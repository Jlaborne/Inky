-- ============================================================
-- Inky - Schema complet (version "portfolios.tags text[]")
-- PostgreSQL 14+
-- ============================================================

-- 0) (Optionnel) Créer la base puis s'y connecter
-- À exécuter avec un superuser (ex: postgres)
-- CREATE DATABASE inky TEMPLATE=template1 ENCODING 'UTF8';
-- \c inky

-- 1) Extensions nécessaires
CREATE EXTENSION IF NOT EXISTS pgcrypto;  -- pour gen_random_uuid()
-- CREATE EXTENSION IF NOT EXISTS unaccent; -- utile plus tard si tu veux ignorer les accents dans les recherches

-- 2) Schéma: public est déjà créé par défaut, on s'assure des droits basiques
ALTER SCHEMA public OWNER TO postgres;

-- 3) Tables

-- 3.1 users
DROP TABLE IF EXISTS public.users CASCADE;
CREATE TABLE public.users (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  uid         text NOT NULL UNIQUE,        -- UID Firebase
  email       text NOT NULL UNIQUE,
  first_name  text NOT NULL,
  last_name   text NOT NULL,
  role        text NOT NULL,               -- 'user' | 'tattoo'
  created_at  timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at  timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT users_role_check CHECK (role IN ('user','tattoo'))
);

-- 3.2 tattoo_artists (profil attaché à un user)
DROP TABLE IF EXISTS public.tattoo_artists CASCADE;
CREATE TABLE public.tattoo_artists (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid UNIQUE,   -- 1 profil artiste par user
  title           text NOT NULL,
  phone           text NOT NULL,
  city            text NOT NULL,
  description     text,
  instagram_link  text,
  facebook_link   text,
  created_at      timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at      timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_tattoo_artists_user
    FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- 3.3 portfolios (avec colonne tags)
DROP TABLE IF EXISTS public.portfolios CASCADE;
CREATE TABLE public.portfolios (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id   uuid,
  title       text NOT NULL,
  main_image  text NOT NULL,     -- URL
  description text,
  tags        text[] NOT NULL DEFAULT '{}',  -- <== tags au format array de slugs
  created_at  timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_portfolios_artist
    FOREIGN KEY (artist_id) REFERENCES public.tattoo_artists(id) ON DELETE CASCADE
);

-- 3.4 portfolio_images
DROP TABLE IF EXISTS public.portfolio_images CASCADE;
CREATE TABLE public.portfolio_images (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id uuid,
  image_url   text NOT NULL,
  available   boolean DEFAULT true,
  created_at  timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_portfolio_images_portfolio
    FOREIGN KEY (portfolio_id) REFERENCES public.portfolios(id) ON DELETE CASCADE
);

-- 3.5 tags (référentiel des styles affichés côté front)
DROP TABLE IF EXISTS public.tags CASCADE;
CREATE TABLE public.tags (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,      -- affichage (français)
  slug        text NOT NULL UNIQUE, -- clé technique en minuscules sans accents (ex: 'neo-traditional')
  description text,
  created_at  timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- 4) (Optionnel) Index utiles
-- Pour la recherche par préfixe sur la ville, ajouter plus tard:
-- CREATE INDEX idx_tattoo_artists_lower_city ON public.tattoo_artists (lower(city));
-- Pour accélérer les requêtes par tags (si besoin plus tard):
-- CREATE INDEX idx_portfolios_tags_gin ON public.portfolios USING GIN (tags);

-- 5) Seed initial (styles FR)
INSERT INTO public.tags (name, slug) VALUES
 ('Minimaliste','fineline'),
 ('Black','blackwork'),
 ('Réaliste','realistic'),
 ('Old School','old-school'),
 ('Néo-traditionnel','neo-traditional'),
 ('Dotwork','dotwork'),
 ('Lettrage','lettering')
ON CONFLICT (slug) DO NOTHING;

-- 6) Droits simples (facultatif)
GRANT ALL ON SCHEMA public TO PUBLIC;

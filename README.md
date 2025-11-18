# Inky – Plateforme de recherche de tatoueurs

Inky est une application web permettant de rechercher des tatoueurs par ville et de consulter leurs portfolios. Les artistes peuvent créer leur page, ajouter leurs informations et téléverser des images. Le projet fonctionne entièrement via Docker Compose (frontend, backend, PostgreSQL).

## Fonctionnalités
- Recherche de tatoueurs par ville
- Consultation d’une page artiste
- Portfolios d’images
- Authentification via Firebase
- Espace artiste pour gérer ses informations et portfolios

## Structure du projet
- front : application React
- back : API Node.js / Express
- database : schéma PostgreSQL
- docker-compose.yml : orchestre les services

## Prérequis
- Docker
- Docker Compose
- Un projet Firebase (pour les variables d’environnement)

## Installation avec Docker Compose
Depuis la racine du projet (où se trouve docker-compose.yml) :

1. Construire les services :
docker compose build

2. Lancer l’ensemble en mode détaché :
docker compose up -d

3. Arrêter les services :
docker compose down

## Variables d’environnement

### Frontend (fichier front/.env)
REACT_APP_FIREBASE_API_KEY=xxxx  
REACT_APP_FIREBASE_AUTH_DOMAIN=xxxx  
REACT_APP_FIREBASE_PROJECT_ID=xxxx  
REACT_APP_FIREBASE_APP_ID=xxxx  
REACT_APP_API_URL=http://localhost:5000/api

### Backend (fichier back/.env)
PORT=5000  
DATABASE_URL=postgres://postgres:postgres@db:5432/inky  
FIREBASE_PROJECT_ID=xxxx  
FIREBASE_CLIENT_EMAIL=xxxx  
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"  
UPLOADS_FOLDER=/app/uploads

### Base de données (automatique avec Docker)
- Nom d’utilisateur : postgres
- Mot de passe : postgres
- Base créée automatiquement : inky

## Base de données
Pour initialiser manuellement la base (si nécessaire) :
docker exec -it db psql -U postgres -d inky -f /docker-entrypoint-initdb.d/schema.sql

Tables principales :
- users  
- tattoo_artists  
- portfolios  
- portfolio_images  

## Endpoints principaux
Artistes :  
- POST /api/artists  
- GET /api/artists/:firebase_uid  
- GET /api/artists?city=Ville

Portfolios :  
- POST /api/artists/:firebase_uid/portfolios  
- GET /api/artists/:firebase_uid/portfolios

Images :  
- POST /api/portfolios/:portfolioId/images  
- GET /api/portfolios/:portfolioId/images

## Accès aux services
Frontend : http://localhost:3000  
Backend : http://localhost:5000  
PostgreSQL : localhost:5432  

## Auteur
Joshua Laborne – Projet développé dans le cadre de la formation Holberton School.

--
-- PostgreSQL database dump
--

-- Dumped from database version 14.13 (Ubuntu 14.13-0ubuntu0.22.04.1)
-- Dumped by pg_dump version 16.4

-- Started on 2024-10-22 17:21:10

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 4 (class 2615 OID 2200)
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- TOC entry 822 (class 1247 OID 41003)
-- Name: user_role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.user_role AS ENUM (
    'admin',
    'user',
    'tattoo'
);


ALTER TYPE public.user_role OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 209 (class 1259 OID 41016)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    uid character varying NOT NULL,
    name character varying NOT NULL,
    first_name character varying NOT NULL,
    email character varying NOT NULL,
    password character varying,
    role character varying NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 3316 (class 0 OID 41016)
-- Dependencies: 209
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (uid, name, first_name, email, password, role, created_at, updated_at) FROM stdin;
9lZMDMZbhScjy5o8KQJLYEkGuEE2	Marie	Dupont	marie21@example.com	securePassword123	user	2024-10-10 15:14:55.280989	2024-10-10 15:14:55.280989
kNA2z9q9DeWR4KtkZYMmwQyjYff1	John	Doe	user@example.com	password123	user	2024-10-17 11:09:53.064597	2024-10-17 11:09:53.064597
udrNwHkRLoQApZH2TbZ6Ja3EkA33	John	Doe	user2@example.com	password3	user	2024-10-17 11:10:36.164006	2024-10-17 11:10:36.164006
q5Xe7UtrilWufdmDu0SRbIMBjbF3	John	Doe	useradmin@example.com	password3	admin	2024-10-17 12:03:56.183074	2024-10-17 12:03:56.183074
\.


--
-- TOC entry 3174 (class 2606 OID 41026)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 3176 (class 2606 OID 41024)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (uid);


--
-- TOC entry 3322 (class 0 OID 0)
-- Dependencies: 4
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;
GRANT ALL ON SCHEMA public TO PUBLIC;


-- Completed on 2024-10-22 17:21:12

--
-- PostgreSQL database dump complete
--


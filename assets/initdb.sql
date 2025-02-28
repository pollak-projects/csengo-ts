--
-- PostgreSQL database cluster dump
--

-- Started on 2025-02-20 13:24:52 UTC

SET default_transaction_read_only = off;

SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;

--
-- Roles
--

--
-- User Configurations
--








--
-- Databases
--

--
-- Database "template1" dump
--

\connect template1

--
-- PostgreSQL database dump
--

-- Dumped from database version 16.6 (Debian 16.6-1.pgdg120+1)
-- Dumped by pg_dump version 16.6

-- Started on 2025-02-20 13:24:52 UTC

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

-- Completed on 2025-02-20 13:24:52 UTC

--
-- PostgreSQL database dump complete
--

--
-- Database "csengo" dump
--

--
-- PostgreSQL database dump
--

-- Dumped from database version 16.6 (Debian 16.6-1.pgdg120+1)
-- Dumped by pg_dump version 16.6

-- Started on 2025-02-20 13:24:52 UTC

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
-- TOC entry 3472 (class 1262 OID 16384)
-- Name: csengo; Type: DATABASE; Schema: -; Owner: csengo
--

\connect csengo

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 216 (class 1259 OID 16394)
-- Name: Kreta; Type: TABLE; Schema: public; Owner: csengo
--

CREATE TABLE public."Kreta" (
                                id uuid DEFAULT gen_random_uuid() NOT NULL,
                                om bigint NOT NULL,
                                name character varying(255) NOT NULL,
                                "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
                                "updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public."Kreta" OWNER TO csengo;

--
-- TOC entry 219 (class 1259 OID 16420)
-- Name: PendingSong; Type: TABLE; Schema: public; Owner: csengo
--

CREATE TABLE public."PendingSong" (
                                      id uuid DEFAULT gen_random_uuid() NOT NULL,
                                      title character varying(255),
                                      "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
                                      "updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
                                      "songBucketId" uuid NOT NULL,
                                      "uploadedById" uuid DEFAULT '00000000-0000-0000-0000-000000000000'::uuid NOT NULL
);


ALTER TABLE public."PendingSong" OWNER TO csengo;

--
-- TOC entry 224 (class 1259 OID 16459)
-- Name: Role; Type: TABLE; Schema: public; Owner: csengo
--

CREATE TABLE public."Role" (
                               id uuid DEFAULT gen_random_uuid() NOT NULL,
                               role text NOT NULL
);


ALTER TABLE public."Role" OWNER TO csengo;

--
-- TOC entry 218 (class 1259 OID 16412)
-- Name: Song; Type: TABLE; Schema: public; Owner: csengo
--

CREATE TABLE public."Song" (
                               id uuid DEFAULT gen_random_uuid() NOT NULL,
                               title character varying(255),
                               "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
                               "updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
                               "songBucketId" uuid NOT NULL,
                               "uploadedById" uuid DEFAULT '00000000-0000-0000-0000-000000000000'::uuid NOT NULL
);


ALTER TABLE public."Song" OWNER TO csengo;

--
-- TOC entry 220 (class 1259 OID 16428)
-- Name: SongBucket; Type: TABLE; Schema: public; Owner: csengo
--

CREATE TABLE public."SongBucket" (
                                     id uuid DEFAULT gen_random_uuid() NOT NULL,
                                     path character varying(500) NOT NULL,
                                     "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
                                     "updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."SongBucket" OWNER TO csengo;

--
-- TOC entry 217 (class 1259 OID 16402)
-- Name: User; Type: TABLE; Schema: public; Owner: csengo
--

CREATE TABLE public."User" (
                               id uuid DEFAULT gen_random_uuid() NOT NULL,
                               username character varying(255) NOT NULL,
                               password character varying(255) NOT NULL,
                               email character varying(255) NOT NULL,
                               "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
                               "updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
                               "kretaId" uuid NOT NULL
);


ALTER TABLE public."User" OWNER TO csengo;

--
-- TOC entry 222 (class 1259 OID 16439)
-- Name: Vote; Type: TABLE; Schema: public; Owner: csengo
--

CREATE TABLE public."Vote" (
                               id integer NOT NULL,
                               "userId" uuid NOT NULL,
                               "songId" uuid NOT NULL,
                               "sessionId" uuid NOT NULL,
                               "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
                               "updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Vote" OWNER TO csengo;

--
-- TOC entry 221 (class 1259 OID 16438)
-- Name: Vote_id_seq; Type: SEQUENCE; Schema: public; Owner: csengo
--

CREATE SEQUENCE public."Vote_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Vote_id_seq" OWNER TO csengo;

--
-- TOC entry 3473 (class 0 OID 0)
-- Dependencies: 221
-- Name: Vote_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: csengo
--

ALTER SEQUENCE public."Vote_id_seq" OWNED BY public."Vote".id;


--
-- TOC entry 223 (class 1259 OID 16447)
-- Name: VotingSession; Type: TABLE; Schema: public; Owner: csengo
--

CREATE TABLE public."VotingSession" (
                                        id uuid DEFAULT gen_random_uuid() NOT NULL,
                                        "songNames" text[],
                                        start timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
                                        "end" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
                                        "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
                                        "updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."VotingSession" OWNER TO csengo;

--
-- TOC entry 226 (class 1259 OID 16472)
-- Name: _RoleToUser; Type: TABLE; Schema: public; Owner: csengo
--

CREATE TABLE public."_RoleToUser" (
                                      "A" uuid NOT NULL,
                                      "B" uuid NOT NULL
);


ALTER TABLE public."_RoleToUser" OWNER TO csengo;

--
-- TOC entry 225 (class 1259 OID 16467)
-- Name: _SongToVotingSession; Type: TABLE; Schema: public; Owner: csengo
--

CREATE TABLE public."_SongToVotingSession" (
                                               "A" uuid NOT NULL,
                                               "B" uuid NOT NULL
);


ALTER TABLE public."_SongToVotingSession" OWNER TO csengo;

--
-- TOC entry 215 (class 1259 OID 16385)
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: csengo
--

CREATE TABLE public._prisma_migrations (
                                           id character varying(36) NOT NULL,
                                           checksum character varying(64) NOT NULL,
                                           finished_at timestamp with time zone,
                                           migration_name character varying(255) NOT NULL,
                                           logs text,
                                           rolled_back_at timestamp with time zone,
                                           started_at timestamp with time zone DEFAULT now() NOT NULL,
                                           applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO csengo;

--
-- TOC entry 3262 (class 2604 OID 16442)
-- Name: Vote id; Type: DEFAULT; Schema: public; Owner: csengo
--

ALTER TABLE ONLY public."Vote" ALTER COLUMN id SET DEFAULT nextval('public."Vote_id_seq"'::regclass);


--
-- TOC entry 3456 (class 0 OID 16394)
-- Dependencies: 216
-- Data for Name: Kreta; Type: TABLE DATA; Schema: public; Owner: csengo
--

INSERT INTO public."Kreta" VALUES ('560b4f38-5bd1-4015-ad5f-9fc5f45f7078', 12312312312, 'admin', '2024-12-10 19:29:48.384767+00', '2024-12-10 19:29:48.384767+00');
INSERT INTO public."Kreta" VALUES ('b34d2a65-0d9f-48f6-b42e-78a7932d7245', 71111111111, 'Tamáskovits Gyula Ákos', '2024-12-10 20:20:28.118077+00', '2024-12-10 20:20:28.118077+00');
INSERT INTO public."Kreta" VALUES ('d830aa4a-58df-4793-88fd-762c791edf81', 72222222222, 'Jani Patrik', '2024-12-10 20:20:28.118077+00', '2024-12-10 20:20:28.118077+00');
INSERT INTO public."Kreta" VALUES ('d357cce4-8d95-46b8-a5ef-b900fe92591e', 73333333333, 'Barna Máté', '2024-12-10 20:20:28.118077+00', '2024-12-10 20:20:28.118077+00');
-- A tesztelőnek felvett adat
INSERT INTO public."Kreta" VALUES ('45f4d3e3-95c9-4525-8dfc-c590e3a3d74c', 74444444444, 'Tesztelő', '2024-12-10 20:20:28.118077+00', '2024-12-10 20:20:28.118077+00');
INSERT INTO public."Kreta" VALUES ('00000000-0000-0000-0000-000000000000', 0, 'Default Kreta', '2025-01-17 19:03:38.757992+00', '2025-01-17 19:03:38.757992+00');


--
-- TOC entry 3459 (class 0 OID 16420)
-- Dependencies: 219
-- Data for Name: PendingSong; Type: TABLE DATA; Schema: public; Owner: csengo
--

INSERT INTO public."PendingSong" VALUES ('2587417b-7234-4f7b-bd79-fa36447ae7fa', 'Coco Jambo', '2025-02-15 21:26:22.566+00', '2025-02-15 21:26:22.566+00', '2506c777-61d5-4b67-ad5a-e76f5a5e1acb', 'a7cc3c55-5b84-42d4-ba3f-124d1fcf7dfd');
INSERT INTO public."PendingSong" VALUES ('10287491-6a1d-4d58-b39a-2513b4a1c495', 'Happy Nation', '2025-02-15 21:26:30.449+00', '2025-02-15 21:26:30.449+00', '73670aeb-b854-4288-8ef6-027ceabdc1c9', '776a1480-fe47-4e03-8409-58280c9e7b25');


--
-- TOC entry 3464 (class 0 OID 16459)
-- Dependencies: 224
-- Data for Name: Role; Type: TABLE DATA; Schema: public; Owner: csengo
--

INSERT INTO public."Role" VALUES ('5628b847-a13f-4714-b4f5-a1b1067e68cc', 'user');
INSERT INTO public."Role" VALUES ('f477695e-52c9-407d-b520-e760fc7bd4b9', 'admin');


--
-- TOC entry 3458 (class 0 OID 16412)
-- Dependencies: 218
-- Data for Name: Song; Type: TABLE DATA; Schema: public; Owner: csengo
--

INSERT INTO public."Song" VALUES ('9f0a3f87-058f-464a-882f-c79755e9cabf', 'Purple Disco Machine - Substitution', '2025-01-06 12:05:04.334+00', '2025-01-06 12:05:04.334+00', '106612db-d390-4cb7-b2b5-3e6c83ef71fc', 'a3a64467-e4f2-4bd5-a9e8-27a602106474');
INSERT INTO public."Song" VALUES ('861674a7-f4dd-4152-adaf-7bf8dbe2d850', 'OneRepublic - RUNAWAY', '2025-01-06 12:05:35.24+00', '2025-01-06 12:06:27.275+00', '1b0465fe-29a5-4beb-a3ed-6c237d3ddb83', 'a3a64467-e4f2-4bd5-a9e8-27a602106474');
INSERT INTO public."Song" VALUES ('3446b7b5-e3cb-44b8-a36c-65540535ec06', 'I Know What You Want', '2025-01-15 08:50:44.1+00', '2025-01-15 08:50:44.1+00', '85e0735e-d02d-48b0-b2a5-9d3ece8ac1f0', 'a7cc3c55-5b84-42d4-ba3f-124d1fcf7dfd');
INSERT INTO public."Song" VALUES ('7ada0621-a791-4c75-bfbd-692307d579dd', 'Do I Wanna Know', '2025-01-15 08:40:57.882+00', '2025-01-15 08:51:18.911+00', 'df358544-94e1-4c23-93eb-6f1b56d4e729', '776a1480-fe47-4e03-8409-58280c9e7b25');


--
-- TOC entry 3460 (class 0 OID 16428)
-- Dependencies: 220
-- Data for Name: SongBucket; Type: TABLE DATA; Schema: public; Owner: csengo
--

INSERT INTO public."SongBucket" VALUES ('106612db-d390-4cb7-b2b5-3e6c83ef71fc', '/data/audio/1733862839496-Purple Disco Machine - Substitution.mp3', '2024-12-10 20:33:59.6+00', '2024-12-10 20:33:59.6+00');
INSERT INTO public."SongBucket" VALUES ('1b0465fe-29a5-4beb-a3ed-6c237d3ddb83', '/data/audio/1733862853423-OneRepublic - RUNAWAY.mp3', '2024-12-10 20:34:14.073+00', '2024-12-10 20:34:14.073+00');
INSERT INTO public."SongBucket" VALUES ('85e0735e-d02d-48b0-b2a5-9d3ece8ac1f0', '/data/audio/1733863143999-I Know What You Want.mp3', '2024-12-10 20:39:08.338+00', '2024-12-10 20:39:08.338+00');
INSERT INTO public."SongBucket" VALUES ('df358544-94e1-4c23-93eb-6f1b56d4e729', '/data/audio/1733863150525-Do I Wanna Know.mp3', '2024-12-10 20:39:13.201+00', '2024-12-10 20:39:13.201+00');
INSERT INTO public."SongBucket" VALUES ('2506c777-61d5-4b67-ad5a-e76f5a5e1acb', '/data/audio/1733863157106-Coco Jambo.mp3', '2024-12-10 20:39:19.384+00', '2024-12-10 20:39:19.384+00');
INSERT INTO public."SongBucket" VALUES ('73670aeb-b854-4288-8ef6-027ceabdc1c9', '/data/audio/1733863163547-Happy Nation.mp3', '2024-12-10 20:39:25.6+00', '2024-12-10 20:39:25.6+00');


--
-- TOC entry 3457 (class 0 OID 16402)
-- Dependencies: 217
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: csengo
--

-- Username: admin Password: admin
INSERT INTO public."User" VALUES ('a3a64467-e4f2-4bd5-a9e8-27a602106474', 'admin', '$2y$10$VbPLwRYhdfbsfMV3S8uXHO1zjEumvxHGdqhBig18lEgYM1oud0IoK', 'admin@csengo.dev', '2024-12-10 19:47:04.317+00', '2024-12-10 19:47:04.317+00', '560b4f38-5bd1-4015-ad5f-9fc5f45f7078');
-- Username: Tamaskovits Password: tamaskovits
INSERT INTO public."User" VALUES ('a7cc3c55-5b84-42d4-ba3f-124d1fcf7dfd', 'Tamaskovits', '$2y$10$YJb8kuzfxhrOq4pAM6E6Tu6a2hjKWHonboDpzDyVfeISykUzbx.w6', 'tamaskovits@csengo.dev', '2024-12-10 20:55:11.08+00', '2024-12-10 20:55:11.08+00', 'b34d2a65-0d9f-48f6-b42e-78a7932d7245');
-- Username: Janipatrik Password: janipatrik
INSERT INTO public."User" VALUES ('776a1480-fe47-4e03-8409-58280c9e7b25', 'Janipatrik', '$2y$10$1LxdHqT6Mb/d7jkIhUrbL.6muAanoYZPGbHKcDafRdBsdVgUbL6ly', 'janipatrik@csengo.dev', '2024-12-11 08:39:08.351+00', '2024-12-11 08:39:08.351+00', 'd830aa4a-58df-4793-88fd-762c791edf81');
-- Username: Barnamate Password: barnamate
INSERT INTO public."User" VALUES ('c438ecf7-ea1f-45b5-bc2b-2fb1a083784a', 'Barnamate', '$2y$10$CRwpoV7kNQGJ43.ragnxyuzucqaitud9DhBsVmT1GhqSuWHJu6.HG', 'barnamate@csengo.dev', '2024-12-11 08:39:08.351+00', '2024-12-11 08:39:08.351+00', 'd357cce4-8d95-46b8-a5ef-b900fe92591e');
INSERT INTO public."User" VALUES ('00000000-0000-0000-0000-000000000000', 'default_user', 'password', 'default@example.com', '2025-01-17 19:03:38.757992+00', '2025-01-17 19:03:38.757992+00', '00000000-0000-0000-0000-000000000000');


--
-- TOC entry 3462 (class 0 OID 16439)
-- Dependencies: 222
-- Data for Name: Vote; Type: TABLE DATA; Schema: public; Owner: csengo
--

INSERT INTO public."Vote" VALUES (565, 'c438ecf7-ea1f-45b5-bc2b-2fb1a083784a', '861674a7-f4dd-4152-adaf-7bf8dbe2d850', '768b17f6-1488-443d-834c-bbd0dd3c57ed', '2025-02-16 19:44:02.305+00', '2025-02-17 19:44:02.305+00');
INSERT INTO public."Vote" VALUES (566, 'a7cc3c55-5b84-42d4-ba3f-124d1fcf7dfd', '861674a7-f4dd-4152-adaf-7bf8dbe2d850', '768b17f6-1488-443d-834c-bbd0dd3c57ed', '2025-02-16 19:44:02.305+00', '2025-02-17 19:44:02.305+00');
INSERT INTO public."Vote" VALUES (567, '776a1480-fe47-4e03-8409-58280c9e7b25', '861674a7-f4dd-4152-adaf-7bf8dbe2d850', '768b17f6-1488-443d-834c-bbd0dd3c57ed', '2025-02-16 19:44:02.305+00', '2025-02-17 19:44:02.305+00');
INSERT INTO public."Vote" VALUES (568, 'a7cc3c55-5b84-42d4-ba3f-124d1fcf7dfd', '861674a7-f4dd-4152-adaf-7bf8dbe2d850', '890bd43d-321d-4d8c-847b-a02ec6ef537d', '2025-02-17 19:44:02.305+00', '2025-02-17 19:44:02.305+00');
INSERT INTO public."Vote" VALUES (572, 'a7cc3c55-5b84-42d4-ba3f-124d1fcf7dfd', '9f0a3f87-058f-464a-882f-c79755e9cabf', '890bd43d-321d-4d8c-847b-a02ec6ef537d', '2025-02-17 20:07:51.622+00', '2025-02-17 20:07:51.622+00');
INSERT INTO public."Vote" VALUES (576, '776a1480-fe47-4e03-8409-58280c9e7b25', '861674a7-f4dd-4152-adaf-7bf8dbe2d850', '890bd43d-321d-4d8c-847b-a02ec6ef537d', '2025-02-17 22:26:24.644+00', '2025-02-17 22:26:24.644+00');
INSERT INTO public."Vote" VALUES (578, '776a1480-fe47-4e03-8409-58280c9e7b25', '3446b7b5-e3cb-44b8-a36c-65540535ec06', '890bd43d-321d-4d8c-847b-a02ec6ef537d', '2025-02-18 10:48:06.517+00', '2025-02-18 10:48:06.517+00');


--
-- TOC entry 3463 (class 0 OID 16447)
-- Dependencies: 223
-- Data for Name: VotingSession; Type: TABLE DATA; Schema: public; Owner: csengo
--

INSERT INTO public."VotingSession" VALUES ('768b17f6-1488-443d-834c-bbd0dd3c57ed', '{"OneRepublic - RUNAWAY"}', '2025-02-15 16:52:00+00', '2025-02-18 05:00:00+00', '2025-02-15 19:53:28.046+00', '2025-02-15 19:53:28.046+00');
INSERT INTO public."VotingSession" VALUES ('890bd43d-321d-4d8c-847b-a02ec6ef537d', '{"Purple Disco Machine - Substitution","OneRepublic - RUNAWAY","I Know What You Want","Do I Wanna Know"}', '2025-01-15 02:53:00+00', '2026-01-20 23:59:00+00', '2025-01-15 08:52:46.736+00', '2025-01-15 08:52:46.736+00');


--
-- TOC entry 3466 (class 0 OID 16472)
-- Dependencies: 226
-- Data for Name: _RoleToUser; Type: TABLE DATA; Schema: public; Owner: csengo
--

INSERT INTO public."_RoleToUser" VALUES ('5628b847-a13f-4714-b4f5-a1b1067e68cc', 'a3a64467-e4f2-4bd5-a9e8-27a602106474');
INSERT INTO public."_RoleToUser" VALUES ('f477695e-52c9-407d-b520-e760fc7bd4b9', 'a3a64467-e4f2-4bd5-a9e8-27a602106474');
INSERT INTO public."_RoleToUser" VALUES ('5628b847-a13f-4714-b4f5-a1b1067e68cc', '776a1480-fe47-4e03-8409-58280c9e7b25');
INSERT INTO public."_RoleToUser" VALUES ('5628b847-a13f-4714-b4f5-a1b1067e68cc', 'a7cc3c55-5b84-42d4-ba3f-124d1fcf7dfd');
INSERT INTO public."_RoleToUser" VALUES ('5628b847-a13f-4714-b4f5-a1b1067e68cc', 'c438ecf7-ea1f-45b5-bc2b-2fb1a083784a');


--
-- TOC entry 3465 (class 0 OID 16467)
-- Dependencies: 225
-- Data for Name: _SongToVotingSession; Type: TABLE DATA; Schema: public; Owner: csengo
--

INSERT INTO public."_SongToVotingSession" VALUES ('861674a7-f4dd-4152-adaf-7bf8dbe2d850', '768b17f6-1488-443d-834c-bbd0dd3c57ed');
INSERT INTO public."_SongToVotingSession" VALUES ('9f0a3f87-058f-464a-882f-c79755e9cabf', '890bd43d-321d-4d8c-847b-a02ec6ef537d');
INSERT INTO public."_SongToVotingSession" VALUES ('861674a7-f4dd-4152-adaf-7bf8dbe2d850', '890bd43d-321d-4d8c-847b-a02ec6ef537d');
INSERT INTO public."_SongToVotingSession" VALUES ('3446b7b5-e3cb-44b8-a36c-65540535ec06', '890bd43d-321d-4d8c-847b-a02ec6ef537d');
INSERT INTO public."_SongToVotingSession" VALUES ('7ada0621-a791-4c75-bfbd-692307d579dd', '890bd43d-321d-4d8c-847b-a02ec6ef537d');


--
-- TOC entry 3455 (class 0 OID 16385)
-- Dependencies: 215
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: csengo
--

INSERT INTO public._prisma_migrations VALUES ('5cfd926c-5097-4b47-91a2-7394d0fb74b7', 'b9265776660ee165d082f8ddc9192da1b39666d616dd3e2823133cbd7a0b0f5e', '2024-12-10 19:22:11.666192+00', '20241210185133_prod', NULL, NULL, '2024-12-10 19:22:11.478619+00', 1);
INSERT INTO public._prisma_migrations VALUES ('7280e014-bc80-4235-947a-1f0d68bf0c57', '9b0bd9b56b98be572856511ea72d9ff609e32e34f212827128c02e2bb8d4a953', '2025-01-17 19:08:18.06269+00', '20250117190305_prod', NULL, NULL, '2025-01-17 19:08:18.038474+00', 1);


--
-- TOC entry 3474 (class 0 OID 0)
-- Dependencies: 221
-- Name: Vote_id_seq; Type: SEQUENCE SET; Schema: public; Owner: csengo
--

SELECT pg_catalog.setval('public."Vote_id_seq"', 578, true);


--
-- TOC entry 3275 (class 2606 OID 16401)
-- Name: Kreta Kreta_pkey; Type: CONSTRAINT; Schema: public; Owner: csengo
--

ALTER TABLE ONLY public."Kreta"
    ADD CONSTRAINT "Kreta_pkey" PRIMARY KEY (id);


--
-- TOC entry 3283 (class 2606 OID 16427)
-- Name: PendingSong PendingSong_pkey; Type: CONSTRAINT; Schema: public; Owner: csengo
--

ALTER TABLE ONLY public."PendingSong"
    ADD CONSTRAINT "PendingSong_pkey" PRIMARY KEY (id);


--
-- TOC entry 3292 (class 2606 OID 16466)
-- Name: Role Role_pkey; Type: CONSTRAINT; Schema: public; Owner: csengo
--

ALTER TABLE ONLY public."Role"
    ADD CONSTRAINT "Role_pkey" PRIMARY KEY (id);


--
-- TOC entry 3286 (class 2606 OID 16437)
-- Name: SongBucket SongBucket_pkey; Type: CONSTRAINT; Schema: public; Owner: csengo
--

ALTER TABLE ONLY public."SongBucket"
    ADD CONSTRAINT "SongBucket_pkey" PRIMARY KEY (id);


--
-- TOC entry 3280 (class 2606 OID 16419)
-- Name: Song Song_pkey; Type: CONSTRAINT; Schema: public; Owner: csengo
--

ALTER TABLE ONLY public."Song"
    ADD CONSTRAINT "Song_pkey" PRIMARY KEY (id);


--
-- TOC entry 3278 (class 2606 OID 16411)
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: csengo
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- TOC entry 3288 (class 2606 OID 16446)
-- Name: Vote Vote_pkey; Type: CONSTRAINT; Schema: public; Owner: csengo
--

ALTER TABLE ONLY public."Vote"
    ADD CONSTRAINT "Vote_pkey" PRIMARY KEY (id);


--
-- TOC entry 3290 (class 2606 OID 16458)
-- Name: VotingSession VotingSession_pkey; Type: CONSTRAINT; Schema: public; Owner: csengo
--

ALTER TABLE ONLY public."VotingSession"
    ADD CONSTRAINT "VotingSession_pkey" PRIMARY KEY (id);


--
-- TOC entry 3298 (class 2606 OID 16476)
-- Name: _RoleToUser _RoleToUser_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: csengo
--

ALTER TABLE ONLY public."_RoleToUser"
    ADD CONSTRAINT "_RoleToUser_AB_pkey" PRIMARY KEY ("A", "B");


--
-- TOC entry 3295 (class 2606 OID 16471)
-- Name: _SongToVotingSession _SongToVotingSession_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: csengo
--

ALTER TABLE ONLY public."_SongToVotingSession"
    ADD CONSTRAINT "_SongToVotingSession_AB_pkey" PRIMARY KEY ("A", "B");


--
-- TOC entry 3272 (class 2606 OID 16393)
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: csengo
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- TOC entry 3273 (class 1259 OID 16477)
-- Name: Kreta_om_key; Type: INDEX; Schema: public; Owner: csengo
--

CREATE UNIQUE INDEX "Kreta_om_key" ON public."Kreta" USING btree (om);


--
-- TOC entry 3284 (class 1259 OID 16480)
-- Name: PendingSong_songBucketId_key; Type: INDEX; Schema: public; Owner: csengo
--

CREATE UNIQUE INDEX "PendingSong_songBucketId_key" ON public."PendingSong" USING btree ("songBucketId");


--
-- TOC entry 3293 (class 1259 OID 16481)
-- Name: Role_role_key; Type: INDEX; Schema: public; Owner: csengo
--

CREATE UNIQUE INDEX "Role_role_key" ON public."Role" USING btree (role);


--
-- TOC entry 3281 (class 1259 OID 16479)
-- Name: Song_songBucketId_key; Type: INDEX; Schema: public; Owner: csengo
--

CREATE UNIQUE INDEX "Song_songBucketId_key" ON public."Song" USING btree ("songBucketId");


--
-- TOC entry 3276 (class 1259 OID 16478)
-- Name: User_kretaId_key; Type: INDEX; Schema: public; Owner: csengo
--

CREATE UNIQUE INDEX "User_kretaId_key" ON public."User" USING btree ("kretaId");


--
-- TOC entry 3299 (class 1259 OID 16483)
-- Name: _RoleToUser_B_index; Type: INDEX; Schema: public; Owner: csengo
--

CREATE INDEX "_RoleToUser_B_index" ON public."_RoleToUser" USING btree ("B");


--
-- TOC entry 3296 (class 1259 OID 16482)
-- Name: _SongToVotingSession_B_index; Type: INDEX; Schema: public; Owner: csengo
--

CREATE INDEX "_SongToVotingSession_B_index" ON public."_SongToVotingSession" USING btree ("B");


--
-- TOC entry 3303 (class 2606 OID 16494)
-- Name: PendingSong PendingSong_songBucketId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: csengo
--

ALTER TABLE ONLY public."PendingSong"
    ADD CONSTRAINT "PendingSong_songBucketId_fkey" FOREIGN KEY ("songBucketId") REFERENCES public."SongBucket"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3304 (class 2606 OID 24592)
-- Name: PendingSong PendingSong_uploadedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: csengo
--

ALTER TABLE ONLY public."PendingSong"
    ADD CONSTRAINT "PendingSong_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3301 (class 2606 OID 16489)
-- Name: Song Song_songBucketId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: csengo
--

ALTER TABLE ONLY public."Song"
    ADD CONSTRAINT "Song_songBucketId_fkey" FOREIGN KEY ("songBucketId") REFERENCES public."SongBucket"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3302 (class 2606 OID 24587)
-- Name: Song Song_uploadedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: csengo
--

ALTER TABLE ONLY public."Song"
    ADD CONSTRAINT "Song_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3300 (class 2606 OID 16484)
-- Name: User User_kretaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: csengo
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_kretaId_fkey" FOREIGN KEY ("kretaId") REFERENCES public."Kreta"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3305 (class 2606 OID 16509)
-- Name: Vote Vote_sessionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: csengo
--

ALTER TABLE ONLY public."Vote"
    ADD CONSTRAINT "Vote_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES public."VotingSession"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3306 (class 2606 OID 16499)
-- Name: Vote Vote_songId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: csengo
--

ALTER TABLE ONLY public."Vote"
    ADD CONSTRAINT "Vote_songId_fkey" FOREIGN KEY ("songId") REFERENCES public."Song"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3307 (class 2606 OID 16504)
-- Name: Vote Vote_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: csengo
--

ALTER TABLE ONLY public."Vote"
    ADD CONSTRAINT "Vote_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3310 (class 2606 OID 16524)
-- Name: _RoleToUser _RoleToUser_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: csengo
--

ALTER TABLE ONLY public."_RoleToUser"
    ADD CONSTRAINT "_RoleToUser_A_fkey" FOREIGN KEY ("A") REFERENCES public."Role"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3311 (class 2606 OID 16529)
-- Name: _RoleToUser _RoleToUser_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: csengo
--

ALTER TABLE ONLY public."_RoleToUser"
    ADD CONSTRAINT "_RoleToUser_B_fkey" FOREIGN KEY ("B") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3308 (class 2606 OID 16514)
-- Name: _SongToVotingSession _SongToVotingSession_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: csengo
--

ALTER TABLE ONLY public."_SongToVotingSession"
    ADD CONSTRAINT "_SongToVotingSession_A_fkey" FOREIGN KEY ("A") REFERENCES public."Song"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3309 (class 2606 OID 16519)
-- Name: _SongToVotingSession _SongToVotingSession_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: csengo
--

ALTER TABLE ONLY public."_SongToVotingSession"
    ADD CONSTRAINT "_SongToVotingSession_B_fkey" FOREIGN KEY ("B") REFERENCES public."VotingSession"(id) ON UPDATE CASCADE ON DELETE CASCADE;


-- Completed on 2025-02-20 13:24:52 UTC

--
-- PostgreSQL database dump complete
--

--
-- Database "postgres" dump
--

\connect postgres

--
-- PostgreSQL database dump
--

-- Dumped from database version 16.6 (Debian 16.6-1.pgdg120+1)
-- Dumped by pg_dump version 16.6

-- Started on 2025-02-20 13:24:52 UTC

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

-- Completed on 2025-02-20 13:24:53 UTC

--
-- PostgreSQL database dump complete
--

-- Completed on 2025-02-20 13:24:53 UTC

--
-- PostgreSQL database cluster dump complete
--


--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: GuestCategory; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."GuestCategory" AS ENUM (
    'GENERAL',
    'BRIDE_GUEST',
    'GROOM_GUEST'
);


--
-- Name: MediaType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."MediaType" AS ENUM (
    'IMAGE',
    'VIDEO'
);


--
-- Name: UserRole; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."UserRole" AS ENUM (
    'ADMIN',
    'STAFF'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Event; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Event" (
    id text NOT NULL,
    "studioId" text NOT NULL,
    title text NOT NULL,
    "brideName" text,
    "groomName" text,
    "bridePhone" text,
    "groomPhone" text,
    "coupleAccessToken" text NOT NULL,
    "eventDate" timestamp(3) without time zone NOT NULL,
    location text,
    description text,
    "coverImage" text,
    slug text NOT NULL,
    subdomain text,
    "isPublished" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "googleMapAddress" text NOT NULL
);


--
-- Name: Guest; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Guest" (
    id text NOT NULL,
    "eventId" text NOT NULL,
    name text NOT NULL,
    phone text,
    email text,
    "invitationCode" text NOT NULL,
    "checkedIn" boolean DEFAULT false NOT NULL,
    "checkedInAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    category public."GuestCategory" DEFAULT 'GENERAL'::public."GuestCategory" NOT NULL
);


--
-- Name: Media; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Media" (
    id text NOT NULL,
    "eventId" text NOT NULL,
    type public."MediaType" NOT NULL,
    url text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "groupLabel" text
);


--
-- Name: Studio; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Studio" (
    id text NOT NULL,
    name text NOT NULL,
    email text,
    phone text NOT NULL,
    "logoUrl" text,
    "primaryColor" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: User; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."User" (
    id text NOT NULL,
    phone text NOT NULL,
    password text NOT NULL,
    role public."UserRole" DEFAULT 'STAFF'::public."UserRole" NOT NULL,
    "studioId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "teamRole" text DEFAULT 'EVENT_PLANNER'::text NOT NULL
);


--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: -
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


--
-- Data for Name: Event; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Event" (id, "studioId", title, "brideName", "groomName", "bridePhone", "groomPhone", "coupleAccessToken", "eventDate", location, description, "coverImage", slug, subdomain, "isPublished", "createdAt", "updatedAt", "googleMapAddress") FROM stdin;
55555555-5555-5555-5555-555555555551	11111111-1111-1111-1111-111111111111	Meron & Dawit Wedding	Meron	Dawit	+12025550111	+12025550112	eeeeeeee-1111-1111-1111-111111111111	2026-04-04 07:36:48.241	Skylight Hotel, Addis Ababa	A classic Orthodox ceremony followed by an elegant reception.	\N	meron-dawit-wedding	merondawit	t	2026-03-05 07:36:48.241	2026-03-05 07:36:48.241	Skylight Hotel, Addis Ababa
55555555-5555-5555-5555-555555555552	11111111-1111-1111-1111-111111111111	Lidiya & Abel Wedding	Lidiya	Abel	+12025550113	+12025550114	eeeeeeee-2222-2222-2222-222222222222	2026-05-19 07:36:48.241	Kuriftu Resort, Bishoftu	Modern outdoor wedding with intimate evening lighting.	\N	lidiya-abel-wedding	lidiyaabel	f	2026-03-05 07:36:48.241	2026-03-05 07:36:48.241	Kuriftu Resort, Bishoftu
55555555-5555-5555-5555-555555555553	11111111-1111-1111-1111-111111111111	Bethlehem & Henok Wedding	Bethlehem	Henok	+12025550115	+12025550116	eeeeeeee-3333-3333-3333-333333333333	2026-02-13 07:36:48.241	Adama Cultural Hall	Traditional ceremony and family-centered celebration.	\N	bethlehem-henok-wedding	bethlehemhenok	t	2026-03-05 07:36:48.241	2026-03-05 07:36:48.241	Adama Cultural Hall
59f3423b-b500-4ecd-8161-706fab05de06	11111111-1111-1111-1111-111111111111	አለሙ እና ሜሮን	ሜሮን	አለሙ	+2519585844	+25195857444	766a1f3c-1d69-4239-8b1f-2842387036d4	2026-03-19 13:28:00	አዲስ አበባ	አለሙ እና ሜሮን	\N	--360012	\N	f	2026-03-05 13:29:20.066	2026-03-05 13:29:20.066	https://www.google.com/maps/place/Saro+Maria+Hotel/@8.9942826,38.7848202,88m/data=!3m1!1e3!4m20!1m10!3m9!1s0x164b84fdecaa60c1:0x4cd8c8852b9434f4!2sSaro+Maria+Hotel!5m2!4m1!1i2!8m2!3d8.9942038!4d38.7851712!16s%2Fg%2F1yghb62mw!3m8!1s0x164b84fdecaa60c1:0x4cd8c8852b9434f4!5m2!4m1!1i2!8m2!3d8.9942038!4d38.7851712!16s%2Fg%2F1yghb62mw?entry=ttu&g_ep=EgoyMDI1MTIwOS4wIKXMDSoASAFQAw%3D%3D
\.


--
-- Data for Name: Guest; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Guest" (id, "eventId", name, phone, email, "invitationCode", "checkedIn", "checkedInAt", "createdAt", category) FROM stdin;
\.


--
-- Data for Name: Media; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Media" (id, "eventId", type, url, "createdAt", "groupLabel") FROM stdin;
\.


--
-- Data for Name: Studio; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Studio" (id, name, email, phone, "logoUrl", "primaryColor", "createdAt", "updatedAt") FROM stdin;
11111111-1111-1111-1111-111111111111	Kebkab Events	hello@demostudio.local	+12025550100	http://localhost:3001/api/uploads/7c6c0707-e624-403d-8056-70532e4247ab.png	\N	2026-03-05 07:36:48.235	2026-03-06 08:53:08.426
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."User" (id, phone, password, role, "studioId", "createdAt", "updatedAt", "teamRole") FROM stdin;
22222222-2222-2222-2222-222222222222	+12025550101	$2b$12$khP7DeopBWtGTnasSuPr..7evJGydFiakmYqzcEeSB0XMVQPbdLJ2	ADMIN	11111111-1111-1111-1111-111111111111	2026-03-05 07:36:48.238	2026-03-05 07:36:48.238	EVENT_PLANNER
33333333-3333-3333-3333-333333333333	+12025550102	$2b$12$khP7DeopBWtGTnasSuPr..7evJGydFiakmYqzcEeSB0XMVQPbdLJ2	STAFF	11111111-1111-1111-1111-111111111111	2026-03-05 07:36:48.238	2026-03-05 07:36:48.238	EVENT_PLANNER
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
87d03276-d145-431c-8cca-e5ce61fabc36	2549d86a423a468124209fdc06a8298ead4b9e266eb74f6414e7dce77ad31ad5	2026-03-05 07:36:48.156645+03	20260213143042_init	\N	\N	2026-03-05 07:36:48.137914+03	1
45941359-af6c-4135-997d-7a8b787a0fff	86be240bc69ccc5210f7737c26ea94f91e6043bda9061e15761ab0a609af20bb	2026-03-05 07:36:48.223655+03	20260213152749_database_schema_setup	\N	\N	2026-03-05 07:36:48.157601+03	1
09e13268-8bb5-4d24-9a88-555b28f12390	2b1ce707753c66e12ddddca8dc6c114381b4778fc2d5993fb4a68b70cf5ba0dc	2026-03-05 07:36:48.229693+03	20260213154144_database_schema_setup	\N	\N	2026-03-05 07:36:48.224122+03	1
102f5271-654a-4794-8472-11736d1844de	37acd6626ee6b6c2bd26b21301241222d27e4f57a1b163388878b841f84cea2f	2026-03-05 07:36:48.243727+03	20260214120000_seed_sample_studio_users	\N	\N	2026-03-05 07:36:48.230173+03	1
c5c245e0-25be-4bb2-ab17-74695e63e1e9	421ef94f1b96db10ecff40ebfe0809afd259c1bd03e35a2fb6ca6b7eb2135c1b	2026-03-05 07:36:48.247446+03	20260214143000_add_guest_category	\N	\N	2026-03-05 07:36:48.244228+03	1
e16dcc3b-3d0e-4424-9f8c-76b225a8df78	fb0846b3abcd9e594fd95af71baceabd51119f282b6d44a68ee86035030a3dce	2026-03-05 07:36:48.253505+03	20260216101500_seed_templates_events_existing_db	\N	\N	2026-03-05 07:36:48.247989+03	1
7ccceabc-35b5-4c84-bb36-50f8584f49d0	eb8a8db6f45b57fac8c121fc8fd0932a29fb2739cecdccc1f6978ff9287168d5	2026-03-05 07:36:48.257862+03	20260216103000_backfill_missing_event_phones	\N	\N	2026-03-05 07:36:48.254188+03	1
48d047ad-3aa0-4756-8d15-b42f65240d28	e283ed5d16a39d2fe2620073d7680bb64d7bed252f1a55570440fd8abeeb883e	2026-03-05 07:36:48.260654+03	20260216113000_add_team_role_to_user	\N	\N	2026-03-05 07:36:48.258312+03	1
\.


--
-- Name: Event Event_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Event"
    ADD CONSTRAINT "Event_pkey" PRIMARY KEY (id);


--
-- Name: Guest Guest_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Guest"
    ADD CONSTRAINT "Guest_pkey" PRIMARY KEY (id);


--
-- Name: Media Media_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Media"
    ADD CONSTRAINT "Media_pkey" PRIMARY KEY (id);


--
-- Name: Studio Studio_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Studio"
    ADD CONSTRAINT "Studio_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: Event_coupleAccessToken_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Event_coupleAccessToken_key" ON public."Event" USING btree ("coupleAccessToken");


--
-- Name: Event_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Event_slug_key" ON public."Event" USING btree (slug);


--
-- Name: Event_studioId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Event_studioId_idx" ON public."Event" USING btree ("studioId");


--
-- Name: Event_subdomain_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Event_subdomain_key" ON public."Event" USING btree (subdomain);


--
-- Name: Guest_eventId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Guest_eventId_idx" ON public."Guest" USING btree ("eventId");


--
-- Name: Guest_invitationCode_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Guest_invitationCode_key" ON public."Guest" USING btree ("invitationCode");


--
-- Name: Media_eventId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Media_eventId_idx" ON public."Media" USING btree ("eventId");


--
-- Name: Studio_phone_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Studio_phone_key" ON public."Studio" USING btree (phone);


--
-- Name: User_phone_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "User_phone_key" ON public."User" USING btree (phone);


--
-- Name: Event Event_studioId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Event"
    ADD CONSTRAINT "Event_studioId_fkey" FOREIGN KEY ("studioId") REFERENCES public."Studio"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Guest Guest_eventId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Guest"
    ADD CONSTRAINT "Guest_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES public."Event"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Media Media_eventId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Media"
    ADD CONSTRAINT "Media_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES public."Event"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: User User_studioId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_studioId_fkey" FOREIGN KEY ("studioId") REFERENCES public."Studio"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--


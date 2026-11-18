CREATE ROLE journalpilot
  LOGIN
  PASSWORD 'journalpilot-rls-test'
  NOSUPERUSER
  NOCREATEDB
  NOCREATEROLE
  NOREPLICATION
  NOBYPASSRLS;

CREATE TABLE public.users (
  id uuid PRIMARY KEY
);

CREATE TABLE public.journals (
  id uuid PRIMARY KEY,
  "userId" uuid NOT NULL REFERENCES public.users(id),
  "deletedAt" timestamptz
);

CREATE TABLE public.journal_entries (
  id uuid PRIMARY KEY,
  "journalId" uuid NOT NULL REFERENCES public.journals(id),
  content text NOT NULL,
  "deletedAt" timestamptz
);

CREATE TABLE public.media (
  id uuid PRIMARY KEY,
  "entryId" uuid NOT NULL REFERENCES public.journal_entries(id)
);

CREATE TABLE public.locations (
  id uuid PRIMARY KEY,
  "entryId" uuid NOT NULL REFERENCES public.journal_entries(id)
);

CREATE TABLE public.embeddings (
  id uuid PRIMARY KEY,
  "entryId" uuid NOT NULL REFERENCES public.journal_entries(id)
);

CREATE TABLE public.ai_processing (
  id uuid PRIMARY KEY,
  "entryId" uuid REFERENCES public.journal_entries(id),
  "mediaId" uuid REFERENCES public.media(id)
);

CREATE TABLE public.ai_metadata (
  id uuid PRIMARY KEY,
  "entryId" uuid REFERENCES public.journal_entries(id),
  "mediaId" uuid REFERENCES public.media(id)
);

CREATE TABLE public.weekly_reflections (
  id uuid PRIMARY KEY,
  "userId" uuid NOT NULL REFERENCES public.users(id)
);

CREATE TABLE public.conversations (
  id uuid PRIMARY KEY,
  "userId" uuid NOT NULL REFERENCES public.users(id),
  "journalId" uuid REFERENCES public.journals(id)
);

CREATE TABLE public.messages (
  id uuid PRIMARY KEY,
  "conversationId" uuid NOT NULL REFERENCES public.conversations(id)
);

GRANT USAGE ON SCHEMA public TO journalpilot;
GRANT SELECT, INSERT, UPDATE ON public.users, public.journals TO journalpilot;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.journal_entries TO journalpilot;
GRANT SELECT ON
  public.media,
  public.locations,
  public.embeddings,
  public.ai_processing,
  public.ai_metadata,
  public.weekly_reflections,
  public.conversations,
  public.messages
TO journalpilot;

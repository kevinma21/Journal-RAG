BEGIN;

CREATE TYPE "MediaUploadState" AS ENUM ('PENDING', 'READY', 'ATTACHED', 'CLEANUP_PENDING');

ALTER TABLE public.journal_entries ADD COLUMN revision integer NOT NULL DEFAULT 0;
ALTER TABLE public.media ADD COLUMN position integer NOT NULL DEFAULT 0;
CREATE UNIQUE INDEX "media_storagePath_key" ON public.media ("storagePath");

CREATE TABLE public.media_uploads (
    id uuid PRIMARY KEY,
    "userId" uuid NOT NULL,
    "journalId" uuid NOT NULL,
    -- A new draft has no entry row yet, and cleanup must survive entry deletion.
    "targetEntryId" uuid NOT NULL,
    "storagePath" text NOT NULL,
    "fileName" varchar(500) NOT NULL,
    "mimeType" varchar(255) NOT NULL,
    "fileSize" integer NOT NULL CHECK ("fileSize" > 0),
    state "MediaUploadState" NOT NULL DEFAULT 'PENDING',
    "createdAt" timestamptz(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" timestamptz(3) NOT NULL,
    "uploadTokenValidUntil" timestamptz(3) NOT NULL,
    "nextCleanupAt" timestamptz(3),
    CHECK ((state = 'CLEANUP_PENDING') = ("nextCleanupAt" IS NOT NULL))
);

CREATE UNIQUE INDEX "media_uploads_storagePath_key" ON public.media_uploads ("storagePath");
CREATE INDEX "media_uploads_userId_state_idx" ON public.media_uploads ("userId", state);
CREATE INDEX "media_uploads_targetEntryId_state_idx" ON public.media_uploads ("targetEntryId", state);
CREATE INDEX "media_uploads_state_expiresAt_idx" ON public.media_uploads (state, "expiresAt");
CREATE INDEX "media_uploads_state_nextCleanupAt_idx" ON public.media_uploads (state, "nextCleanupAt");

ALTER TABLE public.media_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_uploads FORCE ROW LEVEL SECURITY;

CREATE POLICY media_uploads_runtime_owner ON public.media_uploads
  FOR ALL TO journalpilot
  USING ("userId" = journalpilot_private.current_user_id())
  WITH CHECK (
    "userId" = journalpilot_private.current_user_id()
    AND EXISTS (
      SELECT 1 FROM public.journals j
      WHERE j.id = "journalId" AND j."userId" = journalpilot_private.current_user_id()
    )
  );

GRANT SELECT, INSERT, UPDATE ON public.media_uploads TO journalpilot;
GRANT INSERT, UPDATE, DELETE ON public.media TO journalpilot;

-- Deployments grant this group to a dedicated worker login.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_catalog.pg_roles WHERE rolname = 'journalpilot_media_cleanup') THEN
    CREATE ROLE journalpilot_media_cleanup NOLOGIN;
  END IF;
END;
$$;

GRANT USAGE ON SCHEMA public TO journalpilot_media_cleanup;
GRANT SELECT (id, "storagePath", state, "expiresAt", "uploadTokenValidUntil", "nextCleanupAt"),
  UPDATE (state, "nextCleanupAt"), DELETE ON public.media_uploads TO journalpilot_media_cleanup;

CREATE POLICY media_uploads_cleanup_read ON public.media_uploads
  FOR SELECT TO journalpilot_media_cleanup
  USING (
    state = 'CLEANUP_PENDING'
    OR (state IN ('PENDING', 'READY') AND "expiresAt" <= now())
  );

CREATE POLICY media_uploads_cleanup_update ON public.media_uploads
  FOR UPDATE TO journalpilot_media_cleanup
  USING (
    state = 'CLEANUP_PENDING'
    OR (state IN ('PENDING', 'READY') AND "expiresAt" <= now())
  )
  WITH CHECK (state = 'CLEANUP_PENDING');

CREATE POLICY media_uploads_cleanup_delete ON public.media_uploads
  FOR DELETE TO journalpilot_media_cleanup
  USING (state = 'CLEANUP_PENDING' AND "uploadTokenValidUntil" <= now());

COMMIT;

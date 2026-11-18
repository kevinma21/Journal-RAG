-- The Prisma API connects as a shared, non-superuser role. Each authenticated
-- API operation sets a transaction-local user ID after verifying the Supabase
-- access token. RLS policies below consume only that transaction-local value.

DO $$
DECLARE
  runtime_is_superuser boolean;
  runtime_bypasses_rls boolean;
  runtime_owns_tenant_tables boolean;
BEGIN
  SELECT rolsuper, rolbypassrls
  INTO runtime_is_superuser, runtime_bypasses_rls
  FROM pg_catalog.pg_roles
  WHERE rolname = 'journalpilot';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Required Prisma runtime role "journalpilot" does not exist';
  END IF;

  IF runtime_is_superuser OR runtime_bypasses_rls THEN
    RAISE EXCEPTION 'Prisma runtime role "journalpilot" must not be SUPERUSER or BYPASSRLS';
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM pg_catalog.pg_class AS c
    JOIN pg_catalog.pg_namespace AS n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname = ANY (ARRAY[
        'users',
        'journals',
        'journal_entries',
        'media',
        'locations',
        'embeddings',
        'ai_processing',
        'ai_metadata',
        'weekly_reflections',
        'conversations',
        'messages'
      ])
      AND c.relowner = (SELECT oid FROM pg_catalog.pg_roles WHERE rolname = 'journalpilot')
  ) INTO runtime_owns_tenant_tables;

  IF runtime_owns_tenant_tables THEN
    RAISE EXCEPTION 'Prisma runtime role "journalpilot" must not own tenant tables';
  END IF;
END;
$$;

CREATE SCHEMA IF NOT EXISTS journalpilot_private;
REVOKE ALL ON SCHEMA journalpilot_private FROM PUBLIC;
GRANT USAGE ON SCHEMA journalpilot_private TO journalpilot;
GRANT USAGE ON SCHEMA public TO journalpilot;

CREATE OR REPLACE FUNCTION journalpilot_private.current_user_id()
RETURNS uuid
LANGUAGE sql
STABLE
SET search_path = pg_catalog
AS $$
  SELECT CASE
    WHEN setting.value ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      THEN setting.value::uuid
    ELSE NULL
  END
  FROM (SELECT pg_catalog.current_setting('journalpilot.user_id', true) AS value) setting
$$;

REVOKE ALL ON FUNCTION journalpilot_private.current_user_id() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION journalpilot_private.current_user_id() TO journalpilot;

-- Give the runtime role read access to derived tenant records so RLS can scope
-- future retrieval paths. Write grants remain limited to existing API needs.
GRANT SELECT ON TABLE
  public.media,
  public.locations,
  public.embeddings,
  public.ai_processing,
  public.ai_metadata,
  public.weekly_reflections,
  public.conversations,
  public.messages
TO journalpilot;

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users FORCE ROW LEVEL SECURITY;
CREATE POLICY users_runtime_owner ON public.users
  FOR ALL TO journalpilot
  USING (id = journalpilot_private.current_user_id())
  WITH CHECK (id = journalpilot_private.current_user_id());

ALTER TABLE public.journals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journals FORCE ROW LEVEL SECURITY;
CREATE POLICY journals_runtime_owner ON public.journals
  FOR ALL TO journalpilot
  USING ("userId" = journalpilot_private.current_user_id())
  WITH CHECK ("userId" = journalpilot_private.current_user_id());

ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries FORCE ROW LEVEL SECURITY;
CREATE POLICY journal_entries_runtime_owner ON public.journal_entries
  FOR ALL TO journalpilot
  USING (EXISTS (
    SELECT 1
    FROM public.journals AS j
    WHERE j.id = "journalId"
      AND j."userId" = journalpilot_private.current_user_id()
  ))
  WITH CHECK (EXISTS (
    SELECT 1
    FROM public.journals AS j
    WHERE j.id = "journalId"
      AND j."userId" = journalpilot_private.current_user_id()
  ));

ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media FORCE ROW LEVEL SECURITY;
CREATE POLICY media_runtime_owner ON public.media
  FOR ALL TO journalpilot
  USING (EXISTS (
    SELECT 1
    FROM public.journal_entries AS e
    JOIN public.journals AS j ON j.id = e."journalId"
    WHERE e.id = "entryId"
      AND j."userId" = journalpilot_private.current_user_id()
  ))
  WITH CHECK (EXISTS (
    SELECT 1
    FROM public.journal_entries AS e
    JOIN public.journals AS j ON j.id = e."journalId"
    WHERE e.id = "entryId"
      AND j."userId" = journalpilot_private.current_user_id()
  ));

ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations FORCE ROW LEVEL SECURITY;
CREATE POLICY locations_runtime_owner ON public.locations
  FOR ALL TO journalpilot
  USING (EXISTS (
    SELECT 1
    FROM public.journal_entries AS e
    JOIN public.journals AS j ON j.id = e."journalId"
    WHERE e.id = "entryId"
      AND j."userId" = journalpilot_private.current_user_id()
  ))
  WITH CHECK (EXISTS (
    SELECT 1
    FROM public.journal_entries AS e
    JOIN public.journals AS j ON j.id = e."journalId"
    WHERE e.id = "entryId"
      AND j."userId" = journalpilot_private.current_user_id()
  ));

ALTER TABLE public.embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.embeddings FORCE ROW LEVEL SECURITY;
CREATE POLICY embeddings_runtime_owner ON public.embeddings
  FOR ALL TO journalpilot
  USING (EXISTS (
    SELECT 1
    FROM public.journal_entries AS e
    JOIN public.journals AS j ON j.id = e."journalId"
    WHERE e.id = "entryId"
      AND j."userId" = journalpilot_private.current_user_id()
  ))
  WITH CHECK (EXISTS (
    SELECT 1
    FROM public.journal_entries AS e
    JOIN public.journals AS j ON j.id = e."journalId"
    WHERE e.id = "entryId"
      AND j."userId" = journalpilot_private.current_user_id()
  ));

ALTER TABLE public.ai_processing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_processing FORCE ROW LEVEL SECURITY;
CREATE POLICY ai_processing_runtime_owner ON public.ai_processing
  FOR ALL TO journalpilot
  USING (
    (
      ("entryId" IS NOT NULL AND EXISTS (
        SELECT 1
        FROM public.journal_entries AS e
        JOIN public.journals AS j ON j.id = e."journalId"
        WHERE e.id = "entryId"
          AND j."userId" = journalpilot_private.current_user_id()
      ))
      OR
      ("mediaId" IS NOT NULL AND EXISTS (
        SELECT 1
        FROM public.media AS m
        JOIN public.journal_entries AS e ON e.id = m."entryId"
        JOIN public.journals AS j ON j.id = e."journalId"
        WHERE m.id = "mediaId"
          AND j."userId" = journalpilot_private.current_user_id()
      ))
    )
    AND (
      "entryId" IS NULL OR EXISTS (
        SELECT 1
        FROM public.journal_entries AS e
        JOIN public.journals AS j ON j.id = e."journalId"
        WHERE e.id = "entryId"
          AND j."userId" = journalpilot_private.current_user_id()
      )
    )
    AND (
      "mediaId" IS NULL OR EXISTS (
        SELECT 1
        FROM public.media AS m
        JOIN public.journal_entries AS e ON e.id = m."entryId"
        JOIN public.journals AS j ON j.id = e."journalId"
        WHERE m.id = "mediaId"
          AND j."userId" = journalpilot_private.current_user_id()
      )
    )
  )
  WITH CHECK (
    (
      ("entryId" IS NOT NULL AND EXISTS (
        SELECT 1
        FROM public.journal_entries AS e
        JOIN public.journals AS j ON j.id = e."journalId"
        WHERE e.id = "entryId"
          AND j."userId" = journalpilot_private.current_user_id()
      ))
      OR
      ("mediaId" IS NOT NULL AND EXISTS (
        SELECT 1
        FROM public.media AS m
        JOIN public.journal_entries AS e ON e.id = m."entryId"
        JOIN public.journals AS j ON j.id = e."journalId"
        WHERE m.id = "mediaId"
          AND j."userId" = journalpilot_private.current_user_id()
      ))
    )
    AND (
      "entryId" IS NULL OR EXISTS (
        SELECT 1
        FROM public.journal_entries AS e
        JOIN public.journals AS j ON j.id = e."journalId"
        WHERE e.id = "entryId"
          AND j."userId" = journalpilot_private.current_user_id()
      )
    )
    AND (
      "mediaId" IS NULL OR EXISTS (
        SELECT 1
        FROM public.media AS m
        JOIN public.journal_entries AS e ON e.id = m."entryId"
        JOIN public.journals AS j ON j.id = e."journalId"
        WHERE m.id = "mediaId"
          AND j."userId" = journalpilot_private.current_user_id()
      )
    )
  );

ALTER TABLE public.ai_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_metadata FORCE ROW LEVEL SECURITY;
CREATE POLICY ai_metadata_runtime_owner ON public.ai_metadata
  FOR ALL TO journalpilot
  USING (
    (
      ("entryId" IS NOT NULL AND EXISTS (
        SELECT 1
        FROM public.journal_entries AS e
        JOIN public.journals AS j ON j.id = e."journalId"
        WHERE e.id = "entryId"
          AND j."userId" = journalpilot_private.current_user_id()
      ))
      OR
      ("mediaId" IS NOT NULL AND EXISTS (
        SELECT 1
        FROM public.media AS m
        JOIN public.journal_entries AS e ON e.id = m."entryId"
        JOIN public.journals AS j ON j.id = e."journalId"
        WHERE m.id = "mediaId"
          AND j."userId" = journalpilot_private.current_user_id()
      ))
    )
    AND (
      "entryId" IS NULL OR EXISTS (
        SELECT 1
        FROM public.journal_entries AS e
        JOIN public.journals AS j ON j.id = e."journalId"
        WHERE e.id = "entryId"
          AND j."userId" = journalpilot_private.current_user_id()
      )
    )
    AND (
      "mediaId" IS NULL OR EXISTS (
        SELECT 1
        FROM public.media AS m
        JOIN public.journal_entries AS e ON e.id = m."entryId"
        JOIN public.journals AS j ON j.id = e."journalId"
        WHERE m.id = "mediaId"
          AND j."userId" = journalpilot_private.current_user_id()
      )
    )
  )
  WITH CHECK (
    (
      ("entryId" IS NOT NULL AND EXISTS (
        SELECT 1
        FROM public.journal_entries AS e
        JOIN public.journals AS j ON j.id = e."journalId"
        WHERE e.id = "entryId"
          AND j."userId" = journalpilot_private.current_user_id()
      ))
      OR
      ("mediaId" IS NOT NULL AND EXISTS (
        SELECT 1
        FROM public.media AS m
        JOIN public.journal_entries AS e ON e.id = m."entryId"
        JOIN public.journals AS j ON j.id = e."journalId"
        WHERE m.id = "mediaId"
          AND j."userId" = journalpilot_private.current_user_id()
      ))
    )
    AND (
      "entryId" IS NULL OR EXISTS (
        SELECT 1
        FROM public.journal_entries AS e
        JOIN public.journals AS j ON j.id = e."journalId"
        WHERE e.id = "entryId"
          AND j."userId" = journalpilot_private.current_user_id()
      )
    )
    AND (
      "mediaId" IS NULL OR EXISTS (
        SELECT 1
        FROM public.media AS m
        JOIN public.journal_entries AS e ON e.id = m."entryId"
        JOIN public.journals AS j ON j.id = e."journalId"
        WHERE m.id = "mediaId"
          AND j."userId" = journalpilot_private.current_user_id()
      )
    )
  );

ALTER TABLE public.weekly_reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_reflections FORCE ROW LEVEL SECURITY;
CREATE POLICY weekly_reflections_runtime_owner ON public.weekly_reflections
  FOR ALL TO journalpilot
  USING ("userId" = journalpilot_private.current_user_id())
  WITH CHECK ("userId" = journalpilot_private.current_user_id());

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations FORCE ROW LEVEL SECURITY;
CREATE POLICY conversations_runtime_owner ON public.conversations
  FOR ALL TO journalpilot
  USING (
    "userId" = journalpilot_private.current_user_id()
    AND (
      "journalId" IS NULL OR EXISTS (
        SELECT 1
        FROM public.journals AS j
        WHERE j.id = "journalId"
          AND j."userId" = journalpilot_private.current_user_id()
      )
    )
  )
  WITH CHECK (
    "userId" = journalpilot_private.current_user_id()
    AND (
      "journalId" IS NULL OR EXISTS (
        SELECT 1
        FROM public.journals AS j
        WHERE j.id = "journalId"
          AND j."userId" = journalpilot_private.current_user_id()
      )
    )
  );

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages FORCE ROW LEVEL SECURITY;
CREATE POLICY messages_runtime_owner ON public.messages
  FOR ALL TO journalpilot
  USING (EXISTS (
    SELECT 1
    FROM public.conversations AS c
    WHERE c.id = "conversationId"
      AND c."userId" = journalpilot_private.current_user_id()
  ))
  WITH CHECK (EXISTS (
    SELECT 1
    FROM public.conversations AS c
    WHERE c.id = "conversationId"
      AND c."userId" = journalpilot_private.current_user_id()
  ));

-- Keep the application user row synchronized with Supabase Auth identities.
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.users (id, "createdAt", "updatedAt")
  VALUES (NEW.id, pg_catalog.now(), pg_catalog.now())
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_deleted_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  DELETE FROM public.users WHERE id = OLD.id;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;
CREATE TRIGGER on_auth_user_deleted
  AFTER DELETE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_deleted_auth_user();

-- Backfill identities that existed before this migration.
INSERT INTO public.users (id, "createdAt", "updatedAt")
SELECT id, pg_catalog.now(), pg_catalog.now()
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- Application tables are private by default. User-owned rows can only be
-- accessed through Supabase with a JWT whose subject owns the row.
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_processing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY users_self_access ON public.users
  FOR ALL TO authenticated
  USING (id = (SELECT auth.uid()))
  WITH CHECK (id = (SELECT auth.uid()));

CREATE POLICY journals_owner_access ON public.journals
  FOR ALL TO authenticated
  USING ("userId" = (SELECT auth.uid()))
  WITH CHECK ("userId" = (SELECT auth.uid()));

CREATE POLICY journal_entries_owner_access ON public.journal_entries
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.journals j
    WHERE j.id = "journalId" AND j."userId" = (SELECT auth.uid())
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.journals j
    WHERE j.id = "journalId" AND j."userId" = (SELECT auth.uid())
  ));

CREATE POLICY media_owner_access ON public.media
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.journal_entries e
    JOIN public.journals j ON j.id = e."journalId"
    WHERE e.id = "entryId" AND j."userId" = (SELECT auth.uid())
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.journal_entries e
    JOIN public.journals j ON j.id = e."journalId"
    WHERE e.id = "entryId" AND j."userId" = (SELECT auth.uid())
  ));

CREATE POLICY locations_owner_access ON public.locations
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.journal_entries e
    JOIN public.journals j ON j.id = e."journalId"
    WHERE e.id = "entryId" AND j."userId" = (SELECT auth.uid())
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.journal_entries e
    JOIN public.journals j ON j.id = e."journalId"
    WHERE e.id = "entryId" AND j."userId" = (SELECT auth.uid())
  ));

CREATE POLICY embeddings_owner_access ON public.embeddings
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.journal_entries e
    JOIN public.journals j ON j.id = e."journalId"
    WHERE e.id = "entryId" AND j."userId" = (SELECT auth.uid())
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.journal_entries e
    JOIN public.journals j ON j.id = e."journalId"
    WHERE e.id = "entryId" AND j."userId" = (SELECT auth.uid())
  ));

CREATE POLICY ai_processing_owner_access ON public.ai_processing
  FOR ALL TO authenticated
  USING (
    ("entryId" IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.journal_entries e
      JOIN public.journals j ON j.id = e."journalId"
      WHERE e.id = "entryId" AND j."userId" = (SELECT auth.uid())
    )) OR
    ("mediaId" IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.media m
      JOIN public.journal_entries e ON e.id = m."entryId"
      JOIN public.journals j ON j.id = e."journalId"
      WHERE m.id = "mediaId" AND j."userId" = (SELECT auth.uid())
    ))
  )
  WITH CHECK (
    ("entryId" IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.journal_entries e
      JOIN public.journals j ON j.id = e."journalId"
      WHERE e.id = "entryId" AND j."userId" = (SELECT auth.uid())
    )) OR
    ("mediaId" IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.media m
      JOIN public.journal_entries e ON e.id = m."entryId"
      JOIN public.journals j ON j.id = e."journalId"
      WHERE m.id = "mediaId" AND j."userId" = (SELECT auth.uid())
    ))
  );

CREATE POLICY ai_metadata_owner_access ON public.ai_metadata
  FOR ALL TO authenticated
  USING (
    ("entryId" IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.journal_entries e
      JOIN public.journals j ON j.id = e."journalId"
      WHERE e.id = "entryId" AND j."userId" = (SELECT auth.uid())
    )) OR
    ("mediaId" IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.media m
      JOIN public.journal_entries e ON e.id = m."entryId"
      JOIN public.journals j ON j.id = e."journalId"
      WHERE m.id = "mediaId" AND j."userId" = (SELECT auth.uid())
    ))
  )
  WITH CHECK (
    ("entryId" IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.journal_entries e
      JOIN public.journals j ON j.id = e."journalId"
      WHERE e.id = "entryId" AND j."userId" = (SELECT auth.uid())
    )) OR
    ("mediaId" IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.media m
      JOIN public.journal_entries e ON e.id = m."entryId"
      JOIN public.journals j ON j.id = e."journalId"
      WHERE m.id = "mediaId" AND j."userId" = (SELECT auth.uid())
    ))
  );

CREATE POLICY reflections_owner_access ON public.weekly_reflections
  FOR ALL TO authenticated
  USING ("userId" = (SELECT auth.uid()))
  WITH CHECK ("userId" = (SELECT auth.uid()));

CREATE POLICY conversations_owner_access ON public.conversations
  FOR ALL TO authenticated
  USING ("userId" = (SELECT auth.uid()))
  WITH CHECK (
    "userId" = (SELECT auth.uid())
    AND ("journalId" IS NULL OR EXISTS (
      SELECT 1 FROM public.journals j
      WHERE j.id = "journalId" AND j."userId" = (SELECT auth.uid())
    ))
  );

CREATE POLICY messages_owner_access ON public.messages
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = "conversationId" AND c."userId" = (SELECT auth.uid())
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = "conversationId" AND c."userId" = (SELECT auth.uid())
  ));

-- Media objects are private. Object names must begin with the authenticated
-- user's UUID so policies can enforce tenant ownership on every operation.
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('journal-media', 'journal-media', false, 10485760)
ON CONFLICT (id) DO UPDATE SET public = false;

CREATE POLICY journal_media_read_own ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'journal-media'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

CREATE POLICY journal_media_insert_own ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'journal-media'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

CREATE POLICY journal_media_update_own ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'journal-media'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  )
  WITH CHECK (
    bucket_id = 'journal-media'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

CREATE POLICY journal_media_delete_own ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'journal-media'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

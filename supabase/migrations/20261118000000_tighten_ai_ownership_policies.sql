-- AI rows may reference an entry, media object, or both. When both references
-- are present, require both resources to belong to the authenticated user.
DROP POLICY IF EXISTS ai_processing_owner_access ON public.ai_processing;
CREATE POLICY ai_processing_owner_access ON public.ai_processing
  FOR ALL TO authenticated
  USING (
    (
      ("entryId" IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.journal_entries e
        JOIN public.journals j ON j.id = e."journalId"
        WHERE e.id = "entryId" AND j."userId" = (SELECT auth.uid())
      ))
      OR
      ("mediaId" IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.media m
        JOIN public.journal_entries e ON e.id = m."entryId"
        JOIN public.journals j ON j.id = e."journalId"
        WHERE m.id = "mediaId" AND j."userId" = (SELECT auth.uid())
      ))
    )
    AND (
      "entryId" IS NULL OR EXISTS (
        SELECT 1 FROM public.journal_entries e
        JOIN public.journals j ON j.id = e."journalId"
        WHERE e.id = "entryId" AND j."userId" = (SELECT auth.uid())
      )
    )
    AND (
      "mediaId" IS NULL OR EXISTS (
        SELECT 1 FROM public.media m
        JOIN public.journal_entries e ON e.id = m."entryId"
        JOIN public.journals j ON j.id = e."journalId"
        WHERE m.id = "mediaId" AND j."userId" = (SELECT auth.uid())
      )
    )
  )
  WITH CHECK (
    (
      ("entryId" IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.journal_entries e
        JOIN public.journals j ON j.id = e."journalId"
        WHERE e.id = "entryId" AND j."userId" = (SELECT auth.uid())
      ))
      OR
      ("mediaId" IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.media m
        JOIN public.journal_entries e ON e.id = m."entryId"
        JOIN public.journals j ON j.id = e."journalId"
        WHERE m.id = "mediaId" AND j."userId" = (SELECT auth.uid())
      ))
    )
    AND (
      "entryId" IS NULL OR EXISTS (
        SELECT 1 FROM public.journal_entries e
        JOIN public.journals j ON j.id = e."journalId"
        WHERE e.id = "entryId" AND j."userId" = (SELECT auth.uid())
      )
    )
    AND (
      "mediaId" IS NULL OR EXISTS (
        SELECT 1 FROM public.media m
        JOIN public.journal_entries e ON e.id = m."entryId"
        JOIN public.journals j ON j.id = e."journalId"
        WHERE m.id = "mediaId" AND j."userId" = (SELECT auth.uid())
      )
    )
  );

DROP POLICY IF EXISTS ai_metadata_owner_access ON public.ai_metadata;
CREATE POLICY ai_metadata_owner_access ON public.ai_metadata
  FOR ALL TO authenticated
  USING (
    (
      ("entryId" IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.journal_entries e
        JOIN public.journals j ON j.id = e."journalId"
        WHERE e.id = "entryId" AND j."userId" = (SELECT auth.uid())
      ))
      OR
      ("mediaId" IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.media m
        JOIN public.journal_entries e ON e.id = m."entryId"
        JOIN public.journals j ON j.id = e."journalId"
        WHERE m.id = "mediaId" AND j."userId" = (SELECT auth.uid())
      ))
    )
    AND (
      "entryId" IS NULL OR EXISTS (
        SELECT 1 FROM public.journal_entries e
        JOIN public.journals j ON j.id = e."journalId"
        WHERE e.id = "entryId" AND j."userId" = (SELECT auth.uid())
      )
    )
    AND (
      "mediaId" IS NULL OR EXISTS (
        SELECT 1 FROM public.media m
        JOIN public.journal_entries e ON e.id = m."entryId"
        JOIN public.journals j ON j.id = e."journalId"
        WHERE m.id = "mediaId" AND j."userId" = (SELECT auth.uid())
      )
    )
  )
  WITH CHECK (
    (
      ("entryId" IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.journal_entries e
        JOIN public.journals j ON j.id = e."journalId"
        WHERE e.id = "entryId" AND j."userId" = (SELECT auth.uid())
      ))
      OR
      ("mediaId" IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.media m
        JOIN public.journal_entries e ON e.id = m."entryId"
        JOIN public.journals j ON j.id = e."journalId"
        WHERE m.id = "mediaId" AND j."userId" = (SELECT auth.uid())
      ))
    )
    AND (
      "entryId" IS NULL OR EXISTS (
        SELECT 1 FROM public.journal_entries e
        JOIN public.journals j ON j.id = e."journalId"
        WHERE e.id = "entryId" AND j."userId" = (SELECT auth.uid())
      )
    )
    AND (
      "mediaId" IS NULL OR EXISTS (
        SELECT 1 FROM public.media m
        JOIN public.journal_entries e ON e.id = m."entryId"
        JOIN public.journals j ON j.id = e."journalId"
        WHERE m.id = "mediaId" AND j."userId" = (SELECT auth.uid())
      )
    )
  );

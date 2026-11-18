-- The API uses its own PostgreSQL role. Grant only the operations needed by
-- the entry endpoints when that role exists in the deployment database.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'journalpilot') THEN
    EXECUTE 'GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.journal_entries TO journalpilot';
  END IF;
END
$$;

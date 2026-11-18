# ADR 0001: PostgreSQL Row-Level Security for Tenant Isolation

- Status: Accepted
- Date: 2026-11-19

## Context

JournalPilot is a multi-tenant journal application. NestJS verifies Supabase
access tokens, resolves the user's ID, and existing Prisma services include
ownership predicates. A missed predicate could still expose rows because
application query filters are not enforced by PostgreSQL.

The API connects directly to PostgreSQL through Prisma as the shared
`journalpilot` role. It does not send requests through Supabase's PostgREST
gateway, so Supabase's `auth.uid()` context is not automatically present in
Prisma queries. The repository's earlier Supabase policies therefore do not
provide RLS for this direct Prisma connection.

The audited development database had RLS disabled on application tables. Its
runtime role was not superuser and did not have `BYPASSRLS`; it owned the
database but not the tenant tables. Database ownership does not itself bypass
table RLS, and `FORCE ROW LEVEL SECURITY` is enabled. The migration URL used a
separate superuser account. The migration does not change these database
roles.

## Decision

Keep API authentication and Prisma ownership predicates. Add PostgreSQL RLS as
defense in depth, using a transaction-local custom setting supplied by the
trusted API after token verification.

`PrismaService.withUserContext(userId, operation)` starts an interactive
transaction, parameterizes `set_config('journalpilot.user_id', userId, true)`,
and invokes the callback with that transaction client. All tenant queries in
that operation must use the callback's transaction client. The `true` argument
makes the setting local to the transaction and prevents it from persisting
when a pooled connection is reused.

The RLS function `journalpilot_private.current_user_id()` returns a UUID only
for a valid transaction-local setting; missing/invalid context returns NULL.
Policies target the `journalpilot` runtime role, use `USING` and `WITH CHECK`,
and are forced on tenant tables. The migration rejects a runtime role that is
a superuser or has `BYPASSRLS`.

Policies cover `users`, `journals`, `journal_entries`, `media`, `locations`,
`embeddings`, `ai_processing`, `ai_metadata`, `weekly_reflections`,
`conversations`, and `messages`, following the ownership chain in the data
model. AI rows must reference at least one source, and every non-null source
must belong to the current user. Prisma migration metadata and PostGIS
reference data are excluded.

## Alternatives considered

1. **Keep only Prisma ownership filters.** This matches current API behavior,
   but PostgreSQL cannot catch a missing filter in a future query.
2. **Route API database operations through Supabase PostgREST.** This would
   supply Supabase JWT claims for `auth.uid()`, but it conflicts with the
   existing direct Prisma architecture and would require a broad data-access
   rewrite.
3. **Create a database login per application user.** This can provide
   database-recognized identities, but user lifecycle, connection pooling,
   and credential management become disproportionate for this application.
4. **Set a session-wide user variable.** Rejected because pooled connections
   could retain context across requests.

## Security trade-offs

The API passes a verified identity, not a user ID taken from a request body or
query parameter. Prisma's tagged SQL API parameterizes the context-setting
value. All ordinary query inputs continue through Prisma's parameterized
queries.

The shared runtime database role can set its own custom setting. This design
therefore protects against accidentally omitted ownership predicates while
the API is trusted; it does not protect against arbitrary SQL execution under
the API role or stolen runtime credentials. Preventing that stronger threat
would require a different identity architecture, such as database-verified
signed claims or per-tenant database identities.

The current worker has no database operations. Any future tenant-aware worker
must set context from a trusted job source and use it for the whole transaction.
System-wide jobs need a separate explicit authorization design; do not grant
`BYPASSRLS` as a shortcut.

Runtime and migration roles must remain separate. The currently configured
migration role is superuser in local development; production should use a
dedicated schema-migration role with only required DDL privileges and no
`BYPASSRLS`. The API runtime role must not own tenant tables. The local
development role owns its database; production should use a runtime role that
does not own the database either, and a separate least-privileged migration
role.

## Migration and rollback

Apply the Prisma migration only to a reviewed target database after taking a
backup and confirming the runtime role exists, is not superuser or
`BYPASSRLS`, and does not own tenant tables. Deploy the API code that wraps
tenant operations in `withUserContext` with the migration so requests
establish context. The repository command is:

```bash
pnpm db:migrate:deploy
```

It uses `MIGRATION_DATABASE_URL`, not the API's `DATABASE_URL`. Do not apply it
to a production database without the normal review and backup process.

### Local development rollout

On 2026-11-19, the entry runtime-permissions migration and this RLS migration
were applied to the local `journalpilot` development database in one
transaction after explicit approval. The Prisma CLI hung before connecting,
including for `prisma --version`, so the checked-in SQL files were executed
through the configured migration connection and their SHA-256 checksums were
recorded in `_prisma_migrations`. The checksums and migration history were
verified afterward. The Prisma CLI should be repaired before the next migration
deployment so normal migration commands can be used again.

Read-only verification as the `journalpilot` runtime role confirmed all eleven
tenant tables have RLS enabled and forced, each has one runtime owner policy,
and queries without a transaction-local user context return no rows. The
disposable integration suite verified cross-user CRUD denial and pool-context
reset. This rollout applies only to the local PostgreSQL database; it did not
change the remote Supabase project or Supabase Storage policies.

Prisma migrations are forward-only. If a production rollout must be reversed,
prefer a corrective forward migration. In an emergency coordinated rollback,
first put the API into maintenance mode, then restore the compatible code and
run a reviewed SQL rollback as the migration role. The rollback must drop the
`journalpilot` policies, remove `FORCE` and `ENABLE ROW LEVEL SECURITY` from
the listed tenant tables, revoke the migration's related-table `SELECT`
grants, and drop `journalpilot_private.current_user_id()` and its schema.
Disabling RLS reduces database protection to the API ownership filters, so do
not do it as an uncoordinated response to request failures.

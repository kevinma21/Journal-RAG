## Local Development

### Prerequisites

The local development environment uses:

- Node.js
- pnpm
- PostgreSQL
- Docker
- Docker Compose

PostgreSQL is installed locally and provides:

- PostgreSQL
- pgvector
- PostGIS

Redis runs locally through Docker Compose.

Supabase Auth and Supabase Storage use the configured Supabase project.

### Repository Setup

Clone the repository and install workspace dependencies:

```bash
pnpm install
```

### Environment Configuration

Create the required environment files from the provided examples.

The project separates configuration by application and tooling:

```text
.env
apps/api/.env
apps/web/.env.local
```

The root `.env` is the shared source for `DATABASE_URL` (API runtime) and the
Prisma migration URLs (`MIGRATION_DATABASE_URL` and `SHADOW_DATABASE_URL`). The
API loads those values as well as API-specific settings from `apps/api/.env`.

API runtime configuration includes Redis and server-side services.

Next.js local configuration contains the public Supabase configuration.

Never commit local `.env` files or secrets.

### Start PostgreSQL

Make sure the local PostgreSQL server is running.

The JournalPilot database must have the required PostgreSQL extensions:

```text
pgvector
PostGIS
```

Verify that the `journalpilot` database is available before starting the application.

### Start Redis

Redis is managed through Docker Compose.

From the repository root:

```bash
docker compose up -d redis
```

Verify the container:

```bash
docker compose ps
```

Verify Redis:

```bash
docker exec journalpilot-redis redis-cli ping
```

Expected:

```text
PONG
```

### Start the Applications

Run the applications from separate terminals.

Web:

```bash
pnpm --filter web dev
```

API:

```bash
pnpm --filter api start:dev
```

Worker:

```bash
pnpm --filter worker start:dev
```

### Local Architecture

The local development environment is:

```text
                    JournalPilot
                         │
       ┌─────────────────┼─────────────────┐
       │                 │                 │
       ▼                 ▼                 ▼
    Next.js           NestJS API         Worker
       │                 │                 │
       │                 ├───────┐         │
       │                 │       │         │
       │                 ▼       ▼         ▼
       │            PostgreSQL  Redis    BullMQ
       │            + pgvector           processing
       │            + PostGIS
       │
       └──────────── Supabase Cloud
                    ├── Auth
                    └── Storage
```

PostgreSQL is the authoritative application data store.

Redis is used as queue infrastructure for BullMQ and is not the source of truth for journal data.

### Stop Local Infrastructure

Stop Redis:

```bash
docker compose down
```

The Redis volume is preserved unless volumes are explicitly removed.

### Useful Commands

Check Docker services:

```bash
docker compose ps
```

View Redis logs:

```bash
docker compose logs redis
```

Restart Redis:

```bash
docker compose restart redis
```

Check workspace packages:

```bash
pnpm -r list --depth -1
```

### Image attachments

Apply the media migrations to the application database and the private Supabase
Storage bucket before enabling the editor controls. The Prisma migration creates
the non-login PostgreSQL role `journalpilot_media_cleanup`. Grant it to a
dedicated worker login and configure these variables in the worker process.

- `MEDIA_CLEANUP_DATABASE_URL` for the dedicated cleanup login
- `REDIS_URL` for the same BullMQ Redis instance used by the API
- `SUPABASE_URL` and `SUPABASE_SECRET_KEY` for private Storage cleanup
- `SUPABASE_SECRET_KEY` also belongs in the API runtime for media verification
  and URL signing

After verifying the API and worker in the target environment, set
`NEXT_PUBLIC_MEDIA_ATTACHMENTS=true` and rebuild the web app. The editor accepts
up to 12 JPEG, PNG, or WebP photos per entry, at most 6 MiB per file.

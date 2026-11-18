#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "$0")/../../.." && pwd)"
container_name="journalpilot-rls-test-$$"
admin_password="journalpilot-rls-admin-test"

cleanup() {
  docker rm --force "$container_name" >/dev/null 2>&1 || true
}
trap cleanup EXIT

docker run --detach --rm \
  --name "$container_name" \
  --env POSTGRES_PASSWORD="$admin_password" \
  --env POSTGRES_DB=journalpilot_test \
  --publish 127.0.0.1::5432 \
  postgres:18-alpine >/dev/null

port="$(docker port "$container_name" 5432/tcp | awk -F: '{print $NF}')"

ready=false
for attempt in $(seq 1 60); do
  if docker exec "$container_name" pg_isready -h 127.0.0.1 -U postgres -d journalpilot_test >/dev/null 2>&1; then
    ready=true
    break
  fi
  sleep 1
done

if [ "$ready" != true ]; then
  printf '%s\n' 'Disposable PostgreSQL did not become ready.' >&2
  exit 1
fi

docker exec -i "$container_name" \
  psql --host 127.0.0.1 --set ON_ERROR_STOP=1 --username postgres --dbname journalpilot_test \
  < "$repo_root/apps/api/test/rls-fixture.sql"

docker exec -i "$container_name" \
  psql --host 127.0.0.1 --set ON_ERROR_STOP=1 --username postgres --dbname journalpilot_test \
  < "$repo_root/prisma/migrations/20261119100000_prisma_tenant_rls/migration.sql"

DATABASE_URL="postgresql://journalpilot:journalpilot-rls-test@127.0.0.1:${port}/journalpilot_test" \
DATABASE_POOL_MAX=1 \
RLS_ADMIN_DATABASE_URL="postgresql://postgres:${admin_password}@127.0.0.1:${port}/journalpilot_test" \
  pnpm --filter api exec vitest run \
    --config test/vitest.config.rls.ts \
    --maxWorkers=1 \
    --no-file-parallelism

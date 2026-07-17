#!/bin/sh
set -eu

ROOT=/opt/carreiras-match
BACKUP="${1:?backup path required}"
ENV_FILE="$ROOT/.env"
LOAD_COPY="$ROOT/backups/postgres-load.db"
LOAD_FILE="$ROOT/backups/pgloader.load"
trap 'rm -f "$LOAD_FILE"' EXIT

if grep -q '^POSTGRES_PASSWORD=' "$ENV_FILE"; then
  POSTGRES_PASSWORD="$(sed -n 's/^POSTGRES_PASSWORD=//p' "$ENV_FILE" | tail -1)"
else
  POSTGRES_PASSWORD="$(openssl rand -hex 32)"
  {
    echo "POSTGRES_USER=carreiras"
    echo "POSTGRES_PASSWORD=$POSTGRES_PASSWORD"
    echo "POSTGRES_DB=carreiras_match"
  } >> "$ENV_FILE"
fi

docker volume create carreiras-match_postgres-data >/dev/null
if ! docker ps -a --format '{{.Names}}' | grep -qx carreiras-match-postgres; then
  docker run -d \
    --name carreiras-match-postgres \
    --restart unless-stopped \
    --network carreiras-match_default \
    -v carreiras-match_postgres-data:/var/lib/postgresql/data \
    -e POSTGRES_USER=carreiras \
    -e POSTGRES_PASSWORD="$POSTGRES_PASSWORD" \
    -e POSTGRES_DB=carreiras_match \
    postgres:17-alpine >/dev/null
fi

until docker exec carreiras-match-postgres pg_isready -U carreiras -d carreiras_match >/dev/null 2>&1; do
  sleep 1
done

docker run --rm \
  -v "$ROOT/backups:/backups" \
  alpine:3.22 sh -c \
  "apk add --no-cache sqlite >/dev/null && cp /backups/$(basename "$BACKUP") /backups/postgres-load.db && sqlite3 /backups/postgres-load.db 'DROP TABLE IF EXISTS _prisma_migrations;'"

docker exec -e PGPASSWORD="$POSTGRES_PASSWORD" carreiras-match-postgres \
  psql -U carreiras -d carreiras_match -v ON_ERROR_STOP=1 -c \
  'DROP SCHEMA public CASCADE; CREATE SCHEMA public;'

{
  echo "LOAD DATABASE"
  echo "FROM sqlite:///data/source.db"
  echo "INTO postgresql://carreiras:$POSTGRES_PASSWORD@carreiras-match-postgres/carreiras_match"
  echo "WITH create tables, create indexes, reset sequences, foreign keys, quote identifiers;"
} > "$LOAD_FILE"

docker run --rm \
  --network carreiras-match_default \
  -v "$LOAD_COPY:/data/source.db:ro" \
  -v "$LOAD_FILE:/data/pgloader.load:ro" \
  dimitri/pgloader:latest \
  pgloader /data/pgloader.load

docker exec -e PGPASSWORD="$POSTGRES_PASSWORD" carreiras-match-postgres \
  psql -U carreiras -d carreiras_match -v ON_ERROR_STOP=1 -c \
  'SELECT COUNT(*) AS users FROM "User"; SELECT COUNT(*) AS resumes FROM "Resume"; SELECT COUNT(*) AS analyses FROM "Analysis"; SELECT COUNT(*) AS payments FROM "Payment"; SELECT COUNT(*) AS subscriptions FROM "Subscription"; SELECT COUNT(*) AS page_views FROM "PageView";'

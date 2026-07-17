#!/bin/sh
set -eu
cd /opt/carreiras-match
. ./.env
DATABASE_URL="postgresql://${POSTGRES_USER:-carreiras}:$POSTGRES_PASSWORD@carreiras-match-postgres:5432/${POSTGRES_DB:-carreiras_match}"

docker run --rm \
  --network carreiras-match_default \
  -e DATABASE_URL="$DATABASE_URL" \
  --entrypoint sh \
  carreiras-match-app \
  -c 'for path in prisma/migrations/*; do test -d "$path" || continue; name="$(basename "$path")"; npx prisma migrate resolve --applied "$name"; done'

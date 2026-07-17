#!/bin/sh
set -eu
cd /opt/carreiras-match
PASSWORD="$(sed -n 's/^POSTGRES_PASSWORD=//p' .env | tail -1)"
docker exec -e PGPASSWORD="$PASSWORD" carreiras-match-postgres \
  psql -U carreiras -d carreiras_match -At -c \
  "SELECT table_name || '.' || column_name FROM information_schema.columns WHERE table_schema='public' AND table_name IN ('User','Resume','Analysis','Payment') ORDER BY table_name, ordinal_position;"

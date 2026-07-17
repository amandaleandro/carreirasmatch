#!/bin/sh
set -eu
cd /opt/carreiras-match
PASSWORD="$(sed -n 's/^POSTGRES_PASSWORD=//p' .env | tail -1)"
docker exec -e PGPASSWORD="$PASSWORD" carreiras-match-postgres \
  psql -U carreiras -d carreiras_match -At -c \
  "SELECT table_name || '.' || column_name FROM information_schema.columns WHERE table_schema='public' AND table_name IN ('User','Resume','Analysis','Payment') ORDER BY table_name, ordinal_position;"

docker exec -e PGPASSWORD="$PASSWORD" carreiras-match-postgres \
  psql -U carreiras -d carreiras_match -At -c \
  "SELECT 'User',COUNT(*) FROM \"User\" UNION ALL SELECT 'Resume',COUNT(*) FROM \"Resume\" UNION ALL SELECT 'Analysis',COUNT(*) FROM \"Analysis\" UNION ALL SELECT 'Payment',COUNT(*) FROM \"Payment\" UNION ALL SELECT 'Subscription',COUNT(*) FROM \"Subscription\" UNION ALL SELECT 'PageView',COUNT(*) FROM \"PageView\";"

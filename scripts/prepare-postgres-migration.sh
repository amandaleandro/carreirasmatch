#!/bin/sh
set -eu

STAMP="${1:?stamp required}"
ROOT=/opt/carreiras-match
BACKUP="$ROOT/backups/postgres-migration-$STAMP.db"

mkdir -p "$ROOT/backups"
docker run --rm \
  -v carreiras-match_sqlite-data:/data \
  -v "$ROOT/backups:/backups" \
  alpine:3.22 sh -c \
  "apk add --no-cache sqlite >/dev/null && sqlite3 /data/dev.db '.backup /backups/postgres-migration-$STAMP.db' && sqlite3 /backups/postgres-migration-$STAMP.db 'PRAGMA integrity_check;'"

test -s "$BACKUP"
ls -lh "$BACKUP"
echo "BACKUP=$BACKUP"

docker run --rm \
  -v "$ROOT/backups:/backups" \
  alpine:3.22 sh -c \
  "apk add --no-cache sqlite >/dev/null && sqlite3 -header -column /backups/postgres-migration-$STAMP.db \"SELECT 'User' AS table_name, COUNT(*) AS rows FROM User UNION ALL SELECT 'Resume',COUNT(*) FROM Resume UNION ALL SELECT 'Analysis',COUNT(*) FROM Analysis UNION ALL SELECT 'Payment',COUNT(*) FROM Payment UNION ALL SELECT 'Subscription',COUNT(*) FROM Subscription UNION ALL SELECT 'Application',COUNT(*) FROM Application UNION ALL SELECT 'PageView',COUNT(*) FROM PageView;\""

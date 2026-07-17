#!/bin/sh
set -eu

BACKUP_DIR="${BACKUP_DIR:-/backups}"
INTERVAL="${BACKUP_INTERVAL_SECONDS:-86400}"
RETENTION="${BACKUP_RETENTION_DAYS:-14}"
mkdir -p "$BACKUP_DIR"

while true; do
  stamp="$(date -u +%Y%m%d-%H%M%S)"
  target="$BACKUP_DIR/postgres-$stamp.dump"
  if pg_dump --format=custom --file="$target"; then
    pg_restore --list "$target" >/dev/null
    find "$BACKUP_DIR" -type f -name 'postgres-*.dump' -mtime "+$RETENTION" -delete
  else
    rm -f "$target"
  fi
  sleep "$INTERVAL"
done

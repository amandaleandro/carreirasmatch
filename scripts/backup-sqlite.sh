#!/bin/sh
set -eu

DB_PATH="${DB_PATH:-/data/dev.db}"
BACKUP_DIR="${BACKUP_DIR:-/backups}"
INTERVAL_SECONDS="${BACKUP_INTERVAL_SECONDS:-86400}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-14}"

mkdir -p "$BACKUP_DIR"

while true; do
  timestamp="$(date -u +%Y%m%dT%H%M%SZ)"
  target="$BACKUP_DIR/dev-$timestamp.db"
  temporary="$target.tmp"

  if [ -f "$DB_PATH" ]; then
    sqlite3 "$DB_PATH" ".timeout 10000" ".backup '$temporary'"
    sqlite3 "$temporary" "PRAGMA integrity_check;" | grep -qx "ok"
    mv "$temporary" "$target"
    find "$BACKUP_DIR" -type f -name 'dev-*.db' -mtime "+$RETENTION_DAYS" -delete
    echo "[backup] created $target"
  else
    echo "[backup] database not found at $DB_PATH" >&2
  fi

  sleep "$INTERVAL_SECONDS"
done

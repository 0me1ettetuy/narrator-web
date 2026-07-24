#!/bin/sh
set -eu

BACKUP_DIR="${BACKUP_DIR:-/var/backups/postgres}"
RETENTION_DAYS="${RETENTION_DAYS:-7}"
PGHOST="${PGHOST:?Set PGHOST}"
PGUSER="${PGUSER:?Set PGUSER}"
PGDATABASE="${PGDATABASE:?Set PGDATABASE}"
PGPASSWORD="${PGPASSWORD:?Set PGPASSWORD}"

export PGHOST PGUSER PGDATABASE PGPASSWORD

case "$RETENTION_DAYS" in
  ''|*[!0-9]*)
    echo "RETENTION_DAYS must be a non-negative integer" >&2
    exit 1
    ;;
esac

mkdir -p "$BACKUP_DIR"
umask 077

echo "Waiting for PostgreSQL at $PGHOST..."
until pg_isready -q; do
  sleep 2
done

timestamp="$(date -u +%Y%m%dT%H%M%SZ)"
backup_file="$BACKUP_DIR/${PGDATABASE}_${timestamp}.dump"
tmp_file="${backup_file}.tmp"

echo "Creating backup: $backup_file"
pg_dump --format=custom --no-owner --no-acl --file="$tmp_file"
mv "$tmp_file" "$backup_file"

echo "Pruning backups older than $RETENTION_DAYS days"
find "$BACKUP_DIR" -type f -name "${PGDATABASE}_*.dump" -mtime +"$RETENTION_DAYS" -delete

echo "Backup complete"

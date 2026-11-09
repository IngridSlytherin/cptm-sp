#!/usr/bin/env bash
set -euo pipefail
PROJECT_DIR="${1:-$(pwd)}"
BACKUP_DIR="${2:-$PROJECT_DIR/backups}"
cd "$PROJECT_DIR"
[[ -f .env ]] || { echo "Arquivo .env ausente" >&2; exit 1; }
mkdir -p "$BACKUP_DIR"
BACKUP_FILE="$BACKUP_DIR/rail-status-$(date -u +%Y%m%dT%H%M%SZ).dump"
docker compose -f docker-compose.prod.yml exec -T postgres sh -c 'exec pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc' > "$BACKUP_FILE"
[[ -s "$BACKUP_FILE" ]] || { echo "Backup vazio" >&2; exit 1; }
echo "Backup criado: $BACKUP_FILE"

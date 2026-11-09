#!/usr/bin/env bash
set -euo pipefail
if [[ $# -lt 1 ]]; then echo "Uso: $0 ARQUIVO.dump [DIRETORIO_PROJETO]" >&2; exit 1; fi
BACKUP_FILE="$(realpath "$1")"
PROJECT_DIR="${2:-$(pwd)}"
[[ -r "$BACKUP_FILE" ]] || { echo "Backup não encontrado: $BACKUP_FILE" >&2; exit 1; }
cd "$PROJECT_DIR"
[[ -f .env ]] || { echo "Arquivo .env ausente" >&2; exit 1; }
# A restauração sobrescreve objetos conflitantes; faça um backup atual antes de confirmar.
read -r -p "Restaurar $BACKUP_FILE? Digite RESTAURAR: " confirmation
[[ "$confirmation" == "RESTAURAR" ]] || { echo "Cancelado."; exit 1; }
docker compose -f docker-compose.prod.yml exec -T postgres sh -c 'exec pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --clean --if-exists' < "$BACKUP_FILE"
echo "Restauração concluída."

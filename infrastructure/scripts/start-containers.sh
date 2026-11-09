#!/usr/bin/env bash
set -euo pipefail
PROJECT_DIR="${1:-$(pwd)}"
cd "$PROJECT_DIR"
[[ -f .env ]] || { echo "Arquivo .env ausente em $PROJECT_DIR" >&2; exit 1; }
docker compose -f docker-compose.prod.yml config --quiet
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml ps

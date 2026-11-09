#!/usr/bin/env bash
set -euo pipefail
if [[ ${EUID} -ne 0 ]]; then echo "Execute como root." >&2; exit 1; fi
apt-get update
apt-get install -y ca-certificates curl git ufw
echo "Pacotes básicos instalados. Execute install-docker.sh e create-deploy-user.sh em seguida."

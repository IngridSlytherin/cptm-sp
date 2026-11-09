#!/usr/bin/env bash
set -euo pipefail
if [[ ${EUID} -ne 0 ]]; then echo "Execute como root." >&2; exit 1; fi
DEPLOY_USER="${1:-deploy}"
if ! id "$DEPLOY_USER" >/dev/null 2>&1; then adduser --disabled-password --gecos "" "$DEPLOY_USER"; fi
usermod -aG docker "$DEPLOY_USER"
echo "Usuário $DEPLOY_USER criado. Copie manualmente uma chave pública para /home/$DEPLOY_USER/.ssh/authorized_keys antes de encerrar a sessão atual."

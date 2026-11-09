#!/usr/bin/env bash
set -euo pipefail
if [[ ${EUID} -ne 0 ]]; then echo "Execute como root." >&2; exit 1; fi
# Confirme que o SSH por chave funciona antes de habilitar o firewall para evitar bloqueio remoto.
ufw default deny incoming
ufw default allow outgoing
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
ufw status verbose

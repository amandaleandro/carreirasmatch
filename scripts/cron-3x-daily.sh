#!/bin/bash
# Script para executar a sincronização unificada (UberHub, Prefeituras, CDLs) 3 vezes ao dia
# Pode ser configurado no Crontab do Linux:
# 0 6,14,22 * * * /bin/bash /caminho/do/projeto/scripts/cron-3x-daily.sh

DOMAIN="${SITE_URL:-http://localhost:3000}"
SECRET="${CRON_SECRET:-}"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Disparando sincronização unificada 3x ao dia..."

if [ -n "$SECRET" ]; then
  curl -s -X GET -H "Authorization: Bearer $SECRET" "$DOMAIN/api/cron/sync-all"
else
  curl -s -X GET "$DOMAIN/api/cron/sync-all"
fi

echo ""
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Sincronização disparada com sucesso."

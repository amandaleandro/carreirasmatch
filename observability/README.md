# Observabilidade — Prometheus + Loki + Grafana

Stack de monitoramento self-hosted, complementar ao Sentry (erros) e Plausible (produto):

- **Prometheus** — métricas (série temporal). Faz scrape do app, do Caddy, do host e dos containers.
- **Loki + Promtail** — logs centralizados de todos os containers.
- **Grafana** — dashboards e exploração, em `https://grafana.carreirasmatch.com.br`.
- **cAdvisor** — métricas por container (CPU/memória/rede/IO).
- **node-exporter** — métricas do host (CPU, memória, disco, rede).

Tudo roda num `docker-compose.observability.yml` separado, na mesma rede Docker do app
(`carreiras-match_default`), então nada além do Grafana fica exposto na internet.

## O que já vem instrumentado no app

- `GET /api/metrics` (route handler Next, runtime Node) expõe:
  - métricas de processo Node (heap, event loop lag, GC, CPU) via `prom-client`;
  - métricas de negócio: `carreiras_analysis_total`, `carreiras_analysis_duration_seconds`,
    `carreiras_ai_provider_calls_total`, `carreiras_payment_events_total` (ver `src/lib/metrics.ts`).
- O Caddy expõe `/metrics` no endpoint admin (porta 2019), com taxa de requests,
  status e latência na borda.

O endpoint `/api/metrics` é **bloqueado na internet** pelo Caddy (retorna 404); o Prometheus
o acessa direto pelo container na rede interna.

## Variáveis de ambiente novas (no `.env` da VPS)

```dotenv
# Senha do admin do Grafana (obrigatória para subir a stack)
GRAFANA_ADMIN_PASSWORD=troque-esta-senha
# Usuário admin do Grafana (opcional, padrão: admin)
GRAFANA_ADMIN_USER=admin

# Opcional — trava por token no /api/metrics do app (defesa em profundidade).
# Se setar, descomente o bloco authorization no observability/prometheus/prometheus.yml.
# METRICS_TOKEN=um-token-aleatorio-longo
```

## Subir

Pré-requisito: a stack principal já rodando (a rede `carreiras-match_default` precisa existir).

```bash
# 1. App principal (se ainda não estiver de pé)
docker compose up -d

# 2. Stack de observabilidade
docker compose -f docker-compose.observability.yml up -d
```

## DNS

Aponte `grafana.carreirasmatch.com.br` (registro A) para o IP da VPS. O Caddy emite o
certificado TLS automaticamente no primeiro acesso.

## Acessar

- Grafana: `https://grafana.carreirasmatch.com.br` (login com as credenciais acima).
- O dashboard **"Carreiras Match — Visão Geral"** já vem provisionado, junto com os
  datasources Prometheus e Loki.

## Reiniciar só a observabilidade

```bash
docker compose -f docker-compose.observability.yml restart
docker compose -f docker-compose.observability.yml down    # derruba (dados ficam nos volumes)
```

## Retenção

- Prometheus: 30 dias (`--storage.tsdb.retention.time`).
- Loki: 14 dias (`retention_period` no `loki-config.yml`).

Ajuste conforme o disco da VPS.

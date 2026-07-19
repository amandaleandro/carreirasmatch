# Observabilidade - Prometheus + Loki + Grafana

Stack de monitoramento self-hosted, complementar ao Sentry (erros) e Plausible (produto):

- **Prometheus** - métricas (série temporal). Faz scrape do app, do Caddy, do host e dos containers.
- **Loki + Promtail** - logs centralizados de todos os containers.
- **Grafana** - dashboards e exploração, em `https://carreirasmatch.com.br/grafana`.
- **cAdvisor** - métricas por container (CPU/memória/rede/IO).
- **node-exporter** - métricas do host (CPU, memória, disco, rede).

Tudo roda num `docker-compose.observability.yml` separado, na mesma rede Docker do app
(`carreiras-match_default`), então nada além do Grafana fica exposto na internet.

## O que já vem instrumentado no app

- `GET /api/metrics` (route handler Next, runtime Node) expõe:
  - métricas de processo Node (heap, event loop lag, GC, CPU) via `prom-client`;
  - métricas de negócio: `carreiras_analysis_total`, `carreiras_analysis_duration_seconds`,
    `carreiras_ai_provider_calls_total`, `carreiras_ai_tokens_total`,
    `carreiras_ai_estimated_cost_usd_total`, `carreiras_ai_cache_events_total`,
    `carreiras_ai_provider_duration_seconds` e `carreiras_payment_events_total`
    (ver `src/lib/metrics.ts`).
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

# Opcional - trava por token no /api/metrics do app (defesa em profundidade).
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

Nenhum registro novo é necessário: o Grafana é servido sob `/grafana` no domínio
principal (`carreirasmatch.com.br`), reaproveitando o certificado TLS existente.

## Acessar

- Grafana: `https://carreirasmatch.com.br/grafana` (login com as credenciais acima).
- O dashboard **"Carreiras Match - Visão Geral"** já vem provisionado, junto com os
  datasources Prometheus e Loki.
- O dashboard **"Carreiras Match - Custos de IA"** mostra custo estimado em
  USD/BRL, projeção mensal, tokens, cache, participação das cotas gratuitas,
  falhas e latência. Ajuste a variável `Cotação USD/BRL` no topo quando necessário.
- O dashboard **"Carreiras Match - Capacidade diária da IA"** contabiliza
  tarefas concluídas por provedor e por operação, média de tokens por tarefa,
  ritmo diário projetado e quantas tarefas o saldo informado suporta com base
  no custo médio realmente observado. O filtro `Operação` ajuda a localizar
  quais recursos merecem otimização primeiro.
- O dashboard **"Carreiras Match - Negócio Executivo"** acompanha aquisição,
  ativação, assinaturas, receita, uso do produto, empresas, triagens e funil.
- O dashboard **"Carreiras Match - Operação & SLO"** reúne disponibilidade,
  latência HTTP, erros, runtime Node, PostgreSQL, saturação da VPS, containers e
  logs críticos.
- O dashboard **"Carreiras Match - Crescimento & Funil"** separa aquisição,
  ativação, conversões e engajamento, com filtro de 24h, 7d ou 30d.
- O dashboard **"Carreiras Match - Pagamentos & Receita"** acompanha tentativas,
  aprovações, conversão, ticket médio, receita por canal e status financeiros.
- O dashboard **"Carreiras Match - IA Confiabilidade & Roteamento"** mostra
  sucesso, falhas, fallback, latência p95, cache, provedores e modelos usados.

As métricas agregadas de negócio são atualizadas no máximo uma vez por minuto
durante o scrape de `/api/metrics`. Elas expõem apenas contagens e valores
financeiros agregados, nunca nomes, e-mails, currículos ou outros dados pessoais.

O custo financeiro é calculado apenas para modelos presentes na tabela de preços
em `src/lib/ai-providers.ts`; modelos sem preço conhecido continuam aparecendo em
tokens e chamadas, sem inventar um valor monetário.

## Reiniciar só a observabilidade

```bash
docker compose -f docker-compose.observability.yml restart
docker compose -f docker-compose.observability.yml down    # derruba (dados ficam nos volumes)
```

## Retenção

- Prometheus: 30 dias (`--storage.tsdb.retention.time`).
- Loki: 14 dias (`retention_period` no `loki-config.yml`).

Ajuste conforme o disco da VPS.

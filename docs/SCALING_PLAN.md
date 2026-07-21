# Plano de escala

Hoje roda inteiro numa **única VPS** (~4 GB RAM, disco 69 GB), hospedando
vários projetos além do carreiras-match no mesmo host. Este documento lista,
em ordem aproximada de "o que quebra primeiro", o que fazer quando o tráfego
crescer.

## O que quebra primeiro

### 1. RAM da VPS durante o build (já aconteceu)

`next build` tem pico de memória alto e já derrubou a VM inteira num deploy
pesado (commit grande de freelancer + jogos). Mitigado com 6 GB de swap
(`/swapfile` + `/swapfile_deploy`), mas isso é um paliativo, não capacidade
real — swap sob pressão de build é lento e não resolve tráfego concorrente
alto durante o deploy.

**Próximo passo natural:** build em ambiente separado (CI dedicado ou
estágio de build com mais memória) publicando uma imagem pronta para a VPS
só baixar e rodar, tirando o pico de memória do host de produção.

### 2. Disco por acúmulo de cache Docker

Cada deploy soma ~4,5 GB de build cache. Hoje mitigado por cron semanal de
prune — mas isso é limpeza reativa, não elimina a causa. Ver
[OPERATIONS.md](OPERATIONS.md) e [TROUBLESHOOTING.md](TROUBLESHOOTING.md).

**Próximo passo:** builds multi-stage já ajudam a limitar camadas grandes;
considerar registry externo de imagem em vez de rebuild local a cada push.

### 3. Rate limit e agendadores presos ao processo único

`src/lib/rate-limit.ts` é um `Map` em memória do processo — funciona porque
hoje há **uma única réplica** do `app`. Os quatro agendadores
(`email-scheduler`, `blog-scheduler`, `job-feed-scheduler`,
`external-source-scheduler`) também rodam com `setInterval` dentro do
processo web, coordenados só por registros no próprio banco (`SourceSync`,
`EmailLog`) para não duplicar.

**Isso quebra assim que houver mais de uma réplica do `app`:** rate limit
efetivo multiplica pelo número de réplicas, e os agendadores rodariam em
paralelo em cada réplica — a proteção contra duplicidade hoje depende de
"só existe um processo rodando o tick", não de lock distribuído real.

**Próximo passo — fila de processamento dedicada:** mover PDF, scraping,
matching de vaga, sincronização de fontes e envio de e-mail/push para um
worker separado, com fila real (Redis) em vez de `setInterval` in-process. O
agendador atual já registra execução por chave (fonte + horário/dia), então
a migração pode reaproveitar essa chave como idempotência da fila:

| Variável (reservada, ainda não usada) | Uso |
| --- | --- |
| `REDIS_URL` | Conexão da fila distribuída |
| `WORKER_CONCURRENCY` | Máximo de jobs simultâneos no worker |

Rate limit também deveria migrar para Redis (`INCR` + `EXPIRE`) no mesmo
movimento, para funcionar corretamente com múltiplas réplicas do `app`.

### 4. PostgreSQL single-instance

O banco já é PostgreSQL 17 (migrado de SQLite), com volume próprio e backup
periódico — isso já resolveu a limitação mais grave que existia (SQLite não
aguenta escrita concorrente sob carga). Os próximos cuidados, em ordem:

1. **Testar restauração de backup regularmente** — hoje existe backup, mas
   sem teste periódico de restauração não há garantia real de recuperação.
2. **Monitorar conexões, disco, locks e queries lentas** via os dashboards
   de Operação & SLO no Grafana.
3. **Revisar índices** com volume de dados representativo — hoje o schema
   não foi testado sob carga real de produção em escala.
4. **Pool de conexões** (ex.: PgBouncer) antes de multiplicar réplicas do
   `app` — sem pool, cada réplica nova multiplica conexões diretas ao
   Postgres.
5. **Planejar migrations destrutivas com compatibilidade entre versões**
   (deploy/rollback sem downtime) antes de depender de múltiplas réplicas
   em produção simultaneamente.

### 5. Observabilidade incompleta

Loki não está ingerindo logs hoje (ver
[TROUBLESHOOTING.md](TROUBLESHOOTING.md)) — antes de escalar tráfego, isso
precisa estar resolvido, porque investigar incidente sob mais carga sem log
centralizado funcional fica ainda mais difícil.

## Fora do caminho crítico técnico, mas relevantes para crescimento de produto

### WhatsApp

Hoje o único canal de notificação ativo é e-mail (mais push, desde
2026-07-20). Alertas por WhatsApp exigiriam provedor autorizado,
consentimento explícito, modelo de mensagem aprovado e opção de
cancelamento:

| Variável (reservada, ainda não usada) | Uso |
| --- | --- |
| `WHATSAPP_PROVIDER` | Provedor contratado |
| `WHATSAPP_ACCESS_TOKEN` | Credencial mantida só no servidor |
| `WHATSAPP_SENDER_ID` | Identificador do remetente aprovado |

### Mapas

Links públicos de localização usam OpenStreetMap sem armazenar localização
precisa do usuário. Um mapa interativo com marcadores exigiria
geocodificação, cache de coordenadas e respeito ao limite de uso do
provedor escolhido — não implementado.

## Ordem de prioridade recomendada

1. Resolver Loki (log é pré-requisito para operar com confiança em maior
   escala).
2. Build fora do host de produção (elimina o risco de OOM/reinício de VM).
3. Fila real (Redis) para agendadores + rate limit distribuído — só depois
   disso faz sentido considerar múltiplas réplicas do `app`.
4. Pool de conexões Postgres, junto com a introdução de réplicas.
5. WhatsApp e mapas ficam condicionados a demanda de produto, não a limite
   técnico atual.

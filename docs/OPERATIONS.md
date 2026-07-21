# Operação

Este documento descreve como o deploy e a operação em produção funcionam **de
verdade**, na VPS própria (não é infraestrutura gerenciada/PaaS).

## Topologia de produção

Um único host (VPS, `177.153.62.190`) roda **vários projetos no mesmo box**
(carreiras-match + outros), com ~4 GB de RAM total. O Compose principal
(`docker-compose.yml`, projeto `carreiras-match`) sobe:

- `app` — Next.js (container `carreiras-match-app`);
- `postgres` — PostgreSQL 17 (container `carreiras-match-postgres`, volume
  `postgres-data`);
- `postgres-backup` — dump periódico do Postgres;
- `caddy` — proxy reverso e TLS (container `carreiras-match-caddy`), na rede
  externa `edge_net` além da rede própria.

Uma stack separada e opcional (`docker-compose.observability.yml`, projeto
`carreiras-match-observability`) sobe Prometheus, Loki, Promtail, Grafana,
cAdvisor e node-exporter, conectando-se à rede `carreiras-match_default`
criada pela stack principal.

O banco é **PostgreSQL**, não SQLite — a migração aconteceu em julho de 2026
(commits `b81a916`/`7305f7a`). Scripts com `sqlite` no nome (`scripts/
backup-sqlite.sh`, variável `SQLITE_BACKUP_HOST_DIR`) são resquício histórico:
o nome ficou, mas hoje apontam para o fluxo Postgres.

## Deploy: push-to-deploy

Não há CI/CD (não existe `.github/workflows`). O deploy é **git push direto
para a VPS**:

```bash
git push vps master
```

O remote `vps` aponta para `ssh://root@177.153.62.190/opt/git/carreiras-match.git`
(repositório bare). Um hook `post-receive` nesse bare repo faz `git checkout -f`
em `/opt/carreiras-match` e roda:

```bash
docker compose build app
docker compose up -d --force-recreate app
```

Isso recria **só o container `app`** — Caddy, Postgres e observabilidade não
são tocados por um deploy normal.

### Migrations rodam sozinhas

`docker-entrypoint.sh` do container `app` executa `npx prisma migrate deploy`
a cada start, antes do `npm start`. Como o hook faz `--force-recreate app`, um
push que inclui uma migration nova basta — não é preciso rodar nada manual na
VPS. Confirme com:

```bash
ssh root@177.153.62.190 "docker logs carreiras-match-app | head -30"
```

**Gotcha conhecido:** as tabelas do marketplace de freelancer e de parceiros
(`Freelance*` em algum momento, `Partner*`/`GameScore`) já foram criadas via
`prisma db push` em vez de migration — o entrypoint só aplica migrations de
arquivo. Se um banco novo for provisionado do zero hoje, confirme com `npx
prisma migrate status` que não faltam tabelas que só existem na prod atual por
`db push`.

### O `.env` local nunca chega em produção

`.env` está no `.gitignore` **e** no `.dockerignore`. Um `git push vps` não
leva variável nenhuma — produção lê `/opt/carreiras-match/.env`, um arquivo
próprio mantido só na VPS. Editar o `.env` local e dar push não muda nada em
produção; é preciso copiar a variável manualmente para o `.env` da VPS:

```bash
grep -E "^MINHA_VAR=" .env | sed 's/\r$//' | ssh root@177.153.62.190 'cat >> /opt/carreiras-match/.env'
```

O `sed 's/\r$//'` é obrigatório: o `.env` local é CRLF (Windows) e o `\r`
sobra dentro do valor se não for removido.

- Variáveis de **runtime** (a maioria) só exigem `docker compose up -d
  --force-recreate app` depois de atualizar o `.env` da VPS.
- Variáveis **`NEXT_PUBLIC_*`** são embutidas no bundle do cliente em build
  time (passadas como build args no `docker-compose.yml`/`Dockerfile`) e
  exigem rebuild (`docker compose build app`), não só recreate.

Já aconteceu de `RESEND_API_KEY`/`RESEND_FROM_EMAIL` ficarem ausentes em
produção depois de configuradas só localmente — todos os e-mails
transacionais morreram em silêncio até o `.env` da VPS ser corrigido.

### Caddyfile é bind mount de arquivo único

O Compose monta `./Caddyfile:/etc/caddy/Caddyfile:ro`. Como o deploy faz
`git checkout -f`, o arquivo no host é **substituído por um novo inode**, mas
o container do Caddy continua com o inode antigo aberto. Um `caddy reload` ou
`caddy validate` dentro do container nesse meio-tempo lê a config **velha**.

Para aplicar uma mudança no Caddyfile:

```bash
cd /opt/carreiras-match && docker compose up -d --force-recreate caddy
```

Isso remonta o arquivo atual. Reload sozinho não basta.

### `git push vps` pode "parecer" travar

O hook faz build + `--force-recreate`, o que passa fácil de 2 minutos. Se o
comando de push rodar com timeout curto (ferramenta de automação, por
exemplo), a conexão SSH pode ser derrubada (exit 143) **mesmo com o deploy
remoto tendo terminado normalmente**. Não assuma falha só pelo timeout do
cliente — confirme direto:

```bash
git fetch vps && git log vps/master..master   # deve ficar vazio
ssh root@177.153.62.190 "cd /opt/carreiras-match && docker compose ps app"
```

Se o container aparecer "Up" há poucos minutos alinhado ao horário do push, o
deploy terminou antes do timeout do cliente estourar.

### Google Fonts pode falhar o build de forma intermitente

`next build` baixa fontes do `next/font/google` em build time. A rede da VPS
falha de forma intermitente para isso, gerando erro tipo `module-not-found`
em `geist_mono_*.module.css`. É transitório — re-disparar resolve:

```bash
git commit --allow-empty -m "redeploy" && git push vps master
```

Correção definitiva (não feita ainda): migrar para `next/font/local` com os
arquivos de fonte no repo.

## Disco cheio por cache Docker

Cada deploy reconstrói a imagem e acumula **build cache** e **imagens
órfãs**. Um deploy sozinho já gerou ~4,5 GB de cache novo em medições
anteriores; o disco (69 GB) já chegou a 100% de uso por esse acúmulo.

Mitigações já aplicadas em produção:

- **cron semanal de limpeza** — `/etc/cron.d/carreiras-docker-prune`, domingo
  04:00, roda `docker builder prune -f && docker image prune -f`;
- **swap permanente** — `/swapfile_deploy` (4 GB) somado ao swap antigo (2
  GB), total 6 GB, para o `next build` não estourar a RAM (~4 GB) da VPS e
  reiniciar a VM (já aconteceu num deploy pesado).

Checar manualmente quando desconfiar de disco:

```bash
ssh root@177.153.62.190 'df -h / ; docker system df'
```

Limpeza manual segura, **só depois de confirmar o novo deploy no ar**
(preserva a imagem anterior para rollback):

```bash
docker image prune -f && docker builder prune -f
```

**Nunca** use `-a`/`--all` (apaga também a imagem anterior, matando a opção
de rollback rápido) nem `docker volume prune`/`--volumes` (apagaria o volume
`postgres-data`, ou seja, o banco).

## Verificações pós-deploy

1. Abrir a página pública e efetuar login.
2. `docker compose ps` sem loop de restart.
3. `docker logs carreiras-match-app` mostrando o `migrate deploy` sem erro.
4. Executar uma análise controlada.
5. Confirmar `/api/metrics` sendo raspado pelo Prometheus (se a stack de
   observabilidade estiver de pé).
6. Conferir erro/evento de teste no Sentry, quando `SENTRY_DSN` estiver
   configurado.
7. Em mudanças de cobrança, seguir
   [PAYMENT_PRODUCTION_VALIDATION.md](PAYMENT_PRODUCTION_VALIDATION.md).

## Backup

`postgres-backup` roda um dump periódico controlado por `BACKUP_INTERVAL_
SECONDS` e `BACKUP_RETENTION_DAYS` (14 dias por padrão), salvo no diretório
apontado por `SQLITE_BACKUP_HOST_DIR` (nome legado da era SQLite; hoje
seleciona o destino do backup Postgres).

Teste de restauração mensal recomendado:

1. escolher um backup recente;
2. restaurar em uma instância PostgreSQL isolada;
3. conferir migrations e contagens de linhas;
4. rodar consultas de leitura críticas;
5. registrar data, arquivo e resultado do teste.

Sem teste de restauração, existe arquivo de backup, mas não há garantia de
recuperação.

## Agendadores em produção

Todos os agendadores rodam **dentro do processo Node do container `app`**
(`setInterval`, iniciados em `src/instrumentation.ts` no boot), não como cron
do sistema operacional nem workers separados:

| Agendador | Arquivo | Frequência | Flag para desligar |
| --- | --- | --- | --- |
| E-mails de ciclo de vida (renovação, expiração, onboarding, alertas de vaga, etc.) | `src/lib/email-scheduler.ts` | tick periódico, com régua própria por e-mail | `LIFECYCLE_EMAILS_ENABLED=false` |
| Feed de vagas | `src/lib/job-feed-scheduler.ts` | 08:00 / 14:00 / 20:00 `America/Sao_Paulo` (`JOB_FEED_RUN_TIMES`) | `JOB_FEED_AUTOFETCH_ENABLED=false` |
| Fontes externas (cursos, boletins, **radares de concurso e vestibular**) | `src/lib/external-source-scheduler.ts` | 08:00 / 14:00 / 20:00 `America/Sao_Paulo` (`EXTERNAL_SOURCES_RUN_TIMES`) | `EXTERNAL_SOURCES_SYNC_ENABLED=false` |
| Geração automática de posts de blog | `src/lib/blog-scheduler.ts` | tick diário | `BLOG_AUTOGEN_ENABLED=false` |

Os radares `/concursos` e `/vestibulares` (RSS de Gran Cursos, Concursos no
Brasil, Quero Bolsa, Stoodi, Guia do Estudante) fazem parte da mesma rotina de
fontes externas — cada horário fica registrado no banco (não repete no mesmo
dia) e pode ser disparado manualmente pelo botão "Atualizar todas as fontes
agora" em `/admin` (rota `/api/admin/external-sources/sync`, exige sessão
admin).

Como todos rodam **no processo web**, múltiplas réplicas do `app` duplicariam
trabalho — hoje há só uma réplica, então não é um problema, mas escalar
horizontalmente exige mover isso para um worker dedicado com coordenação
(ver [SCALING_PLAN.md](SCALING_PLAN.md)).

## Observabilidade

Subir a stack (a rede `carreiras-match_default` da stack principal precisa
existir primeiro):

```bash
docker compose up -d
docker compose -f docker-compose.observability.yml up -d
```

- **Prometheus** — métricas, raspando `app` (`/api/metrics`, bloqueado na
  internet pelo Caddy, acessado só na rede interna), Caddy (`:9180/metrics`),
  cAdvisor e node-exporter. Retenção de 30 dias.
- **Grafana** — `https://carreirasmatch.com.br/grafana` (login `admin` +
  `GRAFANA_ADMIN_PASSWORD`). Servido sob `/grafana` no domínio principal
  (sem subdomínio novo), com `GF_SERVER_SERVE_FROM_SUB_PATH=true`. Dashboards
  provisionados automaticamente a partir de `observability/grafana/
  dashboards/` (recarregam sozinhos, sem gotcha de bind mount porque é
  diretório, não arquivo único):
  - Visão Geral, Host (VPS), Containers, App & Borda, Logs;
  - Custos de IA, Capacidade diária da IA, IA Confiabilidade & Roteamento;
  - Negócio Executivo, Crescimento & Funil, Pagamentos & Receita, Acessos &
    Aquisição;
  - **Deploys & Incidentes** — usa `resets(process_start_time_seconds{job=
    "carreiras-app"})` como proxy de deploy (não existe evento de deploy
    explícito no stack; cada `--force-recreate` reinicia o processo Node),
    mais uptime %, minutos indisponíveis estimados e taxa de erro 5xx/IA.
  - **Farol das Jornadas** — painéis de status por jornada (candidato: CV/IA,
    candidaturas, pagamento, assinatura; empresa: pagamento, triagens,
    contato com talentos). Um painel de texto lista explicitamente o que
    **ainda não tem métrica própria** (alertas de vaga, blog/SEO, radares de
    concurso/vestibular, marketplace freelancer), para não passar a
    impressão errada de "tudo verde" nessas áreas.
- **Loki + Promtail** — **hoje NÃO está ingerindo logs de verdade.**
  `curl http://localhost:3100/loki/api/v1/labels` na VPS volta vazio (zero
  labels, zero séries) e o promtail loga `error sending batch ... context
  deadline exceeded` ao tentar empurrar para `carreiras-match-loki:3100`. Na
  prática, o dashboard "Logs" do Grafana fica vazio e não dá para investigar
  incidente por log histórico — `docker logs carreiras-match-app` só tem o
  que veio desde o último `--force-recreate` (que acontece a cada deploy, ou
  seja, o histórico some rápido). Isso é um problema aberto, não resolvido, e
  deve ser corrigido antes de depender de log centralizado para incidentes.
  Enquanto isso não for corrigido, use `docker logs` diretamente no container
  certo logo após o incidente, antes do próximo deploy apagar o histórico.

Métricas de negócio (`carreiras_analysis_total`,
`carreiras_ai_provider_calls_total`, `carreiras_payment_events_total` etc.)
são agregadas, sem nomes, e-mails ou currículos — ver `observability/
README.md` para a lista completa e `src/lib/metrics.ts` para a implementação.

## Incidente

1. Registrar horário, sintomas e impacto.
2. Preservar o que existir de log **antes** do próximo deploy (ver limitação
   do Loki acima — o log do container some no próximo `--force-recreate`).
3. Identificar o último deploy/migration (`git log`, `docker logs` do
   `migrate deploy`).
4. Conter o impacto sem apagar evidências.
5. Se houver cobrança indevida ou vazamento de dado, priorizar bloqueio da
   ação antes de investigar a causa raiz.
6. Restaurar o serviço e validar os fluxos críticos (login, análise,
   pagamento).
7. Documentar causa, correção e prevenção.

## Rotação de segredos

Troque imediatamente um segredo exposto, atualize `/opt/carreiras-match/.env`
na VPS e reinicie os serviços dependentes (`--force-recreate app`, e rebuild
se for `NEXT_PUBLIC_*`). Para webhook do Mercado Pago, atualize painel e
aplicação na mesma janela — enquanto divergem, todo webhook real é rejeitado
(401) e pagamentos ficam pendentes. Considere inválido qualquer segredo que
apareceu em commit, log, print ou conversa pública.

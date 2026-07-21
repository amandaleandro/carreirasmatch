# Arquitetura

## Aviso sobre a versão do Next.js

O projeto está em **Next.js 16.2.10** (`package.json`), uma versão com mudanças
de convenção em relação ao Next "clássico" que a maioria do conhecimento geral
assume. A mais relevante para quem mexe neste repo:

- O arquivo de middleware não se chama `middleware.ts` — chama-se
  **`src/proxy.ts`** (renomeado oficialmente para "Proxy" a partir do Next 16;
  ver `node_modules/next/dist/docs/01-app/04-glossary.md`). É ele quem exporta
  `auth` como proxy e decide, via matcher, quais rotas passam pela checagem de
  sessão.
- `prisma/schema.prisma` usa `generator client { provider = "prisma-client" }`
  com `output = "../src/generated/prisma"` — o client Prisma 7 é gerado dentro
  de `src/generated/prisma`, não em `node_modules/.prisma/client` como no
  padrão antigo. Importações usam esse caminho gerado.
- Antes de alterar convenções de rota, cache ou build, confira
  `node_modules/next/dist/docs/` — não assuma o comportamento do Next clássico.

## Visão geral da stack

- **Next.js 16** (App Router) + React 19 + TypeScript.
- Páginas server-rendered em `src/app/**/page.tsx`, endpoints de API em
  `src/app/api/**/route.ts`, lógica de domínio em `src/lib/`.
- **PostgreSQL 17** via **Prisma 7** (`@prisma/client`, adapter `@prisma/adapter-pg`).
  Existe também `@prisma/adapter-better-sqlite3` nas dependências, resquício da
  migração anterior de SQLite — o runtime atual é Postgres apenas (ver
  `datasource db { provider = "postgresql" }` em `prisma/schema.prisma`).
- **NextAuth v5** (`next-auth@5.0.0-beta.31`) para autenticação, estratégia JWT.
- **Tailwind CSS 4** para estilo.
- **Vitest** para testes (`npm test`), vários arquivos `*.test.ts` ao lado da
  lib que testam (ex.: `ai-providers.test.ts`, `coupons.test.ts`,
  `rate-limit.test.ts`, `webhook-secret.test.ts`).
- **Sentry** (`@sentry/nextjs`) para erros; **prom-client** para métricas
  Prometheus.

## Estrutura de pastas (`src/`)

- `src/app/` — App Router: páginas públicas, área do candidato, área da
  empresa (`empresa/(painel)/**`), área do parceiro (`parceiro/**`),
  marketplace de freelancer (`freelancer/**`, `freelancers/**`,
  `projetos/**`), jogos (`jogos/**`), ferramentas (`tools/**`), admin
  (`admin/**`) e todas as rotas de API (`api/**`).
- `src/lib/` — toda a lógica de domínio: IA multi-provedor, pagamentos,
  e-mail, autenticação por tipo de conta, fontes de vagas, schedulers,
  métricas, matching, moderação de oportunidades, etc. Ver
  [ROUTES.md](ROUTES.md) e [API.md](API.md) para o inventário de rotas que
  usam cada lib.
- `src/lib/job-sources/` — um arquivo por fonte externa de vaga (Adzuna,
  Indeed, Gupy, Sólides, Greenhouse, Lever, Jooble, LinkedIn, Glassdoor,
  RemoteOK, Arbeitnow, TheMuse, Himalayas, RemoteJobsOrg, Jobicy, Remotive) —
  ver [INTEGRATIONS.md](INTEGRATIONS.md).
- `src/components/` — componentes de UI compartilhados.
- `src/generated/prisma/` — client Prisma gerado (não editar à mão).
- `src/auth.ts`, `src/auth.config.ts`, `src/proxy.ts` — autenticação e
  controle de acesso por rota.
- `src/instrumentation.ts`, `src/instrumentation-client.ts` — boot do Sentry e
  arranque dos schedulers in-process.

## Autenticação (três tipos de conta)

`src/auth.ts` registra quatro providers no NextAuth:

1. `Google` — condicional, só se `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`
   estiverem setados.
2. `Credentials` (candidato) — e-mail + senha contra `User.passwordHash`
   (bcryptjs), com rate limit por IP+e-mail.
3. `Credentials` id `"company-credentials"` — autentica um `CompanyMember`
   (não a `Company` diretamente). O membro é quem tem `passwordHash`; a
   sessão carrega `accountType: "company"`, `companyId` e `companyRole`
   (`owner` | `member`).
4. `Credentials` id `"partner-credentials"` — autentica um `Partner`
   (parceiro de cursos/conteúdo), sessão com `accountType: "partner"`.

`src/auth.config.ts` define os callbacks `jwt`/`session` (propagam
`accountType`, `companyId`, `companyRole`, `memberId`, `partnerId`) e
`authorized`, que é a gate central de acesso a página: decide se
`/empresa/**` exige sessão de empresa, `/parceiro/**` exige sessão de
parceiro, e o resto exige sessão de candidato a não ser que o caminho esteja
na lista `PUBLIC_PATHS` ou seja uma ferramenta marcada `free` no catálogo
(`isFreeTool`, de `src/lib/tools-catalog.ts`).

`src/proxy.ts` é o arquivo que o Next 16 executa como proxy/middleware; ele
usa `auth` (de `src/auth.ts`) com esse `authConfig`. **`/api/**` não passa
pelo proxy** — cada Route Handler é responsável pela própria autenticação
(tipicamente via `requireAuth()`, `requireCompanyApi()`,
`requirePartnerApi()` ou `requireAdminApi()`).

## Camadas de `src/lib/`

- **IA** — `ai-providers.ts` (motor multi-provedor com fallback e cota),
  `groq.ts` (prompt e schema da análise de currículo, usa
  `runJsonAcrossProviders`), `ai-schemas.ts`/`ai-shape.ts` (validação e
  normalização de saída), várias libs de ferramenta específica (
  `behavioral-test.ts`, `career-guide.ts`, `interview-guide-tips.ts` etc.).
- **Pagamento** — `mercadopago.ts` (SDK), `billing-plans.ts`,
  `company-billing.ts`, `partner-billing.ts`, `webhook-secret.ts` (valida
  `x-signature` do Mercado Pago).
- **E-mail** — `resend.ts` (envio + templates + `sendOnce`/`EmailLog`),
  `email-scheduler.ts` (ciclo de vida in-process), `email.ts` (normalização).
- **Vagas e feed** — `job-feed.ts`, `job-feed-scheduler.ts`, `scrape-job.ts`,
  `feed-tags.ts`, `company-vaga.ts`, `company-vaga-feed.ts`,
  `job-sources/*`.
- **Oportunidades públicas / concursos / vestibulares** —
  `external-source-sync.ts`, `external-source-scheduler.ts`, `radar-sync.ts`
  (RSS), `opportunity-safety.ts` (score de risco/link morto).
- **Freelancer** — `freelance.ts` (regras do marketplace freelancer:
  propostas, contrato, avaliação, mensageria).
- **Talentos/empresa** — `talent-search.ts`, `company-screening.ts`,
  `company-auth.ts`.
- **Observabilidade** — `metrics.ts` (registro Prometheus), `sentry-init.ts`.
- **Autorização/acesso** — `admin.ts`, `require-auth.ts`,
  `require-auth-page.ts`, `require-subscription-page.ts`, `entitlements.ts`,
  `tool-access.ts`, `free-tool-access.ts`, `free-analysis-limit.ts`,
  `full-access-users.ts`.
- **Diversos** — `coupons.ts` (cupom de influenciador), `referrals.ts`
  (indicação direta), `rate-limit.ts`, `push.ts` (Web Push/VAPID),
  `github-profile.ts`, `youtube-sync.ts`, `blog-generator.ts` +
  `blog-scheduler.ts`.

## Jobs e agendadores in-process

Não há cron externo nem fila de mensageria: os agendadores rodam **dentro do
próprio processo Next**, iniciados em `src/instrumentation.ts` (função
`register()`, executada uma vez no boot do server, runtime Node):

| Scheduler | Lib | Flag para desligar | O que faz |
| --- | --- | --- | --- |
| Blog automático | `blog-scheduler.ts` | `BLOG_AUTOGEN_ENABLED=false` | Gera posts de blog por IA em rodízio de nicho, `BLOG_POSTS_PER_DAY` por dia |
| Feed de vagas | `job-feed-scheduler.ts` | `JOB_FEED_AUTOFETCH_ENABLED=false` | Busca vagas nas fontes externas em horários fixos (`JOB_FEED_RUN_TIMES`) |
| Fontes externas (cursos/boletins/radares) | `external-source-scheduler.ts` | `EXTERNAL_SOURCES_SYNC_ENABLED=false` | Sincroniza `ExternalCourse`, `PublicJobBulletin`, `PublicOpportunity`, faz bootstrap do YouTube |
| E-mails de ciclo de vida | `email-scheduler.ts` | `LIFECYCLE_EMAILS_ENABLED=false` | Lembrete de renovação, acesso expirado, nudge de onboarding, follow-up de lead |

Cada scheduler usa `setInterval` com um tick (`TICK_INTERVAL_MS`) que checa se
já é hora de rodar (horários configuráveis em `America/Sao_Paulo`) e é
idempotente por dia/execução (via tabela `SourceSync` ou `EmailLog`,
dependendo do caso). Radares de concurso/vestibular (`radar-sync.ts`) rodam
como parte do `external-source-scheduler` — ver [INTEGRATIONS.md](INTEGRATIONS.md).

Também no boot, `instrumentation.ts` roda um backfill único e auto-desligável
de tags de vaga (`backfill-job-tags.ts`) para jobs ingeridos antes da
migração de tags — vira no-op assim que todas as vagas ativas estão tagueadas.

## Observabilidade

- **Métricas**: `GET /api/metrics` expõe o registro `prom-client`
  (`src/lib/metrics.ts`), com métricas de negócio (análises, IA, pagamentos)
  além das métricas default de processo Node. Protegido opcionalmente por
  `METRICS_TOKEN` (`Authorization: Bearer <token>`); o Caddy também bloqueia
  o caminho vindo da internet pública.
- **Prometheus/Loki/Grafana**: stack separada em
  `docker-compose.observability.yml` (ver `observability/README.md`).
  Prometheus faz scrape de `/api/metrics` pela rede interna do Docker; Loki
  recebe logs via Promtail; Grafana consulta ambos. Existem dashboards
  dedicados de deploys/incidentes e do "farol das jornadas" do produto.
- **Erros**: Sentry (`@sentry/nextjs`), inicializado em
  `src/instrumentation.ts` (server) e `src/instrumentation-client.ts`
  (client), condicionado a `SENTRY_DSN`/`NEXT_PUBLIC_SENTRY_DSN`.
- **Analytics de produto**: Plausible (sem cookies) via
  `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`, mais uma tabela própria `FunnelEvent`/
  `PageView` para instrumentar o funil sem dado pessoal.

## Pagamentos

Provedor é **Mercado Pago**, não Stripe — não há nenhuma integração Stripe no
código. `src/lib/mercadopago.ts` encapsula o SDK; `src/app/api/billing/**`
cria pagamento avulso (Payment Brick) e assinatura (Preapproval/Subscription
Brick); `src/app/api/billing/webhook/route.ts` é o ponto autoritativo
assíncrono, validado por HMAC (`webhook-secret.ts`) sobre o header
`x-signature`. Empresas e parceiros têm seus próprios fluxos de crédito
(`company-billing.ts`, `partner-billing.ts`) reaproveitando o mesmo webhook.
Ver [INTEGRATIONS.md](INTEGRATIONS.md) e [DATABASE.md](DATABASE.md).

## Deploy

Build multi-stage em `Dockerfile` (`prisma generate` + `next build`);
`docker-entrypoint.sh` roda `npx prisma migrate deploy` antes de `npm start`.
PostgreSQL 17 persistido em volume; Caddy faz proxy/TLS; `postgres-backup`
executa backups periódicos. Deploy é push-to-deploy via VPS.

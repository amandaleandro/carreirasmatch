# Arquitetura

## Visão geral

Next.js App Router monolítico: páginas server-rendered em `src/app/`,
endpoints de API em `src/app/api/`, lógica de domínio em `src/lib/`,
persistência em SQLite via Prisma.

## Autenticação (`src/auth.ts`, `src/auth.config.ts`, `src/proxy.ts`)

- NextAuth v5, estratégia **JWT**.
- Provider `Credentials`: e-mail + senha, hash com `bcryptjs`.
- Provider Google OAuth incluído condicionalmente (só se
  `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` estiverem setados - hoje não
  estão, então só login por senha funciona).
- `src/proxy.ts` é o middleware de rotas (nome novo do antigo
  `middleware.ts` no Next 16) - usa `auth` como `proxy` e um matcher para
  decidir quais rotas exigem sessão. A gate central de rota autenticada
  fica em `authConfig.callbacks.authorized` (`src/auth.config.ts`).
- **Sem rate limit no login** (`authorize()` em `src/auth.ts`) - só
  `register` e helpers de `requireAuth()` limitam tentativas.

## Modelo de dados (`prisma/schema.prisma`)

Entidades principais:

- `User` - conta, preferências (tema, área profissional, checklist de
  estágio), relações para tudo abaixo.
- `Resume` / `Analysis` - currículo enviado (texto + PDF opcional) e o
  resultado da análise de IA (scores, pontos fortes/fracos, plano de
  estudo, perguntas de entrevista, etc. - muitos campos são JSON
  serializado em `String`).
- `Job` / `JobMatch` - vagas agregadas (scraping + APIs de terceiros) e o
  match calculado contra um currículo.
- `Application` / `ApplicationActivity` - funil de candidaturas do usuário
  (kanban) com histórico de mudança de status.
- `Payment` / `Subscription` - pagamento avulso (`first_analysis`,
  `diagnostic`) e assinatura recorrente, ambos ligados ao Mercado Pago via
  `mpPaymentId`.
- `Lead` - captura de contato (nome/e-mail/telefone) de visitante sem
  conta, antes de revelar resultado de teste vocacional ou análise
  simples.
- `AppSetting` - configuração operacional editável pelo admin (ex.: qual
  modelo Groq usar).
- Diversas tabelas de "ferramentas gratuitas" (teste vocacional, teste de
  soft skills, cronograma de estudo/aula, cursos do usuário, metas
  semanais) que alimentam a seção `tools/`.

**29 migrations** aplicadas (`prisma/migrations/`), schema em dia com o
banco local.

## Fluxo de análise de currículo (Groq)

`src/lib/groq.ts` monta o prompt e chama a API da Groq (modelo configurado
via `GROQ_MODEL`, default recomendado `llama-3.3-70b-versatile`). O
resultado é JSON parseado direto (`JSON.parse`) e gravado em `Analysis`.
Não há schema de validação (zod) sobre a resposta do modelo nem retry em
caso de truncamento (`finish_reason === "length"` é apenas logado).

## Pagamentos (Mercado Pago)

- `src/lib/mercadopago.ts` - cliente/SDK, lê `MERCADOPAGO_ACCESS_TOKEN`
  (falha só no primeiro uso, não no boot).
- `src/app/api/billing/**` - criação de pagamento avulso (Payment Brick) e
  assinatura (Preapproval / Subscription Brick), mais o **webhook**.
- `src/lib/webhook-secret.ts` - valida o header `x-signature` via HMAC +
  `timingSafeEqual`, falha **fechado** (401) se a assinatura não bater ou
  o segredo não estiver configurado.
- Fluxo esperado: usuário paga → Mercado Pago chama o webhook → webhook
  atualiza `Payment.status` / `Subscription.status`. Se o segredo do
  webhook estiver errado, esse último passo nunca acontece e o pagamento
  fica `pending` para sempre mesmo tendo sido cobrado.

## Admin (`src/app/admin`, `src/app/api/admin`, `src/lib/admin.ts`)

Acesso controlado por `requireAdminPage` / `requireAdminApi`, que checam a
sessão contra a lista `ADMIN_EMAILS` (env var, e-mails separados por
vírgula) ou `hasFullAccessEmail`. Usado para conceder assinatura/créditos
manualmente a um usuário e trocar o modelo Groq em uso.

## Feed de vagas (`src/lib/job-feed.ts`, `src/lib/scrape-job.ts`)

Agrega vagas de múltiplas fontes opcionais (Adzuna, Jooble, Gupy, Sólides,
scraping via Playwright/cheerio; Glassdoor ainda não homologado). Cada
fonte é pulada silenciosamente se a respectiva env var não estiver
configurada.

## Deploy (`Dockerfile`, `docker-compose.yml`, `docker-entrypoint.sh`)

Build multi-stage → `prisma generate` + `next build`. No entrypoint,
`npx prisma migrate deploy` roda antes de `npm start`. O SQLite é
persistido em volume nomeado. **`docker-compose.yml` hoje não repassa as
variáveis do Mercado Pago nem das fontes de vaga** - só variáveis
`ABACATEPAY_*` obsoletas de uma integração de pagamento anterior - ver
[`LAUNCH_CHECKLIST.md`](LAUNCH_CHECKLIST.md).

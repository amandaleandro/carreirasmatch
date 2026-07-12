# Variáveis de ambiente

Nenhuma validação de schema (zod ou similar) roda no boot — variáveis
ausentes ou com placeholder falham silenciosamente ou só no primeiro uso
(ex.: `mercadopago.ts` lança erro apenas quando alguém tenta pagar).
Revise esta lista manualmente antes de cada deploy.

## Obrigatórias

| Variável | Uso | Observação |
|---|---|---|
| `DATABASE_URL` | Conexão Prisma/SQLite | `file:./dev.db` local, `file:/app/data/dev.db` no Docker (volume) |
| `AUTH_SECRET` | Assinatura de JWT/sessão do NextAuth | gerar com `openssl rand -base64 32` |
| `GROQ_API_KEY` | Chamadas de análise de currículo/vaga | free tier tem limite diário de tokens |
| `GROQ_MODEL` | Modelo usado nas análises | default sugerido: `llama-3.3-70b-versatile` |
| `APP_URL` | Monta `back_url` do Mercado Pago (Preapproval) | precisa ser a URL pública real em produção |
| `MERCADOPAGO_ACCESS_TOKEN` | Backend: cria pagamentos/assinaturas | `APP_USR-...` = **produção real**, `TEST-...` = sandbox |
| `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY` | Client: inicializa os Bricks | exposta no bundle, isso é esperado |
| `MERCADOPAGO_WEBHOOK_SECRET` | Valida `x-signature` no webhook | **se estiver errado/placeholder, todo webhook real é rejeitado (401) e pagamentos ficam `pending` para sempre** |
| `ADMIN_EMAILS` | Libera `/admin` e `requireAdminApi` | lista separada por vírgula |

## Opcionais (fontes extra de vagas — puladas se ausentes)

| Variável | Fonte |
|---|---|
| `ADZUNA_APP_ID` / `ADZUNA_APP_KEY` | Adzuna |
| `JOOBLE_API_KEY` | Jooble |
| `GUPY_COMPANIES` | Gupy (lista de subdomínios) |
| `SOLIDES_COMPANIES` | Sólides (lista de slugs) |
| `GLASSDOOR_PARTNER_ID` / `GLASSDOOR_PARTNER_KEY` | Glassdoor (exige parceria homologada, doc ainda não confirmada — ver `src/lib/job-sources/glassdoor.ts`) |
| `GREENHOUSE_BOARDS` | Greenhouse (lista de board tokens, ex.: `stripe,figma`) |
| `LEVER_COMPANIES` | Lever (lista de slugs de empresa, ex.: `netflix,plaid`) |

Jobicy não precisa de configuração — roda sempre, como Arbeitnow/RemoteOK.

## Opcionais (blog automático)

| Variável | Uso | Observação |
| --- | --- | --- |
| `BLOG_AUTOGEN_ENABLED` | Liga/desliga o scheduler de geração automática de posts (`src/instrumentation.ts` → `src/lib/blog-scheduler.ts`) | default `true`; defina `"false"` para desligar sem mudar código |
| `BLOG_POSTS_PER_DAY` | Meta de posts gerados por dia (rodízio pelos nichos em `VOCATION_AREAS`) | default `5` |

## Opcionais (auth)

| Variável | Uso |
|---|---|
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Login com Google — sem elas, só login por e-mail/senha fica disponível |
| `RESEND_API_KEY` | Envio do e-mail de "esqueci minha senha" (`src/lib/resend.ts`) — crie uma conta grátis em resend.com. **Sem ela, o link de redefinição não é enviado** (só loga um erro no servidor). |
| `RESEND_FROM_EMAIL` | Remetente do e-mail de redefinição de senha. Sem ela, usa `onboarding@resend.dev` (domínio de teste do Resend, funciona mas identifica menos a marca). Para usar um remetente `@carreirasmatch.com.br`, é preciso verificar o domínio no painel do Resend primeiro. |

## Docker Compose

`docker-compose.yml` hoje repassa: `GROQ_API_KEY`, `DATABASE_URL`,
`AUTH_SECRET`, `AUTH_TRUST_HOST`, `AUTH_URL`, `GOOGLE_CLIENT_ID/SECRET`,
`ADZUNA_APP_ID/KEY`, `JOOBLE_API_KEY`, `GUPY_COMPANIES`,
`SOLIDES_COMPANIES`, `GLASSDOOR_PARTNER_ID/KEY`, `GREENHOUSE_BOARDS`,
`LEVER_COMPANIES`, `MERCADOPAGO_ACCESS_TOKEN`,
`NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY`, `MERCADOPAGO_WEBHOOK_SECRET`,
`APP_URL`, `ADMIN_EMAILS`, `GROQ_MODEL`, `RESEND_API_KEY`,
`RESEND_FROM_EMAIL`.

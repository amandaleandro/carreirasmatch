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
| `GUPY_COMPANIES` | Gupy (lista de subdomínios; usa lista padrão de grandes empregadores BR quando vazio) |
| `SOLIDES_COMPANIES` | Sólides (lista de slugs) |
| `GLASSDOOR_PARTNER_ID` / `GLASSDOOR_PARTNER_KEY` | Glassdoor (exige parceria homologada, doc ainda não confirmada — ver `src/lib/job-sources/glassdoor.ts`) |
| `GREENHOUSE_BOARDS` | Greenhouse (lista de board tokens, ex.: `stripe,figma`) |
| `LEVER_COMPANIES` | Lever (lista de slugs de empresa, ex.: `netflix,plaid`) |

Jobicy e Remotive não precisam de configuração — rodam sempre, como
Arbeitnow/RemoteOK.
Indeed roda por padrão via scraping com Playwright. Se houver bloqueio anti-bot
temporário, a fonte falha sozinha e o feed continua com as demais.
Jooble exige uma chave válida e ativa; 403 significa chave inválida/sem acesso
segundo a documentação oficial da Jooble.
Greenhouse e Lever usam listas padrão de empresas brasileiras/remote-friendly
quando as variáveis `GREENHOUSE_BOARDS` e `LEVER_COMPANIES` ficam vazias.
Gupy também roda por padrão com uma lista de grandes empregadores brasileiros
(varejo, atendimento, farmácia, indústria, banco) para diversificar o feed além
das vagas de tecnologia; defina `GUPY_COMPANIES` para sobrescrever a lista.

## Opcionais (blog automático)

| Variável | Uso | Observação |
| --- | --- | --- |
| `BLOG_AUTOGEN_ENABLED` | Liga/desliga o scheduler de geração automática de posts (`src/instrumentation.ts` → `src/lib/blog-scheduler.ts`) | default `true`; defina `"false"` para desligar sem mudar código |
| `BLOG_POSTS_PER_DAY` | Meta de posts gerados por dia (rodízio pelos nichos em `VOCATION_AREAS`) | default `5` |

## Opcionais (feed automático de vagas)

| Variável | Uso | Observação |
| --- | --- | --- |
| `JOB_FEED_AUTOFETCH_ENABLED` | Liga/desliga a rotina automática de busca de vagas | default `true`; defina `"false"` para desligar |
| `JOB_FEED_RUN_TIMES` | Horários diários em `America/Sao_Paulo` | default `08:00,14:00,20:00` |
| `JOB_FEED_QUERIES` | Termos em rodízio para a busca automática | formato `Título PT|Título EN|keyword1,keyword2;Outro PT|Outro EN|keyword` |
| `FEED_MATCH_BATCH_SIZE` | Quantas vagas salvas são pontuadas por visita ao feed | default `20`; usa IA, então aumente com cuidado |
| `JOB_RETENTION_DAYS` | Depois de quantos dias uma vaga expira automaticamente | default `45` |

A lista padrão local cobre vagas sem experiência/primeiro emprego e áreas
gerais: administrativo, atendimento, vendas, marketing, RH, financeiro,
logística, operações, saúde, educação, jurídico, engenharia, produto, design,
tecnologia, estágio e jovem aprendiz.

## Opcionais (auth)

| Variável | Uso |
|---|---|
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Login com Google — sem elas, só login por e-mail/senha fica disponível |
| `RESEND_API_KEY` | Envio do e-mail de "esqueci minha senha" (`src/lib/resend.ts`) — crie uma conta grátis em resend.com. **Sem ela, o link de redefinição não é enviado** (só loga um erro no servidor). |
| `RESEND_FROM_EMAIL` | Remetente do e-mail de redefinição de senha. Sem ela, usa `onboarding@resend.dev` (domínio de teste do Resend, funciona mas identifica menos a marca). Para usar um remetente `@carreirasmatch.com.br`, é preciso verificar o domínio no painel do Resend primeiro. |

## E-mails transacionais e de ciclo de vida

Todos os e-mails saem via Resend (`src/lib/resend.ts`) e exigem `RESEND_API_KEY`.
São dois grupos:

- **Transacionais (event-driven):** boas-vindas (cadastro), redefinir senha,
  pagamento confirmado, assinatura ativada, **pagamento recusado** e
  **assinatura cancelada**. Os dois últimos e os de confirmação disparam em
  caminho síncrono + webhook do Mercado Pago; a idempotência é garantida pela
  tabela `EmailLog` via `sendOnce` (chaveado pelo `mpPaymentId`).
- **Ciclo de vida (scheduler in-process, `src/lib/email-scheduler.ts`):**
  lembrete de renovação (~3 dias antes), aviso de acesso expirado, nudge de
  onboarding (cadastrou e não fez análise) e follow-up de lead (deixou contato e
  não virou conta). Rodam algumas vezes ao dia e usam `EmailLog` para não
  duplicar.

| Variável | Uso | Observação |
|---|---|---|
| `LIFECYCLE_EMAILS_ENABLED` | Liga/desliga o scheduler de e-mails de ciclo de vida (`src/instrumentation.ts` → `src/lib/email-scheduler.ts`) | default ligado; defina `"false"` para desligar. Não afeta os transacionais. |

## Opcionais (provedores de IA extras — multi-provedor com fallback)

O sistema usa **Groq** por padrão (`GROQ_API_KEY` / `GROQ_MODEL`), mas a camada de
IA (`src/lib/ai-providers.ts`) é multi-provedor: qualquer provedor abaixo com
chave setada entra numa **rotação com fallback automático** — se um bater no
limite ou falhar, a chamada tenta o próximo. Cada requisição loga
`provider=… model=… ms=…` para comparar qual é o melhor. Todos são compatíveis
com a API OpenAI.

| Variável | Provedor | Onde pegar a chave |
|---|---|---|
| `CEREBRAS_API_KEY` / `CEREBRAS_MODEL` | Cerebras (rápido, tipo Groq) | cloud.cerebras.ai |
| `GEMINI_API_KEY` / `GEMINI_MODEL` | Google Gemini (free tier generoso) | aistudio.google.com/apikey |
| `TOGETHER_API_KEY` / `TOGETHER_MODEL` | Together AI | api.together.xyz |
| `DEEPINFRA_API_KEY` / `DEEPINFRA_MODEL` | DeepInfra (barato) | deepinfra.com |
| `OPENROUTER_API_KEY` / `OPENROUTER_MODEL` | OpenRouter (agrega vários) | openrouter.ai/keys |

> `*_MODEL` é opcional — sobrescreve o modelo default de cada provedor. O
> `qwen/qwen3-32b` do Groq é ignorado no código por ter TPM baixo demais nesta
> conta (ver `src/lib/groq.ts`).

## Opcionais (analytics e monitoramento)

| Variável | Uso | Observação |
|---|---|---|
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | Liga o Plausible Analytics de funil (`src/components/analytics.tsx`, `src/lib/analytics.ts`) | Sem ela, nenhum script carrega e `track()` vira no-op. Plausible é sem cookies, então não exige banner de consentimento. |
| `NEXT_PUBLIC_PLAUSIBLE_SRC` | URL do script do Plausible | Opcional; default `https://plausible.io/js/script.tagged-events.js`. Troque se auto-hospedar. |
| `SENTRY_DSN` / `NEXT_PUBLIC_SENTRY_DSN` | Monitoramento de erros server / client (`src/lib/sentry-init.ts`, `src/instrumentation.ts`, `src/instrumentation-client.ts`) | Sem elas, o Sentry fica inerte. Só envia em produção. Não usamos o plugin de build do Sentry, então source maps não sobem automaticamente (stack traces vêm minificadas). |
| `SENTRY_TRACES_SAMPLE_RATE` | Amostragem de tracing de performance (0 a 1) | Default `0` (sem tracing, só erros). |

## Opcionais (Google AdSense)

| Variável | Uso | Observação |
|---|---|---|
| `NEXT_PUBLIC_ADSENSE_CLIENT` | Liga o AdSense (`src/lib/adsense.ts`). Formato `ca-pub-0000000000000000` | Chave mestra: sem ela nenhum script carrega, nenhum anúncio renderiza e `/ads.txt` responde 404. |
| `NEXT_PUBLIC_ADSENSE_SLOT_BLOG_ARTICLE` | Id da unidade dentro do artigo do blog (`/blog/[slug]`) | Só o id numérico, sem `ca-pub-`. Sem ela, essa posição não renderiza. |
| `NEXT_PUBLIC_ADSENSE_SLOT_BLOG_LIST` | Id da unidade na listagem do blog (`/blog`) | Idem. |
| `NEXT_PUBLIC_ADSENSE_SLOT_TOOL_GUIDE` | Id da unidade nos guias abertos (ferramentas com `free` no catálogo) | Idem. |

> Os slots vêm do painel do AdSense em **Anúncios > Por unidade de anúncio**.
> Como cada posição é independente, dá para ligar uma de cada vez.
>
> `/ads.txt` é gerado por rota (`src/app/ads.txt/route.ts`) a partir do
> `NEXT_PUBLIC_ADSENSE_CLIENT`, não é arquivo estático em `public/`. O Google
> exige esse arquivo para autorizar a venda do inventário do domínio.
>
> Anúncios só aparecem nas páginas públicas de conteúdo (blog e vagas). Áreas
> logadas, ferramentas e páginas de pagamento ficam sem anúncio, por política do
> AdSense e para não degradar a experiência de quem paga.
>
> Diferente do Plausible, o AdSense **usa cookies de publicidade de terceiros** —
> a Política de Privacidade (`src/app/privacidade/page.tsx`) já traz a divulgação
> exigida pelo Google. Reavalie a necessidade de banner de consentimento se for
> servir tráfego do EEE/Reino Unido.

> SEO: `/sitemap.xml` e `/robots.txt` são gerados automaticamente
> (`src/app/sitemap.ts`, `src/app/robots.ts`) usando `APP_URL` como base. Não
> precisam de env var própria além de `APP_URL`.

## Docker Compose

`docker-compose.yml` hoje repassa: `GROQ_API_KEY`, `DATABASE_URL`,
`AUTH_SECRET`, `AUTH_TRUST_HOST`, `AUTH_URL`, `GOOGLE_CLIENT_ID/SECRET`,
`ADZUNA_APP_ID/KEY`, `JOOBLE_API_KEY`, `GUPY_COMPANIES`,
`SOLIDES_COMPANIES`, `GLASSDOOR_PARTNER_ID/KEY`, `GREENHOUSE_BOARDS`,
`LEVER_COMPANIES`, `MERCADOPAGO_ACCESS_TOKEN`,
`NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY`, `MERCADOPAGO_WEBHOOK_SECRET`,
`APP_URL`, `ADMIN_EMAILS`, `GROQ_MODEL`, `RESEND_API_KEY`,
`RESEND_FROM_EMAIL`.

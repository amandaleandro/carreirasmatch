# Variáveis de ambiente

Não há validação de schema (zod ou similar) rodando no boot: variáveis
ausentes ou com placeholder falham silenciosamente ou só no primeiro uso
(ex.: `mercadopago.ts` lança erro apenas quando alguém tenta pagar). Revise
esta lista manualmente antes de cada deploy. Nenhum valor real é documentado
aqui — só a chave e para que serve.

## Obrigatórias

| Variável | Uso | Observação |
| --- | --- | --- |
| `DATABASE_URL` | Conexão Prisma/PostgreSQL | `postgresql://...`; no Compose é montada a partir de `POSTGRES_USER`/`POSTGRES_PASSWORD`/`POSTGRES_DB` |
| `AUTH_SECRET` | Assinatura de JWT/sessão do NextAuth v5 | lido implicitamente pelo NextAuth (não aparece como `process.env.AUTH_SECRET` no código); gerar com `openssl rand -base64 32` |
| `AUTH_TRUST_HOST` / `AUTH_URL` | Configuração de host confiável do NextAuth atrás de proxy (Caddy) | padrão do NextAuth v5, necessário em produção |
| `GROQ_API_KEY` ou `OPENAI_API_KEY` (ou qualquer outro provedor de IA da lista abaixo) | Chamadas de análise de currículo/vaga e ferramentas com IA | configure ao menos um provedor |
| `APP_URL` | Base para `back_url` do Mercado Pago, sitemap/robots e URLs absolutas | precisa ser a URL pública real em produção |
| `MERCADOPAGO_ACCESS_TOKEN` | Backend: cria pagamentos/assinaturas | `APP_USR-...` = produção real, `TEST-...` = sandbox |
| `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY` | Client: inicializa os Bricks (Payment/Preapproval) | exposta no bundle, isso é esperado |
| `MERCADOPAGO_WEBHOOK_SECRET` | Valida `x-signature` no webhook (`src/lib/webhook-secret.ts`) | se estiver errado/placeholder, todo webhook real é rejeitado (401) e pagamentos ficam `pending` para sempre |
| `ADMIN_EMAILS` | Libera `/admin`, `requireAdminPage`/`requireAdminApi`; também recebe notificações internas de novo cadastro e de venda (via Resend) | lista separada por vírgula; sem ela, notificações não são enviadas (só logam) |

## Provedores de IA (multi-provedor com fallback)

`src/lib/ai-providers.ts` inclui qualquer provedor abaixo que tenha uma
chave válida e distribui as chamadas por rotação **free-first**: alterna
primeiro entre Groq, Cerebras e Gemini; se as cotas gratuitas falharem/
esgotarem, tenta os secundários e deixa OpenAI como reserva paga por último.
Todos são compatíveis com a API OpenAI (`chat.completions`).

| Variável | Provedor | Observação |
| --- | --- | --- |
| `GROQ_API_KEY` / `GROQ_MODEL` | Groq | default sugerido `llama-3.3-70b-versatile`; modelo configurável também em runtime via `/admin` (`AppSetting`) |
| `OPENAI_API_KEY` / `OPENAI_MODEL` | OpenAI | default `gpt-4.1-nano`; funciona como reserva paga, nunca é removida da fila por cota/cooldown |
| `CEREBRAS_API_KEY` / `CEREBRAS_MODEL` | Cerebras | default `gpt-oss-120b` |
| `GEMINI_API_KEY` / `GEMINI_MODEL` | Google Gemini | default `gemini-3.1-flash-lite` |
| `TOGETHER_API_KEY` / `TOGETHER_MODEL` | Together AI | default `meta-llama/Llama-3.3-70B-Instruct-Turbo` |
| `DEEPINFRA_API_KEY` / `DEEPINFRA_MODEL` | DeepInfra | default `meta-llama/Llama-3.3-70B-Instruct` |
| `OPENROUTER_API_KEY` / `OPENROUTER_MODEL` | OpenRouter | default `meta-llama/llama-3.3-70b-instruct` |
| `AI_ROUTING_MODE` | Modo de roteamento | `free_first` (default), `round_robin` ou `priority` |
| `AI_DAILY_TOKEN_BUDGET` / `AI_DAILY_TOKEN_BUDGET_<ID>` | Cota diária de tokens por provedor (`<ID>` em maiúsculas, ex. `AI_DAILY_TOKEN_BUDGET_GROQ`) | `0` ou ausente = ilimitado |
| `AI_MAX_RETRIES` | Repetições por provedor | default `2`, máximo `3` |
| `AI_REQUEST_TIMEOUT_MS` | Timeout de cada tentativa | default `45000`, mínimo `5000` |
| `AI_MAX_INPUT_CHARS` | Proteção contra entrada gigante (preserva início e instruções finais) | default `50000` |
| `AI_RATE_LIMIT_COOLDOWN_MS` | Pausa de um provedor após 429 sem `retry-after` no header | default `60000` |
| `AI_RESULT_CACHE_TTL_MS` | Reutiliza resposta idêntica de baixa temperatura por N ms | default `300000`; `0` desliga |
| `AI_RESULT_CACHE_MAX_ENTRIES` | Máximo de resultados em cache (só em memória do processo) | default `100` |

## Fontes de vagas (opcionais — puladas se ausentes)

| Variável | Fonte |
| --- | --- |
| `ADZUNA_APP_ID` / `ADZUNA_APP_KEY` | Adzuna |
| `JOOBLE_API_KEY` (+ `JOOBLE_JOBS_ENABLED`) | Jooble |
| `INDEED_JOBS_ENABLED` | Liga/desliga o scraping do Indeed (via Playwright) |
| `GUPY_COMPANIES` | Gupy (lista de subdomínios; usa lista padrão de grandes empregadores BR quando vazio) |
| `SOLIDES_COMPANIES` | Sólides (lista de slugs) |
| `GLASSDOOR_PARTNER_ID` / `GLASSDOOR_PARTNER_KEY` | Glassdoor (exige parceria homologada) |
| `GREENHOUSE_BOARDS` | Greenhouse (lista de board tokens) |
| `LEVER_COMPANIES` | Lever (lista de slugs de empresa) |
| `CHROMIUM_EXECUTABLE_PATH` | Caminho do Chromium para scraping via Playwright/stealth (Indeed, Glassdoor) |

Arbeitnow, RemoteOK, TheMuse, Himalayas, RemoteJobsOrg, Jobicy, Remotive e
LinkedIn não exigem configuração — rodam sempre. Ver
[INTEGRATIONS.md](INTEGRATIONS.md) para o estado real de cada fonte (Jooble
hoje desligada por 403).

## Feed automático de vagas

| Variável | Uso | Observação |
| --- | --- | --- |
| `JOB_FEED_AUTOFETCH_ENABLED` | Liga/desliga o scheduler (`src/instrumentation.ts` → `job-feed-scheduler.ts`) | default `true`; `"false"` desliga |
| `JOB_FEED_RUN_TIMES` | Horários diários em `America/Sao_Paulo` | default `08:00,14:00,20:00` |
| `JOB_FEED_QUERIES` | Termos em rodízio para a busca automática | formato `Título PT\|Título EN\|keyword1,keyword2;Outro PT\|Outro EN\|keyword` |
| `FEED_MATCH_BATCH_SIZE` | Quantas vagas salvas são pontuadas por visita ao feed (usa IA) | default `20` |
| `JOB_RETENTION_DAYS` | Depois de quantos dias uma vaga expira automaticamente | default `45` |

## Cursos, boletins e radares (concurso/vestibular)

| Variável | Uso | Observação |
| --- | --- | --- |
| `EXTERNAL_SOURCES_SYNC_ENABLED` | Liga/desliga a busca automática de cursos, boletins e radares RSS | default `true` |
| `EXTERNAL_SOURCES_RUN_TIMES` | Horários diários em `America/Sao_Paulo` | default `08:00,14:00,20:00` |
| `YOUTUBE_API_KEY` | Sincronização de `CareerVideo` (`src/lib/youtube-sync.ts`) | sem ela, o bootstrap/sync de vídeos não roda |

Cada horário é registrado no banco (`SourceSync`) para impedir repetição no
mesmo dia; se uma fonte falhar, o horário não é marcado como concluído e uma
nova tentativa ocorre na próxima verificação.

## Blog automático

| Variável | Uso | Observação |
| --- | --- | --- |
| `BLOG_AUTOGEN_ENABLED` | Liga/desliga o scheduler de geração de posts | default `true` |
| `BLOG_POSTS_PER_DAY` | Meta de posts gerados por dia (rodízio de nicho) | default `5` |

## Auth

| Variável | Uso |
| --- | --- |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Login com Google (candidato); sem elas, só e-mail/senha funciona |

## E-mail (Resend)

| Variável | Uso | Observação |
| --- | --- | --- |
| `RESEND_API_KEY` | Envio de todos os e-mails transacionais e de ciclo de vida (`src/lib/resend.ts`) | sem ela, nada é enviado (só loga erro) |
| `RESEND_FROM_EMAIL` | Remetente | sem ela, usa `onboarding@resend.dev` (domínio de teste); precisa verificar domínio próprio no painel do Resend para usar um remetente com marca |
| `LIFECYCLE_EMAILS_ENABLED` | Liga/desliga o scheduler de e-mails de ciclo de vida (`email-scheduler.ts`) | default ligado; não afeta os transacionais |

## GitHub

| Variável | Uso | Observação |
| --- | --- | --- |
| `GITHUB_TOKEN` | Busca de perfil público na ferramenta de revisão de GitHub (`src/lib/github-profile.ts`) | sem ela, limite de 60 req/h por IP do servidor (compartilhado entre usuários, 2 por análise); com token classic sem escopo, sobe para 5.000/h |

## Notificações push (Web Push / VAPID)

| Variável | Uso | Observação |
| --- | --- | --- |
| `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` | Par de chaves VAPID para Web Push (`src/lib/push.ts`) | sem elas, a feature de push vira no-op |
| `VAPID_SUBJECT` | Contato exigido pelo protocolo Web Push (`mailto:...`) | default `mailto:contato@carreirasmatch.com.br` |

## Analytics, publicidade e erros

| Variável | Uso | Observação |
| --- | --- | --- |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | Liga o Plausible Analytics de funil | sem ela, nenhum script carrega e `track()` vira no-op; Plausible é sem cookies |
| `NEXT_PUBLIC_PLAUSIBLE_SRC` | URL do script do Plausible | default `https://plausible.io/js/script.tagged-events.js` |
| `SENTRY_DSN` / `NEXT_PUBLIC_SENTRY_DSN` | Monitoramento de erros server/client | sem elas, o Sentry fica inerte; source maps não sobem automaticamente |
| `SENTRY_TRACES_SAMPLE_RATE` | Amostragem de tracing de performance (0 a 1) | default `0` |
| `NEXT_PUBLIC_ADSENSE_CLIENT` | Liga o Google AdSense (`ca-pub-...`) | sem ela, nenhum anúncio renderiza e `/ads.txt` responde 404 |
| `NEXT_PUBLIC_ADSENSE_SLOT_BLOG_ARTICLE` / `NEXT_PUBLIC_ADSENSE_SLOT_BLOG_LIST` / `NEXT_PUBLIC_ADSENSE_SLOT_TOOL_GUIDE` | Ids de unidades de anúncio específicas | cada posição liga independente |
| `GOOGLE_SITE_VERIFICATION` | Verificação de propriedade no Google Search Console | meta tag na home |

Anúncios só aparecem em páginas públicas de conteúdo (blog, vagas, guias
abertos); áreas logadas e páginas de pagamento não têm anúncio.

## Observabilidade (Prometheus/Loki/Grafana)

| Variável | Uso |
| --- | --- |
| `METRICS_TOKEN` | Protege `/api/metrics` com `Authorization: Bearer <token>`. Sem ele, produção aceita apenas o scrape direto da rede Docker; acessos encaminhados pelo proxy público respondem `503` (e o Caddy também bloqueia o caminho). |

Stack completa (Prometheus, Loki, Promtail, Grafana) sobe por
`docker-compose.observability.yml`, com variáveis próprias documentadas em
`observability/README.md`.

## Backup do PostgreSQL (Docker Compose)

| Variável | Default | Uso |
| --- | --- | --- |
| `SQLITE_BACKUP_HOST_DIR` | `./backups` | Nome legado da variável usada pelo Compose para o diretório de backups PostgreSQL no host |
| `BACKUP_INTERVAL_SECONDS` | `86400` | Intervalo entre backups |
| `BACKUP_RETENTION_DAYS` | `14` | Retenção local dos dumps |

## Runtime interno

| Variável | Uso |
| --- | --- |
| `NEXT_RUNTIME` | Setada pelo próprio Next; `instrumentation.ts` só roda os schedulers quando `nodejs` (não em edge) |
| `NODE_ENV` | Padrão Node/Next |

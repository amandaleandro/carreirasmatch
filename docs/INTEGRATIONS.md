# Integrações externas

## Inteligência artificial

`src/lib/ai-providers.ts` é uma camada multi-provedor com fallback: um único
cliente OpenAI-compatível (`openai` SDK) troca `baseURL`/`apiKey`/`model`
conforme o provedor. Um endpoint só entra na fila se a chave dele estiver
setada.

| Provedor | Papel | Configuração |
| --- | --- | --- |
| Groq | Gratuito, primeira opção | `GROQ_API_KEY`, `GROQ_MODEL` |
| Cerebras | Gratuito, primeira opção | `CEREBRAS_API_KEY`, `CEREBRAS_MODEL` |
| Gemini | Gratuito, primeira opção | `GEMINI_API_KEY`, `GEMINI_MODEL` |
| Together, DeepInfra, OpenRouter | Secundários | `*_API_KEY`, `*_MODEL` |
| OpenAI | Reserva paga, nunca removida por cota/cooldown | `OPENAI_API_KEY`, `OPENAI_MODEL` |

Roteamento configurável por `AI_ROUTING_MODE` (`free_first` default,
`round_robin`, `priority`). Cada requisição loga
`provider=… model=… ms=… input_tokens=… output_tokens=…` para comparar
performance/custo real. Chamadas de baixa temperatura (≤0.3) são cacheadas em
memória por `AI_RESULT_CACHE_TTL_MS`; requisições idênticas simultâneas
compartilham a mesma promise (evita cobrança duplicada por duplo clique).
Erros 429 colocam o provedor em cooldown (lendo `retry-after`/
`retry-after-ms` do header quando disponível) e um orçamento diário de tokens
por provedor pode ser configurado (`AI_DAILY_TOKEN_BUDGET*`).

`src/lib/groq.ts` (nome histórico — hoje é o orquestrador da análise de
currículo em cima do multi-provedor, não uma integração exclusiva da Groq)
monta o prompt e chama `runJsonAcrossProviders`; o resultado é JSON parseado
e validado. Saídas estruturadas de outras ferramentas passam por
`src/lib/ai-schemas.ts`/`ai-shape.ts` antes de serem persistidas.

## Mercado Pago (pagamentos)

Não há Stripe no código — o provedor de pagamento é **Mercado Pago**
(`src/lib/mercadopago.ts`), usado por candidato (avulso e assinatura),
empresa (pacote de créditos de triagem) e parceiro (créditos de destaque de
curso).

- Backend: `MERCADOPAGO_ACCESS_TOKEN` (`APP_USR-...` = produção real,
  `TEST-...` = sandbox). O cliente só falha no primeiro uso, não no boot.
- Frontend: `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY` inicializa os Bricks
  (`@mercadopago/sdk-react`) — Payment Brick (avulso/cartão/PIX) e
  Preapproval/Subscription Brick (assinatura recorrente).
- Webhook: `POST /api/billing/webhook` é o ponto autoritativo assíncrono.
  Valida o header `x-signature` via HMAC + `timingSafeEqual`
  (`src/lib/webhook-secret.ts`, `MERCADOPAGO_WEBHOOK_SECRET`) e **falha
  fechado** (401) se a assinatura não bater ou o segredo não estiver
  configurado — nesse caso o pagamento fica `pending` para sempre mesmo tendo
  sido cobrado. Depois de validar a assinatura, o webhook confirma o status
  consultando a API do Mercado Pago (`getPayment`/`getPreapproval`) antes de
  liberar qualquer acesso, e trata reenvio do mesmo evento checando a
  transição de status (não duplica crédito/comissão/e-mail).
- `APP_URL` monta as URLs de retorno (`back_url`).

Ver [PAYMENT_PRODUCTION_VALIDATION.md](PAYMENT_PRODUCTION_VALIDATION.md) para
o checklist de validação em produção.

## E-mail (Resend)

`src/lib/resend.ts` concentra todo envio (templates + chamada à API do
Resend), com `RESEND_API_KEY`/`RESEND_FROM_EMAIL`. Dois grupos:

- **Transacionais (event-driven)**: boas-vindas, redefinir senha, pagamento
  confirmado, assinatura ativada, pagamento recusado, assinatura cancelada.
  Disparam em caminho síncrono e/ou pelo webhook do Mercado Pago.
- **Ciclo de vida** (`src/lib/email-scheduler.ts`, in-process, sem cron
  externo): lembrete de renovação, aviso de acesso expirado, nudge de
  onboarding (cadastrou e não fez análise) e follow-up de lead (deixou
  contato e não virou conta).

Idempotência em ambos os grupos via `EmailLog` + `sendOnce` (chave por tipo +
`dedupeKey`, ex. `mpPaymentId`) — o scheduler roda várias vezes ao dia e não
pode duplicar envio.

## Fontes de vagas

Conectores em `src/lib/job-sources/` (um arquivo por fonte), agregados em
`src/lib/job-sources/index.ts::fetchNewJobsFromAllSources`. Cada fonte é
chamada em paralelo (`Promise.allSettled`); uma fonte que falha não derruba
as demais, e o erro vira uma entrada no array `errors` retornado.

| Fonte | Configuração | Estado |
| --- | --- | --- |
| Arbeitnow, RemoteOK, TheMuse, Himalayas, RemoteJobsOrg, Jobicy, Remotive, LinkedIn | Nenhuma (sempre ativas) | Ativas |
| Indeed | `INDEED_JOBS_ENABLED`, scraping via Playwright/stealth | Ativa por padrão; falha isolada se houver bloqueio anti-bot |
| Adzuna | `ADZUNA_APP_ID`/`ADZUNA_APP_KEY` | Ativa se configurada |
| Gupy | `GUPY_COMPANIES` (lista padrão de grandes empregadores BR quando vazio) | Ativa por padrão |
| Sólides | `SOLIDES_COMPANIES` | Ativa se configurada |
| Greenhouse | `GREENHOUSE_BOARDS` (lista padrão quando vazio) | Ativa por padrão |
| Lever | `LEVER_COMPANIES` (lista padrão quando vazio) | Ativa por padrão |
| **Jooble** | `JOOBLE_API_KEY` + `JOOBLE_JOBS_ENABLED` | **Desligada em produção — a API responde 403 (chave inválida/sem acesso segundo a Jooble)**; `isJoobleConfigured()` só entra na fila se a chave estiver setada e `JOOBLE_JOBS_ENABLED` não for `"false"` |
| Glassdoor | `GLASSDOOR_PARTNER_ID`/`GLASSDOOR_PARTNER_KEY` | Não homologada; só entra na fila com contexto de request (IP/user-agent) |

O agregador deduplica por URL e por um "fingerprint" (título + empresa +
localização normalizados) antes de gravar `Job` novo; vagas expiram depois de
`JOB_RETENTION_DAYS` (default 45).

`src/lib/job-feed-scheduler.ts` roda 3x/dia (`JOB_FEED_RUN_TIMES`) girando por
uma lista de cargos (`JOB_FEED_QUERIES`) e, a cada execução, também por um
estado brasileiro (`JOB_FEED_LOCATIONS`, default = as 27 UFs) passado como
`where`/`l`/`location` para Adzuna/Indeed/LinkedIn. Buscar por estado (em vez
de nacional sem filtro, ou só por capital) evita que vagas de cidades menores
fiquem de fora do topo paginado dessas APIs.

## Radares de concurso e vestibular (RSS)

`src/lib/radar-sync.ts` sincroniza `RadarItem` a partir de feeds RSS/Atom
fixos (sem chave de API):

| Feed | Tipo |
| --- | --- |
| Gran Cursos (`blog.grancursosonline.com.br/feed/`) | `concurso` |
| Concursos no Brasil (`concursosnobrasil.com/feed/`) | `concurso` |
| Quero Bolsa (`querobolsa.com.br/revista/feed.xml`) | `vestibular` |
| Stoodi (`blog.stoodi.com.br/feed/`) | `vestibular` |
| Guia do Estudante (`guiadoestudante.abril.com.br/feed/`) | `vestibular` |

Roda como parte do `external-source-scheduler.ts`, junto com a sincronização
de `ExternalCourse` (cursos) e `PublicJobBulletin` (boletins de vaga
pública/concurso). Cada item é filtrado por relevância (`isRelevant`) antes
de virar `RadarItem`, e a execução idempotente por horário/dia fica marcada
em `SourceSync`.

## GitHub e YouTube

- `GITHUB_TOKEN` (opcional) — usado pela ferramenta de revisão de perfil
  GitHub (`src/lib/github-profile.ts`); sem token, limite de 60 req/h por IP
  do servidor (2 por análise), com token classic sem escopo sobe pra 5.000/h.
- `YOUTUBE_API_KEY` — alimenta `src/lib/youtube-sync.ts`, que popula
  `CareerVideo` por área.

URLs fornecidas pelo usuário (GitHub, LinkedIn, vagas) passam por
`src/lib/url-safety.ts` antes de qualquer requisição server-side.

## Analytics, publicidade e erros

- **Plausible** — `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`/`NEXT_PUBLIC_PLAUSIBLE_SRC`;
  sem cookies, não exige banner de consentimento.
- **Google AdSense** — `NEXT_PUBLIC_ADSENSE_CLIENT` + slots por posição
  (`NEXT_PUBLIC_ADSENSE_SLOT_*`); usa cookies de publicidade de terceiros
  (divulgado na Política de Privacidade). Só em páginas públicas de
  conteúdo.
- **Sentry** — `SENTRY_DSN`/`NEXT_PUBLIC_SENTRY_DSN` +
  `SENTRY_TRACES_SAMPLE_RATE`; inicializado em `src/instrumentation.ts` e
  `src/instrumentation-client.ts`.

Variáveis `NEXT_PUBLIC_*` são incorporadas ao bundle e nunca podem conter
segredo.

## Notificações push (Web Push)

`src/lib/push.ts` usa `web-push` com par de chaves VAPID
(`VAPID_PUBLIC_KEY`/`VAPID_PRIVATE_KEY`/`VAPID_SUBJECT`). Sem as chaves, a
feature vira no-op inteira. Inscrições ficam em `PushSubscription`; quando um
envio retorna 404/410 a inscrição morta é removida.

## Observabilidade (Prometheus/Loki/Grafana)

- `GET /api/metrics` expõe o registro `prom-client` (`src/lib/metrics.ts`),
  protegido opcionalmente por `METRICS_TOKEN`.
- Stack separada em `docker-compose.observability.yml`: Prometheus faz
  scrape do endpoint pela rede interna do Docker; Promtail encaminha logs
  para Loki; Grafana consulta os dois. Há dashboards dedicados a
  deploys/incidentes e ao "farol das jornadas" do produto (alertas de vaga,
  blog, radares, freelancer instrumentados como eventos de negócio).
- O Caddy bloqueia `/api/metrics` vindo da internet pública; `METRICS_TOKEN`
  é defesa em profundidade.

## Padrões de falha e fallback

- Toda chamada externa tem timeout (`AbortSignal.timeout` ou timeout do SDK).
- Uma fonte/integração opcional ausente desabilita só a própria capacidade —
  nunca derruba o restante do fluxo (feed de vagas, análise de IA, etc.).
- Webhooks e schedulers são idempotentes (`EmailLog`, `SourceSync`, checagem
  de transição de status).
- Logs registram provedor/fonte e contexto, nunca token ou conteúdo sensível
  completo.
- Troca de chave/segredo exige restart do processo Node; variáveis
  `NEXT_PUBLIC_*` exigem novo build (ficam embutidas no bundle client).

# Integrações externas

## Inteligência artificial

A camada em `src/lib/ai-providers.ts` permite múltiplos provedores com fallback.
O roteamento é configurado por `AI_ROUTING_MODE`; timeout e retentativas são
controlados por variáveis próprias.

| Provedor | Configuração principal |
| --- | --- |
| Groq | `GROQ_API_KEY`, `GROQ_MODEL` |
| OpenAI | `OPENAI_API_KEY`, `OPENAI_MODEL` |
| Cerebras | `CEREBRAS_API_KEY`, `CEREBRAS_MODEL` |
| Gemini | `GEMINI_API_KEY`, `GEMINI_MODEL` |
| Together | `TOGETHER_API_KEY`, `TOGETHER_MODEL` |
| DeepInfra | `DEEPINFRA_API_KEY`, `DEEPINFRA_MODEL` |
| OpenRouter | `OPENROUTER_API_KEY`, `OPENROUTER_MODEL` |

Saídas estruturadas devem passar pelos schemas e normalizadores em
`src/lib/ai-schemas.ts` e `src/lib/ai-shape.ts`. Nunca persista cegamente uma
resposta do modelo.

## Mercado Pago

Responsável por pagamento avulso, assinatura e pacote de créditos de empresa.

- backend: `MERCADOPAGO_ACCESS_TOKEN`;
- frontend: `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY`;
- webhook: `MERCADOPAGO_WEBHOOK_SECRET`;
- URLs de retorno: `APP_URL`.

Credenciais `APP_USR` geram transações reais. A confirmação assíncrona deve
validar assinatura e consultar o pagamento no provedor antes de liberar acesso.
Veja [PAYMENT_PRODUCTION_VALIDATION.md](PAYMENT_PRODUCTION_VALIDATION.md).

## E-mail

Resend envia e-mails transacionais e de ciclo de vida por `src/lib/resend.ts`,
`src/lib/email.ts` e scheduler relacionado.

- `RESEND_API_KEY`;
- `RESEND_FROM_EMAIL`;
- `LIFECYCLE_EMAILS_ENABLED`.

`EmailLog` impede repetição por tipo/chave. Falha de envio não deve reverter uma
confirmação de pagamento.

## Fontes de vagas

Conectores ficam em `src/lib/job-sources/`. Há fontes sem credencial e fontes
configuráveis:

- Adzuna, Jooble, Indeed;
- Gupy e Sólides;
- Greenhouse e Lever;
- Glassdoor, quando houver parceria;
- Remotive, Remote OK, Arbeitnow, Jobicy, Himalayas e outras implementadas.

O scheduler de feed e a sincronização de oportunidades têm flags e horários
independentes. Fontes instáveis devem falhar isoladamente, registrar execução e
não derrubar todo o lote.

## GitHub e YouTube

- `GITHUB_TOKEN` aumenta limites e permite a revisão de perfil.
- `YOUTUBE_API_KEY` alimenta sincronização de vídeos.

URLs fornecidas pelo usuário passam por validação de segurança antes de
requisições server-side.

## Analytics, publicidade e erros

- Plausible: `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` e `NEXT_PUBLIC_PLAUSIBLE_SRC`;
- AdSense: cliente e slots `NEXT_PUBLIC_ADSENSE_*`;
- Sentry: `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN` e taxa de traces.

Variáveis `NEXT_PUBLIC_*` são incorporadas ao bundle e nunca podem conter
segredos.

## Observabilidade

Prometheus consulta `/api/metrics`; Loki recebe logs via Promtail; Grafana
consulta ambos. `METRICS_TOKEN` protege opcionalmente o endpoint. A stack está
em `docker-compose.observability.yml` e é detalhada em
`observability/README.md`.

## Falhas e fallback

- Defina timeout em chamadas externas.
- Registre provedor e contexto, nunca token ou conteúdo sensível completo.
- Use idempotência em webhooks, e-mails e schedulers.
- Uma integração opcional ausente deve desabilitar apenas sua capacidade.
- Alterações de chave exigem restart/redeploy; variáveis públicas exigem novo
  build.

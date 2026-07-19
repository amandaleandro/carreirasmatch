# Plano seguro de escala

## PostgreSQL — concluído

O runtime atual já usa PostgreSQL 17: o provider do Prisma é `postgresql`, o
Compose mantém o volume `postgres-data` e há backup periódico dedicado. Os
scripts de SQLite permanecem apenas como histórico da migração.

Próximos cuidados de escala:

1. testar restauração regularmente;
2. monitorar conexões, disco, locks e consultas lentas;
3. revisar índices com dados representativos;
4. adotar pool de conexões antes de multiplicar réplicas;
5. planejar migrations destrutivas com compatibilidade entre versões.

## Fila de processamento

O próximo estágio usa Redis e um worker separado para PDF, scraping, matching e
e-mails. O agendador atual já registra execuções e evita duplicidade, portanto
os trabalhos podem receber uma chave formada por fonte, URL e horário.

Variáveis reservadas:

| Variável | Uso |
| --- | --- |
| `REDIS_URL` | Conexão da fila distribuída |
| `WORKER_CONCURRENCY` | Quantidade máxima de trabalhos simultâneos |

## WhatsApp

Alertas por WhatsApp exigem um provedor autorizado, consentimento explícito,
modelo de mensagem aprovado e opção de cancelamento. A ativação depende de:

| Variável | Uso |
| --- | --- |
| `WHATSAPP_PROVIDER` | Provedor contratado |
| `WHATSAPP_ACCESS_TOKEN` | Credencial mantida somente no servidor |
| `WHATSAPP_SENDER_ID` | Identificador do remetente aprovado |

E-mail continua sendo o canal ativo enquanto essas credenciais não existirem.

## Mapas

Os links públicos usam OpenStreetMap sem armazenar localização precisa do
usuário. Um mapa interativo com marcadores exige geocodificação, cache de
coordenadas e respeito ao limite do provedor escolhido.

## Observabilidade

Antes de tráfego pago, preencher Plausible e Sentry no ambiente de produção e
confirmar eventos, erros, alertas e cliques no painel administrativo.

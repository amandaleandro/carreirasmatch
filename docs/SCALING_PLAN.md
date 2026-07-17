# Plano seguro de escala

## PostgreSQL

A troca de SQLite por PostgreSQL deve acontecer em uma janela planejada:

1. criar a instância PostgreSQL e restringir o acesso à rede da aplicação;
2. gerar um backup íntegro do SQLite;
3. suspender escritas durante a migração;
4. migrar e conferir contagens de usuários, pagamentos, análises e candidaturas;
5. alterar o provider do Prisma e `DATABASE_URL`;
6. executar testes de pagamento, login, análise e alertas;
7. manter o backup original para retorno.

Não é seguro trocar o banco da VPS automaticamente enquanto usuários podem
gravar dados.

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

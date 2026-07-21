# Solução de problemas

Problemas reais já enfrentados em produção, com a causa confirmada e o que
fazer. Não é uma lista hipotética — cada seção abaixo já aconteceu.

## Build falha na VPS por `next/font/google`

**Sintoma:** deploy falha com erro tipo `module-not-found` em
`geist_mono_*.module.css` ou referência a `next/font/google`.

**Causa:** `next build` baixa as fontes do Google Fonts em build time, e a
rede da VPS falha de forma intermitente para esse download. Não é erro no
código — é transitório.

**Como resolver:** re-disparar o deploy costuma resolver:

```bash
git commit --allow-empty -m "redeploy" && git push vps master
```

**Correção definitiva (ainda não feita):** migrar para `next/font/local`
com os arquivos de fonte versionados no repo, removendo a dependência de
rede externa no build.

## Disco cheio por cache/imagens Docker

**Sintoma:** deploy falha, container não sobe, ou operações de escrita no
Postgres começam a falhar por falta de espaço.

**Causa:** cada deploy reconstrói a imagem, acumulando build cache e imagens
órfãs. Já foi medido ~4,5 GB de cache novo por deploy, e o disco (69 GB) já
chegou a 100% de uso.

**Nota histórica:** antes da migração para PostgreSQL (concluída em
2026-07), disco cheio causava `SQLITE_FULL`/`database or disk is full` no
SQLite. **Esse erro específico não existe mais** — o banco é PostgreSQL
desde então. Disco cheio hoje se manifesta como falha de escrita do
Postgres, falha de build, ou o host inteiro ficando instável (a VPS já
reiniciou uma vez por pico de memória durante um `next build` pesado,
mitigado com swap adicional — ver abaixo).

**Diagnóstico:**

```bash
ssh root@177.153.62.190 'df -h / ; docker system df'
```

**Como resolver**, só depois de confirmar que o deploy novo está no ar
(preserva a imagem anterior para rollback):

```bash
docker image prune -f && docker builder prune -f
```

**Nunca** use `-a`/`--all` (remove também a imagem anterior, matando o
rollback rápido) nem `docker volume prune`/`--volumes` (apagaria o volume
`postgres-data`, ou seja, o banco de produção inteiro).

**Prevenção já ativa:** cron semanal (`/etc/cron.d/carreiras-docker-prune`,
domingo 04:00) rodando o prune automaticamente, e 6 GB de swap
(`/swapfile` + `/swapfile_deploy`) para o `next build` não estourar a RAM
(~4 GB) da VPS.

## Loki não está ingerindo logs

**Sintoma:** o dashboard "Logs" no Grafana está vazio; não há como buscar
log histórico de um incidente passado.

**Causa confirmada:** `curl http://localhost:3100/loki/api/v1/labels` na
VPS retorna vazio (zero labels, zero séries). O container `promtail` loga
repetidamente `error sending batch, will retry ... context deadline
exceeded` ao tentar empurrar para `carreiras-match-loki:3100`. Isso é um
problema aberto, ainda não corrigido.

**Impacto prático:** o único log disponível para investigar um incidente é
`docker logs <container>`, e ele só cobre o que aconteceu **desde o último
`--force-recreate`** — como todo deploy faz `--force-recreate app`, o
histórico de log some a cada deploy. Se um incidente aconteceu há dias, não
há como recuperar o log dele hoje.

**O que fazer enquanto não for corrigido:**

1. Ao investigar um incidente, capture `docker logs` do container afetado
   **imediatamente**, antes que outro deploy rode e apague o histórico.
2. Para investigar dado de produção diretamente (não log, mas estado),
   consultar o Postgres de produção via `docker exec` num container com
   acesso ao `DATABASE_URL`, em vez de depender de log.
3. Verificar se `promtail` e `loki` estão saudáveis:

   ```bash
   docker compose -f docker-compose.observability.yml logs promtail loki --tail 50
   ```

4. Correção real ainda não investigada a fundo — suspeita não confirmada é
   de rede/DNS entre containers ou configuração de push do promtail; não
   tratar como resolvido até `labels` retornar dado.

## `git push vps master` parece travar

**Sintoma:** o comando de push não retorna, ou retorna erro/timeout (exit
143) mesmo que o deploy pareça ter completado.

**Causa:** o hook `post-receive` na VPS faz `docker compose build app` +
`docker compose up -d --force-recreate app`, o que facilmente passa de 2
minutos. Uma ferramenta ou terminal com timeout curto derruba a conexão SSH
antes do hook terminar — **isso não significa que o deploy falhou**, só que
o cliente parou de esperar.

**Como confirmar o estado real, sem assumir nada pelo timeout:**

```bash
git fetch vps && git log vps/master..master   # vazio = a ref já atualizou
ssh root@177.153.62.190 "cd /opt/carreiras-match && docker compose ps app"
```

Se o container aparecer "Up" com tempo de atividade compatível com o
horário do push, o deploy terminou normalmente antes do timeout do cliente
estourar. Use um timeout alto (5-10 min) ao automatizar o push, para evitar
esse falso alarme.

## Aplicação não inicia

1. Confira se `DATABASE_URL` existe e aponta para PostgreSQL acessível
   (formato `postgresql://...`; provider Prisma é `postgresql`, não há mais
   suporte a SQLite em produção).
2. Confira `AUTH_SECRET`.
3. Execute `npx prisma generate` e `npx prisma migrate deploy`.
4. Rode `npm run build` para obter o erro completo (sem build de produção
   não há sinal claro de erro de tipo/rota).
5. No Docker: `docker compose ps` e logs só do serviço afetado.

## Erro de conexão com banco

- Confirme o healthcheck do container `postgres` (`pg_isready`).
- Valide usuário, banco e senha sem imprimi-los em log ou terminal
  compartilhado.
- Confirme que a aplicação usa o hostname `postgres` (nome do serviço no
  Compose), não `localhost`, dentro do container.
- Confira migrations pendentes com `npx prisma migrate status`.
- Lembre que algumas tabelas de produção foram criadas por `prisma db push`
  em vez de migration (ver [OPERATIONS.md](OPERATIONS.md)) — um banco novo
  provisionado do zero pode não ter todas as tabelas que produção tem.

## Login redireciona repetidamente

- Verifique `APP_URL`, `AUTH_URL`, `AUTH_SECRET` e `AUTH_TRUST_HOST` no
  ambiente correto (local vs `.env` da VPS — não são o mesmo arquivo).
- Confirme se a sessão de empresa/parceiro carrega `accountType` e
  `companyId`/`partnerId` (ver [AUTHORIZATION.md](AUTHORIZATION.md) sobre
  por que `authConfig` precisa desses callbacks).
- Verifique se a rota deveria estar em `PUBLIC_PATHS`
  (`src/auth.config.ts`) — rota nova fora dessa lista redireciona para
  login mesmo sendo destinada a ser pública (já aconteceu com
  `/freelancers` e `/projetos`).
- Apague cookies apenas no ambiente de teste.

## Pagamento aprovado não libera acesso

1. Consulte o pagamento pelo ID diretamente no painel do Mercado Pago.
2. Confira entrega e código HTTP do webhook no painel do Mercado Pago.
3. Procure o registro `Payment` (ou `CompanyPayment`/`PartnerPayment`) por
   `mpPaymentId`.
4. Valide `status`, `paidAt`, `analysisId`/`userId`.
5. Confira `MERCADOPAGO_WEBHOOK_SECRET` — se divergir do painel, **todo**
   webhook real é rejeitado com 401 e nada confirma automaticamente.
6. Confirme `APP_URL` correto no ambiente que recebeu o pagamento.
7. Reenvie o webhook manualmente só depois de confirmar idempotência (ver
   `src/app/api/billing/webhook/route.ts` — a lógica só age na transição de
   estado, então reenviar um evento já processado deve ser inofensivo).

## IA falha ou responde formato inválido

- Confira se ao menos um provider está configurado (`GROQ_API_KEY` ou
  `OPENAI_API_KEY`; outros são opcionais via multi-provedor com fallback).
- Verifique modelo disponível e limites/cota da conta do provider.
- Consulte timeout (`AI_REQUEST_TIMEOUT_MS`), retries (`AI_MAX_RETRIES`) e
  modo de roteamento (`AI_ROUTING_MODE`).
- Procure falha de validação Zod nos schemas de resposta de IA — resposta
  de IA nunca é tratada como confiável sem passar por schema.
- Teste com entrada pequena e sem dado pessoal real.

## Feed de vagas ou radares (concurso/vestibular) não atualizam

- Confira as flags (`JOB_FEED_AUTOFETCH_ENABLED`,
  `EXTERNAL_SOURCES_SYNC_ENABLED`) e os horários configurados
  (`JOB_FEED_RUN_TIMES`/`EXTERNAL_SOURCES_RUN_TIMES`, default
  `08:00,14:00,20:00` em `America/Sao_Paulo`).
- Consulte a tabela `SourceSync` para a última execução registrada — cada
  horário só roda uma vez por dia por slot.
- Valide credenciais da fonte específica (ex.: `JOOBLE_API_KEY`).
- Teste a fonte isoladamente — bloqueio anti-bot e mudança de HTML externo
  acontecem sem aviso (ex.: Indeed via scraping Playwright, RSS de
  concursos/vestibulares que já mudaram de formato antes).
- Dispare manualmente pelo botão "Atualizar todas as fontes agora" em
  `/admin` (exige sessão admin) para não esperar o próximo horário.
- Confira retenção (`JOB_RETENTION_DAYS`) e filtros `active`/`expiresAt`.

## E-mails não chegam

- Verifique `RESEND_API_KEY`, `RESEND_FROM_EMAIL` e domínio verificado no
  Resend — e confirme que estão no `.env` **da VPS**, não só local (já
  aconteceu de faltar em produção e todos os e-mails morrerem em silêncio).
- Confira `LIFECYCLE_EMAILS_ENABLED` (desliga o scheduler inteiro se
  `"false"`).
- Consulte `EmailLog` — uma chave já registrada impede reenvio
  (`sendOnce`), então "não enviou de novo" pode ser esperado.
- Veja o log do container logo após o evento (lembre que some no próximo
  deploy) e a caixa de spam do endereço de teste controlado pela equipe.

## Push/PWA não funciona

- PWA e push já estão implementados no código (`src/app/manifest.ts`,
  `public/sw.js`, `src/lib/push.ts`, modelo `PushSubscription`) — não é uma
  feature faltando, é possivelmente configuração ausente.
- Push exige `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` e `VAPID_SUBJECT`
  configurados no `.env` **da VPS**. Sem eles, o recurso fica silenciosamente
  no-op (nada quebra, mas nenhuma notificação sai).
- Confirme que o navegador registrou o service worker (`public/sw.js`) e
  que a permissão de notificação foi concedida.
- Push é enviado junto do e-mail de alerta de vaga (`sendJobAlerts` em
  `email-scheduler.ts`), compartilhando o mesmo `sendOnce`/`EmailLog` — os
  mesmos diagnósticos de "e-mails não chegam" acima se aplicam.

## Métricas ou Grafana indisponíveis

- A stack principal precisa criar a rede `carreiras-match_default` **antes**
  da stack de observabilidade subir.
- Confira `METRICS_TOKEN` no Prometheus e na aplicação, se configurado.
- Valide os volumes de provisioning do Grafana
  (`observability/grafana/provisioning`, `observability/grafana/dashboards`).
- Consulte `observability/README.md` para a lista completa de dashboards e
  variáveis.
- Se for especificamente o dashboard "Logs" vazio, veja a seção "Loki não
  está ingerindo logs" acima — não é um problema de Grafana em si.

## Build falha depois de mudar Next.js

Esta versão do Next.js possui convenções próprias, diferentes do que
treinamento genérico assume (por isso o nome de arquivo `src/proxy.ts` em
vez de `middleware.ts`, por exemplo). Antes de corrigir código, consulte os
guias instalados em `node_modules/next/dist/docs/` e siga os avisos de
depreciação da versão instalada — ver `AGENTS.md` na raiz do repo.

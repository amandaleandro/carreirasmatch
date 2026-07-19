# Solução de problemas

## Aplicação não inicia

1. Confira se `DATABASE_URL` existe e aponta para PostgreSQL acessível.
2. Confira `AUTH_SECRET`.
3. Execute `npx prisma generate` e `npx prisma migrate deploy`.
4. Rode `npm run build` para obter o erro completo.
5. No Docker, use `docker compose ps` e logs apenas do serviço afetado.

## Erro de conexão com banco

- Confirme o healthcheck do container `postgres`.
- Valide usuário, banco e senha sem imprimi-los.
- Verifique se a aplicação usa o hostname `postgres` dentro do Compose.
- Confira migrations pendentes com `npx prisma migrate status`.

## Login redireciona repetidamente

- Verifique `APP_URL`, `AUTH_URL`, `AUTH_SECRET` e `AUTH_TRUST_HOST`.
- Apague cookies apenas no ambiente de teste.
- Confirme se sessão de empresa tem `accountType` e `companyId`.
- Verifique se a rota deveria estar em `PUBLIC_PATHS`.

## Pagamento aprovado não libera acesso

1. Consulte o pagamento pelo ID no Mercado Pago.
2. Confira entrega e HTTP do webhook.
3. Procure `Payment` por `mpPaymentId`.
4. Valide `status`, `paidAt`, `analysisId` e `userId`.
5. Confira assinatura secreta e `APP_URL`.
6. Reenvie o webhook somente depois de confirmar idempotência.

## IA falha ou responde formato inválido

- Confira se ao menos um provider está configurado.
- Verifique modelo disponível e limites da conta.
- Consulte timeout, retries e modo de roteamento.
- Procure falha de validação nos schemas de IA.
- Teste com entrada pequena e sem dados pessoais reais.

## Feed ou oportunidades não atualizam

- Confira flags e horários de sincronização.
- Consulte `SourceSync` para a última execução.
- Valide credenciais da fonte específica.
- Teste a fonte isoladamente; bloqueios e HTML externo podem mudar.
- Confira retenção e filtros `active`/`expiresAt`.

## E-mails não chegam

- Verifique chave, remetente e domínio no Resend.
- Confira `LIFECYCLE_EMAILS_ENABLED`.
- Consulte `EmailLog`: uma chave existente impede reenvio.
- Veja logs do scheduler e a caixa de spam do endereço controlado.

## Métricas ou Grafana indisponíveis

- A stack principal deve criar `carreiras-match_default` antes da stack de
  observabilidade.
- Confira `METRICS_TOKEN` no Prometheus e na aplicação.
- Valide volumes de provisioning do Grafana.
- Consulte `observability/README.md`.

## Build falha depois de mudar Next.js

Esta versão do Next.js possui convenções próprias. Antes de corrigir código,
consulte os guias instalados em `node_modules/next/dist/docs/` e siga os avisos
de depreciação da versão do projeto.

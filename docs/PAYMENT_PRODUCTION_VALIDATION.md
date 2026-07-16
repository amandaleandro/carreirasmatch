# Homologação de pagamento em produção

Use este roteiro com uma cobrança real de menor valor disponível. Não use cartão
de teste com credenciais `APP_USR`, pois o Mercado Pago pode bloquear a operação.

## Antes da cobrança

1. Confirme que o deploy usa `APP_USR-...` em
   `MERCADOPAGO_ACCESS_TOKEN` e na chave pública.
2. No painel do Mercado Pago, confirme o webhook de pagamentos apontando para
   `https://carreirasmatch.com.br/api/billing/webhook` e copie a mesma assinatura
   secreta para `MERCADOPAGO_WEBHOOK_SECRET`.
3. Confirme `APP_URL=https://carreirasmatch.com.br` e `ADMIN_EMAILS` no ambiente
   de produção.
4. Abra uma análise anônima em janela privada e anote o id em `/report/{id}`.

## Cobrança e evidências

1. Desbloqueie o diagnóstico e pague com um e-mail controlado pela equipe.
2. No navegador, confirme o estado aprovado (cartão) ou o QR Code e posterior
   aprovação (Pix), sem erro de API.
3. No painel do Mercado Pago, confirme pagamento aprovado e entrega do webhook
   com HTTP 200.
4. No banco de produção, consulte o pagamento pelo id do Mercado Pago:

   ```sql
   SELECT id, kind, status, amount, analysisId, paidAt
   FROM Payment
   WHERE mpPaymentId = 'ID_DO_MERCADO_PAGO';
   ```

5. Confirme `status = 'paid'`, `paidAt` preenchido e acesso ao relatório completo
   após login com o mesmo e-mail. Para plano, confirme também:

   ```sql
   SELECT status, currentPeriodEnd, lastPaymentId
   FROM Subscription
   WHERE userId = 'ID_DO_USUARIO';
   ```

6. Confirme a chegada do e-mail transacional e que o evento de pagamento aparece
   no analytics. Registre horário, `mpPaymentId`, tipo, valor e resultado.
7. Faça estorno pelo painel após concluir a homologação, se aplicável, e confira
   o tratamento operacional do reembolso.

O fluxo só está homologado quando navegador, Mercado Pago, webhook, banco,
entitlement e e-mail concordarem. Uma credencial configurada, isoladamente, não
é evidência de pagamento ponta a ponta.

# Homologação de pagamento em produção

**O provedor de pagamento é o Mercado Pago — não Stripe.** Não há nenhuma
referência a Stripe no código (`grep -ri stripe src/` não retorna nada). SDK
usado: `mercadopago` (backend, `src/lib/mercadopago.ts`) e
`@mercadopago/sdk-react` (Bricks no client). Se você está procurando um
roteiro de webhook do Stripe, ele não se aplica a este projeto.

## Como está configurado

- `MERCADOPAGO_ACCESS_TOKEN` — usado no backend para criar pagamento
  (`Payment`) e assinatura (`PreApproval`). Prefixo `APP_USR-...` = produção
  real; `TEST-...` = sandbox. `src/lib/mercadopago.ts` lança erro só quando
  alguém tenta pagar sem a variável configurada (não há checagem no boot).
- `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY` — chave pública, embutida no bundle
  do cliente em **build time** (build arg no `docker-compose.yml`/
  `Dockerfile`), usada para inicializar os Bricks de pagamento
  (`mercadopago-payment-brick.tsx`).
- `MERCADOPAGO_WEBHOOK_SECRET` — valida o header `x-signature` do webhook
  (ver `src/lib/webhook-secret.ts`). Se estiver errado ou for placeholder,
  **todo webhook real é rejeitado com 401** e nenhum pagamento confirma
  automaticamente, mesmo aprovado no painel do Mercado Pago.
- Fluxos cobertos: pagamento avulso (diagnóstico), assinatura mensal
  (`PreApproval`), créditos de triagem para empresa
  (`src/app/api/empresa/billing/comprar/route.ts`) e créditos de destaque
  para parceiro (`src/app/api/partner/billing/comprar/route.ts`).

## Webhook

- Endpoint único: `POST /api/billing/webhook`
  (`src/app/api/billing/webhook/route.ts`).
- Trata dois tipos de evento via querystring `type`/`topic`:
  `payment` e `subscription_preapproval`.
- Antes de processar qualquer coisa, valida `x-signature` com HMAC-SHA256
  sobre o manifest `id:<dataId>;request-id:<requestId>;ts:<ts>;`, comparado
  com `timingSafeEqual`. Assinatura inválida → `401` imediato, sem tocar o
  banco.
- Depois da assinatura validada, **consulta o pagamento/preapproval direto
  na API do Mercado Pago** (`getPayment`/`getPreapproval`) antes de liberar
  qualquer acesso — não confia cegamente no corpo do evento recebido.
- Idempotente por transição de estado: só concede crédito, envia e-mail e
  registra evento de funil quando o `status` muda de fato (ex.:
  `pending → paid`), então reenvio do mesmo evento pelo Mercado Pago não
  duplica benefício nem e-mail.
- Também reconhece pagamento de empresa (`CompanyPayment`) e de parceiro
  (`PartnerPayment`) pelo mesmo `dataId`, quando não encontra `Payment` de
  candidato correspondente.

## Antes de confiar em produção — o que testar de verdade

Uma credencial configurada, isoladamente, **não é evidência** de que o
fluxo ponta a ponta funciona. Use este roteiro com uma cobrança real de
valor baixo. **Não use cartão de teste com credenciais `APP_USR-...`** — o
Mercado Pago pode bloquear a operação por misturar ambiente de teste com
credencial de produção.

### Antes da cobrança

1. Confirme que o deploy em produção usa `APP_USR-...` (não `TEST-...`) em
   `MERCADOPAGO_ACCESS_TOKEN` e na chave pública correspondente.
2. No painel do Mercado Pago, confirme o webhook de pagamentos apontando
   para `https://carreirasmatch.com.br/api/billing/webhook` e copie a
   **mesma** assinatura secreta para `MERCADOPAGO_WEBHOOK_SECRET` no `.env`
   da VPS (não no `.env` local — eles são arquivos diferentes, ver
   [OPERATIONS.md](OPERATIONS.md)). Se a conta Mercado Pago for compartilhada
   com outro site/projeto, cada integração tem assinatura própria — confirme
   que pegou a certa.
3. Confirme `APP_URL=https://carreirasmatch.com.br` e `ADMIN_EMAILS` no
   ambiente de produção.
4. Abra uma análise anônima em janela privada e anote o id em
   `/report/{id}`.

### Cobrança e evidências

1. Desbloqueie o diagnóstico e pague com um e-mail controlado pela equipe.
2. No navegador, confirme o estado aprovado (cartão) ou o QR Code seguido
   de aprovação (Pix), sem erro de API na tela.
3. No painel do Mercado Pago, confirme pagamento aprovado **e** entrega do
   webhook com HTTP 200 (não só o pagamento aprovado — a entrega do webhook
   é o que de fato libera acesso no sistema).
4. No banco de produção, consulte o pagamento pelo id do Mercado Pago:

   ```sql
   SELECT id, kind, status, amount, "analysisId", "paidAt"
   FROM "Payment"
   WHERE "mpPaymentId" = 'ID_DO_MERCADO_PAGO';
   ```

5. Confirme `status = 'paid'`, `paidAt` preenchido, e acesso ao relatório
   completo após login com o mesmo e-mail. Para plano/assinatura, confirme
   também:

   ```sql
   SELECT status, "currentPeriodEnd", "lastPaymentId"
   FROM "Subscription"
   WHERE "userId" = 'ID_DO_USUARIO';
   ```

6. Confirme a chegada do e-mail transacional (Resend) e que o evento de
   pagamento aparece no analytics (Plausible, se configurado) e nos
   dashboards de Pagamentos & Receita no Grafana.
7. Registre horário, `mpPaymentId`, tipo, valor e resultado.
8. Faça estorno pelo painel do Mercado Pago após concluir a homologação, se
   aplicável, e confira o tratamento do reembolso no sistema (status
   `refunded`/`charged_back` no webhook).

### Repita para cada tipo de cobrança que mudar

Se a mudança tocar um fluxo específico, valide **esse** fluxo, não só o
genérico acima:

| Fluxo | O que confirmar além do roteiro geral |
| --- | --- |
| Assinatura mensal (`PreApproval`) | `subscription_preapproval` chega no webhook; `Subscription.currentPeriodEnd` é estendido corretamente; cancelamento no painel reflete `status = cancelled` sem revogar acesso já pago no período corrente |
| Pix avulso | Pagamento nasce `pending`; webhook confirma a transição para `paid` (diferente do cartão, que já nasce `paid` na rota síncrona) |
| Créditos de empresa (`CompanyPayment`) | `grantScreeningCredits` credita só na primeira transição para `approved`; notificação ao admin dispara uma única vez |
| Créditos de parceiro (`PartnerPayment`) | mesmo padrão de idempotência, via `grantPartnerCredits` |
| Cupom de influenciador | `registerCouponUsage` conta uma única vez por pagamento, mesmo com reenvio do webhook |

O fluxo só está homologado quando navegador, painel do Mercado Pago,
webhook, banco de produção, entitlement e e-mail concordam entre si. Uma
credencial configurada corretamente não substitui esse teste de ponta a
ponta.

# Checklist de lançamento

Baseado em auditoria técnica completa do projeto (2026-07-09). Estado geral
do código é bom (0 erros de TypeScript, 0 erros de lint, 60/60 testes
passando, build de produção completo).

## ✅ Corrigido nesta sessão

- [x] `docker-compose.yml` não repassava as variáveis do Mercado Pago
  (`MERCADOPAGO_ACCESS_TOKEN`, `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY`,
  `MERCADOPAGO_WEBHOOK_SECRET`) nem as das fontes de vaga extras
  (Jooble/Gupy/Sólides/Glassdoor) — adicionadas. Vars obsoletas
  `ABACATEPAY_*` removidas.
- [x] Rate limiting adicionado ao login (`src/auth.ts`, Credentials
  `authorize`) — mesmo limite/janela usado no cadastro (10 tentativas /
  15 min, por IP + e-mail), usando o `checkRateLimit` já existente.
- [x] Erro de lint em `src/components/theme-toggle.tsx` corrigido
  (setState em efeito documentado e suprimido pontualmente, já que é
  necessário para evitar mismatch de hidratação — o tema real só pode ser
  lido do DOM após o mount).
- [x] Páginas **Termos de Uso** (`/termos`) e **Política de Privacidade**
  (`/privacidade`) publicadas, cobrindo IA/análises, pagamentos via
  Mercado Pago, dados coletados (LGPD) e direitos do titular. Linkadas no
  formulário de cadastro (`/register`).
- [x] README.md, `docs/ARCHITECTURE.md` e `docs/ENV.md` recriados.

## 🔴 Só o usuário pode resolver — bloqueia aceitar pagamento real

- [ ] **Configurar `MERCADOPAGO_WEBHOOK_SECRET` com o valor real** do
  painel do Mercado Pago (Sua integração → Webhooks → Assinatura
  secreta). Hoje é o placeholder `"..."` em `.env`. Com esse valor
  errado, `src/lib/webhook-secret.ts` rejeita (401) **todo** webhook real
  — nenhum pagamento/assinatura é confirmado automaticamente, mesmo que o
  cliente seja cobrado de verdade (o token é de produção, `APP_USR-...`).
  Isso não é algo que eu possa gerar por código — precisa ser copiado do
  painel da conta Mercado Pago.
- [ ] **Testar o fluxo completo de pagamento em produção** (Payment Brick
  → webhook → ativação de assinatura) antes de divulgar o link
  publicamente, idealmente com uma cobrança real pequena de teste, já que
  o token não é sandbox.
- [ ] Confirmar que `ADMIN_EMAILS` está definido corretamente no ambiente
  de produção (não só local) — não consigo verificar isso de dentro do
  código sem ver o `.env` de produção.

## 🟡 Importante, mas não impede o lançamento de amanhã

- [ ] Ter um plano de backup do `dev.db` (SQLite em arquivo) — não há
  backup automático hoje; um volume Docker perdido = dados perdidos.
- [ ] Revisar o texto dos Termos/Privacidade com um advogado antes de
  operar em maior escala — o conteúdo criado é uma base sólida e honesta,
  mas não substitui revisão jurídica formal.

## 🟢 Pode esperar (pós-lançamento)

- [ ] Validação de env vars no boot (zod) para falhar rápido em vez de
  falhar só no primeiro uso.
- [ ] Testes de integração para o webhook de billing e o pipeline de
  análise Groq (hoje só as libs de suporte têm teste, não as rotas).
- [ ] Plano de migração para Postgres quando o tráfego/concorrência de
  escrita crescer além do que SQLite aguenta confortavelmente.
- [ ] Retry/backoff nas chamadas à Groq e validação de schema da
  resposta (hoje é `JSON.parse` direto, sem schema).
- [ ] Homologação da integração com Glassdoor (hoje incompleta/sem
  confirmação de contrato de API).
- [ ] Limpar warnings de lint restantes (variáveis não usadas em
  `report/page.tsx`, `<img>` sem otimização em
  `mercadopago-payment-brick.tsx`).

## Resumo

Tudo que dependia de código foi corrigido e verificado (build, lint,
testes, type-check — todos limpos). O que falta para lançar com segurança
amanhã depende de duas ações que só você pode fazer fora do código:
copiar o segredo real do webhook do Mercado Pago e testar um pagamento
real de ponta a ponta antes de divulgar o link.

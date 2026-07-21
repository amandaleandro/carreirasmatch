# Checklist de lançamento

Reescrito em 2026-07-21 a partir do estado real do código e da operação —
este não é mais um sistema em fase de MVP inicial: a maioria das features
"óbvias" de uma plataforma de carreira já existe e está em produção. O que
falta é uma lista curta e específica, não um roadmap genérico.

## Já pronto e em produção

- **Autenticação** — candidato (credenciais + Google opcional), empresa,
  parceiro, cada um com provider próprio; admin e influenciador derivados da
  sessão de candidato. Ver [AUTHORIZATION.md](AUTHORIZATION.md).
- **Análise de currículo com IA** — multi-provedor com fallback (Groq,
  OpenAI e outros opcionais), retry/timeout configuráveis, validação Zod das
  respostas.
- **Pagamento (Mercado Pago)** — avulso, assinatura, créditos de triagem
  (empresa) e de destaque (parceiro); webhook validado por assinatura HMAC,
  idempotente. Fluxo real validado em produção com cobrança real (16/07/2026).
- **Banco de dados** — migrado de SQLite para PostgreSQL 17, com backup
  periódico automatizado (`postgres-backup`).
- **Kanban de candidaturas**, **banco de talentos/busca ativa** (com opt-in
  e fluxo de aceite antes de expor contato), **cupons e painel de
  influenciador** (comissão, relatório).
- **Marketplace de freelancer** — nicho de dois lados novo (qualquer `User`
  contrata e/ou é contratado), grátis por enquanto (sem escrow/pagamento
  embutido). 7 tabelas próprias, rotas `/freelancers`, `/projetos`,
  `/freelancer` (hub autenticado).
- **Radares de concurso e vestibular** (`/concursos`, `/vestibulares`) via
  RSS, sincronizados 3x/dia.
- **Blog/SEO automático** — geração diária de posts, sitemap e robots
  gerados, `<html lang="pt-BR">`.
- **8 réguas de e-mail de ciclo de vida** (renovação, expiração, onboarding,
  lead followup, upgrade de diagnóstico, conversão para assinatura,
  recuperação de checkout, alerta de vaga), todas com `sendOnce`/`EmailLog`
  para não duplicar envio.
- **PWA e push notifications** — implementados e no ar desde 2026-07-20:
  manifest (`src/app/manifest.ts`), ícones, service worker (`public/sw.js`),
  modelo `PushSubscription`, push disparado junto com o alerta de vaga por
  e-mail. **Não é mais um gap** — ver pendência específica de ambiente
  abaixo.
- **Observabilidade** — Prometheus + Grafana com 9 dashboards provisionados
  (incluindo Deploys & Incidentes e Farol das Jornadas), métricas de
  negócio e de IA, Sentry para erro, Plausible para produto.
- **Termos de Uso e Política de Privacidade** publicados e linkados no
  cadastro, cobrindo IA, pagamento e LGPD.
- Qualidade de código: lint e build de produção limpos; 23 arquivos de teste
  unitário (Vitest) cobrindo as regras de negócio mais sensíveis (ver
  [TESTING.md](TESTING.md) para o que **não** está coberto).

## Pendências reais antes de escalar divulgação

- [ ] **`VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` / `VAPID_SUBJECT` no `.env`
  da VPS.** O código de push já está pronto, mas as chaves geradas ficaram
  só no `.env` local (que nunca sobe para produção — ver
  [OPERATIONS.md](OPERATIONS.md)). Sem elas, push fica silenciosamente
  desativado; nada quebra, mas nenhuma notificação sai.
- [ ] **Loki não ingere logs.** Investigação de incidente por log histórico
  não funciona hoje (ver [TROUBLESHOOTING.md](TROUBLESHOOTING.md)). Não é
  bloqueante para lançar, mas reduz a capacidade de diagnosticar incidente
  depois do fato.
- [ ] **Confirmar `ADMIN_EMAILS` no ambiente de produção** (não só local) —
  sem valor correto, notificações internas de novo cadastro/venda e acesso
  a `/admin` ficam quebrados silenciosamente.
- [ ] **Revisão jurídica formal** dos Termos/Privacidade antes de operar em
  maior escala — o texto atual é uma base honesta, mas não substitui
  advogado.
- [ ] **Testes de integração para o webhook de billing e o pipeline de
  análise.** Hoje só as libs de suporte (`src/lib/**`) têm teste unitário; a
  rota de webhook e `/api/analyze` em si não têm cobertura automatizada —
  dependem inteiramente da matriz manual (ver [TESTING.md](TESTING.md)).
- [ ] **Furo de migration conhecido**: algumas tabelas de produção
  (marketplace de freelancer em certo ponto, `Partner*`, `GameScore`) foram
  criadas via `prisma db push` e não têm arquivo de migration
  correspondente. Um banco novo provisionado do zero hoje ficaria sem elas.
  Gerar a migration retroativa exige shadow DB (não disponível direto no
  container de produção).

## Pode esperar (pós-lançamento, sem urgência)

- [ ] Validação de env vars no boot (zod ou similar) para falhar rápido em
  vez de falhar só no primeiro uso de cada variável.
- [ ] Correção definitiva do build flaky de fontes: migrar
  `next/font/google` para `next/font/local`.
- [ ] Adicionar `docker image prune -f && docker builder prune -f` ao fim
  do script de deploy (hoje mitigado por cron semanal, não pelo próprio
  deploy).
- [ ] Homologação da integração com Glassdoor (hoje incompleta/sem
  confirmação de contrato de API).
- [ ] Escrow/pagamento no marketplace de freelancer, caso vire produto
  monetizado (hoje é grátis por decisão de produto, não por limitação
  técnica).
- [ ] Fila de processamento (Redis + worker) para tirar os agendadores do
  processo web antes de escalar horizontalmente — ver
  [SCALING_PLAN.md](SCALING_PLAN.md).

## Resumo

O código está maduro e a maior parte do trabalho de produto está feita e em
produção real, incluindo pagamento validado com cobrança de verdade. O que
resta é essencialmente **configuração de ambiente em produção** (chaves
VAPID, `ADMIN_EMAILS`), um problema de observabilidade conhecido (Loki) e
lacunas específicas de cobertura de teste — não features faltando.

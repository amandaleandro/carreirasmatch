# Parcerias e B2B — o que existe de fato

Quatro frentes com rotas e fluxos reais no código: empresas, parceiros de
curso, influencer e marketplace freelancer. Todas gratuitas hoje (nenhuma
delas tem uma tela de preço/plano pago no fluxo de cadastro).

## Empresas — recrutamento (`/empresas`, `/empresa/*`)

- **Landing pública:** `/empresas` (`src/app/empresas/page.tsx`) — "Encontre
  os candidatos certos, ranqueados por IA". Lista 6 recursos (triagem
  automática por IA, ranking por aderência, Kanban de candidaturas, banco de
  talentos, perfil público da empresa, equipe multiusuário) e 3 passos
  ("Publique a vaga" → "IA ranqueia os candidatos" → "Fale com os
  melhores"). CTA: "Cadastrar empresa grátis", com nota "Comece grátis, sem
  cartão de crédito."
- **Cadastro/login:** `src/app/empresa/cadastro`, `src/app/empresa/login`.
- **Painel autenticado:** `src/app/empresa/(painel)/` com sub-rotas
  `billing`, `contatos`, `equipe`, `perfil`, `relatorios`, `talentos`,
  `triagem`, `vagas` — ou seja, o painel cobre publicação de vaga, triagem
  por IA, gestão de equipe (dono/membro), banco de talentos com pedidos de
  contato, relatórios e billing.
- **Perfil público por empresa:** `/empresas/[slug]` — página com marca da
  empresa e vagas abertas, compartilhável.
- **E-mails relacionados** (`src/lib/resend.ts`): `sendCompanyMemberInviteEmail`
  (convite de equipe com senha temporária), `sendCompanyNewApplicationEmail`
  (nova candidatura recebida), `sendCompanyContactAcceptedEmail` (candidato
  liberou contato do banco de talentos), `sendInterviewScheduledEmail`
  (aviso ao candidato quando a empresa agenda entrevista).

## Parceiros de curso (`/parceiro`, não confundir com `/parceiros`)

- **Landing pública:** `/parceiro` (`src/app/parceiro/page.tsx`) — "Divulgue
  seus cursos para quem está buscando a próxima vaga". Recursos: cursos em
  destaque, leads qualificados, painel de cliques e interesse, faturamento
  no painel. Passos: "Cadastre-se grátis" → "Publique seus cursos" →
  "Receba leads". CTA: "Cadastrar como parceiro", nota "Cadastro grátis,
  sem cartão de crédito", checkout de cursos pagos via Mercado Pago.
- **Cadastro/login/dashboard:** `src/app/parceiro/cadastro`,
  `src/app/parceiro/login`, `src/app/parceiro/dashboard`.
- **Perfil público do parceiro:** `/parceiros/[id]` (plural) — página com
  nome, descrição e cursos ativos do parceiro (`prisma.partner.findUnique`
  com `courses`).

### Atenção: `/parceiros` (plural, sem id) é outra coisa

`src/app/parceiros/page.tsx` **não é** uma listagem de parceiros — é um
formulário público de submissão de oportunidades: "Publique vagas, cursos e
parcerias" / "Empresas, prefeituras, escolas e instituições podem enviar
vagas, cursos ou propostas. Toda publicação passa por revisão antes de
aparecer no sistema." (`PartnerSubmissionForm`). É um canal de captação de
conteúdo, não o diretório de parceiros — o diretório real está nas páginas
individuais `/parceiros/[id]`.

## Influencer (`/influencer`)

- Não tem landing pública própria (rota única, autenticada via
  `requireInfluencerPage`, `src/lib/influencer.ts`) — é o painel de quem já
  tem um cupom atribuído.
- Mostra: link de indicação próprio (`InfluencerReferralLink`), vendas
  confirmadas com o cupom, cadastros feitos com o cupom (pagos ou não),
  receita gerada, e comissão calculada por `commissionCents(grossRevenueCents,
  coupon.commissionPercent)` (`src/lib/coupon-report.ts`).
- Texto confirmado no painel: "Você tem acesso total ao sistema, sem
  pagamento." — ou seja, o influencer testa o produto de graça.

## Marketplace freelancer (`/freelancer`, `/freelancers`, `/projetos`)

- **Hub autenticado do freelancer:** `/freelancer` (`src/app/freelancer/page.tsx`)
  — "Ofereça seus serviços ou contrate profissionais para os seus
  projetos." Qualquer usuário autenticado acessa as quatro seções: "Meu
  perfil" (`/freelancer/perfil`, publicado ou rascunho), "Minhas propostas"
  (`/freelancer/propostas`), "Buscar projetos" (`/projetos`), "Projetos que
  publiquei" (`/freelancer/meus-projetos`).
- **Vitrine pública de freelancers:** `/freelancers` (com filtro por
  categoria via `FREELANCE_CATEGORIES`, `src/lib/freelance.ts`) e perfil
  individual em `/freelancers/[id]`.
- Marketplace de dois lados: o mesmo usuário pode publicar um projeto (como
  cliente) e enviar proposta a outro projeto (como freelancer) — não há
  separação de tipo de conta.
- Sem cobrança de comissão/escrow no código: pagamento entre cliente e
  freelancer acontece fora da plataforma.

## O que não existe

Não há um portal ou API de parceria formalizada com escolas/faculdades além
do formulário de submissão pública (`/parceiros`) e do programa de cursos
(`/parceiro`) — não há contrato, relatório white-label ou pacote
institucional dedicado no código. Não há tela de precificação paga para
nenhum dos quatro perfis (empresa, parceiro de curso, influencer,
freelancer): todos operam em modo gratuito hoje.

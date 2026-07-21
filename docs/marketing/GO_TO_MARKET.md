# Go-to-market

Canais descritos aqui são os que já têm superfície construída no produto —
não é um plano aspiracional. Cada canal aponta para as rotas/arquivos que o
sustentam.

## 1. SEO orgânico multi-segmento

O produto já tem um leque amplo de landings por momento de carreira e por
necessidade específica: `/estagio`, `/jovem-aprendiz`, `/primeiro-emprego`,
`/transicao`, `/recolocacao`, `/oab`, `/concurso`, `/concursos`,
`/vestibulares`, `/curriculo-sem-experiencia`, `/curriculo-gratis`,
`/faculdade-ou-tecnico`, `/como-fazer-curriculo`, `/cursos-gratuitos`,
`/mercado-de-trabalho` (dados dinâmicos por cidade/cargo, alimentados por
`prisma.publicOpportunity`). `/comece` funciona como hub guarda-chuva de
entrada. Ver `CONTENT_ENGINE.md` para como blog e radares de
concurso/vestibular alimentam esse canal de forma automatizada (scheduler,
não produção editorial manual).

`src/lib/seo.ts` centraliza metadata, Organization/WebSite JSON-LD,
breadcrumbs, FAQ e BlogPosting — a base técnica de SEO estruturado já está
pronta para qualquer página que a use.

## 2. Desafio do Match como motor de indicação (loop viral)

`/desafio` (`src/app/desafio/page.tsx` + `DesafioForm.tsx`) é hoje o único
mecanismo de crescimento viral construído no produto:

1. o visitante sobe currículo + vaga (se não estiver logado, o próprio
   `DesafioForm` cria a conta no fluxo, com senha temporária gerada);
2. recebe o resultado com "Card para Story" para compartilhar;
3. quem entra pelo link de indicação (`?ref=<userId>`) é registrado via
   `registerUserReferral` (`src/lib/referrals.ts`);
4. a cada 3 indicações confirmadas, o usuário ganha 1 diagnóstico completo
   grátis (`REFERRALS_NEEDED_FOR_REWARD = 3`, creditado em
   `unlockedFullDiagnosticCredits`).

É o canal com menor custo de aquisição possível hoje porque não depende de
mídia paga: o próprio resultado (Match %) é o gancho de compartilhamento.

## 3. Marketplace freelancer como canal lateral de aquisição

`/freelancer`, `/freelancers`, `/projetos` implementam um marketplace de
dois lados — qualquer usuário pode publicar um projeto ou se candidatar como
freelancer. É um nicho novo dentro do produto — hoje gratuito, sem cobrança
de comissão/escrow no código (o pagamento entre as partes acontece fora da
plataforma). Funciona como porta de entrada alternativa para quem busca
renda via projeto, não só vaga CLT, e amplia a base cadastrada, que depois
pode ser trabalhada no funil de análise/assinatura.

## 4. Parcerias B2B como canal de receita e distribuição

Três programas B2B com cadastro e painel dedicados:

- **Empresas** (`/empresas` → `/empresa/cadastro`): recrutamento com
  triagem/ranking por IA, Kanban de candidaturas, banco de talentos, perfil
  público da empresa (`/empresas/[slug]`) — a própria página pública da
  empresa funciona como canal de distribuição adicional (vagas
  compartilháveis, SEO).
- **Parceiros de curso** (`/parceiro` → `/parceiro/cadastro`): escolas e
  criadores de curso divulgam ofertas para a base de usuários buscando
  qualificação, com painel de leads/cliques/faturamento e checkout via
  Mercado Pago para cursos pagos.
- **Influencer** (`/influencer`): painel de cupom de indicação com comissão
  percentual sobre a receita gerada (`src/lib/coupon-report.ts`,
  `commissionCents`), acesso total ao produto sem pagamento para quem tem o
  cupom.

O commit `fee7922` ("cross-link empresas, parceiro e freelancers no
marketing e headers") adicionou navegação cruzada entre essas landings e uma
seção na home apontando para elas — antes desse commit, marketplace
freelancer e parceiro não tinham ponto de descoberta a partir do fluxo
principal do candidato.

## O que não existe como canal hoje

Não há mídia paga configurada além do AdSense de conteúdo (ver
`PAID_MEDIA.md`), não há programa de afiliados fora do influencer/cupom
descrito acima, e não há integração de postagem automática em redes sociais
no código.

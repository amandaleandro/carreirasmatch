# Jornadas principais

Fluxos ponta a ponta do CarreirasMatch, do ponto de vista do usuário. Para o
que cada tela faz isoladamente, ver [FEATURES.md](FEATURES.md); para regras
de free vs. pago, ver [PRODUCT_OVERVIEW.md](PRODUCT_OVERVIEW.md).

## 1. Cadastro → onboarding → primeira análise de vaga

1. O visitante entra por uma landing (`/`, `/comece` ou uma landing de
   nicho), uma vaga, um post do blog ou uma ferramenta gratuita.
2. Cria conta em `/register` (e-mail/senha ou Google OAuth, se configurado)
   informando segmento de carreira e área profissional — ou pode começar uma
   análise diretamente em `/analise` sem sessão (limitado por rate limit de
   IP), sendo levado a `/register?email=…` mais tarde caso queira desbloquear
   ou salvar o resultado.
3. Após o primeiro login, `/dashboard` dispara automaticamente o **tour
   guiado** (`src/components/guided-tour.tsx`) depois de ~700ms, se o
   usuário nunca o viu (`localStorage` — chave `guided-tour:v2:done`). O
   roteiro é adaptado ao `careerSegment`: por exemplo, o segmento `student`
   prioriza Ferramentas e Radar de Vestibulares antes de Análise; já
   `apprentice`, `first_job` e `internship` seguem o roteiro padrão
   (Desafio → Análise → Feed → Todas as Vagas → Candidaturas → Currículo →
   Ferramentas → Mentorias → Freelancer → Jogos → Busca → Visão geral).
   O tour não bloqueia a tela — os elementos ficam clicáveis por baixo do
   destaque — e pode ser reaberto a qualquer momento pelo botão de ajuda.
4. Cerca de 1,2s depois de qualquer acesso à área logada (se ainda não visto,
   `localStorage` chave `upcoming-features-modal:v6:seen`), abre a **modal de
   novidades** (`src/components/upcoming-features-modal.tsx`), listando o
   que já está no ar (Desafio do Match, Freelancer, Jogos, Radar de
   Concursos/Vestibulares, Mentorias, Todas as Vagas) e o que está em
   construção (ver seção 6, roadmap).
5. O usuário faz sua primeira análise: envia PDF de currículo + descrição da
   vaga em `/analise`. `POST /api/analyze` extrai o texto do PDF, chama a IA
   e persiste `Resume` + `Analysis`.
6. O score simples aparece sempre. Como é a **primeira análise** do usuário,
   o diagnóstico completo é liberado automaticamente e de graça — sem
   pedir pagamento. O relatório completo fica em `/report/[id]`.
7. Da segunda análise em diante, o acesso ao diagnóstico completo passa a
   depender de assinatura ativa (dentro do limite mensal do segmento),
   pagamento avulso `diagnostic`, crédito de indicação (Desafio do Match) ou
   acesso administrativo/influenciador.

## 2. Desafio do Match (indicação/referral)

1. O usuário abre `/desafio` — que funciona tanto logado quanto anônimo — e
   pode gerar sua análise de Match ali mesmo (mesmo motor de `/analise`,
   apresentado como "Match %" com um card para compartilhar em stories).
2. A tela mostra um link de indicação pessoal, baseado no próprio `userId`
   (`?ref=<userId>`), para compartilhar com amigos.
3. Quando outra pessoa abre `/desafio?ref=<userId>` **já logada**, a página
   chama `registerUserReferral(newUserId, referrerUserId)`
   (`src/lib/referrals.ts`): associa o novo usuário como indicado
   (`referredById`) — só na primeira vez; indicações repetidas ou
   autoindicação (`ref === próprio id`) são ignoradas silenciosamente.
4. `registerUserReferral` conta o total de indicações do indicador
   (`User.count({ referredById })`). A cada múltiplo de 3 indicações (3, 6,
   9…), o indicador ganha **+1 crédito de diagnóstico completo**
   (`unlockedFullDiagnosticCredits`, incrementado via
   `prisma.user.update`).
5. `getUserReferralStats(userId)` calcula, para exibir na tela: total de
   indicados, quantas faltam para o próximo prêmio (`neededForNext =
   REFERRALS_NEEDED_FOR_REWARD - (total % 3)`) e quantos créditos
   disponíveis.
6. Um crédito disponível é consumido (`consumeReferralCredit`) na hora de
   liberar o diagnóstico completo de uma análise que, de outra forma, não
   estaria liberada — é uma das fontes checadas por `canViewFullDiagnostic`
   em `src/lib/entitlements.ts`.

Observação: o registro da indicação acontece no acesso a `/desafio?ref=…`,
não no momento do cadastro em `/register` — ou seja, um indicado que nunca
visita `/desafio` com o link do amigo não conta como indicação.

## 3. Assinatura / pagamento

### Pagamento avulso

1. O usuário escolhe desbloquear um diagnóstico específico ou a primeira
   análise (`first_analysis`).
2. `POST /api/billing/payment` cria o pagamento no Mercado Pago (Payment
   Brick, cartão ou Pix) e um `Payment` local `pending`.
3. A confirmação chega na resposta do checkout (cartão, síncrono) ou pelo
   webhook (Pix, assíncrono).
4. `POST /api/billing/webhook` valida a assinatura HMAC (`x-signature`),
   consulta o pagamento e atualiza o registro de forma idempotente.
5. Funciona sem login: o visitante paga informando e-mail; a conta é
   criada/recuperada por esse e-mail e ele é levado a `/register?email=…`
   para definir senha. Uma análise anônima só pode ser desbloqueada se
   ainda não tiver dono (`resume.userId == null`) — nesse caso é
   reivindicada para a conta ao confirmar o pagamento.

### Assinatura recorrente

1. O usuário escolhe um plano em `/assinar` (preço varia por segmento).
2. `POST /api/billing/subscription` cria o fluxo recorrente
   (Preapproval/Subscription Brick).
3. Pagamentos confirmados atualizam `Payment` e criam/estendem a
   `Subscription` (1:1 com o usuário) via `grantSubscriptionPeriod`
   (`src/lib/billing-plans.ts`) — se a assinatura ainda está ativa, estende
   a partir do fim do período atual, sem perder dias já pagos.
4. `hasActiveSubscriptionAccess()` considera status e `currentPeriodEnd`
   vigente para liberar o restante do produto pago.
5. Cancelamento ou expiração remove o acesso recorrente sem apagar o
   histórico de análises.

## 4. Tour guiado e modal de novidades

- **Tour guiado** (`guided-tour.tsx`): dispara automaticamente na primeira
  visita a `/dashboard`; pode ser reiniciado manualmente pelo botão de ajuda
  registrado no contexto de UI (`useUiPanels`). Navega entre rotas conforme
  o passo exige um alvo em outra página (ex.: passo "Análise" força ida a
  `/dashboard`), aguarda o elemento aparecer no DOM (`data-tour="..."`) e
  destaca com um anel azul, sem bloquear a interação com a página por trás.
  Suporta teclado (setas para navegar, Esc para fechar) e progresso salvo
  por passo. A versão do roteiro (`v2`) é incrementada sempre que o conteúdo
  muda de verdade, forçando quem já viu a rever o que há de novo.
- **Modal de novidades** (`upcoming-features-modal.tsx`): abre ~1,2s após o
  primeiro acesso não visto (chave de versão `v5`), dividida em "Já
  disponível" (com link direto para cada feature) e "Em construção" (roadmap
  resumido, com status "Próximo" ou "Depois"). Fecha com Esc, clique fora ou
  botão de fechar; a preferência de "já vi" fica em `localStorage`.

## 5. Busca e candidaturas

1. Fontes internas (feed próprio) e externas (scraping/APIs de vaga)
   alimentam `Job`; fontes públicas oficiais alimentam `PublicOpportunity`.
2. O candidato consulta `/feed` (curado por fit score), `/todas-as-vagas`
   (sem curadoria) ou `/vagas-publicas` (oficiais, por cargo/estado/cidade).
3. Pode salvar a oportunidade e criar/atualizar uma candidatura em
   `/applications`.
4. `Application` registra o estado atual do funil;
   `ApplicationActivity` guarda cada transição de status.
5. A partir de uma candidatura ou análise, o usuário acessa preparação de
   entrevista (`/interviews/[applicationId]`) e plano de ação
   (`/action-plan`), reaproveitando os dados já gerados.

## 6. Empresa: triagem e banco de talentos

1. A empresa cria conta em `/empresa/cadastro` e entra por
   `/empresa/login`; a sessão recebe `accountType: "company"` e
   `companyId`.
2. A empresa cria uma triagem em `/empresa/(painel)/triagem/nova` e envia
   currículos em lote.
3. O backend verifica franquia/créditos, extrai os currículos e classifica
   os candidatos; o resultado fica em `/empresa/(painel)/triagem/[id]`.
4. Depois do limite gratuito, a empresa compra créditos em
   `/empresa/(painel)/billing`.
5. Para o banco de talentos: o candidato ativa `discoverable` e define
   interesses; a empresa pesquisa apenas perfis elegíveis em
   `/empresa/(painel)/talentos`; um `TalentContactRequest` é criado como
   `pending`; o candidato aceita ou recusa; dados de contato só devem ser
   exibidos depois de `accepted`.

## 7. Portal de parceiros

1. O parceiro cria conta em `/parceiro/cadastro` e entra por
   `/parceiro/login` (`accountType: "partner"`).
2. Cadastra cursos gratuitos no painel (`/parceiro/dashboard/cursos`), que
   aparecem no catálogo público `/cursos-gratuitos` e na vitrine
   `/parceiros/[id]`.
3. Pode comprar créditos de destaque (`/parceiro/dashboard/anunciar` →
   `POST /api/partner/billing/comprar`) para marcar um curso como
   `featured`; créditos são concedidos após confirmação do pagamento.
4. Acompanha cliques (`PartnerCourseClick`) e leads de interesse
   (`PartnerLead`, capturados quando um candidato demonstra interesse num
   curso) no painel de leads.

## 8. Marketplace freelancer

1. Um usuário publica um perfil (`/freelancer/perfil`) e/ou um projeto
   (`/projetos/novo`).
2. Freelancers interessados enviam proposta a um projeto
   (`/freelancer/propostas`); o contratante aceita uma delas.
3. Ao aceitar, um `FreelanceContract` é criado, habilitando mensagens
   (`FreelanceThread`/`FreelanceMessage`) e acompanhamento do progresso.
4. Ao concluir, cada parte avalia a outra (`FreelanceReview`), o que
   atualiza a reputação exibida no perfil público (`/freelancers/[id]`).
5. Pagamento pelo serviço é combinado fora da plataforma — não há
   escrow/checkout integrado nesse fluxo hoje.

## 9. Suporte

1. O usuário abre um ticket em `/suporte`.
2. Mensagens ficam associadas a `SupportTicket`.
3. A equipe trata o chamado em `/admin/suporte`.
4. Estado e histórico do chamado permanecem persistidos, visíveis em
   `/suporte/[id]` para o usuário.

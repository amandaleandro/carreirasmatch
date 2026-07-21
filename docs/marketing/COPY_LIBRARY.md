# Biblioteca de copy

Trechos reais extraídos do código-fonte das páginas e dos templates de
e-mail. Não são sugestões — são o texto que já está em produção. Onde o texto
depende de uma variável (nome, valor, data), isso é indicado.

## Home (`src/components/marketing-home.tsx`)

- Eyebrow: "Candidaturas mais estratégicas"
- H1: "Pare de se candidatar no escuro."
- Subtítulo: "Compare seu currículo com uma vaga real, descubra o que está
  ajudando ou atrapalhando e receba um plano claro antes de aplicar."
- CTA primário: "Analisar currículo e vaga" → `/analise`
- CTA secundário: "Ver vagas de hoje" → `/vagas-de-hoje`
- Selos de apoio: "Resultado inicial gratuito" · "Sem promessa de
  contratação"
- Seção "como funciona": eyebrow "Da vaga ao próximo passo", H2 "Clareza em
  três etapas.", texto de apoio: "Você não precisa mudar toda a sua história.
  Precisa mostrar as evidências mais relevantes para a oportunidade certa."
- Nav do header: Para você · Vagas · Ferramentas grátis · Freelancers ·
  Empresas · Parceiros (cross-links adicionados no commit `fee7922`).
- `<title>` da home (via `title.absolute`, `src/app/page.tsx`): "Compare seu
  currículo com a vaga | CarreirasMatch".

## `/comece` (`src/app/comece/page.tsx`)

- `<title>`: "Análise de currículo com IA para o seu momento"
- Descrição: "Estágio, primeiro emprego, transição de carreira, recolocação,
  jovem aprendiz ou estágio na faculdade: compare seu currículo com a vaga e
  veja exatamente o que ajustar antes de aplicar."

## `/gratuito` (`src/app/gratuito/page.tsx`)

- Eyebrow: "Central gratuita"
- Título: "Recursos práticos para conseguir emprego."
- Descrição: "Currículo, análise de vaga e teste vocacional básico abrem sem
  cadastro. As outras ferramentas pedem apenas uma conta gratuita, sem
  cartão."
- Bloco final (CTA de conta): "Salve seu progresso gratuitamente" / "Tenha
  checklist, teste comportamental e experiências gratuitas de IA na sua
  conta." → botão "Criar conta grátis" (`/register`)
- Labels de card: "Sem cadastro" e "Cadastro grátis"; botão de card "Abrir
  recurso"

## `/assinar` (`src/app/assinar/page.tsx`)

- `<title>`: "Planos para o seu momento profissional"
- Descrição: "Escolha um plano de carreira com análises, preparação para
  entrevistas e acompanhamento adequado ao seu momento."
- O plano exibido depende do parâmetro `?segment=`, com `career_pro` como
  padrão (`isCareerSegment`, `src/lib/career-segments.ts`).

## `/desafio` — Desafio do Match (`src/app/desafio/page.tsx` + `DesafioForm.tsx`)

- Badge: "Desafio do Match de Carreira"
- H1: "Descubra seu **Match %** real com a vaga dos seus sonhos"
- Subtítulo: "Envie seu currículo e a vaga desejada. Nossa IA analisa
  instantaneamente seu perfil, aponta pontos fortes, lacunas e gera seu
  **Card para Story** para você convidar amigos!"
- Cards de destaque: Match de Aderência ("Calculado em % real") · Pontos
  Fortes ("O que destaca você") · Palavras-chave ("Termos que faltam no CV")
  · Perguntas da Entrevista ("Orientações completas")
- Título do formulário: "Envie seu Currículo e a Vaga Desejada" / "Preencha
  os campos para criar seu acesso e gerar seu Match %"
- CTA do formulário: "Gerar Meu Match e Card para Story"
- Explicação do mecanismo de indicação (texto real, 3 passos):
  1. "Faça seu Match" — "Envie o currículo e receba a pontuação de
     alinhamento com a vaga desejada."
  2. "Compartilhe o Card" — "Poste seu resultado nos Stories com o card
     exclusivo e convide seus amigos."
  3. "Indique 3 Amigos" — "A cada 3 amigos que entrarem pelo seu link, você
     ganha 1 Diagnóstico Completo grátis!"
- A regra "3 indicações = 1 diagnóstico completo grátis" é real, não só
  copy: `REFERRALS_NEEDED_FOR_REWARD = 3` em `src/lib/referrals.ts`.

## E-mails (`src/lib/resend.ts`) — assunto e corpo reais

Todos os e-mails usam o mesmo layout (`layout()`), remetente configurável via
`RESEND_FROM_EMAIL`, e passam por `sendOnce()`/`EmailLog` quando fazem parte
do ciclo de vida, para nunca duplicar envio.

| Função | Assunto | Trecho do corpo |
| --- | --- | --- |
| `sendWelcomeEmail` | "Bem-vindo(a) ao CarreirasMatch 🎉" | "Sua conta no CarreirasMatch está pronta. A partir de agora você pode analisar seu currículo contra qualquer vaga..." → CTA "Analisar meu currículo" |
| `sendLeadFollowUpEmail` | "Seu diagnóstico de carreira está esperando" | "Você começou uma análise no CarreirasMatch e ficou faltando pouco para ver o resultado completo..." → CTA "Ver minha análise completa" |
| `sendOnboardingNudgeEmail` | "Vamos fazer sua primeira análise?" | "Você criou sua conta no CarreirasMatch mas ainda não fez sua primeira análise..." → CTA "Analisar meu currículo" |
| `sendConvertToSubscriptionEmail` | "Você já sabe seu score. Falta o plano de ação." | "Você analisou seu currículo no CarreirasMatch e viu onde está sua aderência. Esse é o diagnóstico, a parte que dói. A parte que resolve é o que vem depois." → CTA "Ver o que muda com o plano" |
| `sendDiagnosticUpgradeEmail` | "Leve seu diagnóstico para as próximas vagas" | "Agora que você já viu o que ajustar nesta oportunidade, o próximo passo é repetir o processo nas próximas vagas..." → CTA "Conhecer o plano mensal" |
| `sendCheckoutRecoveryEmail` | "Quer continuar sua assinatura?" | "Você começou o pagamento, mas a assinatura ainda não foi confirmada..." → CTA "Retomar assinatura" |
| `sendPaymentConfirmationEmail` | "Pagamento confirmado ✅" | "Recebemos seu pagamento de {valor} e liberamos {diagnóstico/análise}." |
| `sendSubscriptionConfirmationEmail` | "Assinatura ativada 🚀" | "Tudo certo! Sua assinatura do CarreirasMatch está ativa e você já tem acesso completo às análises, feed de vagas, preparação de entrevista..." |
| `sendPaymentFailedEmail` | "Não conseguimos processar seu pagamento" | "Isso costuma acontecer por limite, dados divergentes ou uma trava de segurança do banco." |
| `sendSubscriptionCancelledEmail` | "Sua assinatura foi cancelada" | "Você continua com acesso até o fim do período já pago... Se puder, responda contando o que faltou pra gente." |
| `sendRenewalReminderEmail` | "Sua assinatura renova em breve" / "Seu acesso expira em breve" | Varia conforme `autoRenews` |
| `sendSubscriptionExpiredEmail` | "Seu acesso expirou" | "Seu período de assinatura chegou ao fim e sua conta voltou ao plano gratuito." |
| `sendJobAlertEmail` | "Novas vagas em {local}" | Lista de até 10 vagas com título, fonte e link, CTA "Ver todas as vagas" |
| `sendTalentContactRequestEmail` | "{empresa} quer falar com você" | Notifica candidato de pedido de contato do banco de talentos (B2B) |

A régua "cadastrou, analisou, não assinou" (`sendLeadFollowUpEmail` →
`sendOnboardingNudgeEmail` → `sendConvertToSubscriptionEmail` →
`sendDiagnosticUpgradeEmail`/`sendCheckoutRecoveryEmail`) é o fluxo de
conversão pós-cadastro real do produto, todo com dedupe via `EmailLog`.

## O que não existe

Não há copy de anúncio pago (Google Search Ads, Meta/Reels/TikTok) no
código nem em qualquer configuração de campanha versionada — ver
`PAID_MEDIA.md`. Não há template de WhatsApp no código (nenhuma integração
de WhatsApp Business encontrada em `src/lib`).

# Roadmap: o que ainda não existe

Este documento lista o que está **planejado mas ainda não construído**. Para
o que já existe, ver [FEATURES.md](FEATURES.md). A fonte oficial e visível
ao usuário do que está "em construção" é a lista `UPCOMING` em
`src/components/upcoming-features-modal.tsx` — os itens abaixo foram
conferidos no código antes de entrar aqui como roadmap real.

## Confirmado como inexistente hoje (fonte: modal de novidades)

### 1. Alertas de concursos e vestibulares por e-mail

**Status no produto**: "Próximo".

O que existe hoje: os radares `/concursos` e `/vestibulares` agregam
conteúdo via RSS e atualizam ao longo do dia, mas são só de consulta — não
há inscrição por tema nem envio de e-mail quando um edital novo aparece.

O que já existe de parecido (e que essa feature reaproveitaria): o modelo
`JobAlert` (`prisma/schema.prisma`) já suporta alerta por e-mail
diário/semanal, mas hoje é usado só para vagas públicas por cargo/cidade/
estado (`src/app/api/job-alerts`, `src/lib/email-scheduler.ts`,
`src/lib/resend.ts`) — não existe um `JobAlert` (ou modelo equivalente) para
concurso/vestibular por tema/banca/estado.

**Para implementar**: modelo de alerta por tema (ex.: área do concurso,
estado, nível), job agendado que casa itens novos do radar com as
inscrições ativas, e template de e-mail via Resend (`src/lib/resend.ts`,
que já tem `sendOnce`/`EmailLog` para dedupe).

### 2. Lembretes de prazo e entrevista por e-mail

**Status no produto**: "Próximo".

O que existe hoje: `Application` já guarda `deadline` e `interviewAt`
(campos usados no kanban de `/applications`), mas nada lê esses campos para
disparar e-mail — não há job, nem template, nem entrada em
`src/lib/email-scheduler.ts` para isso.

**Para implementar**: job agendado que varre candidaturas com `deadline`/
`interviewAt` próximos, e-mail via Resend com o padrão de dedupe já usado
(`EmailLog`), e provavelmente uma preferência de opt-in em `/settings`.

### 3. Reanálise rápida de currículo

**Status no produto**: "Depois".

O que existe hoje: depois de editar o currículo em `/resume/[id]`
(`resume-optimizer.tsx`, que salva `Analysis.resumeOverride`), não há um
atalho para comparar de novo o currículo editado contra a mesma vaga — o
usuário precisaria refazer o fluxo de análise do zero em `/analise`.

**Para implementar**: endpoint que reaproveita `Analysis.resumeOverride` +
a vaga original de uma análise existente e dispara uma nova chamada de IA
sem pedir o PDF/vaga de novo; UI de botão "reanalisar" em
`/resume/[id]` ou no relatório (`/report/[id]`).

## Como este roadmap se relaciona com o produto atual

O produto já tem um núcleo forte: análise de currículo x vaga, pagamento
avulso e assinatura, histórico, otimizador de currículo, entrevistas, plano
de ação, kanban, feed de vagas, ferramentas gratuitas por segmento, jogos,
radares de concurso/vestibular, marketplace freelancer e Desafio do Match.
Os três itens acima são todos sobre **e-mail de ciclo de vida / retenção
proativa** e **um atalho de produtividade dentro de um fluxo que já
existe** — não abrem módulo novo, fecham lacunas de um produto maduro.

## Priorização sugerida

| Item | Por que priorizar | Esforço estimado |
| --- | --- | --- |
| Lembretes de prazo e entrevista | Reaproveita campos já existentes (`deadline`, `interviewAt`) e a infra de e-mail (`resend.ts`); maior efeito de retenção por esforço | Médio |
| Alertas de concursos/vestibulares | Reaproveita o padrão de `JobAlert`, mas exige um modelo de alerta por tema separado do de vagas | Médio |
| Reanálise rápida de currículo | Menor escopo técnico, mas menor efeito percebido — só ajuda quem já editou o currículo | Baixo–Médio |

## Critério para decidir a próxima feature depois destas três

1. Desbloqueia receita ou reduz risco de pagamento?
2. Aumenta a chance do usuário voltar em até 7 dias?
3. Melhora a clareza do valor antes do checkout?
4. Reduz suporte manual?
5. Gera tráfego orgânico qualificado?

Se a resposta for "não" para todas, provavelmente não é a próxima feature.

## Manutenção deste documento

Quando um dos itens acima for implementado:

1. mover a descrição para [FEATURES.md](FEATURES.md), na área correspondente
   (radares, applications/kanban, ou resume);
2. mover o item de `UPCOMING` para `SHIPPED` em
   `src/components/upcoming-features-modal.tsx` e subir a versão de
   `STORAGE_KEY` para que quem já fechou a modal veja a novidade;
3. remover o item deste roadmap.

Para riscos operacionais e itens de infraestrutura fora do escopo de
feature de produto (rate limit distribuído, fila de análises, validação de
env vars no boot etc.), ver [LAUNCH_CHECKLIST.md](LAUNCH_CHECKLIST.md) e
[SCALING_PLAN.md](SCALING_PLAN.md).

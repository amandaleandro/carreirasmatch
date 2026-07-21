# Visão de produto

## Proposta de valor

O CarreirasMatch ajuda uma pessoa a responder três perguntas: "essa vaga
combina comigo?", "o que eu ajusto para aumentar minha chance?" e "o que eu
faço até conseguir?". O núcleo é a **análise de currículo x vaga por IA**
(Groq), que gera um score de aderência e um diagnóstico completo com plano de
ação. Em torno desse núcleo, o produto reúne um funil de candidaturas
(kanban), um feed de vagas com matching automático, ferramentas gratuitas por
segmento, mentorias em vídeo, radares de concurso e vestibular, jogos de
carreira com ranking, um marketplace freelancer e um programa de indicação
("Desafio do Match").

O produto é **maduro**: a maioria das funcionalidades que se esperaria de uma
plataforma de carreira já existe e está em produção. Gaps reais de escopo
estão documentados em [ROADMAP_FEATURES.md](ROADMAP_FEATURES.md) — hoje,
sobretudo alertas por e-mail e reanálise rápida de currículo.

## Para quem é: os 8 segmentos de carreira

Todo usuário (ou visitante) se encaixa em um `CareerSegment`
(`src/lib/career-segments.ts`), que personaliza preço, ferramentas visíveis,
tom da análise e o roteiro do tour guiado:

| Segmento (`value`) | Rótulo no cadastro | Momento de carreira |
| --- | --- | --- |
| `apprentice` | Busco Jovem Aprendiz | Primeiro contato com o mundo do trabalho |
| `first_job` | Busco Primeiro Emprego | Sem experiência formal ainda |
| `internship` | Busco Estágio | Ainda estudando, buscando estágio |
| `student` | Quero escolher faculdade ou técnico | Decidindo formação (pré-carreira) |
| `career_change` | Quero mudar de carreira | Transição para uma nova área |
| `career_pro` | Quero recolocação ou vaga melhor | Recolocação ou crescimento profissional |
| `concurseiro` | Estudo para concurso público | Preparação para concurso |
| `oab` | Estudo para a OAB | Preparação para o Exame da OAB |

Três segmentos legados (`reemployment`, `better_job`, `growth`) ainda são
normalizados para `career_pro` por compatibilidade retroativa
(`normalizeCareerSegment`), mas não aparecem mais como opção de cadastro.

O segmento define, entre outras coisas:
- o preço do plano mensal e o limite de análises com diagnóstico completo por
  mês (`src/lib/career-offers.ts`);
- quais ferramentas de `/tools` aparecem para aquele usuário
  (`src/lib/tools-catalog.ts`, campo `segments`);
- a orientação de tom para sugestões de perfil geradas por IA
  (`SEGMENT_SUGGESTION_GUIDANCE` em `career-segments.ts`);
- a trilha de análise (`CareerTrack`) pré-selecionada e permitida
  (`defaultTrackForSegment`, `tracksForSegment`);
- o roteiro do tour guiado no primeiro acesso (`src/components/guided-tour.tsx`).

## O que é grátis vs. pago

O acesso não depende de estar logado, e sim de **entitlement** — checado por
`src/lib/entitlements.ts` a cada análise. Regras principais:

- **Criar uma análise é sempre grátis** (`hasAnalysisCredit` retorna `true`
  incondicionalmente) — mesmo para visitante anônimo, limitado por rate
  limit de IP. O resultado simples (score) é sempre exibido.
- **A primeira análise de qualquer usuário libera o diagnóstico completo de
  graça**, sem exigir pagamento — reduz atrito e estimula o compartilhamento
  do card de resultado.
- A partir da segunda análise, o **diagnóstico completo** (pontos fracos,
  correções, plano de estudo, perguntas de entrevista etc.) é liberado por:
  - assinatura ativa, dentro do limite mensal de análises do segmento
    (`monthlyAnalysisLimit` em `career-offers.ts` — varia de 50 a 150 por
    mês, ou ilimitado no plano `career_pro`);
  - pagamento avulso do tipo `diagnostic`, vinculado àquela análise
    específica;
  - crédito de diagnóstico ganho no Desafio do Match (a cada 3 indicações
    confirmadas, ver [USER_FLOWS.md](USER_FLOWS.md));
  - acesso administrativo concedido manualmente, ou conta de influenciador
    (dono de cupom), que tem acesso total sem pagar.
- Ferramentas em `/tools/*` têm sua própria flag `free`/`accountFree` no
  catálogo (`src/lib/tools-catalog.ts`): `free` = totalmente pública, sem
  login, indexável e monetizada por anúncio; `accountFree` = liberada para
  qualquer conta logada, sem exigir assinatura. As demais ferramentas seguem
  a regra de assinatura por segmento.
- Preço do plano mensal varia por segmento (de ~R$14,90 no Jovem Aprendiz até
  R$59,90 no plano fundador de Recolocação/Carreira Pro); o pagamento avulso
  de diagnóstico é uniforme entre segmentos.
- Módulos fora do núcleo de análise — jogos, radares de concurso/vestibular,
  mentorias em vídeo, marketplace freelancer, cursos gratuitos — são
  **gratuitos e abertos**, funcionando como retenção e aquisição, não como
  benefício exclusivo de assinante.

## Outros públicos além do candidato

Além do candidato (pessoa física buscando vaga/carreira), o sistema atende:

- **Empresa**: conta separada (`accountType: "company"`), com triagem de
  currículos em lote e busca consentida no banco de talentos.
- **Parceiro**: instituição de ensino/empresa que anuncia cursos no catálogo
  público (`accountType: "partner"`), com painel próprio e créditos de
  destaque pagos.
- **Influenciador**: dono de cupom de desconto/indicação, com painel de
  acompanhamento de conversões e acesso total ao produto sem pagar.
- **Administrador**: e-mail cadastrado em `ADMIN_EMAILS`, com painel de
  suporte, concessões manuais, cupons, fontes de vaga e denúncias.

## Módulos principais do produto

- **Identidade e perfil**: cadastro, login, recuperação de senha, perfil e
  segmento de carreira.
- **Currículo e IA**: upload/leitura de PDF, análise contra vaga,
  diagnóstico, otimização de currículo, exportação em PDF.
- **Carreira**: preparação de entrevistas, plano de ação, sugestões de
  cursos/certificações.
- **Oportunidades**: feed de vagas com matching, todas as vagas sem
  curadoria, vagas públicas oficiais, candidaturas em kanban.
- **Ferramentas gratuitas**: mais de 25 sub-rotas de guias, testes,
  calculadoras e geradores por segmento.
- **Conteúdo**: blog, mentorias em vídeo, radar de concursos, radar de
  vestibulares, cursos externos de parceiros.
- **Engajamento**: jogos de carreira com ranking, Desafio do Match
  (indicação), tour guiado, modal de novidades.
- **Marketplace freelancer**: perfil, projetos, propostas, contratos,
  mensagens e avaliações — aberto a qualquer usuário, sem papéis fixos.
- **Receita**: pagamento avulso e assinatura recorrente via Mercado Pago,
  cupons de desconto, créditos B2B para empresas e parceiros.
- **Operação**: painel administrativo, suporte, denúncias, métricas.

## Modelo de negócio (resumo)

O candidato tem entrada gratuita garantida (score simples sempre, primeira
análise sempre completa) e paga por diagnóstico avulso ou assinatura para o
que vem depois. A empresa tem franquia de triagens e compra pacotes de
créditos. O parceiro compra pacotes de destaque de curso. Cupons atribuem
cadastros e pagamentos a influenciadores, com desconto para quem usa e
comissão para quem indicou.

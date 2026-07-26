# Posicionamento e marca

## O que o código diz que o produto é

`src/lib/seo.ts` define a descrição oficial (usada no JSON-LD de organização,
em todas as páginas): "Copiloto de carreira que compara currículo e vaga,
mostra as lacunas que mais importam e transforma o diagnóstico em ações."

A home (`src/components/marketing-home.tsx`) resume isso na headline: **"Pare
de se candidatar no escuro."**, com o subtítulo "Compare seu currículo com
uma vaga real, descubra o que está ajudando ou atrapalhando e receba um plano
claro antes de aplicar." CTA primário: "Analisar currículo e vaga" (`/analise`).

## Para quem é (fonte: `/sobre`)

`src/app/sobre/page.tsx` nomeia o público diretamente: "estudantes,
estagiários, quem busca o primeiro emprego, quem está mudando de área e quem
está se recolocando no mercado." Três pilares de marca, no texto real da
página:

1. **Clareza em vez de jargão** — "cada análise devolve o que está bom, o
   que falta e o próximo passo, em linguagem direta."
2. **Feito para cada momento** — "Estagiário, primeiro emprego, transição de
   carreira, recolocação ou jovem aprendiz: a experiência muda porque o
   desafio de cada fase é diferente."
3. **Sem julgamento** — "Gap no currículo, pouca experiência, mudança de
   área, a gente lê sua história como ela é e ajuda a contar isso a seu
   favor."

Isso se reflete em rotas reais por segmento em `src/app`: `jovem-aprendiz`,
`primeiro-emprego`, `estagio`, `transicao`, `recolocacao`, `oab`, `concurso`,
`curriculo-sem-experiencia`, `faculdade-ou-tecnico`. `/comece`
(`src/app/comece/page.tsx`) funciona como porta de entrada guarda-chuva para
todos: "Estágio, primeiro emprego, transição de carreira, recolocação, jovem
aprendiz ou estágio na faculdade: compare seu currículo com a vaga e veja
exatamente o que ajustar antes de aplicar."

## Diferencial funcional e Modelo dos 3 Scores

`/sobre` nega a categoria genérica de propósito: "Não somos só um analisador
de currículo, somos um copiloto para as decisões que mais pesam na sua
trajetória profissional."

Diferente de concorrentes globais (como Kickresume ou Jobscan) que analisam apenas se o robô lê o arquivo ou entregam notas genéricas sem contexto, o **CarreirasMatch** organiza a entrega no **Modelo dos 3 Scores**:

1. **Score 1: Leitura ATS (0-100)** (`/verificador-ats` - Grátis) — Avalia a capacidade de extração técnica do arquivo por sistemas automáticos (Gupy, Sólides, Workday), identificando colunas, fontes, datas, contatos e legibilidade sem exigir uma vaga.
2. **Score 2: Qualidade do Currículo (0-100)** (`/verificador-ats` - Grátis) — Diagnostica a força narrativa do documento (verbos de ação, conquistas mensuráveis, repetições, clareza e estrutura).
3. **Score 3: Aderência à Vaga (0-100)** (`/analise` & `/desafio`) — O grande diferencial competitivo: compara o currículo com a vaga desejada (por texto ou link), mapeia lacunas reais, palavras-chave ausentes, perguntas de entrevista e gera o plano de ação.

### Tese Central de Marca vs Concorrentes
> **"Passar pelo robô do ATS não significa ter perfil para a vaga. O CarreirasMatch mostra as duas coisas."**

A vaga pode ser informada por texto colado **ou por link** (LinkedIn, Gupy
etc.) — campo `jobLink` disponível no formulário.

## Prova de dado real, não copy

`src/app/mercado-de-trabalho/page.tsx` é uma página pública alimentada em
tempo real pelo Postgres (`prisma.publicOpportunity.groupBy`), mostrando
cidades, cargos mais publicados e salário médio agregados das vagas públicas
coletadas — funciona como prova social baseada em dado e gancho de SEO local.

## Outros dois lados do produto (não é só B2C candidato)

Além do candidato, existem três públicos adicionais com landing e painel
dedicados (os fluxos atuais estão documentados em `src/app/empresa`,
`src/app/parceiro` e `src/app/freelancer`):

- **empresas** (`/empresas`) — "Encontre os candidatos certos, ranqueados por
  IA", com triagem automática, ranking por aderência e Kanban de
  candidaturas;
- **parceiros de curso** (`/parceiro`) — "Divulgue seus cursos para quem está
  buscando a próxima vaga", com painel de leads/cliques/faturamento;
- **freelancers e clientes de projeto** (`/freelancer`, `/freelancers`,
  `/projetos`) — marketplace de dois lados: qualquer usuário pode publicar um
  projeto ou se candidatar a um.

## O que a marca evita (confirmado pelo texto real das páginas)

Nenhuma página pública lida promete emprego, aprovação ou aumento salarial —
o vocabulário é sempre "aderência", "score", "lacunas" e "plano de ação". A
home reforça isso com o selo "Sem promessa de contratação" ao lado do CTA
principal, ao lado de "Resultado inicial gratuito".

## Tom de voz observado nas páginas

- frases curtas, linguagem direta ("Nada de termo difícil ou relatório
  genérico" — `/sobre`);
- reconhecimento da dificuldade sem culpabilizar quem procura vaga ("a
  maioria das pessoas não perde uma vaga por falta de capacidade, e sim por
  não saber como se apresentar para ela" — `/sobre`);
- pouco ou nenhum uso de jargão de startup ou emoji em excesso no corpo do
  texto (emojis aparecem pontualmente em cards/labels, não no copy principal).

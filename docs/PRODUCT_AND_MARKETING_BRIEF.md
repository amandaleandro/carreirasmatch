# Brief executivo de produto e marketing

> Documento de referência para alinhar produto, comunicação e aquisição. Baseado na leitura do código e da documentação do repositório em 25/07/2026. Quando houver conflito, o comportamento executável em `src/` e o schema Prisma são a fonte de verdade.

## 1. O produto em uma frase

**O CarreirasMatch mostra, antes da candidatura, se uma vaga combina com o seu currículo, o que está faltando e qual é o próximo passo para aumentar a sua chance.**

Versão curta para divulgação: **Pare de se candidatar no escuro.**

## 2. O problema que o produto resolve

Quem busca emprego normalmente enfrenta quatro dúvidas:

1. “Essa vaga realmente combina comigo?”
2. “Por que meu currículo não está funcionando?”
3. “O que devo ajustar antes de enviar?”
4. “Depois de me candidatar, como acompanho e me preparo?”

O problema não é apenas criar um currículo bonito ou encontrar mais vagas. É tomar decisões melhores em cada candidatura, sem enviar o mesmo currículo genérico para todo lugar.

## 3. A ideia principal de valor

### Mensagem central

**Cada vaga pede uma apresentação diferente. O CarreirasMatch compara seu currículo com a oportunidade, traduz as lacunas em ações e ajuda você a se candidatar com mais clareza.**

### Promessa responsável

O produto promete **clareza, preparação e organização**. Não promete contratação, aprovação ou aumento salarial.

### O “eu preciso disso”

> “Eu tenho uma vaga em mente, não sei se meu currículo serve para ela e não quero perder essa oportunidade. Preciso descobrir o que ajustar agora.”

Esse momento deve ser o centro da home, dos anúncios e do primeiro fluxo do produto.

## 4. Como o produto funciona

| Momento | O que o usuário faz | O que recebe |
| --- | --- | --- |
| 1. Entender | Envia currículo e cola o texto ou link de uma vaga | Score de aderência e leitura dos requisitos |
| 2. Diagnosticar | Consulta pontos fortes, lacunas, palavras-chave e ATS | Explicação do que ajuda ou atrapalha |
| 3. Preparar | Ajusta currículo, gera carta e revisa a apresentação | Kit de candidatura e currículo exportável |
| 4. Treinar | Simula perguntas e recebe feedback de entrevista | Perguntas prováveis e preparação |
| 5. Executar | Encontra vagas compatíveis e organiza candidaturas | Feed por aderência, kanban e metas |
| 6. Acompanhar | Revisa evolução e próximos passos | Histórico de scores e plano de ação |

O fluxo principal é `currículo + vaga → match → lacunas → ações → candidatura`.

## 5. Núcleo do produto

O núcleo competitivo é a **análise de currículo x vaga por IA** (`/analise`). Ela produz score geral, técnico, de experiência, senioridade e ATS; pontos fortes e fracos; correções; palavras-chave ausentes; checklist ATS; status recomendado para a candidatura; perguntas de entrevista; plano de estudo; mensagem para recrutador e cargos alternativos. Em transição de carreira, também gera habilidades transferíveis, narrativa e cargos-ponte.

O produto tem um segundo diagnóstico gratuito: o **verificador ATS**. Ele responde se o arquivo consegue ser lido por sistemas automáticos, mas deve ser comunicado como a primeira metade do problema. A aderência à vaga é o diferencial principal.

## 6. Ecossistema de funcionalidades

As funcionalidades devem ser entendidas como camadas do mesmo objetivo:

- **Decisão:** análise de vaga, score, comparador de vagas e verificador ATS.
- **Preparação:** editor/exportação de currículo, carta, perfil, LinkedIn, plano de ação e simulador de entrevista.
- **Execução:** feed de vagas, vagas públicas, candidatura em kanban, metas e piloto automático.
- **Desenvolvimento:** ferramentas gratuitas, cursos, mentorias, radar de concursos, vestibulares, jogos e trilhas por momento de carreira.
- **Alternativas de renda:** marketplace freelancer.
- **B2B:** triagem de currículos, vagas, ranking de candidatos, banco de talentos e contato com consentimento.

### Piloto Automático

O código atual já possui uma camada de candidatura autônoma: o usuário define match mínimo, limite diário, perfil e autorização. O envio automático funciona para vagas de empresas publicadas dentro do CarreirasMatch; vagas externas podem depender de automação autorizada e são bloqueadas quando exigem login, senha ou CAPTCHA. A comunicação deve usar “piloto automático com regras e autorização”, nunca “candidatura garantida em qualquer site”.

## 7. Público prioritário

### Público principal

**Pessoa que encontrou uma vaga e quer saber se vale a pena se candidatar.** É o público que melhor entende o valor em poucos segundos e tem intenção imediata.

### Segmentos de aquisição

- primeiro emprego e jovem aprendiz;
- estágio;
- transição de carreira;
- recolocação e busca por uma vaga melhor;
- estudante decidindo entre faculdade e técnico;
- concurseiro e candidato à OAB.

O produto personaliza linguagem, trilha e oferta por segmento. As campanhas podem ser específicas, mas todas devem voltar para a mesma ideia: **entender o próximo passo antes de agir**.

Públicos secundários, com páginas e campanhas próprias: empresas, escolas/cursos e usuários do marketplace freelancer. Eles não devem dividir a mesma headline da campanha principal do candidato.

## 8. Casa de mensagem

### Problema

“Você se candidata, mas não sabe se o currículo conversa com a vaga — e recebe pouca orientação sobre o que mudar.”

### Insight

“Passar pelo robô do ATS não significa ter perfil para a vaga. E ter perfil não adianta se o currículo não mostra isso.”

### Solução

“Compare currículo e vaga, descubra as lacunas mais importantes e transforme o diagnóstico em ações concretas.”

### Diferenciais

- análise contextualizada para uma vaga real;
- linguagem direta, sem relatório genérico;
- resultado que termina em ação, não apenas em nota;
- experiência adaptada ao momento de carreira;
- entrada gratuita e primeira análise completa sem barreira de pagamento;
- continuidade para preparar, aplicar e acompanhar.

### Provas permitidas

Score de aderência, análise ATS, palavras-chave encontradas e ausentes, recomendações de currículo, plano de ação, histórico de candidaturas e vagas ordenadas por correspondência.

Não usar como prova: promessa de contratação, aumento garantido de salário ou aprovação automática.

## 9. Copy principal recomendada

### Home

**Eyebrow:** Candidaturas mais estratégicas

**Título:** Pare de se candidatar no escuro.

**Subtítulo:** Compare seu currículo com uma vaga real, descubra o que está ajudando ou atrapalhando e receba um plano claro antes de aplicar.

**CTA primário:** Analisar meu currículo e a vaga

**CTA secundário:** Ver vagas compatíveis

**Microprova:** Resultado inicial gratuito · Sem promessa de contratação

### Anúncio de intenção alta

**Você encontrou a vaga. Agora descubra se o seu currículo está pronto.**

Envie o currículo e a descrição da oportunidade. Veja o seu match, as lacunas e o que ajustar antes de clicar em “candidatar”.

**CTA:** Calcular meu match grátis

### Transição de carreira

**Sua experiência não precisa ser descartada. Ela precisa ser traduzida para a próxima área.**

### Primeiro emprego e estágio

**Você não precisa ter uma carreira pronta. Precisa mostrar as evidências certas para começar.**

## 10. Estrutura de comunicação

Toda peça deve responder nesta ordem:

1. Situação: “Você encontrou uma vaga…”
2. Dor: “…mas não sabe se seu currículo serve.”
3. Mecanismo: “Compare os dois com IA.”
4. Entrega: “Veja match, lacunas e ajustes.”
5. Ação: “Candidate-se com um plano.”

Evitar começar pela lista de dezenas de ferramentas. Lista de recursos explica o produto; não cria urgência.

## 11. Funil recomendado

- **Aquisição:** currículo grátis, verificador ATS, conteúdos de currículo, vagas de hoje, páginas por segmento e dados do mercado de trabalho.
- **Ativação:** análise concreta com uma vaga real; resultado compreensível em poucos segundos e com próximo passo explícito.
- **Conversão:** diagnóstico completo ou Kit de Candidatura para a vaga escolhida; assinatura como central de candidaturas para uso recorrente.
- **Retenção:** evolução de score, gaps recorrentes, candidaturas, entrevistas e plano semanal.
- **Indicação:** Desafio do Match com card compartilhável; a regra existente é 3 indicações confirmadas = 1 diagnóstico completo.

## 12. O que dizer e o que não dizer

### Dizer

- “Descubra onde você tem aderência.”
- “Saiba o que ajustar antes de aplicar.”
- “Transforme seu currículo para a vaga que você quer.”
- “Tenha um próximo passo claro.”

### Não dizer

- “Garanta sua contratação.”
- “A IA consegue emprego para você.”
- “Candidate-se para todas as vagas automaticamente”, sem explicar limites e autorizações.
- “Basta passar no ATS.”

## 13. Decisão de posicionamento

O CarreirasMatch não deve ser apresentado primeiro como portal de vagas, gerador de currículo, coleção de ferramentas, marketplace freelancer ou IA genérica de carreira.

Deve ser apresentado primeiro como:

> **O copiloto que ajuda você a decidir e preparar cada candidatura.**

Depois que a pessoa entende esse núcleo, feed, currículo, entrevista, plano, automação e conteúdo passam a fazer sentido como partes da mesma jornada.

## 14. Métricas de mensagem e produto

- início e conclusão da primeira análise;
- percentual que chega ao resultado completo;
- tempo entre resultado e primeira candidatura salva/enviada;
- análises por usuário ativo;
- uso do feed e do kanban;
- conversão de análise para Kit ou assinatura;
- retorno para uma segunda vaga;
- compartilhamentos e indicações do Desafio do Match;
- conversão por segmento.

Métrica principal recomendada: **usuários que transformam uma análise em uma ação de candidatura preparada**. O score sozinho é consumo; a ação é valor realizado.

## 15. Resumo para o time

**O usuário não quer mais uma ferramenta. Ele quer parar de perder tempo e oportunidades por não saber se está se apresentando do jeito certo. O CarreirasMatch compara currículo e vaga, explica o que falta e organiza o próximo passo. A comunicação precisa vender essa clareza primeiro; o restante do ecossistema prova que o produto consegue acompanhar a jornada inteira.**

export type EssayShowcaseCompetency = {
  competency: string;
  score: number;
  whyItScored: string;
};

export type EssayShowcaseEntry = {
  slug: string;
  theme: string;
  year: string;
  paragraphs: string[];
  competencies: EssayShowcaseCompetency[];
  keyTechniques: string[];
};

export const ESSAY_SHOWCASE: EssayShowcaseEntry[] = [
  {
    slug: "invisibilidade-saude-mental",
    theme: "Desafios para o enfrentamento da invisibilidade do cuidado com a saúde mental no Brasil",
    year: "Redação modelo, tema estilo ENEM",
    paragraphs: [
      "No quadro \"O Grito\", Edvard Munch traduz em cores e formas a angústia de uma figura isolada diante do mundo, imagem que ecoa a experiência de milhões de brasileiros que sofrem em silêncio por transtornos mentais. No Brasil, o cuidado com a saúde mental ainda é tratado como pauta secundária, marginalizada por tabus sociais e pela fragilidade das políticas públicas. Esse cenário exige enfrentamento urgente, sob pena de perpetuar sofrimento evitável.",
      "Em primeiro lugar, o estigma social funciona como uma barreira que silencia quem precisa de ajuda. Expressões como \"isso é frescura\" ou \"falta força de vontade\" revelam um imaginário coletivo que associa transtornos mentais a fraqueza de caráter, não a condições de saúde legítimas. Segundo dados da Organização Mundial da Saúde, o Brasil está entre os países com maior prevalência de ansiedade do mundo, e, ainda assim, buscar terapia ou psiquiatra segue sendo, para muitos, motivo de vergonha antes de ser motivo de cuidado.",
      "Em segundo lugar, a insuficiência de políticas públicas agrava o problema. Os Centros de Atenção Psicossocial (CAPS), criados para oferecer suporte gratuito e territorial, sofrem com subfinanciamento crônico e distribuição desigual pelo país, deixando municípios inteiros sem cobertura. Some-se a isso a escassez de psicólogos e psiquiatras na rede pública, e o resultado é um sistema que, no papel, existe, mas na prática não alcança quem mais precisa.",
      "Portanto, é necessário que o Ministério da Saúde, em parceria com estados e municípios, amplie o financiamento e a rede de CAPS, garantindo cobertura territorial mínima em todo o país. Paralelamente, o Ministério da Educação deve incluir educação socioemocional na grade curricular da educação básica, formando desde cedo uma cultura de acolhimento e desestigmatização. Somente unindo estrutura pública e mudança cultural o Brasil poderá tratar a saúde mental com a seriedade que ela exige.",
    ],
    competencies: [
      { competency: "Domínio da norma culta", score: 180, whyItScored: "Poucos desvios pontuais de pontuação; estrutura sintática variada e sem erros graves de concordância ou regência." },
      { competency: "Compreensão do tema", score: 200, whyItScored: "Aborda diretamente o enfrentamento da invisibilidade do cuidado com saúde mental, sem fugir ao tema nem tangenciá-lo." },
      { competency: "Seleção e organização de argumentos", score: 180, whyItScored: "Dois argumentos bem desenvolvidos (estigma social e insuficiência de políticas), com dados de apoio (OMS, CAPS) que sustentam a tese." },
      { competency: "Conhecimento dos mecanismos linguísticos", score: 180, whyItScored: "Uso consistente de conectivos (\"em primeiro lugar\", \"some-se a isso\", \"portanto\") que amarram os parágrafos com coesão clara." },
      { competency: "Proposta de intervenção", score: 200, whyItScored: "Proposta completa: agente (Ministério da Saúde/Educação), ação (financiamento de CAPS, educação socioemocional), meio e finalidade, respeitando os direitos humanos." },
    ],
    keyTechniques: [
      "Abre com repertório sociocultural (a pintura de Munch) conectado diretamente ao tema, não decorativo.",
      "Cada parágrafo de desenvolvimento tem um único argumento central, evitando parágrafos genéricos.",
      "A proposta de intervenção nomeia agente, ação, meio e finalidade, os 4 elementos que a banca do ENEM cobra explicitamente.",
      "Fecha retomando a tese sem repetir a introdução palavra por palavra.",
    ],
  },
  {
    slug: "desafios-empregabilidade-jovem",
    theme: "Desafios da empregabilidade juvenil em um mercado de trabalho em transformação",
    year: "Redação modelo, tema estilo ENEM",
    paragraphs: [
      "A automatização de tarefas e a ascensão da inteligência artificial redesenham, a cada ano, as exigências do mercado de trabalho. Nesse cenário de transformação acelerada, os jovens brasileiros enfrentam um paradoxo: são cobrados por experiência que ainda não tiveram a chance de construir, ao mesmo tempo em que o próprio conceito de \"experiência necessária\" muda mais rápido do que suas trajetórias educacionais conseguem acompanhar. Torna-se urgente refletir sobre esse descompasso.",
      "Um primeiro fator que intensifica o problema é a desconexão entre a formação escolar tradicional e as competências hoje valorizadas pelas empresas. Currículos escolares seguem priorizando memorização em detrimento de habilidades como pensamento crítico, comunicação e domínio digital básico, exatamente as competências mais citadas em pesquisas sobre empregabilidade juvenil, segundo levantamentos do Fórum Econômico Mundial.",
      "Além disso, a desigualdade de acesso à qualificação aprofunda o abismo entre jovens de diferentes realidades sociais. Enquanto uma parcela consegue arcar com cursos, idiomas e certificações que ampliam suas chances, outra parcela, majoritária, depende exclusivamente de oportunidades públicas escassas, perpetuando um ciclo em que a origem social ainda determina, em grande medida, o acesso ao primeiro emprego.",
      "Diante disso, cabe ao Ministério do Trabalho, em articulação com o Ministério da Educação, expandir programas de qualificação profissional gratuita voltados a competências digitais e socioemocionais, priorizando jovens de baixa renda por meio de editais regionais. Cabe também às empresas, incentivadas por benefícios fiscais, ampliar vagas de aprendizagem e estágio remunerado. Só assim será possível reduzir o descompasso entre a juventude brasileira e um mercado de trabalho em constante transformação.",
    ],
    competencies: [
      { competency: "Domínio da norma culta", score: 160, whyItScored: "Boa estrutura geral, com pequenos deslizes de pontuação em períodos mais longos." },
      { competency: "Compreensão do tema", score: 200, whyItScored: "Desenvolve com precisão o eixo temático (empregabilidade juvenil x transformação do mercado), sem se desviar." },
      { competency: "Seleção e organização de argumentos", score: 180, whyItScored: "Argumentos bem escolhidos (desconexão curricular e desigualdade de acesso), com repertório específico (Fórum Econômico Mundial) reforçando a tese." },
      { competency: "Conhecimento dos mecanismos linguísticos", score: 160, whyItScored: "Coesão adequada entre parágrafos, ainda que com repetição ocasional de estrutura de conectivos." },
      { competency: "Proposta de intervenção", score: 180, whyItScored: "Proposta com dois agentes distintos (governo e empresas), ação e meio claros; falta detalhar melhor a finalidade de cada ação." },
    ],
    keyTechniques: [
      "A introdução já apresenta o \"paradoxo\" que organiza toda a redação, cada parágrafo de desenvolvimento explica uma face desse paradoxo.",
      "Usa repertório de dados (Fórum Econômico Mundial) sem citar número exato inventado, cita a fonte, não uma estatística arriscada.",
      "Propõe intervenção com dois agentes (Estado e empresas), mostrando que o problema pede solução em mais de uma frente.",
      "Evita clichês de introdução (\"desde os primórdios da humanidade...\") e vai direto ao repertório conectado ao tema.",
    ],
  },
  {
    slug: "acesso-a-cultura-nas-periferias",
    theme: "Caminhos para democratizar o acesso à cultura nas periferias brasileiras",
    year: "Redação modelo, tema estilo ENEM",
    paragraphs: [
      "O sociólogo Pierre Bourdieu cunhou o conceito de \"capital cultural\" para descrever como o acesso à arte, à leitura e a espaços culturais se distribui de forma desigual entre as classes sociais, reproduzindo privilégios de geração em geração. No Brasil, essa desigualdade se manifesta de forma evidente: enquanto bairros centrais concentram teatros, museus e cinemas, as periferias, onde vive a maior parte da população, seguem à margem do acesso cultural. Democratizar esse acesso é, portanto, uma medida de justiça social.",
      "Um primeiro obstáculo é a concentração geográfica dos equipamentos culturais nos centros urbanos. Museus, teatros e centros culturais tendem a se instalar em regiões de maior poder aquisitivo, exigindo dos moradores da periferia deslocamentos longos e caros, o que, na prática, torna o acesso inviável para grande parte da população, mesmo quando a entrada é gratuita.",
      "Some-se a isso o preconceito simbólico que associa produções culturais periféricas, como o rap, o funk e o grafite, a manifestações de menor valor artístico. Essa hierarquização informal, reforçada por parte da mídia tradicional, invisibiliza expressões culturais legítimas e reduz o incentivo institucional a espaços que já nascem dentro das próprias comunidades.",
      "Para reverter esse cenário, é fundamental que o Ministério da Cultura, em parceria com prefeituras, amplie a instalação de pontos de cultura e bibliotecas comunitárias diretamente nos bairros periféricos, com programação gratuita e recorrente. Ao mesmo tempo, editais públicos de fomento devem priorizar explicitamente coletivos e artistas periféricos, reconhecendo institucionalmente manifestações como rap, funk e grafite como patrimônio cultural brasileiro. Dessa forma, a cultura deixará de ser privilégio de poucos para se tornar, de fato, um direito de todos.",
    ],
    competencies: [
      { competency: "Domínio da norma culta", score: 180, whyItScored: "Texto fluido, período bem construídos, praticamente sem desvios gramaticais." },
      { competency: "Compreensão do tema", score: 200, whyItScored: "Trata diretamente da democratização do acesso à cultura nas periferias, com foco mantido do início ao fim." },
      { competency: "Seleção e organização de argumentos", score: 200, whyItScored: "Argumentos complementares (barreira geográfica e preconceito simbólico) sustentados por repertório sociocultural relevante (Bourdieu)." },
      { competency: "Conhecimento dos mecanismos linguísticos", score: 180, whyItScored: "Conectivos variados e bem posicionados garantem coesão sem repetição mecânica." },
      { competency: "Proposta de intervenção", score: 200, whyItScored: "Dois agentes (Ministério da Cultura/prefeituras e editais públicos), ações concretas, meio e finalidade claramente articulados." },
    ],
    keyTechniques: [
      "Usa um conceito teórico (capital cultural, de Bourdieu) como repertório central, mostra domínio de referência sem apenas citar nome por citar.",
      "Cada argumento tem uma causa concreta (localização de equipamentos, preconceito simbólico) e não apenas uma constatação genérica.",
      "A proposta de intervenção reconhece explicitamente manifestações culturais citadas no desenvolvimento (rap, funk, grafite), amarrando o texto do início ao fim.",
      "Conclusão retoma a ideia de \"privilégio x direito\", fechando o raciocínio sem introduzir argumento novo de última hora.",
    ],
  },
];

export function getEssayShowcaseEntry(slug: string): EssayShowcaseEntry | undefined {
  return ESSAY_SHOWCASE.find((e) => e.slug === slug);
}

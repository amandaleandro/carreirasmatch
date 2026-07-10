export type FirstJobPath = "sem_formacao" | "formacao";

export type FirstJobTip = {
  title: string;
  body: string;
  action: string;
};

export type FirstJobPathContent = {
  key: FirstJobPath;
  label: string;
  intro: string;
  tips: FirstJobTip[];
};

export const FIRST_JOB_GUIDE: FirstJobPathContent[] = [
  {
    key: "sem_formacao",
    label: "Sem formação obrigatória",
    intro:
      "Vagas de entrada que não exigem faculdade ou técnico avaliam menos diploma e mais sinais de responsabilidade, iniciativa e disponibilidade. O guia abaixo mostra onde focar em cada etapa.",
    tips: [
      {
        title: "Currículo por competências, não por formação",
        body: "Sem diploma ou curso técnico para preencher o currículo, a saída é organizar por competências: liste 4 a 5 habilidades práticas (atendimento, organização, comunicação, informática básica) e, embaixo de cada uma, uma frase curta provando que você já usou essa habilidade em algum contexto — escola, casa, trabalho informal ou voluntariado.",
        action: "Escreva 3 frases do tipo \"Já organizei [situação] usando [habilidade]\" antes de montar o currículo final.",
      },
      {
        title: "Cursos rápidos e gratuitos que pesam na triagem",
        body: "Recrutadores de vagas de entrada procuram sinais de iniciativa. Um curso de 20 horas já é um diferencial. Fundação Bradesco, Sebrae e Escola Virtual Gov oferecem certificados reconhecidos e gratuitos em áreas como atendimento, Excel e vendas.",
        action: "Escolha 1 curso de até 2 semanas na sua área de interesse e coloque a certificação no currículo assim que concluir.",
      },
      {
        title: "Transforme experiência informal em prova de responsabilidade",
        body: "Trabalho informal, ajuda no negócio da família, cuidar de irmãos mais novos ou organizar eventos da comunidade mostram responsabilidade, pontualidade e trabalho em equipe — características que pesam tanto quanto experiência formal em vagas de entrada.",
        action: "Liste 2 experiências informais e descreva em uma frase objetiva o que você aprendeu com cada uma.",
      },
      {
        title: "Escolha as vagas certas para aplicar",
        body: "Vagas que dizem \"não exige experiência\" ou \"com ou sem experiência\" têm processos seletivos desenhados para quem está começando — a chance de avançar é maior do que em vagas genéricas de nível pleno.",
        action: "Ao buscar vagas, filtre por palavras como \"iniciante\", \"sem experiência\" ou \"nível de entrada\".",
      },
      {
        title: "Prepare respostas simples para a entrevista",
        body: "Sem cases complexos para contar, a entrevista de quem busca o primeiro emprego costuma ser mais sobre atitude do que sobre técnica. Recrutadores querem saber se você é confiável, aprende rápido e tem disponibilidade real.",
        action: "Treine em voz alta a resposta para \"por que você quer essa vaga\" em até 30 segundos, sem enrolar.",
      },
    ],
  },
  {
    key: "formacao",
    label: "Com faculdade ou curso técnico",
    intro:
      "Ter formação (mesmo em andamento) muda o que vale a pena destacar: projetos acadêmicos, estágios e programas de trainee pesam mais do que experiência informal. O guia abaixo mostra como usar isso a seu favor.",
    tips: [
      {
        title: "A formação em andamento já vale — não espere o diploma",
        body: "A maioria das vagas de primeiro emprego para quem tem faculdade ou técnico aceita formação em andamento. Coloque o curso, a instituição e a previsão de conclusão logo no topo do currículo, mesmo que faltem semestres.",
        action: "Adicione \"previsão de conclusão: [mês/ano]\" junto ao nome do curso no currículo.",
      },
      {
        title: "Projetos acadêmicos e TCC viram experiência",
        body: "Um projeto de faculdade bem descrito — objetivo, o que você fez, resultado — funciona como um case de experiência profissional para quem está entrando no mercado. O erro comum é só citar o nome do projeto sem explicar o que foi feito.",
        action: "Reescreva 1 a 2 projetos no formato \"fiz X para resolver Y, resultado Z\".",
      },
      {
        title: "Estágios e monitorias contam como experiência real",
        body: "Mesmo estágios não remunerados, monitorias e participação em ligas acadêmicas demonstram que você já operou em um ambiente estruturado, com prazos e responsabilidades — isso pesa mais do que parece para quem está do outro lado da mesa.",
        action: "Liste essas experiências na seção de experiência profissional, não em \"atividades extracurriculares\".",
      },
      {
        title: "Programas de trainee e primeiro emprego são a porta de entrada certa",
        body: "Empresas grandes costumam ter programas específicos para recém-formados, com processos seletivos desenhados para quem não tem anos de experiência — a concorrência é mais equilibrada do que em vagas abertas ao mercado geral.",
        action: "Pesquise \"programa trainee\" ou \"programa de primeiro emprego\" + nome da sua área de formação.",
      },
      {
        title: "Explique por que escolheu o curso — e prove que aplica o que aprendeu",
        body: "Recrutadores testam se a escolha do curso foi consciente e se você consegue conectar teoria com prática. Uma resposta genérica (\"sempre gostei da área\") pesa contra você.",
        action: "Prepare uma resposta com um exemplo concreto de como usou um conceito do curso fora da sala de aula.",
      },
    ],
  },
];

export const FIRST_JOB_GUIDE_BY_PATH = Object.fromEntries(
  FIRST_JOB_GUIDE.map((p) => [p.key, p])
) as Record<FirstJobPath, FirstJobPathContent>;

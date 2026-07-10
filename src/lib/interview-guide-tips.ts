export type InterviewGuideSection = "postura" | "portfolio" | "dress_code";

export type InterviewGuideTip = {
  title: string;
  body: string;
  action: string;
};

export type InterviewGuideSectionContent = {
  key: InterviewGuideSection;
  label: string;
  intro: string;
  tips: InterviewGuideTip[];
};

export const INTERVIEW_GUIDE: InterviewGuideSectionContent[] = [
  {
    key: "postura",
    label: "Como funciona e como se portar",
    intro:
      "A maioria das entrevistas de emprego segue uma estrutura parecida — entender essa estrutura e treinar a postura certa reduz boa parte da ansiedade.",
    tips: [
      {
        title: "As 3 partes de quase toda entrevista",
        body: "Entrevistas costumam ter três blocos: quebra-gelo e apresentação (fale de você em até 1 minuto), perguntas sobre experiência e comportamento, e um espaço final para você perguntar sobre a vaga. Saber essa estrutura evita ser pego de surpresa.",
        action: "Treine em voz alta uma apresentação pessoal de 60 segundos: quem você é, o que busca e por que essa vaga.",
      },
      {
        title: "Linguagem corporal fala antes de você",
        body: "Postura ereta, contato visual (ou olhar para a câmera em entrevistas online) e um aperto de mão firme (presencial) passam confiança antes mesmo da primeira resposta. Em entrevistas por vídeo, olhe para a câmera, não para a tela, ao responder.",
        action: "Se for online, teste o enquadramento da câmera e o áudio 10 minutos antes do horário marcado.",
      },
      {
        title: "Use o método STAR para responder sobre experiências",
        body: "Quando pedirem um exemplo (\"me conta uma vez que...\"), estruture a resposta em Situação, Tarefa, Ação e Resultado. Isso organiza sua resposta e evita divagar.",
        action: "Escolha 2 histórias reais (de trabalho, escola ou projeto pessoal) e escreva cada uma no formato STAR antes da entrevista.",
      },
      {
        title: "Sempre tenha perguntas prontas para fazer",
        body: "Quando perguntarem \"você tem alguma pergunta?\", responder \"não\" passa desinteresse. Perguntas sobre o dia a dia da vaga, a equipe ou os próximos passos do processo mostram que você está genuinamente considerando a oportunidade.",
        action: "Prepare 2 perguntas, ex: \"como é o primeiro mês de quem entra nessa vaga?\" e \"quais são os próximos passos do processo?\".",
      },
      {
        title: "Feche a entrevista reforçando interesse",
        body: "No final, reafirme brevemente por que você quer a vaga e agradeça o tempo do entrevistador. Um follow-up por e-mail ou LinkedIn no dia seguinte, agradecendo a conversa, é opcional mas bem visto.",
        action: "Escreva uma frase curta de encerramento e treine dizê-la naturalmente.",
      },
    ],
  },
  {
    key: "portfolio",
    label: "Portfólio",
    intro:
      "Um portfólio bem montado prova na prática o que o currículo só descreve — mesmo para quem está buscando o primeiro emprego e ainda não tem experiência formal.",
    tips: [
      {
        title: "Portfólio não é só para área criativa ou tech",
        body: "Qualquer área pode ter portfólio: atendimento pode mostrar um script de atendimento que criou, marketing pode mostrar posts ou campanhas simuladas, administrativo pode mostrar uma planilha de controle que organizou. O objetivo é mostrar um resultado concreto, não só listar habilidades.",
        action: "Liste 2 a 3 trabalhos (reais ou simulados) que você poderia reunir num portfólio hoje.",
      },
      {
        title: "Estrutura simples de cada projeto no portfólio",
        body: "Para cada item, explique em poucas frases: qual era o objetivo, o que você fez e qual foi o resultado ou aprendizado. Isso vale mais do que só anexar o arquivo final sem contexto.",
        action: "Escreva essa estrutura de 3 frases para o primeiro item do seu portfólio.",
      },
      {
        title: "Onde publicar sem custo",
        body: "Um site gratuito (Notion, Carrd, Canva, GitHub Pages para quem é da área técnica) já é suficiente. O que importa é ter um link único para compartilhar, não a plataforma em si.",
        action: "Escolha uma ferramenta gratuita e crie uma página simples ainda hoje, mesmo que incompleta.",
      },
      {
        title: "Coloque o link do portfólio em todo lugar",
        body: "Currículo, LinkedIn e e-mail de candidatura devem ter o link do portfólio visível. Recrutadores raramente vão procurar por conta própria — o link precisa estar fácil de encontrar.",
        action: "Adicione o link do portfólio no topo do currículo, junto com e-mail e telefone.",
      },
    ],
  },
  {
    key: "dress_code",
    label: "Dress code",
    intro:
      "Vestir-se de forma adequada para a entrevista reduz uma fonte de ansiedade e evita distração — sua roupa não deveria ser o assunto da conversa.",
    tips: [
      {
        title: "Regra geral: vista-se um degrau acima do dia a dia da empresa",
        body: "Pesquise fotos da empresa (site, redes sociais, LinkedIn dos funcionários) para entender o padrão do escritório e vista-se um pouco mais formal do que isso. Startups e empresas de tecnologia costumam aceitar casual (calça, camisa ou blusa simples); bancos, jurídico e grandes corporações pedem mais formalidade (social completo).",
        action: "Antes da entrevista, veja 3 a 5 fotos do ambiente da empresa nas redes sociais para calibrar o nível de formalidade.",
      },
      {
        title: "Na dúvida, formal simples nunca erra",
        body: "Calça social ou jeans escuro sem rasgos, camisa ou blusa lisa, sapato fechado limpo. Evite estampas chamativas, roupas muito curtas ou amassadas — o objetivo é parecer cuidado(a), não necessariamente engravatado(a).",
        action: "Separe a roupa da entrevista no dia anterior e confira se está limpa e passada.",
      },
      {
        title: "Entrevista online também tem dress code",
        body: "Mesmo em vídeo, vista-se como se fosse presencial (pelo menos da cintura para cima) — isso muda sua postura e sua concentração, além de evitar imprevistos se precisar se levantar.",
        action: "Escolha a roupa da entrevista online com a mesma atenção que teria numa presencial.",
      },
      {
        title: "Cuidados básicos que pesam tanto quanto a roupa",
        body: "Cabelo penteado, unhas limpas, e evitar perfume/som forte demais completam a impressão. Pequenos detalhes de higiene e cuidado pessoal são notados tanto quanto a roupa escolhida.",
        action: "Faça uma checagem rápida no espelho 15 minutos antes: roupa, cabelo e postura.",
      },
    ],
  },
];

export const INTERVIEW_GUIDE_BY_SECTION = Object.fromEntries(
  INTERVIEW_GUIDE.map((s) => [s.key, s])
) as Record<InterviewGuideSection, InterviewGuideSectionContent>;

export type CareerGrowthGuideSection =
  | "escolher_caminho"
  | "caso_para_promocao"
  | "estrategia_troca_empresa"
  | "negociacao"
  | "senioridade_real";

export type CareerGrowthGuideTip = {
  title: string;
  body: string;
  action: string;
};

export type CareerGrowthGuideSectionContent = {
  key: CareerGrowthGuideSection;
  label: string;
  intro: string;
  tips: CareerGrowthGuideTip[];
};

export const CAREER_GROWTH_GUIDE: CareerGrowthGuideSectionContent[] = [
  {
    key: "escolher_caminho",
    label: "Promoção ou troca de empresa?",
    intro:
      "Subir de senioridade acontece de dois jeitos: crescendo dentro da empresa atual ou trocando de empresa para um cargo maior. Nenhum dos dois é superior por padrão, o caminho certo depende do que a empresa atual oferece de verdade, não só do que promete.",
    tips: [
      {
        title: "Olhe o histórico real de promoções da sua empresa, não só o discurso",
        body: "Empresas dizem 'aqui tem plano de carreira' com frequência, mas o que importa é: quantas pessoas do seu nível foram promovidas nos últimos 12-24 meses e em quanto tempo. Se a resposta for 'quase ninguém', o caminho interno tende a ser mais lento do que parece.",
        action: "Liste 2-3 pessoas da sua empresa que foram promovidas recentemente e quanto tempo levaram no cargo anterior.",
      },
      {
        title: "Trocar de empresa costuma dar salto salarial maior; promoção interna, salto de confiança maior",
        body: "É comum ganhar 15-30% a mais migrando de empresa para o próximo nível, contra reajustes mais conservadores em promoções internas. Em compensação, promoção interna aproveita a confiança já construída, o que reduz o risco de 'not meeting expectations' num cargo novo.",
        action: "Decida qual pesa mais para você agora: velocidade de ganho salarial ou redução de risco na transição de nível.",
      },
      {
        title: "Pergunte diretamente ao seu gestor sobre o caminho de promoção",
        body: "Muita gente evita essa conversa por medo de parecer ambiciosa demais. Na prática, gestores costumam reagir bem a quem pergunta com clareza o que falta para o próximo nível, e isso já sinaliza intenção de crescer.",
        action: "Marque uma conversa 1:1 com seu gestor e pergunte especificamente o que falta para você chegar ao próximo nível.",
      },
      {
        title: "Não espere a promoção 'acontecer sozinha' por tempo de casa",
        body: "Tempo de casa sozinho raramente é critério de promoção nas empresas atuais, impacto e escopo entregues pesam muito mais. Se sua entrega não mudou nos últimos 12 meses, é sinal de agir, seja pedindo mais escopo, seja começando a buscar fora.",
        action: "Avalie se o escopo do seu trabalho cresceu nos últimos 12 meses. Se não, isso é o primeiro ponto a resolver.",
      },
      {
        title: "Rode os dois caminhos em paralelo até decidir",
        body: "Buscar promoção interna não impede aplicar para vagas externas de nível maior ao mesmo tempo, a proposta externa concreta, inclusive, costuma acelerar uma decisão de promoção interna que estava travada.",
        action: "Enquanto conversa sobre promoção internamente, mantenha 1-2 candidaturas externas de nível acima em andamento.",
      },
    ],
  },
  {
    key: "caso_para_promocao",
    label: "Construir o caso para promoção",
    intro:
      "Promoção raramente é dada só por bom desempenho no cargo atual, é dada para quem já demonstra, na prática, comportamento do próximo nível antes de ser promovido formalmente. Construir esse caso é um trabalho ativo, não passivo.",
    tips: [
      {
        title: "Descubra os critérios formais do próximo nível",
        body: "Empresas maiores costumam ter uma matriz de competências por senioridade (career ladder), mesmo que pouco divulgada. Pedir esse documento ao RH ou gestor mostra intenção e dá um alvo concreto para mirar.",
        action: "Peça ao seu gestor ou RH a matriz de competências (career ladder) do seu cargo até o próximo nível.",
      },
      {
        title: "Já comece a agir como o próximo nível, dentro do possível",
        body: "Assumir mais autonomia em decisões, ajudar a resolver problemas fora do seu escopo formal e apoiar pessoas mais juniores são sinais concretos de senioridade maior, muito mais visíveis do que só pedir a promoção verbalmente.",
        action: "Escolha uma responsabilidade do próximo nível e comece a exercê-la nas próximas semanas, mesmo informalmente.",
      },
      {
        title: "Documente impacto, não só tarefas concluídas",
        body: "'Concluí o projeto X' pesa menos que 'o projeto X reduziu o tempo de processo em 30%' ou 'evitou retrabalho para 3 times'. Números e consequências concretas são o que diferencia entregas de nível pleno das de nível sênior.",
        action: "Reescreva suas 3 últimas entregas relevantes destacando o impacto mensurável, não só a tarefa realizada.",
      },
      {
        title: "Peça feedback específico sobre gaps para o próximo nível, não feedback genérico",
        body: "'Como estou indo?' gera resposta vaga. 'O que especificamente falta para eu chegar ao nível sênior?' gera resposta acionável, e mostra ao gestor que você já está pensando na promoção de forma estruturada.",
        action: "Na próxima 1:1, pergunte especificamente: 'o que falta hoje para eu estar pronto para o próximo nível?'.",
      },
      {
        title: "Formalize o pedido, não deixe só no campo do subentendido",
        body: "Gestores lidam com várias prioridades ao mesmo tempo, quem não formaliza o pedido de promoção corre o risco de ser esquecido no ciclo, mesmo merecendo. Um pedido claro, com dados de impacto, entra no radar de forma diferente de uma expectativa implícita.",
        action: "Marque uma conversa formal com seu gestor para apresentar seu caso de promoção, com os dados de impacto reunidos.",
      },
    ],
  },
  {
    key: "estrategia_troca_empresa",
    label: "Estratégia para troca de empresa",
    intro:
      "Buscar um cargo de nível maior em outra empresa é diferente de buscar recolocação: aqui a narrativa precisa mostrar crescimento, não só continuidade, e o filtro de vagas precisa mirar o próximo nível, não o nível atual.",
    tips: [
      {
        title: "Aplique para vagas do próximo nível, não só do nível atual em outro lugar",
        body: "É comum, por insegurança, aplicar só para vagas do mesmo nível ao trocar de empresa. Isso é um erro se o objetivo é crescer: o salto de senioridade costuma acontecer justamente na troca, quando a empresa nova avalia potencial, não só o cargo formal anterior.",
        action: "Revise suas últimas candidaturas e confirme se pelo menos metade delas mira o nível acima do seu cargo atual.",
      },
      {
        title: "Traduza responsabilidades informais em títulos que o mercado reconhece",
        body: "Se você já exerce funções de nível maior sem o título formal (liderou um projeto, mentorou colegas, tomou decisões de mais impacto), isso deve aparecer no currículo com o vocabulário do nível que você está buscando, não do seu cargo formal atual.",
        action: "Revise seu currículo e ajuste a descrição das suas últimas experiências usando o vocabulário do cargo-alvo.",
      },
      {
        title: "Use a rede para descobrir vagas de nível maior antes delas serem publicadas",
        body: "Vagas de nível sênior/especialista costumam circular por indicação antes de ir para os portais abertos. Avisar sua rede que você busca especificamente crescimento de nível (não só 'uma vaga nova') direciona melhor as indicações que você recebe.",
        action: "Avise 5-10 contatos da sua rede que você está buscando especificamente um cargo de nível acima do atual.",
      },
      {
        title: "Prepare-se para provar senioridade em entrevista, não só listar experiência",
        body: "Entrevistas para cargos de nível maior costumam incluir perguntas de julgamento e tomada de decisão ('como você priorizaria X com recursos limitados?'), não só perguntas sobre o que você já fez. Praticar esse tipo de resposta pesa mais do que decorar o currículo.",
        action: "Treine 2-3 respostas para perguntas de julgamento/priorização típicas do cargo de nível acima que você está buscando.",
      },
      {
        title: "Não subestime o peso da pesquisa salarial ao mirar um nível acima",
        body: "A faixa salarial muda de forma significativa entre níveis, e pedir abaixo do praticado no mercado por insegurança é um erro comum em quem está saltando de nível pela primeira vez.",
        action: "Pesquise a faixa salarial de mercado para o cargo de nível acima antes de definir sua pretensão salarial.",
      },
    ],
  },
  {
    key: "negociacao",
    label: "Negociação de cargo e salário",
    intro:
      "Seja na promoção interna, seja numa proposta externa, negociar o salto de nível é diferente de negociar um reajuste comum, o valor em jogo é maior e a conversa exige preparo específico.",
    tips: [
      {
        title: "Nunca aceite a primeira proposta sem pelo menos uma contraproposta",
        body: "Tanto em promoções internas quanto em propostas externas, a primeira oferta raramente é a melhor que a empresa pode dar. Uma contraproposta bem fundamentada, mesmo que modesta, costuma ser bem recebida e raramente prejudica a relação.",
        action: "Da próxima vez que receber uma proposta de promoção ou oferta externa, prepare uma contraproposta antes de responder.",
      },
      {
        title: "Baseie o pedido em dados de mercado, não só em vontade pessoal",
        body: "'Acho que mereço mais' convence menos do que 'a faixa de mercado para esse cargo está entre X e Y, segundo [fonte]'. Dados externos tiram a negociação do campo emocional e colocam no campo objetivo.",
        action: "Reúna 2-3 referências de faixa salarial de mercado (sites de salário, conversas de rede) antes de negociar.",
      },
      {
        title: "Negocie o pacote completo, não só o salário-base",
        body: "Bônus, participação nos lucros, benefícios, remote/híbrido e orçamento de desenvolvimento fazem parte do pacote e às vezes têm mais espaço de negociação do que o salário-base isolado.",
        action: "Liste todos os itens do pacote (além do salário-base) que fazem sentido negociar na sua situação.",
      },
      {
        title: "Peça tudo por escrito antes de decidir",
        body: "Promessas verbais de reajuste futuro ('no próximo ciclo a gente ajusta') têm pouco valor prático se não estiverem documentadas. Pedir isso por escrito, de forma educada, é legítimo e comum.",
        action: "Se receber uma promessa de ajuste futuro, peça para registrá-la por e-mail ou documento formal.",
      },
      {
        title: "Tenha um piso e um teto definidos antes de entrar na conversa",
        body: "Entrar na negociação sem número mínimo aceitável definido aumenta a chance de aceitar algo abaixo do que você precisa, só pela pressão do momento da conversa.",
        action: "Defina, antes da próxima negociação, o valor mínimo que você aceitaria e o valor ideal que você buscaria.",
      },
    ],
  },
  {
    key: "senioridade_real",
    label: "Construir senioridade de verdade",
    intro:
      "O título do cargo é só o reflexo formal de algo que precisa existir na prática antes: escopo maior, autonomia real e capacidade de resolver problemas mais ambíguos. Sem isso, mesmo quem consegue o título novo tende a sentir o peso do 'síndrome do impostor' logo em seguida.",
    tips: [
      {
        title: "Aumente a ambiguidade dos problemas que você resolve",
        body: "Cargos juniores resolvem problemas bem definidos; cargos seniores lidam com problemas ambíguos, sem solução óbvia de antemão. Buscar ativamente esse tipo de desafio, mesmo sem pedido explícito, é treino direto para o próximo nível.",
        action: "Identifique um problema ambíguo (sem solução clara) no seu time e proponha uma forma de atacá-lo.",
      },
      {
        title: "Desenvolva a habilidade de influenciar sem autoridade formal",
        body: "Convencer colegas e outras áreas a seguir uma direção, mesmo sem ser o chefe deles, é uma competência central de senioridade, e raramente é ensinada formalmente, precisa ser praticada.",
        action: "Na próxima decisão em que você discordar de algo, pratique defender sua posição com argumentos, não só concordar por comodidade.",
      },
      {
        title: "Aprenda a delegar e revisar, não só executar",
        body: "Quem sobe de nível deixa de ser avaliado só pelo que executa sozinho e passa a ser avaliado também pelo que consegue multiplicar através de outras pessoas, orientar, revisar e dar feedback fazem parte disso.",
        action: "Se houver alguém mais júnior no seu time, ofereça orientação ativa em uma tarefa nas próximas semanas.",
      },
      {
        title: "Fique confortável em tomar decisões com informação incompleta",
        body: "Esperar 100% de certeza antes de decidir é comportamento júnior. Senioridade envolve decidir com informação parcial, assumir o risco calculado e ajustar o curso conforme surgem novos dados.",
        action: "Na próxima decisão pequena, evite adiar por falta de 100% de certeza, decida com o que você já tem e ajuste depois se precisar.",
      },
      {
        title: "Busque visibilidade além do seu time direto",
        body: "Senioridade também é reconhecimento, apresentar resultados em reuniões maiores, escrever documentação que outras áreas usam ou participar de decisões multi-time aumenta a visibilidade do seu trabalho na organização.",
        action: "Identifique uma oportunidade de apresentar um resultado seu para além do seu time direto nas próximas semanas.",
      },
    ],
  },
];

export const CAREER_GROWTH_GUIDE_BY_SECTION = Object.fromEntries(
  CAREER_GROWTH_GUIDE.map((s) => [s.key, s])
) as Record<CareerGrowthGuideSection, CareerGrowthGuideSectionContent>;

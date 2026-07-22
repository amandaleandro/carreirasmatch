export type InternshipGuideSection =
  | "conseguir_estagio"
  | "efetivacao"
  | "portfolio_github"
  | "linkedin"
  | "cursos_certificacoes"
  | "financeiro";

export type InternshipGuideTip = {
  title: string;
  body: string;
  action: string;
};

export type InternshipGuideSectionContent = {
  key: InternshipGuideSection;
  label: string;
  intro: string;
  tips: InternshipGuideTip[];
};

export const INTERNSHIP_GUIDE: InternshipGuideSectionContent[] = [
  {
    key: "conseguir_estagio",
    label: "Conseguir o 1º estágio",
    intro:
      "A maior parte das vagas de estágio não chega até você por acaso, elas estão concentradas em alguns canais específicos. Concentre energia neles antes de sair aplicando em qualquer lugar.",
    tips: [
      {
        title: "Cadastre-se nos grandes agentes de integração",
        body: "CIEE, Nube, IEL e Instituto Euvaldo Lodi concentram boa parte das vagas de estágio no Brasil, muitas vezes já ligadas à sua universidade ou curso técnico. Empresas publicam vagas exclusivamente nessas plataformas.",
        action: "Crie seu cadastro completo (com currículo atualizado) em pelo menos 2 desses agentes ainda esta semana.",
      },
      {
        title: "Ative os filtros de vaga em plataformas gerais",
        body: "LinkedIn, Gupy, Vagas.com e Trampos.co permitem filtrar por \"estágio\" e configurar alertas automáticos por e-mail para não perder novas publicações.",
        action: "Configure um alerta de vaga com a palavra-chave \"estágio\" + sua área no LinkedIn e em pelo menos uma dessas plataformas.",
      },
      {
        title: "Fale com o núcleo de estágios da sua instituição",
        body: "Muitas faculdades e escolas técnicas têm parcerias diretas com empresas que nem chegam a ser publicadas nos grandes portais. Esse canal costuma ter menos concorrência.",
        action: "Visite ou envie um e-mail ao núcleo de estágios/coordenação do seu curso perguntando sobre vagas abertas.",
      },
      {
        title: "Prepare-se para o processo seletivo de estágio",
        body: "Processos de estágio costumam ter etapas próprias: teste online (lógica, português, inglês básico), dinâmica em grupo e entrevista com o gestor. Eles avaliam mais potencial e atitude do que experiência prévia.",
        action: "Antes da próxima candidatura, pratique um teste de lógica online e prepare respostas curtas para \"fale sobre você\" e \"por que quer estagiar aqui\".",
      },
      {
        title: "Candidate-se em volume, mas com currículo ajustado por vaga",
        body: "Estágio tem alta concorrência: candidatar-se a poucas vagas reduz muito sua chance. Mas enviar o mesmo currículo genérico para todas também reduz a taxa de resposta.",
        action: "Defina uma meta semanal de candidaturas (ex: 5 por semana) e ajuste ao menos o resumo do currículo para cada vaga.",
      },
    ],
  },
  {
    key: "efetivacao",
    label: "Como ser efetivado",
    intro:
      "Boa parte das empresas contrata efetivos entre os próprios estagiários, é mais barato e menos arriscado do que contratar alguém de fora. Esses comportamentos aumentam de verdade a chance de virar proposta de efetivo.",
    tips: [
      {
        title: "Entregue o básico com consistência antes de tentar se destacar",
        body: "Chegar no horário, cumprir prazos e entregar o que foi pedido sem precisar de cobrança é o que garante a confiança inicial. Sem isso, iniciativa extra não compensa.",
        action: "Nas próximas duas semanas, revise cada entrega antes de mandar e confirme que atende exatamente o que foi pedido.",
      },
      {
        title: "Peça feedback com frequência, não só na avaliação formal",
        body: "Perguntar \"como estou indo?\" periodicamente ao seu supervisor mostra interesse em melhorar e evita que pequenos problemas virem grandes só na hora da avaliação final.",
        action: "Marque uma conversa rápida de feedback com seu supervisor ainda este mês, se ainda não tiver uma recorrente.",
      },
      {
        title: "Assuma uma responsabilidade a mais, aos poucos",
        body: "Perguntar se pode ajudar em uma tarefa fora do combinado inicialmente (com moderação) mostra que você pensa além do escopo mínimo do estágio.",
        action: "Identifique uma tarefa do time que você poderia aprender a fazer e pergunte ao responsável se pode acompanhar.",
      },
      {
        title: "Construa relação com o time, não só com quem te supervisiona",
        body: "A decisão de efetivar raramente é só do supervisor direto, costuma envolver a opinião de outras pessoas do time e às vezes do RH. Ser lembrado só por quem manda em você é arriscado.",
        action: "Puxe conversa com alguém de outra área ou nível hierárquico diferente do seu esta semana.",
      },
      {
        title: "Pergunte diretamente sobre a efetivação antes do fim do contrato",
        body: "Muitos estagiários perdem a chance simplesmente por não demonstrarem interesse claro em continuar. Perguntar não compromete nada e sinaliza intenção.",
        action: "Marque no calendário 60 dias antes do fim do contrato de estágio para iniciar essa conversa com o supervisor ou RH.",
      },
    ],
  },
  {
    key: "portfolio_github",
    label: "Portfólio",
    intro:
      "Currículo mostra o que você diz que sabe; portfólio mostra o que você realmente entregou. Isso vale para qualquer área, não só tecnologia: um portfólio simples e bem organizado pesa mais do que muitos itens incompletos.",
    tips: [
      {
        title: "Escolha 2 a 4 trabalhos, não 20",
        body: "Um portfólio com poucos itens bem explicados e finalizados passa mais confiança do que uma lista longa de trabalhos incompletos. Vale projeto de faculdade, TCC, estudo de caso, peça gráfica, plano de aula ou qualquer entrega concreta da sua área.",
        action: "Liste todos os seus trabalhos hoje e escolha os 3 melhores para deixar em destaque.",
      },
      {
        title: "Todo item precisa de um resumo que conta a história",
        body: "Para cada trabalho, responda em poucas frases: qual era o problema ou objetivo, o que você especificamente fez e qual foi o resultado. Quem avalia raramente reproduz o trabalho todo, costuma ler esse resumo.",
        action: "Escolha seu trabalho mais forte e escreva esse resumo em poucas linhas.",
      },
      {
        title: "Projetos de faculdade ou curso também contam",
        body: "Um trabalho de faculdade, TCC ou projeto de curso pode virar item de portfólio, desde que você explique o contexto e o que era esperado dele.",
        action: "Escolha um projeto acadêmico e monte um resumo dele explicando o contexto e o que você fez.",
      },
      {
        title: "Escolha a plataforma certa para a sua área",
        body: "Quem é de tecnologia/dados publica código no GitHub; design usa Behance; pesquisa acadêmica usa Lattes/ResearchGate; a maioria das demais áreas se sai bem com um site simples e gratuito (Notion, Carrd, Canva) ou até um PDF único. O que importa é ter um link fácil de compartilhar, não a plataforma em si.",
        action: "Escolha a plataforma mais usada na sua área e publique os 3 melhores trabalhos nela.",
      },
      {
        title: "Sem trabalhos prontos ainda? Comece por algo pequeno e real",
        body: "Um trabalho pequeno mas concreto (resolver um problema real do dia a dia, montar um estudo de caso, organizar um material) vale mais do que nenhum item no portfólio.",
        action: "Escolha uma tarefa real da sua área e pense em como transformá-la num item de portfólio esta semana.",
      },
    ],
  },
  {
    key: "linkedin",
    label: "LinkedIn do zero",
    intro:
      "Um LinkedIn incompleto praticamente não aparece nas buscas de recrutadores. Estes passos cobrem o mínimo necessário para um perfil de quem está começando a carreira.",
    tips: [
      {
        title: "Foto e capa profissionais, mesmo sem produção",
        body: "Uma foto de rosto nítida, com boa iluminação e fundo neutro já resolve. Perfis sem foto recebem muito menos visualizações de recrutadores.",
        action: "Se ainda não tem, tire ou peça para alguém tirar uma foto de rosto simples ainda hoje e suba no perfil.",
      },
      {
        title: "Headline não é só o seu cargo",
        body: "Em vez de deixar só \"Estudante em [Curso]\", use a headline para dizer o que você busca e sua área de interesse: ex. \"Estudante de Administração buscando estágio em Marketing\".",
        action: "Reescreva sua headline incluindo o que você busca, não só onde estuda.",
      },
      {
        title: "Seção \"Sobre\" conta sua trajetória em poucas linhas",
        body: "Um parágrafo curto explicando quem você é, o que estuda e o que busca ajuda o recrutador a entender seu perfil sem precisar ler o currículo inteiro.",
        action: "Escreva 3-4 frases na seção Sobre respondendo: quem sou, o que estudo, o que busco.",
      },
      {
        title: "Cadastre experiências mesmo sem ter tido emprego formal",
        body: "Projetos de faculdade, monitoria, voluntariado, participação em empresa júnior ou projetos pessoais podem (e devem) entrar como experiência.",
        action: "Adicione pelo menos uma experiência não-formal (projeto, monitoria, voluntariado) na seção de experiências.",
      },
      {
        title: "Construa sua rede aos poucos, com contexto",
        body: "Enviar convites com uma mensagem curta explicando por que quer se conectar (colegas de curso, professores, pessoas da área) gera muito mais aceitação e engajamento do que convites em branco.",
        action: "Envie 5 convites de conexão nesta semana, cada um com uma mensagem curta e específica.",
      },
    ],
  },
  {
    key: "cursos_certificacoes",
    label: "Cursos e certificações",
    intro:
      "Certificados não substituem experiência prática, mas ajudam a preencher currículo e mostrar iniciativa quando você ainda não tem estágio. Priorize cursos gratuitos e relevantes para a sua área, use o campo de curso/área do seu perfil como guia de busca.",
    tips: [
      {
        title: "Comece pelos cursos gratuitos de fundamentos",
        body: "Google Actividate, Microsoft Learn e a Fundação Bradesco (Escola Virtual) oferecem cursos gratuitos com certificado em áreas como tecnologia, marketing digital, gestão e produtividade.",
        action: "Escolha um curso gratuito relacionado à sua área e comece ainda esta semana.",
      },
      {
        title: "Cursos técnicos têm certificações reconhecidas por setor",
        body: "SENAI e SENAC oferecem cursos rápidos e reconhecidos no mercado para áreas técnicas e administrativas, muitas vezes com preço acessível ou gratuito dependendo da unidade.",
        action: "Pesquise o catálogo de cursos do SENAI/SENAC mais próximo da sua área de curso.",
      },
      {
        title: "Idiomas contam pontos, mesmo em nível básico",
        body: "Inglês (mesmo intermediário) aparece como diferencial em boa parte das vagas de estágio, mesmo em áreas que não são diretamente ligadas a idiomas.",
        action: "Se ainda não estuda inglês, comece com um aplicativo gratuito por 15 minutos ao dia.",
      },
      {
        title: "Priorize cursos ligados diretamente à sua área de curso",
        body: "Um certificado alinhado ao que você estuda (ex: planilhas para quem faz Administração, lógica de programação para quem faz TI) pesa mais no currículo do que um certificado genérico e desconectado.",
        action: "Liste 2 certificações que fazem sentido direto com a sua área e coloque prazo para concluir uma delas.",
      },
      {
        title: "Coloque certificados concluídos no currículo e no LinkedIn",
        body: "Um certificado que fica só guardado no e-mail não ajuda em nada, ele precisa aparecer no currículo e na seção de \"Licenças e certificados\" do LinkedIn.",
        action: "Assim que concluir um curso, adicione o certificado no currículo e no LinkedIn no mesmo dia.",
      },
    ],
  },
  {
    key: "financeiro",
    label: "Guia financeiro",
    intro:
      "A bolsa-auxílio de estágio segue regras diferentes de um salário CLT, entender isso evita expectativas erradas e ajuda a organizar as finanças desde o primeiro estágio.",
    tips: [
      {
        title: "Bolsa-auxílio não é salário CLT",
        body: "Estágio (Lei 11.788/2008) não gera vínculo empregatício: não há FGTS, 13º salário nem férias remuneradas garantidos por lei, apenas bolsa-auxílio, recesso remunerado proporcional e, em muitos casos, vale-transporte.",
        action: "Releia seu termo de compromisso de estágio e confirme quais benefícios estão previstos além da bolsa.",
      },
      {
        title: "Separe o dinheiro assim que ele cair na conta",
        body: "Definir mentalmente (ou em contas separadas) quanto é para gastos fixos, quanto é para o dia a dia e quanto é para guardar evita gastar tudo antes do fim do mês.",
        action: "No próximo pagamento, separe uma porcentagem fixa (mesmo pequena) antes de gastar qualquer coisa.",
      },
      {
        title: "Use a calculadora de bolsa-auxílio para comparar propostas",
        body: "Duas propostas de estágio com a mesma bolsa podem valer valores bem diferentes na prática dependendo de vale-transporte, vale-refeição e carga horária.",
        action: "Antes de aceitar uma proposta, compare o valor real por hora considerando bolsa + benefícios na calculadora de bolsa-auxílio.",
      },
      {
        title: "Evite parcelar compras com base no salário do mês seguinte",
        body: "Parcelar vários gastos pequenos compromete boa parte da bolsa do mês seguinte antes mesmo de ela cair na conta, especialmente arriscado em um contrato de prazo determinado como o estágio.",
        action: "Antes de parcelar qualquer compra, pergunte se conseguiria pagar à vista guardando por 2-3 meses.",
      },
      {
        title: "Comece a guardar dinheiro, mesmo que pouco",
        body: "O estágio costuma ser o primeiro contato com dinheiro próprio, criar o hábito de guardar uma quantia pequena todo mês importa mais do que o valor guardado no início.",
        action: "Programe uma transferência automática pequena para uma reserva assim que a bolsa cair na conta.",
      },
    ],
  },
];

export const INTERNSHIP_GUIDE_BY_SECTION = Object.fromEntries(
  INTERNSHIP_GUIDE.map((s) => [s.key, s])
) as Record<InternshipGuideSection, InternshipGuideSectionContent>;

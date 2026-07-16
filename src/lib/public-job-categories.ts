export type PublicJobCategory = {
  slug: string;
  title: string;
  description: string;
  h1: string;
  where: {
    entryLevel?: boolean;
    seniority?: string;
    workModel?: string;
    area?: string;
    q?: string[];
  };
  /**
   * Conteúdo editorial próprio da categoria, renderizado acima da listagem.
   *
   * As vagas em si vêm de fontes externas e são só um trecho + link para o
   * anunciante original; sem este texto a página seria conteúdo replicado, sem
   * nada nosso. Ele também é o que a página tem de indexável e estável, já que
   * a listagem muda a cada coleta.
   *
   * Regra ao editar: nada de número que não dê para sustentar (faixa salarial,
   * porcentagem de mercado, tempo médio de contratação). Orientação qualitativa
   * envelhece bem e não vira alegação falsa.
   */
  editorial: {
    intro: string;
    expectations: string[];
    tip: string;
  };
};

export const PUBLIC_JOB_CATEGORIES: PublicJobCategory[] = [
  {
    slug: "sem-experiencia",
    title: "Vagas sem experiência | CarreirasMatch",
    h1: "Vagas sem experiência",
    description: "Vagas de entrada, primeiro emprego, jovem aprendiz e oportunidades que não exigem experiência.",
    where: { entryLevel: true },
    editorial: {
      intro:
        "Vagas sem experiência são as portas de entrada do mercado: posições em que a empresa aceita contratar alguém que ainda não trabalhou na função e assume o treinamento. Reunimos aqui anúncios de várias fontes que sinalizam não exigir experiência prévia, incluindo primeiro emprego, aprendizagem e funções operacionais de entrada.",
      expectations: [
        "A maioria pede ensino médio completo ou em andamento, e algumas nem isso.",
        "Disponibilidade de horário costuma pesar mais do que qualquer item do currículo.",
        "Processos tendem a ser rápidos, com entrevista única ou dinâmica em grupo.",
      ],
      tip: "Sem experiência formal, o currículo se sustenta em outras coisas: trabalho voluntário, projetos de curso, atividades de família e cursos livres contam. O que não conta é deixar a página quase em branco - descreva o que você fez, mesmo que não tenha sido um emprego.",
    },
  },
  {
    slug: "primeiro-emprego",
    title: "Vagas de primeiro emprego | CarreirasMatch",
    h1: "Vagas para primeiro emprego",
    description: "Oportunidades para quem está começando a carreira.",
    where: {
      entryLevel: true,
      q: ["primeiro emprego", "primeiro trabalho", "sem experiência", "sem experiencia", "aprendiz"],
    },
    editorial: {
      intro:
        "O primeiro emprego é menos sobre o que você já sabe e mais sobre o que a empresa acredita que você vai aprender. As vagas desta lista mencionam explicitamente primeiro emprego, ausência de experiência ou aprendizagem no texto do anúncio.",
      expectations: [
        "Contratação em regime CLT na maior parte dos casos, com registro em carteira.",
        "Treinamento inicial oferecido pela empresa, às vezes em formato de turma.",
        "Funções de apoio: auxiliar, assistente, operador, atendente.",
      ],
      tip: "Candidate-se mesmo quando faltar um requisito ou outro. Anúncios de entrada costumam listar o candidato ideal, não o mínimo aceitável, e a concorrência real é menor do que a lista de requisitos sugere.",
    },
  },
  {
    slug: "estagio",
    title: "Vagas de estágio | CarreirasMatch",
    h1: "Vagas de estágio",
    description: "Vagas de estágio e trainee coletadas automaticamente.",
    where: { seniority: "Estagio" },
    editorial: {
      intro:
        "O estágio é um vínculo regido pela Lei 11.788/2008: exige matrícula ativa em curso compatível, tem carga horária limitada e precisa de um plano de atividades ligado à sua formação. Na prática, é o formato mais comum de entrada para quem está estudando.",
      expectations: [
        "Comprovação de matrícula e previsão de formatura são pedidas quase sempre.",
        "Jornada reduzida (em geral 4 a 6 horas), compatível com o horário de aula.",
        "Bolsa-auxílio e auxílio-transporte no lugar de salário CLT.",
      ],
      tip: "Estágio não precisa ser na sua área dos sonhos para valer a pena, mas precisa ter relação com o curso - é o que a lei exige e é o que faz a experiência contar no currículo depois. Desconfie de vaga de estágio que descreve tarefas sem nenhum vínculo com a sua formação.",
    },
  },
  {
    slug: "jovem-aprendiz",
    title: "Vagas de jovem aprendiz | CarreirasMatch",
    h1: "Vagas de jovem aprendiz",
    description: "Vagas de jovem aprendiz e aprendizagem para entrada no mercado.",
    where: { q: ["jovem aprendiz", "menor aprendiz", "aprendiz"] },
    editorial: {
      intro:
        "O programa de aprendizagem, previsto na Lei 10.097/2000, combina trabalho e curso de formação profissional. Empresas de médio e grande porte têm cota legal de aprendizes, o que mantém essas vagas circulando o ano inteiro.",
      expectations: [
        "Faixa etária definida por lei, com regras específicas para menores de 18 anos.",
        "Contrato por prazo determinado, com registro em carteira e direitos de CLT.",
        "Parte da carga horária é curso teórico, geralmente em instituição parceira.",
      ],
      tip: "A aprendizagem é uma das poucas entradas no mercado desenhadas para quem não tem currículo nenhum - a empresa já espera isso. O que ela avalia é frequência escolar e comprometimento, então leve o histórico escolar a sério no processo.",
    },
  },
  {
    slug: "home-office",
    title: "Vagas home office | CarreirasMatch",
    h1: "Vagas home office",
    description: "Vagas remotas e oportunidades de trabalho de casa.",
    where: { workModel: "Remoto" },
    editorial: {
      intro:
        "Vagas home office são as que o anúncio classifica como remotas, seja integralmente ou em modelo híbrido com poucos dias presenciais. A concorrência costuma ser maior do que em vagas presenciais, porque a posição deixa de ser limitada pela cidade.",
      expectations: [
        "Autonomia e comunicação escrita pesam mais do que em funções presenciais.",
        "Muitas vagas remotas exigem infraestrutura própria: internet estável e um espaço de trabalho.",
        "Alguns anúncios dizem remoto mas restringem a região por causa de encontros ocasionais.",
      ],
      tip: "Cuidado com o golpe do trabalho em casa. Vaga legítima não cobra taxa de cadastro, não pede pagamento por treinamento e não faz contratação inteira por aplicativo de mensagem. Se pedirem dinheiro em qualquer etapa, não é emprego.",
    },
  },
  {
    slug: "administrativo",
    title: "Vagas administrativas | CarreirasMatch",
    h1: "Vagas administrativas",
    description: "Vagas administrativas, auxiliares e assistentes.",
    where: { area: "Administrativo" },
    editorial: {
      intro:
        "A área administrativa sustenta a rotina de qualquer empresa: documentos, planilhas, agendas, cadastros e o contato entre setores. É uma das áreas com mais vagas de entrada e uma das que mais aceita migração de outras carreiras.",
      expectations: [
        "Pacote Office, especialmente Excel, aparece na maioria dos anúncios.",
        "Organização e atenção a detalhe são o que o gestor realmente avalia.",
        "Progressão comum: auxiliar administrativo, assistente, analista.",
      ],
      tip: "Excel é o divisor de águas nessa área. Sair do básico e dominar procv, tabela dinâmica e filtros muda a faixa de vaga a que você consegue se candidatar, e dá para aprender de graça.",
    },
  },
  {
    slug: "atendimento",
    title: "Vagas de atendimento ao cliente | CarreirasMatch",
    h1: "Vagas de atendimento ao cliente",
    description: "Vagas de atendimento, suporte ao cliente, recepção e relacionamento.",
    where: {
      q: ["atendimento", "atendente", "recepcionista", "recepção", "recepcao", "call center", "sac", "televendas"],
    },
    editorial: {
      intro:
        "Atendimento reúne funções muito diferentes sob o mesmo guarda-chuva: recepção, SAC, call center, suporte e relacionamento. O que elas têm em comum é o contato direto com o cliente e o alto volume de contratação de entrada.",
      expectations: [
        "Escalas variadas, incluindo fins de semana em operações que atendem o consumidor final.",
        "Metas de tempo de atendimento e satisfação são comuns em call center.",
        "Boa comunicação e paciência valem mais do que formação específica.",
      ],
      tip: "Atendimento é uma porta de entrada eficiente, mas leia o anúncio com atenção: recepção, SAC e televendas têm rotinas e pressões bem distintas. Televendas tem meta de venda, e nem todo mundo que quer atender clientes quer vender.",
    },
  },
  {
    slug: "comercial",
    title: "Vagas comerciais e de vendas | CarreirasMatch",
    h1: "Vagas comerciais e de vendas",
    description: "Vagas comerciais, vendas internas, consultoria comercial e SDR.",
    where: { area: "Vendas" },
    editorial: {
      intro:
        "A área comercial é uma das poucas em que resultado importa mais do que diploma, o que a torna acessível para quem está mudando de carreira. Inclui vendas internas, vendas externas, consultoria comercial e SDR (prospecção).",
      expectations: [
        "Remuneração frequentemente dividida entre fixo e variável por comissão.",
        "Metas claras e cobrança de números fazem parte da rotina.",
        "SDR e vendas internas costumam ser as portas de entrada da área.",
      ],
      tip: "Confira sempre a proporção entre fixo e variável antes de aceitar. Uma vaga com fixo baixo e comissão alta é ótima em mês bom e difícil em mês ruim - e o anúncio raramente deixa isso claro, então pergunte na entrevista.",
    },
  },
  {
    slug: "marketing",
    title: "Vagas de marketing | CarreirasMatch",
    h1: "Vagas de marketing",
    description: "Vagas de marketing digital, social media, conteúdo e campanhas.",
    where: { area: "Marketing" },
    editorial: {
      intro:
        "Marketing hoje é majoritariamente digital: social media, conteúdo, tráfego pago, e-mail e análise de resultado. É uma área que valoriza portfólio e prova de trabalho tanto quanto formação.",
      expectations: [
        "Portfólio ou exemplos de trabalho são pedidos com frequência.",
        "Ferramentas aparecem nominalmente nos anúncios: Meta Ads, Google Ads, RD Station, Analytics.",
        "Funções de entrada comuns: assistente de marketing, social media, auxiliar de conteúdo.",
      ],
      tip: "Em marketing você pode construir a experiência antes de ser contratada. Gerir a rede social de um negócio pequeno, criar um blog ou rodar uma campanha própria vira portfólio - e portfólio abre porta que currículo sozinho não abre.",
    },
  },
  {
    slug: "financeiro",
    title: "Vagas na área financeira | CarreirasMatch",
    h1: "Vagas na área financeira",
    description: "Vagas financeiras, contas a pagar, análise financeira e administrativo financeiro.",
    where: { area: "Financeiro" },
    editorial: {
      intro:
        "A área financeira cuida do dinheiro que entra e sai: contas a pagar e receber, conciliação, faturamento, custos e análise. É uma área que premia consistência e método, e onde erro tem consequência visível.",
      expectations: [
        "Excel em nível intermediário ou avançado é praticamente obrigatório.",
        "Familiaridade com ERP (Totvs, SAP, Sankhya e similares) aparece bastante.",
        "Entrada típica: auxiliar de contas a pagar, auxiliar financeiro, assistente.",
      ],
      tip: "Não é preciso ser formada em contabilidade para entrar. Contas a pagar e faturamento aceitam perfil administrativo com Excel, e é de dentro que a maioria das pessoas migra para análise financeira depois.",
    },
  },
  {
    slug: "logistica",
    title: "Vagas de logística | CarreirasMatch",
    h1: "Vagas de logística",
    description: "Vagas de logística, estoque, expedição e operações.",
    where: { area: "Logistica" },
    editorial: {
      intro:
        "Logística move produto: recebimento, estoque, separação, expedição e transporte. É uma área com volume alto de vagas operacionais de entrada e caminhos claros de crescimento para quem fica.",
      expectations: [
        "Muitas vagas operam em turnos, incluindo noturno, com adicional.",
        "Parte das funções exige esforço físico ou certificação específica, como empilhadeira.",
        "Progressão comum: auxiliar de estoque, conferente, líder, supervisor.",
      ],
      tip: "Certificações curtas destravam vaga nessa área rápido. O curso de operador de empilhadeira é um exemplo: dura poucos dias e muda a faixa de vaga que você acessa - muito mais eficiente do que esperar experiência aparecer.",
    },
  },
  {
    slug: "tecnologia",
    title: "Vagas de tecnologia | CarreirasMatch",
    h1: "Vagas de tecnologia",
    description: "Vagas de tecnologia, desenvolvimento, dados e suporte técnico.",
    where: { area: "Tecnologia" },
    editorial: {
      intro:
        "Tecnologia vai muito além de programação: suporte técnico, infraestrutura, dados, QA e produto fazem parte da área. Suporte e help desk seguem sendo as portas de entrada mais acessíveis para quem não vem de formação técnica.",
      expectations: [
        "Vagas de desenvolvimento costumam pedir portfólio ou repositório público.",
        "Suporte técnico e help desk aceitam perfil de entrada com mais frequência.",
        "É a área com maior proporção de vagas remotas.",
      ],
      tip: "Cuidado com a promessa de virar dev em três meses e dobrar de salário. A transição para tecnologia é real e acontece, mas costuma passar por suporte, estágio ou júnior antes - e quem vende atalho garantido está vendendo curso, não carreira.",
    },
  },
];

export function findPublicJobCategory(slug: string): PublicJobCategory | undefined {
  return PUBLIC_JOB_CATEGORIES.find((category) => category.slug === slug);
}

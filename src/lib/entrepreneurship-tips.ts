export type EntrepreneurshipStage = "ideia" | "primeiros_passos" | "formalizacao" | "crescimento";

export type EntrepreneurshipTip = {
  title: string;
  body: string;
  action: string;
};

export type EntrepreneurshipStageContent = {
  key: EntrepreneurshipStage;
  label: string;
  intro: string;
  tips: EntrepreneurshipTip[];
};

export const ENTREPRENEURSHIP_GUIDE: EntrepreneurshipStageContent[] = [
  {
    key: "ideia",
    label: "Tenho uma ideia",
    intro:
      "Antes de gastar tempo ou dinheiro, o objetivo é testar se alguém pagaria pela sua ideia — sem precisar construir tudo primeiro.",
    tips: [
      {
        title: "Valide antes de construir",
        body: "A maioria dos negócios que fecham cedo gastaram meses criando um produto que ninguém pediu. Antes de montar qualquer coisa, converse com 10 pessoas do público que você imagina atender e pergunte como elas resolvem esse problema hoje.",
        action: "Faça uma lista de 10 pessoas para entrevistar essa semana sobre o problema que você quer resolver.",
      },
      {
        title: "Comece pequeno e sem custo",
        body: "Você não precisa de CNPJ, site ou estoque para testar uma ideia. Um formulário grátis, uma conversa no WhatsApp ou um post nas redes já servem para medir interesse real antes de investir.",
        action: "Descreva sua ideia em 3 frases e publique/compartilhe com pelo menos 20 pessoas para medir reação.",
      },
      {
        title: "Identifique quem realmente sente a dor",
        body: "\"Todo mundo\" não é público-alvo. Quanto mais específico o público (idade, situação, necessidade), mais fácil é criar algo que essas pessoas realmente queiram pagar.",
        action: "Escreva uma frase: \"Meu produto ajuda [quem] a resolver [problema] quando [situação]\".",
      },
    ],
  },
  {
    key: "primeiros_passos",
    label: "Primeiros passos",
    intro:
      "Com a ideia validada, é hora de organizar o mínimo necessário para vender e aprender rápido com os primeiros clientes reais.",
    tips: [
      {
        title: "Monte um MVP, não o produto perfeito",
        body: "MVP (produto mínimo viável) é a versão mais simples possível que já resolve o problema central. Detalhes de acabamento, design ou funcionalidades extras podem esperar até você ter clientes pagantes de verdade.",
        action: "Liste o que é essencial para a primeira venda e corte tudo que não for indispensável.",
      },
      {
        title: "Precifique olhando custo e valor, não só concorrência",
        body: "Preço baixo demais no início parece atrair mais clientes, mas costuma inviabilizar o negócio. Calcule seu custo real (tempo, material, taxas) e o valor que o cliente ganha ao resolver o problema — não só o que o concorrente cobra.",
        action: "Calcule seu custo por unidade/hora e defina uma margem mínima antes de fechar o preço final.",
      },
      {
        title: "Sua primeira venda vem da sua rede",
        body: "Antes de investir em anúncios, as primeiras vendas costumam vir de conhecidos, redes sociais pessoais e indicações. É a forma mais barata de testar se o produto realmente resolve o problema de alguém dispostas a pagar.",
        action: "Liste 15 contatos pessoais que podem ser clientes ou indicar clientes, e mande uma mensagem direta hoje.",
      },
      {
        title: "Guarde todo feedback, mesmo o ruim",
        body: "Reclamações e \"não, obrigado\" ensinam mais do que elogios. Anotar objeções recorrentes ajuda a ajustar o produto, o preço ou a forma de vender antes de escalar o negócio.",
        action: "Crie uma lista simples (papel ou planilha) para registrar toda objeção ou reclamação de clientes.",
      },
    ],
  },
  {
    key: "formalizacao",
    label: "Formalização",
    intro:
      "Formalizar o negócio protege você legalmente e abre portas (emitir nota fiscal, vender para empresas, abrir conta PJ) — mas o momento certo é quando já existe alguma venda recorrente.",
    tips: [
      {
        title: "MEI costuma ser o ponto de partida mais simples",
        body: "Para faturamento de até R$ 81 mil por ano e atividades permitidas, o MEI (Microempreendedor Individual) tem abertura gratuita, custo mensal baixo e já permite emitir nota fiscal e ter CNPJ.",
        action: "Verifique se sua atividade está na lista de ocupações permitidas para MEI antes de abrir.",
      },
      {
        title: "Separe finanças pessoais das do negócio desde o início",
        body: "Misturar dinheiro pessoal e do negócio é um dos erros mais comuns de quem está começando — dificulta saber se o negócio está dando lucro de verdade.",
        action: "Abra uma conta (ou carteira) exclusiva para as movimentações do negócio, mesmo antes do CNPJ.",
      },
      {
        title: "Entenda as obrigações básicas antes de formalizar",
        body: "Depois de formalizado, existem obrigações mensais (guias, declaração anual) que, se ignoradas, geram multa. Não é preciso saber tudo sozinho — um contador (mesmo online, de baixo custo) resolve isso rápido.",
        action: "Pesquise 2 opções de contabilidade online para MEI/ME e compare o custo mensal.",
      },
    ],
  },
  {
    key: "crescimento",
    label: "Crescimento",
    intro:
      "Depois que o negócio já vende de forma consistente, o foco muda para repetir o que funciona e não travar sozinho em todas as etapas.",
    tips: [
      {
        title: "Meça o que importa, não só o faturamento",
        body: "Faturamento sem olhar custo pode esconder um negócio no prejuízo. Acompanhar margem de lucro, custo de aquisição de cliente e recompra dá uma visão muito mais real da saúde do negócio.",
        action: "Defina 3 números para acompanhar toda semana: vendas, custo e lucro líquido aproximado.",
      },
      {
        title: "Documente processos antes de contratar ou terceirizar",
        body: "Se só você sabe como o negócio funciona, ele não escala. Escrever o passo a passo das tarefas recorrentes facilita delegar sem perder qualidade.",
        action: "Escolha 1 tarefa recorrente do negócio e escreva o passo a passo como se fosse ensinar outra pessoa.",
      },
      {
        title: "Reinvista antes de tirar tudo de lucro",
        body: "Negócios que crescem de forma sustentável costumam reinvestir parte do lucro em estoque, ferramentas ou marketing antes de distribuir tudo como retirada pessoal.",
        action: "Defina um percentual fixo do lucro mensal para reinvestir no negócio antes de qualquer retirada.",
      },
    ],
  },
];

export const ENTREPRENEURSHIP_GUIDE_BY_STAGE = Object.fromEntries(
  ENTREPRENEURSHIP_GUIDE.map((s) => [s.key, s])
) as Record<EntrepreneurshipStage, EntrepreneurshipStageContent>;

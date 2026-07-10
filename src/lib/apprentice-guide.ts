export type ApprenticeGuideSection =
  | "direitos_deveres"
  | "comportamento"
  | "rendimento_escolar"
  | "economia_financeira"
  | "efetivacao";

export type ApprenticeGuideTip = {
  title: string;
  body: string;
  action: string;
};

export type ApprenticeGuideSectionContent = {
  key: ApprenticeGuideSection;
  label: string;
  intro: string;
  tips: ApprenticeGuideTip[];
};

export const APPRENTICE_GUIDE: ApprenticeGuideSectionContent[] = [
  {
    key: "direitos_deveres",
    label: "Direitos e deveres",
    intro:
      "O contrato de aprendizagem é regido pela Lei 10.097/2000 (Lei da Aprendizagem) e tem regras específicas, diferentes de um emprego comum ou de um estágio. Conhecer essas regras evita abuso e também mostra que você leva o programa a sério.",
    tips: [
      {
        title: "Contrato por prazo determinado, no máximo 2 anos",
        body: "O contrato de aprendizagem tem prazo máximo de 2 anos (exceto para aprendiz com deficiência, que pode ser por prazo indeterminado). Carteira assinada, com todos os direitos trabalhistas proporcionais: FGTS (2%), férias, 13º salário e descanso semanal remunerado.",
        action: "Confira se o contrato assinado menciona o prazo, o salário mínimo-hora e o depósito de FGTS.",
      },
      {
        title: "Jornada reduzida e compatível com a escola",
        body: "A carga horária máxima é de 6 horas diárias (podendo chegar a 8h para quem já concluiu o ensino fundamental, se computadas as horas de aprendizagem teórica). O horário de trabalho não pode atrapalhar a frequência e o desempenho escolar.",
        action: "Anote o horário de aula e o horário de trabalho lado a lado e confirme que não há sobreposição.",
      },
      {
        title: "Formação técnico-profissional obrigatória",
        body: "Além da prática na empresa, você tem direito (e dever) de frequentar um curso teórico em uma entidade formadora (SENAI, SENAC, ONG habilitada, escola técnica). Faltar sem justificativa nas aulas teóricas pode ser considerado falta grave.",
        action: "Guarde o calendário de aulas teóricas junto com o de trabalho para não perder nenhuma.",
      },
      {
        title: "Deveres também existem: pontualidade e respeito às normas",
        body: "Assim como você tem direitos garantidos por lei, também tem deveres: cumprir horários, seguir as normas internas da empresa, tratar colegas e superiores com respeito e se dedicar tanto à parte prática quanto à teórica.",
        action: "Releia o regimento interno ou manual do aprendiz da empresa (se existir) para saber as regras específicas do seu contrato.",
      },
      {
        title: "Rescisão tem regras diferentes de um contrato comum",
        body: "A empresa só pode encerrar o contrato antes do prazo em situações específicas: desempenho insuficiente, falta disciplinar grave, falta injustificada às aulas teóricas, pedido do próprio aprendiz ou quando ele completa 24 anos (exceto aprendiz com deficiência).",
        action: "Se for desligado antes do prazo, peça por escrito o motivo — isso ajuda a confirmar se a rescisão seguiu a lei.",
      },
    ],
  },
  {
    key: "comportamento",
    label: "Como se comportar",
    intro:
      "É normal se sentir inseguro no primeiro contato com o ambiente de trabalho. Esses comportamentos básicos costumam pesar mais do que técnica na avaliação de um aprendiz.",
    tips: [
      {
        title: "Pontualidade é o primeiro sinal que as pessoas notam",
        body: "Chegar no horário (ou alguns minutos antes) mostra comprometimento antes mesmo de você abrir a boca. Atrasos recorrentes, mesmo pequenos, costumam pesar mais do que erros técnicos na avaliação de um aprendiz.",
        action: "Defina um alarme para sair de casa com 10-15 minutos de folga extra nos primeiros meses.",
      },
      {
        title: "Peça ajuda em vez de travar sozinho",
        body: "Ninguém espera que você saiba tudo. Pedir ajuda de forma clara e objetiva (\"não entendi essa parte, pode me explicar de novo?\") é visto como maturidade, não como fraqueza. O erro que pesa é tentar esconder que não entendeu e entregar algo errado.",
        action: "Na próxima dúvida, formule a pergunta antes de perguntar: o que exatamente você não entendeu?",
      },
      {
        title: "Celular e redes sociais: só nos horários combinados",
        body: "Usar celular para assuntos pessoais durante o expediente é um dos motivos mais comuns de advertência para aprendizes. Reserve o uso para o horário de intervalo, mesmo que outros colegas façam diferente.",
        action: "Guarde o celular no silencioso e fora de vista durante o horário de trabalho.",
      },
      {
        title: "Observe antes de agir em tarefas novas",
        body: "Em vez de tentar adivinhar como fazer algo novo, observe como colegas mais experientes fazem e pergunte o passo a passo antes de executar sozinho. Isso evita retrabalho e mostra que você é cuidadoso.",
        action: "Na próxima tarefa nova, peça para acompanhar alguém fazendo uma vez antes de fazer sozinho.",
      },
      {
        title: "Feedback é ferramenta, não crítica pessoal",
        body: "Supervisores costumam dar feedback direto para ajudar você a melhorar rápido, já que o programa tem prazo. Ouvir sem se fechar e perguntar \"como eu posso melhorar isso?\" é o que diferencia quem cresce rápido no programa.",
        action: "Da próxima vez que receber uma correção, anote em vez de só concordar de cabeça — ajuda a não repetir o erro.",
      },
    ],
  },
  {
    key: "rendimento_escolar",
    label: "Rendimento escolar",
    intro:
      "Conciliar trabalho e escola é o maior desafio prático da aprendizagem. A lei já garante horário compatível — mas a organização do seu tempo faz toda a diferença no resultado.",
    tips: [
      {
        title: "Tenha uma agenda única para escola e trabalho",
        body: "Usar dois calendários separados (um mental para escola, outro para o trabalho) é a forma mais comum de perder prazos. Coloque provas, entregas de trabalho, horário de aula teórica e escala de trabalho no mesmo lugar.",
        action: "Escolha um único calendário (papel ou celular) e lance essa semana todos os compromissos de escola e trabalho juntos.",
      },
      {
        title: "Estude em blocos curtos, não só na véspera da prova",
        body: "Com rotina mais cheia, estudar tudo de última hora fica mais difícil. Blocos de 25-30 minutos de estudo focado, distribuídos ao longo da semana, rendem mais do que uma sessão longa e cansada na véspera.",
        action: "Reserve 2 blocos de 30 minutos por semana, em dias fixos, só para revisar o conteúdo da escola.",
      },
      {
        title: "Avise a escola e a empresa sobre datas importantes com antecedência",
        body: "Provas, conselhos de classe e entrega de trabalhos importantes devem ser avisados à empresa com antecedência — a lei protege seu direito de frequentar a escola, mas isso funciona melhor quando você já avisa com tempo, não em cima da hora.",
        action: "No início de cada bimestre, avise seu supervisor sobre as datas de prova já divulgadas pela escola.",
      },
      {
        title: "Se o cansaço estiver afetando as notas, fale antes de piorar",
        body: "É comum o rendimento cair nos primeiros meses de adaptação. Se isso acontecer, converse com a família, a escola e, se necessário, com a entidade formadora — ajustar rotina de sono e estudo cedo evita que o problema fique maior.",
        action: "Se notar 2 notas seguidas caindo, converse com um adulto responsável (família ou coordenador) ainda essa semana.",
      },
      {
        title: "Use o fim de semana para organizar a semana seguinte, não só descansar",
        body: "Reservar 20-30 minutos no domingo para revisar o que vem pela frente (provas, escala de trabalho, tarefas) reduz a sensação de estar sempre correndo atrás durante a semana.",
        action: "Escolha um horário fixo no fim de semana para revisar a agenda da semana seguinte.",
      },
    ],
  },
  {
    key: "economia_financeira",
    label: "Economia financeira",
    intro:
      "Receber o primeiro salário costuma vir sem nenhuma preparação sobre como lidar com dinheiro. Esses hábitos simples evitam os erros mais comuns de quem começa a ganhar dinheiro agora.",
    tips: [
      {
        title: "Separe o dinheiro assim que ele cair na conta",
        body: "Antes de gastar qualquer coisa, divida mentalmente (ou em contas/carteiras separadas) o quanto é para gastos do dia a dia, quanto é para guardar e quanto é para algum objetivo específico. Gastar primeiro e ver o que sobra para guardar quase nunca funciona.",
        action: "No próximo salário, separe uma porcentagem fixa (mesmo que pequena, como 10%) antes de gastar qualquer coisa.",
      },
      {
        title: "Diferencie o que é necessidade do que é vontade",
        body: "Nem todo gasto precisa ser cortado, mas vale a pena perceber a diferença: transporte para o trabalho é necessidade; um lanche todo dia fora de casa é vontade. Perceber essa diferença ajuda a decidir onde cortar quando o dinheiro aperta.",
        action: "Anote todos os gastos de uma semana e marque cada um como \"necessidade\" ou \"vontade\".",
      },
      {
        title: "Evite parcelar compras pequenas",
        body: "Parcelar o salário mensal em diversas compras pequenas é uma armadilha comum: no fim, boa parte do próximo salário já está comprometida antes mesmo de cair na conta. Prefira guardar um pouco e comprar à vista quando possível.",
        action: "Antes de parcelar qualquer compra, pergunte: eu conseguiria comprar isso guardando por 2-3 meses?",
      },
      {
        title: "Comece a guardar dinheiro, mesmo que pouco",
        body: "O valor guardado no início importa menos do que criar o hábito. Guardar uma quantia pequena todo mês, de forma consistente, cria uma reserva para imprevistos e ensina o hábito que vai importar a vida toda.",
        action: "Abra (se ainda não tiver) uma conta digital gratuita e programe uma transferência automática pequena todo mês.",
      },
      {
        title: "Cuidado com pedir fiado ou emprestado para colegas",
        body: "Pedir adiantado ou emprestado com frequência para cobrir gastos do mês é sinal de que o planejamento do salário precisa de ajuste. Isso também pode gerar constrangimento e prejudicar relações no trabalho.",
        action: "Se perceber que o dinheiro sempre acaba antes do fim do mês, revise os gastos da última semana antes de pedir emprestado de novo.",
      },
    ],
  },
  {
    key: "efetivacao",
    label: "Como se destacar",
    intro:
      "Muitas empresas efetivam aprendizes que se destacam ao final (ou antes do fim) do contrato. Esses comportamentos aumentam a chance real de virar uma vaga fixa.",
    tips: [
      {
        title: "Peça mais responsabilidade aos poucos",
        body: "Quem só espera receber tarefas costuma ser visto como alguém que \"cumpre o mínimo\". Pedir para ajudar em uma tarefa nova, com moderação e no momento certo, mostra iniciativa sem parecer que está \"querendo aparecer\".",
        action: "Na próxima semana, pergunte ao seu supervisor se pode ajudar em alguma tarefa que ainda não faz.",
      },
      {
        title: "Entregue com qualidade antes de pedir mais",
        body: "Antes de pedir novas responsabilidades, garanta que as tarefas atuais estão sendo bem feitas e no prazo. Empresas efetivam com mais frequência quem é confiável no básico, não só quem parece \"brilhante\" ocasionalmente.",
        action: "Escolha uma tarefa recorrente sua e melhore um detalhe dela nesta semana (prazo, organização ou atenção a erros).",
      },
      {
        title: "Construa relação com o time, não só com o supervisor",
        body: "Quem só se relaciona bem com o chefe direto, mas é indiferente com o resto do time, costuma perder pontos na hora da decisão de efetivação — que geralmente ouve a opinião de mais gente do que só o supervisor imediato.",
        action: "Puxe conversa com um colega de outro setor essa semana, mesmo que seja rápido.",
      },
      {
        title: "Demonstre interesse real em aprender sobre a empresa",
        body: "Perguntar sobre como a empresa funciona, entender o que outros setores fazem e mostrar curiosidade genuína sinaliza que você pensa em ficar, não só em cumprir o contrato.",
        action: "Escolha um setor da empresa que você não conhece bem e pergunte a alguém como ele funciona.",
      },
      {
        title: "No fim do contrato, pergunte diretamente sobre a efetivação",
        body: "Muitos aprendizes não são efetivados simplesmente porque nunca demonstraram interesse claro em continuar. Perto do fim do contrato, é legítimo perguntar ao supervisor ou RH se existe possibilidade de efetivação.",
        action: "Marque no calendário 60 dias antes do fim do seu contrato para iniciar essa conversa com o supervisor ou RH.",
      },
    ],
  },
];

export const APPRENTICE_GUIDE_BY_SECTION = Object.fromEntries(
  APPRENTICE_GUIDE.map((s) => [s.key, s])
) as Record<ApprenticeGuideSection, ApprenticeGuideSectionContent>;

export type ReemploymentGuideSection =
  | "desligamento_e_gap"
  | "rede_de_contatos"
  | "estrategia_de_candidatura"
  | "objecoes_na_entrevista"
  | "motivacao_na_busca";

export type ReemploymentGuideTip = {
  title: string;
  body: string;
  action: string;
};

export type ReemploymentGuideSectionContent = {
  key: ReemploymentGuideSection;
  label: string;
  intro: string;
  tips: ReemploymentGuideTip[];
};

export const REEMPLOYMENT_GUIDE: ReemploymentGuideSectionContent[] = [
  {
    key: "desligamento_e_gap",
    label: "Desligamento e gap no currículo",
    intro:
      "Como explicar a saída do último emprego e um período sem trabalhar formal costuma pesar mais na cabeça de quem busca recolocação do que na do recrutador, o segredo é ter uma narrativa curta, honesta e sem tom defensivo.",
    tips: [
      {
        title: "Tenha uma frase pronta para o motivo da saída",
        body: "'Fui desligado(a) num corte de equipe' ou 'a empresa reestruturou a área' são respostas neutras e comuns, o mercado sabe que demissões em massa não são culpa individual. Evite justificativas longas, que soam defensivas.",
        action: "Escreva em uma frase o motivo da sua saída, sem adjetivos negativos sobre a empresa anterior.",
      },
      {
        title: "Preencha o gap com o que você fez nele",
        body: "Cursos, freelas, voluntariado, cuidado familiar ou até a própria busca ativa e estruturada por vaga são conteúdo válido para o período. Um gap 'vazio' no currículo preocupa mais que um gap explicado.",
        action: "Liste 2-3 atividades do período sem emprego formal que possam entrar no currículo ou ser citadas na entrevista.",
      },
      {
        title: "Não minta sobre datas para esconder o gap",
        body: "Recrutadores cruzam informações no LinkedIn e em referências. Um gap real e bem explicado gera mais confiança do que uma inconsistência de datas descoberta depois.",
        action: "Confira se as datas no currículo e no LinkedIn batem exatamente.",
      },
      {
        title: "Separe o fato do sentimento",
        body: "'Fui desligado(a) e isso foi difícil' é verdade, mas não precisa aparecer na entrevista. Fale do fato (o desligamento) e do que veio depois (o que você fez, o que aprendeu), não do desconforto emocional.",
        action: "Treine contar sua saída em até 20 segundos, terminando sempre no que você fez depois.",
      },
      {
        title: "Se o gap for longo, mostre atualização recente",
        body: "Quanto maior o tempo fora do mercado, mais importa mostrar que você está atualizado agora, um curso recente, uma certificação, uma vaga temporária. Isso reduz a dúvida de 'ficou parado esse tempo todo?'.",
        action: "Se possível, conclua algo pequeno e recente (curso, certificação) para citar como prova de atualização.",
      },
    ],
  },
  {
    key: "rede_de_contatos",
    label: "Reativar a rede de contatos",
    intro:
      "A maioria das vagas de nível pleno/sênior nunca chega a ser publicada, são preenchidas por indicação. Reativar sua rede é a ação de maior retorno por hora investida na busca por recolocação.",
    tips: [
      {
        title: "Avise que está buscando, sem constrangimento",
        body: "Ex-colegas, ex-chefes e conhecidos de área raramente sabem que você está em busca a menos que você diga. Um post direto ou mensagens individuais custam pouco e abrem portas que o currículo sozinho não abre.",
        action: "Escreva uma mensagem curta avisando que está em busca e envie para 10 contatos da sua rede esta semana.",
      },
      {
        title: "Peça indicação específica, não genérica",
        body: "'Você conhece alguém que possa me ajudar?' é vago e fácil de ignorar. 'Vi que a empresa X está contratando Analista Y, você conhece alguém de lá?' é específico e fácil de responder.",
        action: "Identifique 3 empresas-alvo e peça indicação específica para alguém da sua rede que tenha conexão com elas.",
      },
      {
        title: "Reative, não só peça",
        body: "Antes de pedir algo, comente uma publicação, parabenize por uma conquista, mande uma mensagem sem pedido nenhum. Rede que só recebe pedido esfria rápido.",
        action: "Interaja com 5 publicações de contatos relevantes no LinkedIn antes de fazer qualquer pedido.",
      },
      {
        title: "Recrutadores também são rede",
        body: "Seguir e se conectar com recrutadores da sua área (mesmo sem vaga aberta no momento) aumenta a chance de ser lembrado quando a vaga certa aparecer.",
        action: "Conecte-se com 5 recrutadores ou gente de RH da sua área no LinkedIn, com uma mensagem curta de apresentação.",
      },
      {
        title: "Grupos e comunidades aceleram o processo",
        body: "Grupos de WhatsApp/Telegram/Discord da sua área costumam compartilhar vagas antes delas aparecerem nos grandes portais, e geram contato direto com quem está contratando.",
        action: "Entre em pelo menos 2 comunidades ativas da sua área e observe as vagas compartilhadas por uma semana.",
      },
    ],
  },
  {
    key: "estrategia_de_candidatura",
    label: "Estratégia de candidatura",
    intro:
      "Aplicar para tudo sem critério cansa e traz poucos retornos. Uma estratégia com metas e prioridades claras rende mais entrevistas com menos esforço disperso.",
    tips: [
      {
        title: "Separe vagas por prioridade, não aplique em ordem cronológica",
        body: "Vagas com alta aderência ao seu perfil merecem candidatura personalizada e capricho. Vagas de aderência média podem receber uma versão padrão mais rápida. Vagas de baixa aderência raramente valem o tempo.",
        action: "Classifique suas 10 últimas vagas de interesse em alta, média e baixa aderência antes de aplicar às próximas.",
      },
      {
        title: "Tenha uma meta semanal de candidaturas de qualidade",
        body: "Um número fixo (ex: 8 candidaturas de alta prioridade por semana) evita tanto a paralisia quanto o excesso de candidaturas genéricas que não geram retorno.",
        action: "Defina sua meta semanal em /applications e ajuste o currículo apenas para as vagas de alta prioridade.",
      },
      {
        title: "Adapte o currículo para cada vaga de alta prioridade",
        body: "Recrutadores identificam candidaturas genéricas rapidamente. Ajustar palavras-chave e reordenar experiências para a vaga específica aumenta muito a taxa de resposta.",
        action: "Antes de aplicar numa vaga de alta prioridade, rode uma nova análise de aderência com o texto exato da vaga.",
      },
      {
        title: "Faça o follow-up depois de aplicar",
        body: "Uma mensagem educada ao recrutador ou ao RH, 5-7 dias após a candidatura, demonstra interesse real e às vezes é o empurrão que faz seu currículo ser revisado de novo.",
        action: "Marque no seu kanban de candidaturas quais vagas de alta prioridade já passaram de 5 dias sem resposta.",
      },
      {
        title: "Revise a estratégia a cada 2-3 semanas",
        body: "Se um tipo de vaga ou abordagem não está gerando nenhuma resposta depois de várias tentativas, é sinal de ajustar o alvo, o currículo ou a rede, não de aplicar mais do mesmo jeito.",
        action: "A cada 2 semanas, confira sua taxa de resposta em /applications e ajuste o que não está funcionando.",
      },
    ],
  },
  {
    key: "objecoes_na_entrevista",
    label: "Contornar objeções na entrevista",
    intro:
      "Recrutadores costumam ter perguntas específicas para quem está em recolocação, idade, motivo da saída, expectativa salarial, tempo fora do mercado. Ter resposta pronta para essas objeções muda o resultado da conversa.",
    tips: [
      {
        title: "Antecipe a pergunta sobre o desligamento",
        body: "Ela quase sempre vem. Responder com naturalidade, sem se alongar, e voltar o foco para o que você aprendeu ou fez desde então evita que o assunto vire o centro da entrevista.",
        action: "Treine em voz alta a resposta que você escreveu na seção 'Desligamento e gap' até soar natural.",
      },
      {
        title: "Prepare uma resposta de expectativa salarial com faixa, não valor fixo",
        body: "Dar uma faixa baseada em pesquisa de mercado (não um valor único) mostra que você pesquisou e dá espaço de negociação para os dois lados.",
        action: "Pesquise a faixa salarial de mercado para o cargo-alvo e defina sua faixa mínima e ideal antes da entrevista.",
      },
      {
        title: "Se a pergunta for sobre idade ou tempo de carreira, foque em resultado",
        body: "Objeções indiretas sobre 'senioridade demais' ou 'júnior demais' costumam ser resolvidas mostrando resultados concretos e adaptabilidade, não discutindo a objeção diretamente.",
        action: "Prepare 2 exemplos de resultados que provem que você entrega, independente de idade ou tempo de casa.",
      },
      {
        title: "Mostre que pesquisou a empresa e a vaga",
        body: "Quem está buscando recolocação há tempo às vezes aplica em volume e chega despreparado para a entrevista. Isso é perceptível e pesa contra, pesquisar a empresa antes é rápido e muda a percepção do recrutador.",
        action: "Antes de cada entrevista, anote 3 informações recentes sobre a empresa para citar na conversa.",
      },
      {
        title: "Treine as perguntas específicas da vaga",
        body: "Use a simulação de entrevista vinculada à candidatura para praticar respostas com feedback antes da conversa real, chegar treinado reduz a ansiedade e melhora a clareza das respostas.",
        action: "Abra a candidatura em /applications e treine a simulação de entrevista antes da conversa marcada.",
      },
    ],
  },
  {
    key: "motivacao_na_busca",
    label: "Sustentar a motivação numa busca longa",
    intro:
      "Buscas de recolocação que passam de alguns meses desgastam. Ter rotina, marcos pequenos e formas de medir progresso real (não só 'consegui a vaga ou não') sustenta o ânimo até o resultado final.",
    tips: [
      {
        title: "Trate a busca como um trabalho com horário",
        body: "Definir um bloco fixo do dia para candidaturas, rede e estudo evita tanto a procrastinação quanto o excesso, buscar emprego o dia inteiro sem pausa também cansa e reduz a qualidade das candidaturas.",
        action: "Defina um bloco fixo (ex: 2-3h por dia) dedicado à busca e respeite esse horário como um compromisso de trabalho.",
      },
      {
        title: "Meça progresso pelo processo, não só pelo resultado final",
        body: "Candidaturas de qualidade enviadas, contatos de rede reativados e entrevistas realizadas são progresso real, mesmo sem uma oferta ainda. Medir só 'consegui emprego ou não'é desanimador e não reflete o esforço.",
        action: "Acompanhe suas métricas de jornada em /applications toda semana, não só o resultado final.",
      },
      {
        title: "Rejeição faz parte do processo, não é um veredito sobre você",
        body: "Taxas de rejeição altas são normais numa busca ativa, especialmente no início. Elas dizem mais sobre volume e ajuste de estratégia do que sobre o seu valor profissional.",
        action: "Depois de uma rejeição, anote em 1 frase o que pode melhorar na próxima candidatura e siga em frente.",
      },
      {
        title: "Mantenha uma rotina fora da busca também",
        body: "Exercício físico, contato social e alguma atividade sem relação com emprego ajudam a manter a cabeça no lugar durante um processo que pode se estender por meses.",
        action: "Mantenha pelo menos uma atividade fixa na semana que não tenha nenhuma relação com a busca de emprego.",
      },
      {
        title: "Comemore os marcos intermediários",
        body: "Primeira entrevista marcada, primeira resposta positiva, primeira segunda fase, cada marco é sinal de que a estratégia está funcionando, mesmo antes da oferta final.",
        action: "Na próxima vez que avançar de fase numa candidatura, reconheça isso como uma vitória real, não só 'mais um passo'.",
      },
    ],
  },
];

export const REEMPLOYMENT_GUIDE_BY_SECTION: Record<ReemploymentGuideSection, ReemploymentGuideSectionContent> =
  Object.fromEntries(REEMPLOYMENT_GUIDE.map((s) => [s.key, s])) as Record<
    ReemploymentGuideSection,
    ReemploymentGuideSectionContent
  >;

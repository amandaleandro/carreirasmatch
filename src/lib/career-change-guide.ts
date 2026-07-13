export type CareerChangeGuideSection =
  | "planejar_transicao"
  | "habilidades_transferiveis"
  | "cargos_ponte"
  | "narrativa_entrevista"
  | "financeiro"
  | "cursos_certificacoes";

export type CareerChangeGuideTip = {
  title: string;
  body: string;
  action: string;
};

export type CareerChangeGuideSectionContent = {
  key: CareerChangeGuideSection;
  label: string;
  intro: string;
  tips: CareerChangeGuideTip[];
};

export const CAREER_CHANGE_GUIDE: CareerChangeGuideSectionContent[] = [
  {
    key: "planejar_transicao",
    label: "Planejar a transição",
    intro:
      "Trocar de área raramente é um salto único, é uma sequência de passos. Escolher o ritmo certo evita tanto a frustração de nunca sair do lugar quanto o risco de queimar a ponte antes de estar pronto.",
    tips: [
      {
        title: "Escolha entre transição rápida, gradual ou paralela",
        body: "Rápida (pedir demissão e mergulhar full-time) exige reserva financeira e tolerância a risco. Gradual (estudar e aplicar aos poucos enquanto mantém o emprego atual) é mais lenta mas mais segura. Paralela (freelas ou projetos na área nova, mantendo o emprego atual) prova experiência real antes de migrar de vez.",
        action: "Defina hoje qual dos três ritmos combina com sua reserva financeira e tolerância a risco atual, isso muda todo o resto do plano.",
      },
      {
        title: "Defina o objetivo final e o primeiro passo, não só um dos dois",
        body: "Saber que quer 'trabalhar com Dados' não é um objetivo acionável. Saber que quer chegar a 'Analista de Dados Pleno' em 18 meses, começando por um cargo-ponte de Analista Jr, é.",
        action: "Escreva o cargo final desejado e o prazo realista (12-24 meses é comum para transições completas).",
      },
      {
        title: "Valide a nova área antes de apostar tudo nela",
        body: "Conversas informais com quem já trabalha na área (café virtual de 20 minutos) revelam a rotina real, muito diferente da imagem romantizada que se tem de fora.",
        action: "Marque pelo menos 2 conversas de 20 minutos com profissionais que já atuam na área que você quer entrar.",
      },
      {
        title: "Não abandone sua experiência anterior, reposicione ela",
        body: "Quem migra de carreira tende a esconder o histórico anterior por vergonha de 'não ser da área'. Isso é um erro: recrutadores confiam mais em quem mostra de onde veio e por que está mudando com clareza.",
        action: "Liste 3 conquistas da sua carreira anterior que ainda têm valor, independente da área nova.",
      },
      {
        title: "Trace marcos de progresso, não só o objetivo final",
        body: "Um objetivo de 18 meses sem marcos intermediários é fácil de abandonar. Marcos de 30/60/90 dias (1º curso concluído, 1º projeto publicado, 1ª entrevista) mantêm o movimento visível.",
        action: "Defina o que precisa estar pronto em 30, 60 e 90 dias a partir de hoje.",
      },
    ],
  },
  {
    key: "habilidades_transferiveis",
    label: "Habilidades transferíveis",
    intro:
      "Ninguém começa do zero de verdade. Gestão, comunicação, análise, atendimento ao cliente e organização aparecem em quase todas as áreas, o trabalho é traduzir essas habilidades para o vocabulário da área nova.",
    tips: [
      {
        title: "Separe habilidades técnicas de habilidades transferíveis",
        body: "Habilidades técnicas (ex: Excel avançado, gestão de projetos, atendimento) tendem a se aplicar de forma direta. Habilidades comportamentais (liderança, negociação, resolução de problemas) se aplicam de forma indireta, mas pesam bastante na entrevista.",
        action: "Liste 5 habilidades da sua experiência atual e marque quais são técnicas e quais são comportamentais.",
      },
      {
        title: "Traduza a experiência para o vocabulário da área nova",
        body: "'Organizei a rotina de uma equipe de vendas' pode virar 'gerenciei prazos e priorização de demandas' ao mirar uma vaga de Analista de Projetos, mesmo fato, vocabulário da vaga.",
        action: "Reescreva uma experiência do seu currículo atual usando 2-3 palavras-chave da vaga que você quer.",
      },
      {
        title: "Evidências pesam mais que a lista de habilidades",
        body: "Dizer 'tenho pensamento analítico' convence menos do que contar uma situação real onde você usou dados para tomar uma decisão, mesmo que informal.",
        action: "Escolha uma habilidade transferível e escreva uma situação real (2-3 frases) que a comprove.",
      },
      {
        title: "Tecnologia e ferramentas adjacentes contam ponto",
        body: "Já usou CRM, planilhas avançadas, ferramentas de gestão de tarefas ou automação simples? Isso é sinal de facilidade com tecnologia, relevante mesmo fora de vagas técnicas.",
        action: "Liste todas as ferramentas/softwares que você já usou profissionalmente, mesmo que pareçam básicos.",
      },
      {
        title: "Peça uma segunda opinião de quem já está na área nova",
        body: "É comum subestimar o que já se tem. Alguém de fora, já atuando na área-alvo, costuma enxergar conexões que você não vê de dentro da sua própria trajetória.",
        action: "Mostre sua lista de habilidades para alguém da área nova e pergunte o que mais chama atenção.",
      },
    ],
  },
  {
    key: "cargos_ponte",
    label: "Cargos-ponte",
    intro:
      "Um cargo-ponte é a posição intermediária que te leva até o objetivo final sem exigir o salto completo de uma vez, geralmente mais júnior, mais próximo da sua experiência atual, mas já dentro (ou na borda) da área nova.",
    tips: [
      {
        title: "Mapeie 2 a 4 cargos-ponte realistas até o objetivo final",
        body: "Ex: para ir de Varejo até Analista de Dados Pleno, cargos-ponte possíveis são Assistente Administrativo com foco em relatórios → Analista de Dados Jr → Analista de Dados Pleno. Cada um exige menos salto que ir direto ao objetivo final.",
        action: "Use a análise de vaga da CarreirasMatch para o seu momento de transição e confira os cargos-ponte sugeridos pela IA.",
      },
      {
        title: "Cargo-ponte não é 'dar um passo para trás'",
        body: "É comum sentir que aceitar um cargo mais júnior é um retrocesso. Na prática, é o caminho mais rápido e menos arriscado para consolidar experiência real na área nova, muito mais rápido do que tentar entrar direto no nível pleno/sênior sem histórico.",
        action: "Escreva 2 frases explicando por que o cargo-ponte escolhido acelera, e não atrasa, seu objetivo final.",
      },
      {
        title: "Priorize empresas que promovem internamente",
        body: "Empresas com cultura forte de promoção interna reduzem o risco de ficar 'preso' no cargo-ponte, pesquise antes de aceitar uma proposta.",
        action: "Nas próximas candidaturas, pergunte na entrevista como funciona a trilha de carreira interna da posição.",
      },
      {
        title: "Aceite ganhar menos temporariamente, com prazo definido",
        body: "É comum haver uma redução salarial temporária ao migrar de área. Definir um prazo (ex: 12-18 meses) para recuperar o patamar anterior evita que a transição vire indefinida.",
        action: "Se aplicável, defina um teto de tempo aceitável para o cargo-ponte antes de reavaliar o plano.",
      },
      {
        title: "Use o cargo-ponte para construir portfólio real na área nova",
        body: "Todo cargo-ponte é uma chance de gerar evidências concretas (projetos, relatórios, resultados) que vão pesar na próxima candidatura, não é só 'esperar o tempo passar'.",
        action: "No cargo-ponte atual (ou ao entrar em um novo), defina 1 entregável que possa virar item de portfólio.",
      },
    ],
  },
  {
    key: "narrativa_entrevista",
    label: "Narrativa e entrevista",
    intro:
      "A pergunta 'por que você quer mudar de área?' aparece em quase toda entrevista de transição de carreira. Uma resposta vaga ou defensiva levanta bandeira vermelha; uma resposta clara e honesta vira ponto forte.",
    tips: [
      {
        title: "Conecte passado, presente e futuro em uma frase",
        body: "Uma boa narrativa de transição segue o formato: 'Na minha experiência em [área anterior] desenvolvi [habilidade relevante]; percebi que queria aplicar isso em [área nova], e por isso já [ação concreta: curso, projeto, certificação]'.",
        action: "Escreva sua narrativa de transição em 3-4 frases seguindo esse formato.",
      },
      {
        title: "Nunca fale mal da carreira ou empresa anterior",
        body: "Justificar a mudança criticando o emprego anterior soa como fuga, não como decisão estratégica. Foque no que você está buscando, não no que está deixando para trás.",
        action: "Releia sua narrativa e remova qualquer frase que soe como reclamação da área/empresa anterior.",
      },
      {
        title: "Mostre movimento real, não só intenção",
        body: "'Quero migrar para Dados' convence pouco sozinho. 'Estou migrando para Dados: já concluí um curso de SQL, fiz 2 projetos práticos e estou aplicando para vagas Jr' convence muito mais, porque prova ação, não só desejo.",
        action: "Liste as ações concretas que você já tomou rumo à área nova para citar na entrevista.",
      },
      {
        title: "Prepare-se para a objeção sobre falta de experiência",
        body: "Recrutadores costumam questionar profundidade técnica de quem está migrando. A resposta forte reconhece a lacuna e mostra o plano ativo para fechá-la, não tenta esconder ou minimizar.",
        action: "Escreva uma resposta de 2-3 frases para 'como você compensa não ter experiência formal na área?'.",
      },
      {
        title: "Atualize o LinkedIn para refletir a narrativa, não só o cargo atual",
        body: "A headline e o resumo do LinkedIn são a primeira confirmação (ou contradição) da sua narrativa de transição para quem visita seu perfil depois da entrevista.",
        action: "Atualize a headline do LinkedIn para incluir a área nova que você está buscando.",
      },
    ],
  },
  {
    key: "financeiro",
    label: "Planejamento financeiro",
    intro:
      "Transições de carreira quase sempre envolvem algum período de instabilidade financeira, estudar, aceitar um cargo-ponte com salário menor ou ficar um tempo sem renda. Planejar isso com antecedência é o que separa uma transição bem-sucedida de uma decisão precipitada revertida por pressão financeira.",
    tips: [
      {
        title: "Calcule sua reserva mínima antes de qualquer decisão radical",
        body: "Para uma transição rápida (sair do emprego atual), o recomendado costuma ser ter de 6 a 12 meses de custo de vida guardados. Para transição gradual ou paralela, esse colchão pode ser bem menor.",
        action: "Calcule quantos meses de custo de vida você tem guardados hoje e compare com o ritmo de transição escolhido.",
      },
      {
        title: "Separe o orçamento de estudo do orçamento do dia a dia",
        body: "Cursos, certificações e ferramentas têm custo. Definir um orçamento mensal fixo para isso evita tanto o excesso de gasto quanto a paralisia por falta de investimento.",
        action: "Defina um valor mensal (mesmo pequeno) dedicado só a formação para a área nova.",
      },
      {
        title: "Priorize cursos gratuitos ou de baixo custo no início",
        body: "Antes de investir pesado em uma pós-graduação ou bootcamp caro, cursos gratuitos (Google, Microsoft Learn, SENAI/SENAC) validam se você realmente gosta da área no dia a dia.",
        action: "Complete pelo menos um curso gratuito da área nova antes de investir em formação paga mais cara.",
      },
      {
        title: "Considere renda paralela durante a transição gradual",
        body: "Freelas, projetos pontuais ou consultorias na área nova, mesmo pequenos, geram experiência prática e uma renda extra que reduz a pressão da transição.",
        action: "Avalie se existe algum projeto pequeno e remunerado na área nova que você poderia aceitar agora.",
      },
      {
        title: "Revise o plano financeiro a cada marco, não só no início",
        body: "Reserva financeira e prazo de transição não são fixos, reavaliar a cada 60-90 dias evita continuar em um plano que já não é mais sustentável sem perceber.",
        action: "Marque uma revisão financeira recorrente a cada 60-90 dias durante a transição.",
      },
    ],
  },
  {
    key: "cursos_certificacoes",
    label: "Cursos e certificações",
    intro:
      "Certificações não substituem experiência prática, mas são o jeito mais rápido de mostrar comprometimento real com a área nova, principalmente quando ainda não há histórico profissional nela.",
    tips: [
      {
        title: "Priorize certificações reconhecidas pelo mercado da área nova",
        body: "Cada área tem suas certificações de peso (ex: certificações de nuvem em TI, certificações de gestão em Projetos). Uma certificação genérica pesa menos que uma certificação específica e reconhecida.",
        action: "Pesquise quais são as 2-3 certificações mais citadas em vagas Jr da sua área-alvo.",
      },
      {
        title: "Combine curso teórico com projeto prático",
        body: "Um certificado sozinho prova conhecimento teórico. Um projeto aplicado junto (mesmo pequeno) prova que você sabe usar o que aprendeu, e vira item de portfólio.",
        action: "Ao concluir um curso, aplique o conteúdo em um projeto pequeno e real antes de seguir para o próximo.",
      },
      {
        title: "Use cursos gratuitos de base institucional quando possível",
        body: "SENAI, SENAC, Sebrae e Fundação Bradesco (Escola Virtual) oferecem cursos gratuitos ou de baixo custo com boa aceitação no mercado brasileiro, especialmente para áreas técnicas e administrativas.",
        action: "Verifique o catálogo do SENAI/SENAC/Sebrae mais próximo para cursos ligados à sua área-alvo.",
      },
      {
        title: "Não empilhe certificados sem aplicar nenhum deles",
        body: "Colecionar certificados sem projetos práticos entre eles é um padrão comum de procrastinação disfarçada de produtividade, recrutadores notam quando não há nenhuma aplicação real.",
        action: "Antes de iniciar um novo curso, confirme que já aplicou o conteúdo do curso anterior em algo prático.",
      },
      {
        title: "Atualize currículo e LinkedIn assim que concluir cada certificação",
        body: "Um certificado só ajuda se for visível para quem está avaliando seu perfil, atualizar imediatamente evita esquecer ou acumular tudo para depois.",
        action: "Adicione a certificação mais recente ao currículo e ao LinkedIn ainda hoje, se ainda não fez isso.",
      },
    ],
  },
];

export const CAREER_CHANGE_GUIDE_BY_SECTION = Object.fromEntries(
  CAREER_CHANGE_GUIDE.map((s) => [s.key, s])
) as Record<CareerChangeGuideSection, CareerChangeGuideSectionContent>;

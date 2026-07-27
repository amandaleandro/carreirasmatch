import { normalizeGamePhase, type GamePhase } from "@/lib/game-progression";
import { VOCATION_AREAS, matchAreaSlug } from "@/lib/vocation-areas";

export type CareerGameProfile = {
  careerSegment?: string | null;
  professionalArea?: string | null;
  currentProfessionalArea?: string | null;
  targetProfessionalArea?: string | null;
  studyCourse?: string | null;
};

export type CareerQuestion = {
  q: string;
  options: string[];
  correct: number;
  explanation: string;
};

export type CareerMemoryPair = { term: string; definition: string };

export type CareerGamePack = {
  area: string;
  context: string;
  questions: CareerQuestion[];
  pairs: CareerMemoryPair[];
  words: { word: string; hint: string }[];
};

type AreaPack = { terms: CareerMemoryPair[]; fact: CareerQuestion };

function pack(terms: [string, string][], fact: CareerQuestion): AreaPack {
  return { terms: terms.map(([term, definition]) => ({ term, definition })), fact };
}

// Uma entrada por slug de src/lib/vocation-areas.ts, com vocabulário e uma
// pergunta de domínio real da área (não "conselhos genéricos estilo tech").
const AREA_PACKS: Record<string, AreaPack> = {
  ti: pack(
    [
      ["API", "Interface que permite sistemas conversarem"],
      ["Git", "Controle de versões do código"],
      ["Deploy", "Publicação de uma aplicação em um ambiente"],
      ["Banco de dados", "Estrutura que armazena informações organizadas"],
      ["Teste automatizado", "Verificação repetível do comportamento do software"],
      ["Nuvem", "Infraestrutura de computação acessada pela internet"],
    ],
    {
      q: "Qual prática ajuda a reduzir regressões em um projeto de Tecnologia?",
      options: ["Testes automatizados", "Apagar o histórico do Git", "Evitar documentação", "Publicar sem revisar"],
      correct: 0,
      explanation: "Testes automatizados verificam comportamentos importantes antes da publicação.",
    }
  ),
  medicina: pack(
    [
      ["Anamnese", "Coleta estruturada do histórico do paciente"],
      ["Residência médica", "Especialização prática após a graduação, via prova concorrida"],
      ["CRM", "Conselho que registra o médico para exercer a profissão"],
      ["Diagnóstico diferencial", "Comparação entre hipóteses antes de fechar um diagnóstico"],
      ["Prontuário", "Registro organizado do atendimento"],
      ["Plantão", "Turno de atendimento contínuo, comum em hospitais"],
    ],
    {
      q: "O que é necessário para um médico atuar como especialista reconhecido no Brasil?",
      options: ["Registro no CRM e residência/título de especialista", "Apenas o diploma de graduação", "Só experiência prática sem registro", "Aprovação em concurso público"],
      correct: 0,
      explanation: "O registro no CRM habilita a atuar como médico generalista; o título de especialista vem de residência ou prova de título reconhecida.",
    }
  ),
  direito: pack(
    [
      ["Jurisprudência", "Conjunto de decisões que orienta interpretações"],
      ["Petição", "Manifestação formal apresentada em um processo"],
      ["Contrato", "Acordo que estabelece direitos e obrigações"],
      ["Prazo processual", "Período para realizar um ato dentro de um processo"],
      ["Exame da OAB", "Prova obrigatória para atuar como advogado(a)"],
      ["Conciliação", "Busca de acordo para resolver um conflito"],
    ],
    {
      q: "O que é obrigatório para atuar como advogado(a) no Brasil, além da graduação?",
      options: ["Aprovação no Exame da OAB", "Registro no CRA", "Residência jurídica", "Nenhum requisito adicional"],
      correct: 0,
      explanation: "Sem aprovação no Exame de Ordem, o bacharel em Direito não pode advogar, mesmo com o diploma.",
    }
  ),
  engenharia: pack(
    [
      ["CREA", "Conselho que registra o(a) engenheiro(a) para assinar projetos"],
      ["ART", "Documento que vincula o(a) engenheiro(a) responsável a um projeto"],
      ["Memorial de cálculo", "Documento que justifica tecnicamente as escolhas do projeto"],
      ["Norma técnica", "Padrão (ex: ABNT) que um projeto deve seguir"],
      ["Cronograma físico-financeiro", "Planejamento de etapas de obra e custos ao longo do tempo"],
      ["Ensaio", "Teste técnico para validar material ou estrutura"],
    ],
    {
      q: "O que um(a) engenheiro(a) precisa para assinar projetos como responsável técnico?",
      options: ["Registro no CREA e emissão de ART", "Apenas o diploma de graduação", "Aprovação em concurso público", "Registro no CAU"],
      correct: 0,
      explanation: "O CREA registra o profissional e a ART formaliza a responsabilidade técnica sobre cada projeto assinado.",
    }
  ),
  educacao: pack(
    [
      ["Licenciatura", "Formação exigida para lecionar em uma disciplina"],
      ["Plano de aula", "Planejamento estruturado do conteúdo e objetivos de uma aula"],
      ["BNCC", "Base que define as competências mínimas da educação básica"],
      ["Avaliação formativa", "Avaliação usada para acompanhar o processo de aprendizagem"],
      ["Concurso público", "Principal porta de entrada para a rede estadual/municipal"],
      ["Gestão de sala", "Condução do comportamento e engajamento da turma"],
    ],
    {
      q: "O que é exigido para lecionar oficialmente em uma disciplina na educação básica?",
      options: ["Licenciatura na área", "Apenas experiência prática", "Registro em conselho profissional", "Bacharelado em qualquer área"],
      correct: 0,
      explanation: "A docência regular exige licenciatura específica, diferente de um bacharelado na mesma área.",
    }
  ),
  marketing: pack(
    [
      ["Persona", "Representação do público que uma marca quer alcançar"],
      ["Funil", "Etapas da jornada até uma conversão"],
      ["CTA", "Chamada para a ação desejada"],
      ["Conversão", "Realização da ação definida como objetivo"],
      ["Métrica", "Medida usada para acompanhar um resultado"],
      ["Copy", "Texto criado para comunicar e estimular uma ação"],
    ],
    {
      q: "Antes de criar uma campanha de Marketing, o que deve ser definido?",
      options: ["Público e objetivo mensurável", "Apenas a cor do anúncio", "O texto sem conhecer o público", "O resultado antes do teste"],
      correct: 0,
      explanation: "Público e objetivo orientam a mensagem, o canal e a avaliação da campanha.",
    }
  ),
  design: pack(
    [
      ["Wireframe", "Esboço da estrutura de uma interface"],
      ["Protótipo", "Representação interativa de uma solução"],
      ["Usabilidade", "Facilidade para realizar uma tarefa"],
      ["Hierarquia visual", "Organização que orienta o olhar e a leitura"],
      ["Persona", "Perfil de referência para decisões de design"],
      ["Feedback", "Retorno usado para melhorar uma solução"],
    ],
    {
      q: "O que uma boa decisão de Design deve considerar primeiro?",
      options: ["A necessidade da pessoa usuária", "Somente a tendência visual", "A quantidade de efeitos", "O gosto pessoal do designer"],
      correct: 0,
      explanation: "Design resolve problemas para pessoas e precisa considerar contexto e usabilidade.",
    }
  ),
  administracao: pack(
    [
      ["OKR", "Método de definir e acompanhar objetivos e resultados-chave"],
      ["Fluxograma", "Representação visual das etapas de um processo"],
      ["KPI", "Indicador usado para medir desempenho"],
      ["Orçamento", "Planejamento financeiro de receitas e gastos"],
      ["Liderança situacional", "Adaptar o estilo de gestão conforme a maturidade da equipe"],
      ["Stakeholder", "Pessoa ou grupo com interesse no resultado de um projeto"],
    ],
    {
      q: "O que ajuda a identificar se uma meta de gestão está sendo alcançada?",
      options: ["Definir KPIs claros e acompanhá-los", "Confiar apenas na percepção da equipe", "Evitar medir resultados", "Mudar a meta sempre que for difícil"],
      correct: 0,
      explanation: "Indicadores (KPIs) tornam o progresso mensurável e comparável ao longo do tempo.",
    }
  ),
  financas: pack(
    [
      ["CRC", "Conselho que registra o(a) contador(a) para exercer a profissão"],
      ["Balanço patrimonial", "Demonstrativo da situação financeira em um momento"],
      ["Fluxo de caixa", "Entradas e saídas de dinheiro ao longo do tempo"],
      ["Auditoria", "Verificação independente da conformidade financeira"],
      ["CPA-10/20", "Certificações valorizadas em investimentos e mercado de capitais"],
      ["Provisão", "Reserva contábil para uma despesa ou risco futuro"],
    ],
    {
      q: "O que é exigido para atuar como contador(a) no Brasil?",
      options: ["Registro no CRC após o Exame de Suficiência", "Apenas o diploma de Contabilidade", "Certificação CPA-10", "Registro na OAB"],
      correct: 0,
      explanation: "O registro no CRC depende da aprovação no Exame de Suficiência do CFC, além da graduação.",
    }
  ),
  comunicacao: pack(
    [
      ["Pauta", "Assunto ou proposta de matéria a ser apurada"],
      ["Apuração", "Investigação e checagem de fatos antes de publicar"],
      ["Release", "Texto enviado à imprensa para divulgar uma informação"],
      ["Clipping", "Registro das matérias publicadas sobre um tema ou marca"],
      ["Pauta editorial", "Planejamento de temas que serão produzidos"],
      ["Fonte", "Pessoa ou documento que embasa uma informação"],
    ],
    {
      q: "O que mais pesa na contratação de um(a) jornalista no Brasil hoje?",
      options: ["Clipping/portfólio de matérias publicadas", "Registro em conselho profissional obrigatório", "Apenas o diploma", "Aprovação em concurso público"],
      correct: 0,
      explanation: "Desde 2009 o diploma não é mais obrigatório; o mercado valoriza principalmente o portfólio de matérias.",
    }
  ),
  enfermagem: pack(
    [
      ["COREN", "Conselho que registra o(a) enfermeiro(a) para exercer a profissão"],
      ["SAE", "Sistematização da Assistência de Enfermagem, planejamento do cuidado"],
      ["Triagem", "Classificação inicial de prioridade e risco"],
      ["Escala de plantão", "Organização dos turnos de trabalho da equipe"],
      ["Protocolo de cuidado", "Orientação padronizada para uma conduta"],
      ["Sinais vitais", "Medidas básicas (pressão, temperatura, pulso) do estado do paciente"],
    ],
    {
      q: "O que é obrigatório para exercer a enfermagem no Brasil?",
      options: ["Registro no COREN", "Registro no CRM", "Aprovação em residência médica", "Certificação internacional"],
      correct: 0,
      explanation: "O COREN é o conselho responsável pelo registro profissional de enfermeiros(as) e técnicos(as) de enfermagem.",
    }
  ),
  odontologia: pack(
    [
      ["CRO", "Conselho que registra o(a) dentista para exercer a profissão"],
      ["Anamnese odontológica", "Levantamento do histórico de saúde bucal do paciente"],
      ["Prótese", "Peça que substitui uma estrutura dentária perdida"],
      ["Biossegurança", "Práticas para reduzir riscos de contaminação no atendimento"],
      ["Radiografia periapical", "Imagem usada para avaliar dente e osso ao redor"],
      ["Título de especialista", "Certificação adicional reconhecida pelo CFO"],
    ],
    {
      q: "O que é necessário para um(a) dentista se tornar especialista reconhecido(a)?",
      options: ["Curso ou residência reconhecidos pelo CFO", "Apenas anos de experiência", "Registro em outro conselho", "Aprovação em concurso público"],
      correct: 0,
      explanation: "O título de especialista em Odontologia depende de curso ou residência reconhecidos pelo Conselho Federal de Odontologia.",
    }
  ),
  farmacia: pack(
    [
      ["CRF", "Conselho que registra o(a) farmacêutico(a) para exercer a profissão"],
      ["Manipulação", "Preparo personalizado de medicamentos em farmácia magistral"],
      ["Interação medicamentosa", "Efeito de um medicamento sobre outro no organismo"],
      ["Farmacovigilância", "Monitoramento de efeitos adversos de medicamentos"],
      ["Bula", "Documento com informações oficiais de um medicamento"],
      ["Análise clínica", "Exame laboratorial que apoia diagnóstico e tratamento"],
    ],
    {
      q: "O que é exigido para atuar como farmacêutico(a) responsável em uma farmácia?",
      options: ["Registro no CRF", "Apenas o diploma de graduação", "Registro no CRN", "Curso técnico complementar"],
      correct: 0,
      explanation: "O CRF é o conselho responsável pelo registro e fiscalização da profissão farmacêutica.",
    }
  ),
  fisioterapia: pack(
    [
      ["CREFITO", "Conselho que registra o(a) fisioterapeuta para exercer a profissão"],
      ["Avaliação funcional", "Levantamento dos movimentos e limitações do paciente"],
      ["Reabilitação", "Processo de recuperação de função física"],
      ["Cinesioterapia", "Uso do movimento como recurso terapêutico"],
      ["Prontuário fisioterapêutico", "Registro da evolução do tratamento"],
      ["Prevenção de lesões", "Orientações para evitar novas lesões"],
    ],
    {
      q: "O que é necessário para exercer a fisioterapia no Brasil?",
      options: ["Registro no CREFITO", "Registro no COREN", "Residência médica", "Certificação esportiva"],
      correct: 0,
      explanation: "O CREFITO registra e fiscaliza fisioterapeutas e terapeutas ocupacionais.",
    }
  ),
  nutricao: pack(
    [
      ["CRN", "Conselho que registra o(a) nutricionista para exercer a profissão"],
      ["Anamnese alimentar", "Levantamento dos hábitos alimentares do paciente"],
      ["Plano alimentar", "Prescrição individualizada de alimentação"],
      ["Composição corporal", "Avaliação de gordura, massa magra e outros indicadores"],
      ["Rotulagem nutricional", "Informações obrigatórias sobre um alimento industrializado"],
      ["Segurança alimentar", "Garantia de acesso e qualidade da alimentação"],
    ],
    {
      q: "O que é obrigatório para atuar como nutricionista clínico(a) no Brasil?",
      options: ["Registro no CRN", "Registro no CRM", "Curso técnico complementar", "Certificação internacional"],
      correct: 0,
      explanation: "O CRN é o conselho responsável pelo registro e fiscalização da profissão de nutricionista.",
    }
  ),
  psicologia: pack(
    [
      ["CRP", "Conselho que registra o(a) psicólogo(a) para exercer a profissão"],
      ["Escuta ativa", "Prestar atenção plena ao que a pessoa comunica"],
      ["Sigilo profissional", "Dever de proteger informações compartilhadas em atendimento"],
      ["Anamnese psicológica", "Levantamento do histórico emocional e de vida da pessoa"],
      ["Psicoterapia", "Processo terapêutico conduzido por profissional habilitado"],
      ["Laudo psicológico", "Documento técnico com conclusões de uma avaliação"],
    ],
    {
      q: "O que é necessário para atuar clinicamente como psicólogo(a) no Brasil?",
      options: ["Registro no CRP", "Registro no CRM", "Aprovação em concurso público", "Certificação internacional"],
      correct: 0,
      explanation: "O CRP registra e fiscaliza o exercício da psicologia em todas as suas áreas de atuação.",
    }
  ),
  veterinaria: pack(
    [
      ["CRMV", "Conselho que registra o(a) médico(a) veterinário(a) para exercer a profissão"],
      ["Anamnese veterinária", "Levantamento do histórico de saúde do animal"],
      ["Zoonose", "Doença transmissível entre animais e humanos"],
      ["Protocolo vacinal", "Calendário de vacinas recomendado para um animal"],
      ["Cirurgia veterinária", "Procedimento cirúrgico realizado em animais"],
      ["Manejo sanitário", "Práticas para manter a saúde de um rebanho ou plantel"],
    ],
    {
      q: "O que é obrigatório para exercer a medicina veterinária no Brasil?",
      options: ["Registro no CRMV", "Registro no CRBio", "Curso técnico complementar", "Certificação internacional"],
      correct: 0,
      explanation: "O CRMV é o conselho responsável pelo registro e fiscalização da medicina veterinária.",
    }
  ),
  "educacao-fisica": pack(
    [
      ["CREF", "Conselho que registra o(a) profissional de Educação Física"],
      ["Avaliação física", "Levantamento de condicionamento e limitações do aluno(a)"],
      ["Periodização de treino", "Planejamento de cargas e fases de um treinamento"],
      ["Prescrição de exercício", "Definição individualizada de atividades físicas"],
      ["Recuperação muscular", "Processo de descanso e reparo após o esforço"],
      ["Avaliação postural", "Análise do alinhamento corporal do aluno(a)"],
    ],
    {
      q: "O que é exigido para atuar como personal trainer ou professor(a) de Educação Física?",
      options: ["Registro no CREF", "Registro no CREFITO", "Curso livre apenas", "Certificação internacional obrigatória"],
      correct: 0,
      explanation: "O CREF registra e fiscaliza o exercício profissional da Educação Física.",
    }
  ),
  arquitetura: pack(
    [
      ["CAU", "Conselho que registra o(a) arquiteto(a) para assinar projetos"],
      ["RRT", "Documento que vincula o(a) arquiteto(a) responsável a um projeto"],
      ["Planta baixa", "Representação em vista superior de um espaço"],
      ["Maquete", "Representação física ou digital em escala de um projeto"],
      ["Laudo técnico", "Documento com avaliação técnica de uma edificação"],
      ["Sustentabilidade construtiva", "Práticas para reduzir impacto ambiental de uma obra"],
    ],
    {
      q: "O que um(a) arquiteto(a) precisa para assinar projetos como responsável técnico?",
      options: ["Registro no CAU e emissão de RRT", "Registro no CREA apenas", "Apenas o diploma de graduação", "Aprovação em concurso público"],
      correct: 0,
      explanation: "O CAU registra o profissional e o RRT formaliza a responsabilidade técnica sobre o projeto.",
    }
  ),
  biologicas: pack(
    [
      ["CRBio", "Conselho que registra o(a) biólogo(a) para exercer a profissão"],
      ["Biodiversidade", "Variedade de espécies em um ecossistema"],
      ["Coleta de campo", "Obtenção de amostras ou dados diretamente no ambiente natural"],
      ["Espécie endêmica", "Espécie que só ocorre naturalmente em uma região específica"],
      ["Licenciamento ambiental", "Autorização exigida para atividades com impacto ambiental"],
      ["Iniciação científica", "Primeira experiência de pesquisa acadêmica orientada"],
    ],
    {
      q: "O que é exigido para atuar como biólogo(a) no Brasil?",
      options: ["Registro no CRBio", "Registro no CREA", "Curso técnico complementar", "Certificação internacional"],
      correct: 0,
      explanation: "O CRBio é o conselho responsável pelo registro e fiscalização da profissão de biólogo(a).",
    }
  ),
  agronomia: pack(
    [
      ["CREA", "Conselho que registra o(a) engenheiro(a) agrônomo(a)"],
      ["Manejo do solo", "Práticas para manter a fertilidade e produtividade da terra"],
      ["Fitossanidade", "Controle de pragas e doenças em plantas"],
      ["Zootecnia", "Área voltada à produção e melhoramento animal"],
      ["Safra", "Período de plantio e colheita de uma cultura"],
      ["Agroecologia", "Produção agrícola com foco em sustentabilidade"],
    ],
    {
      q: "O que é exigido para um(a) engenheiro(a) agrônomo(a) assinar projetos técnicos?",
      options: ["Registro no CREA e ART", "Registro no CRMV", "Apenas experiência de campo", "Certificação internacional"],
      correct: 0,
      explanation: "Agronomia segue o mesmo registro (CREA) e ART das demais engenharias.",
    }
  ),
  exatas: pack(
    [
      ["Modelo matemático", "Representação simplificada de um fenômeno usando equações"],
      ["Estatística descritiva", "Resumo numérico de um conjunto de dados"],
      ["Atuária", "Área que calcula riscos financeiros usando matemática e estatística"],
      ["Licenciatura", "Formação exigida para lecionar Matemática ou Física"],
      ["Instrumentação", "Uso de equipamentos para medir grandezas físicas"],
      ["Certificação do IBA", "Certificação valorizada para atuar como atuário(a)"],
    ],
    {
      q: "Qual certificação é valorizada para quem quer atuar como atuário(a) no Brasil?",
      options: ["Certificação do IBA (Instituto Brasileiro de Atuária)", "Registro no CRC", "Registro no CREA", "Exame da OAB"],
      correct: 0,
      explanation: "A carreira de atuária tem certificação própria do IBA, além da formação em exatas.",
    }
  ),
  letras: pack(
    [
      ["Tradução juramentada", "Tradução oficial feita por tradutor concursado pela Junta Comercial"],
      ["Linguística aplicada", "Estudo da língua voltado a problemas práticos de uso"],
      ["Revisão textual", "Correção de gramática, clareza e coesão de um texto"],
      ["Localização", "Adaptação de conteúdo para a língua e cultura de um público"],
      ["Proficiência", "Certificação de domínio de um idioma"],
      ["Legendagem", "Tradução sincronizada com o tempo de uma cena audiovisual"],
    ],
    {
      q: "O que diferencia uma tradução juramentada de uma tradução comum?",
      options: ["Exige aprovação em concurso da Junta Comercial", "É sempre feita por qualquer bacharel em Letras", "Não precisa de certificação", "É exclusiva para textos literários"],
      correct: 0,
      explanation: "A tradução juramentada só pode ser feita por tradutor público aprovado em concurso da Junta Comercial do estado.",
    }
  ),
  humanas: pack(
    [
      ["Pesquisa de campo", "Coleta de dados diretamente com pessoas ou territórios"],
      ["Fonte primária", "Documento ou registro original usado em uma pesquisa histórica"],
      ["Geoprocessamento", "Uso de mapas e dados espaciais para análise territorial"],
      ["Patrimônio histórico", "Bens materiais ou imateriais preservados por seu valor cultural"],
      ["Licenciatura", "Formação exigida para lecionar História ou Geografia"],
      ["Políticas públicas", "Ações do Estado voltadas a um problema social"],
    ],
    {
      q: "Qual é o principal caminho de contratação em pesquisa/museus/órgãos públicos de Humanas?",
      options: ["Concurso público ou processo seletivo específico", "Registro em conselho profissional", "Apenas indicação pessoal", "Exame de ordem"],
      correct: 0,
      explanation: "Sem conselho regulador, essas áreas contratam majoritariamente por concurso ou seleção pública.",
    }
  ),
  "servico-social": pack(
    [
      ["CRESS", "Conselho que registra o(a) assistente social para exercer a profissão"],
      ["CRAS", "Unidade pública de referência da assistência social"],
      ["Instituto Rio Branco", "Concurso de ingresso na carreira diplomática"],
      ["Política social", "Ação pública voltada a reduzir vulnerabilidades"],
      ["Terceiro setor", "Organizações sem fins lucrativos, como ONGs"],
      ["Direitos humanos", "Garantias fundamentais de dignidade para todas as pessoas"],
    ],
    {
      q: "O que é exigido para atuar como assistente social no Brasil?",
      options: ["Registro no CRESS", "Registro no CRP", "Aprovação no Instituto Rio Branco", "Registro no CRA"],
      correct: 0,
      explanation: "O CRESS é o conselho responsável pelo registro e fiscalização do Serviço Social.",
    }
  ),
  artes: pack(
    [
      ["Portfólio artístico", "Coleção de trabalhos que demonstra o repertório de um artista"],
      ["Edital cultural", "Chamada pública para financiar projetos artísticos"],
      ["Curadoria", "Seleção e organização de obras para uma mostra ou coleção"],
      ["Ensaio", "Prática de preparação de uma apresentação artística"],
      ["Arte-educação", "Uso da arte como ferramenta de ensino"],
      ["Produção cultural", "Organização e viabilização de eventos artísticos"],
    ],
    {
      q: "O que costuma pesar mais na carreira artística do que o diploma formal?",
      options: ["Portfólio e participação em editais/coletivos", "Registro em conselho profissional", "Aprovação em concurso público", "Certificação internacional"],
      correct: 0,
      explanation: "Sem conselho regulador geral, portfólio, editais culturais e coletivos são o principal ativo de carreira.",
    }
  ),
  moda: pack(
    [
      ["Coleção", "Conjunto de peças desenvolvidas com um mesmo conceito"],
      ["Modelagem", "Construção do molde que dá forma a uma peça"],
      ["Editorial de moda", "Produção fotográfica temática para divulgar peças ou tendências"],
      ["Moda sustentável", "Produção com foco em reduzir impacto ambiental e social"],
      ["Consultoria de imagem", "Orientação personalizada sobre estilo pessoal"],
      ["Portfólio de moda", "Coleção de peças e projetos que demonstra o trabalho do(a) profissional"],
    ],
    {
      q: "O que é o principal ativo de carreira em Moda, com ou sem vínculo com uma marca?",
      options: ["Portfólio de peças e coleções", "Registro em conselho profissional", "Aprovação em concurso público", "Certificação internacional"],
      correct: 0,
      explanation: "Sem conselho regulador, o portfólio de peças e coleções é o que mais pesa na contratação ou no trabalho autônomo.",
    }
  ),
  "gastronomia-turismo": pack(
    [
      ["Mise en place", "Organização prévia dos ingredientes antes do preparo"],
      ["Cadastur", "Cadastro obrigatório para atuar como guia de turismo"],
      ["Ficha técnica", "Documento com ingredientes, custo e modo de preparo de um prato"],
      ["Rush", "Período de pico de atendimento em cozinha ou salão"],
      ["Roteiro turístico", "Planejamento de um itinerário de viagem ou passeio"],
      ["Enologia", "Estudo e apreciação técnica de vinhos"],
    ],
    {
      q: "O que é obrigatório para atuar como guia de turismo no Brasil?",
      options: ["Cadastro no Cadastur", "Registro em conselho profissional", "Diploma de graduação específico", "Aprovação em concurso público"],
      correct: 0,
      explanation: "Guias de turismo dependem do cadastro no Cadastur; chefs e gestores são contratados principalmente por experiência prática.",
    }
  ),
  audiovisual: pack(
    [
      ["Roteiro", "Texto que estrutura a narrativa de uma produção audiovisual"],
      ["Storyboard", "Sequência de imagens que planeja cenas antes da gravação"],
      ["Pós-produção", "Etapa de edição, cor e som após a gravação"],
      ["Reel", "Compilação curta dos melhores trabalhos de um profissional"],
      ["Enquadramento", "Escolha de ângulo e composição de uma cena"],
      ["Trilha sonora", "Música e efeitos que acompanham uma produção"],
    ],
    {
      q: "O que costuma pesar mais na contratação em Audiovisual do que o diploma?",
      options: ["Reel/portfólio de projetos", "Registro em conselho profissional", "Aprovação em concurso público", "Certificação internacional"],
      correct: 0,
      explanation: "Sem conselho regulador, o reel de projetos é o principal critério de contratação em produtoras ou como freelancer.",
    }
  ),
  "seguranca-publica": pack(
    [
      ["Concurso público", "Principal via de ingresso nas carreiras de segurança pública"],
      ["Teste físico", "Etapa de avaliação de condicionamento físico do concurso"],
      ["Academia de formação", "Treinamento obrigatório após aprovação no concurso"],
      ["Perícia criminal", "Investigação técnica de vestígios de um crime"],
      ["Avaliação psicológica", "Etapa do concurso que avalia perfil psicológico do candidato"],
      ["Hierarquia", "Estrutura de comando típica de carreiras militares e policiais"],
    ],
    {
      q: "Qual é o principal caminho de ingresso em carreiras de Segurança Pública no Brasil?",
      options: ["Concurso público com prova, teste físico e formação", "Processo seletivo de mercado privado", "Registro em conselho profissional", "Indicação direta"],
      correct: 0,
      explanation: "O ingresso é majoritariamente via concurso público, com etapas eliminatórias e formação em academia.",
    }
  ),
};

function normalize(value: string) {
  return value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

function resolveArea(profile: CareerGameProfile): { slug: string | null; label: string } {
  const value = profile.targetProfessionalArea || profile.professionalArea || profile.studyCourse || "";
  const slug = matchAreaSlug(value);
  if (slug && AREA_PACKS[slug]) {
    const label = VOCATION_AREAS.find((a) => a.slug === slug)?.label ?? value;
    return { slug, label };
  }
  return { slug: null, label: value.trim() || "sua área" };
}

function shuffle<T>(list: T[]): T[] {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// Deriva perguntas extras de múltipla escolha a partir do próprio vocabulário
// da área, usando as definições de outros termos como distratores. Evita
// depender de um único "fact" por área e dá volume real de rodadas (duelo etc.)
function termQuestions(terms: CareerMemoryPair[]): CareerQuestion[] {
  if (terms.length < 4) return [];
  return terms.map((target, index) => {
    const distractors = shuffle(terms.filter((_, i) => i !== index)).slice(0, 3).map((t) => t.definition);
    const options = shuffle([target.definition, ...distractors]);
    return {
      q: `O que é "${target.term}"?`,
      options,
      correct: options.indexOf(target.definition),
      explanation: `${target.term}: ${target.definition}`,
    };
  });
}

function genericPairs(area: string, course?: string | null): CareerMemoryPair[] {
  return [
    { term: area, definition: `Área profissional escolhida pelo usuário${course ? `, relacionada ao curso de ${course}` : ""}` },
    { term: "Habilidade técnica", definition: `Conhecimento prático necessário para atuar em ${area}` },
    { term: "Portfólio", definition: `Evidência concreta de projetos ou resultados em ${area}` },
    { term: "Networking", definition: `Construção de relações profissionais relevantes para ${area}` },
    { term: "Feedback", definition: "Retorno usado para melhorar uma entrega" },
    { term: "Próximo passo", definition: `Ação pequena e prática para avançar em ${area}` },
  ];
}

export function buildCareerGamePack(profile: CareerGameProfile, phaseValue?: string | null): CareerGamePack {
  const phase: GamePhase = normalizeGamePhase(phaseValue);
  const { slug, label: area } = resolveArea(profile);
  const knownPack = slug ? AREA_PACKS[slug] : undefined;
  const pairs = (knownPack?.terms ?? genericPairs(area, profile.studyCourse)).slice(0, phase === 1 ? 4 : phase === 2 ? 5 : 6);
  const transition = profile.currentProfessionalArea && profile.targetProfessionalArea
    ? `Você está fazendo uma transição de ${profile.currentProfessionalArea} para ${profile.targetProfessionalArea}.`
    : profile.studyCourse
    ? `Você está se preparando a partir do curso de ${profile.studyCourse}.`
    : `Seu foco profissional é ${area}.`;

  const baseQuestions: CareerQuestion[] = [
    knownPack?.fact ?? {
      q: `Qual atitude mais ajuda quem quer construir carreira em ${area}?`,
      options: [`Praticar e registrar evidências em ${area}`, "Esperar estar perfeito para começar", "Evitar feedback", "Fazer tudo sem prioridade"],
      correct: 0,
      explanation: `Prática consistente, evidências e feedback ajudam a transformar interesse em competência em ${area}.`,
    },
    {
      q: `Como demonstrar preparo para uma oportunidade em ${area}?`,
      options: ["Apresentar um projeto ou situação resolvida", "Listar somente desejos", "Esconder o que ainda está aprendendo", "Enviar a mesma mensagem para todas as vagas"],
      correct: 0,
      explanation: "Projetos, exemplos e resultados tornam a experiência mais concreta para quem avalia.",
    },
    {
      q: transition,
      options: ["Usar a experiência anterior como ponte e aprender o que falta", "Apagar toda a experiência anterior", "Mudar sem estudar a nova área", "Esperar uma oportunidade sem praticar"],
      correct: 0,
      explanation: "Uma transição fica mais forte quando conecta habilidades transferíveis com prática na nova área.",
    },
  ];

  // Perguntas extras derivadas do vocabulário real da área (quando disponível),
  // para dar volume de rodadas sem repetir o mesmo conteúdo (ex: duelo 1v1).
  const questions = [...baseQuestions, ...termQuestions(knownPack?.terms ?? [])];

  const words = pairs
    .filter(({ term }) => normalize(term).replace(/[^a-z]/g, "").length >= 4)
    .map(({ term, definition }) => ({
      word: normalize(term).replace(/[^a-z]/g, "").toUpperCase(),
      hint: definition,
    }));

  return { area, context: transition, questions: questions.slice(0, phase === 1 ? 4 : phase === 2 ? 6 : 9), pairs, words };
}

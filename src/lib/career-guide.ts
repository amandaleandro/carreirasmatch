export type CareerGuideEntry = {
  slug: string;
  label: string;
  dayToDay: string;
  salaryRange: string;
  curiosities: string[];
  technicalSkills: string[];
  softSkills: string[];
};

export const CAREER_GUIDE: CareerGuideEntry[] = [
  {
    slug: "ti",
    label: "Tecnologia da Informação",
    dayToDay:
      "O dia a dia varia bastante por trilha: desenvolvedores passam boa parte do tempo escrevendo e revisando código em squads pequenos, enquanto suporte e infraestrutura lidam mais com chamados, monitoramento e resolução de incidentes. Reuniões curtas diárias (dailies) são comuns em quase toda a área.",
    salaryRange: "Estágio: R$ 1.200 – R$ 2.500 · Júnior: R$ 2.800 – R$ 5.500 · Pleno/Sênior: R$ 6.000 – R$ 18.000+",
    curiosities: [
      "Não existe um único caminho certo: muita gente entra por bootcamp ou curso livre, sem faculdade de Ciência da Computação.",
      "Portfólio no GitHub costuma pesar mais do que o diploma nas primeiras vagas.",
      "A área muda rápido, quem entra precisa se acostumar a aprender ferramentas novas o tempo todo.",
    ],
    technicalSkills: ["Lógica de programação", "Ao menos uma linguagem (Python, JS, Java...)", "Git/controle de versão", "Banco de dados básico (SQL)"],
    softSkills: ["Resolução de problemas", "Comunicação assíncrona (escrita clara)", "Autonomia para pesquisar/aprender sozinho", "Lidar bem com feedback técnico direto"],
  },
  {
    slug: "medicina",
    label: "Medicina",
    dayToDay:
      "Rotina longa desde a graduação: aulas teóricas, estágios em hospital (internato) e plantões. Depois de formado, a maioria faz residência (2 a 5 anos) antes de atuar com mais autonomia. O trabalho envolve contato direto e constante com pacientes, decisões sob pressão e muita atualização constante.",
    salaryRange: "Residente: R$ 4.100 (bolsa nacional) · Recém-formado (plantão): R$ 3.000 – R$ 8.000/plantão fixo · Especialista consolidado: R$ 15.000 – R$ 40.000+",
    curiosities: [
      "É um dos cursos mais concorridos do vestibular/ENEM, muita gente presta mais de uma vez.",
      "A escolha da especialidade só acontece depois de formado, na residência, dá para mudar de ideia pelo caminho.",
      "Plantões noturnos e fins de semana fazem parte da rotina mesmo depois de anos de carreira.",
    ],
    technicalSkills: ["Anatomia e fisiologia aprofundadas", "Raciocínio clínico/diagnóstico", "Procedimentos práticos da especialidade", "Leitura de exames e literatura científica"],
    softSkills: ["Empatia e escuta ativa", "Calma sob pressão", "Comunicação clara com pacientes leigos", "Resiliência emocional"],
  },
  {
    slug: "direito",
    label: "Direito",
    dayToDay:
      "Muda muito conforme a área: quem está no contencioso passa tempo em audiências e prazos processuais; quem está no consultivo foca em análise de contratos e pareceres. Estágio em escritório ou órgão público durante a faculdade é praticamente padrão para quem quer boas oportunidades depois.",
    salaryRange: "Estágio: R$ 800 – R$ 2.000 · Recém-formado (OAB): R$ 2.200 – R$ 4.500 · Especialista/concursado: R$ 8.000 – R$ 30.000+",
    curiosities: [
      "Passar na OAB é obrigatório para advogar, o curso sozinho não basta.",
      "Carreiras públicas (juiz, promotor, procurador) costumam ter os maiores salários da área, mas exigem concursos concorridos.",
      "Boa parte do trabalho é escrita: petições, pareceres e contratos, não só falar em audiência.",
    ],
    technicalSkills: ["Interpretação de lei e jurisprudência", "Redação jurídica (petições, pareceres)", "Pesquisa em bases jurídicas", "Noções de processos e prazos"],
    softSkills: ["Argumentação e persuasão", "Atenção a detalhes", "Organização com prazos rígidos", "Negociação"],
  },
  {
    slug: "engenharia",
    label: "Engenharia",
    dayToDay:
      "Depende muito do ramo: civil e mecânica costumam ter parte do tempo em campo/obra/planta, enquanto produção e software ficam mais em escritório com planejamento e ferramentas de gestão. Projetos costumam ter prazos e etapas bem definidas, com bastante trabalho em equipe multidisciplinar.",
    salaryRange: "Estágio: R$ 1.200 – R$ 2.800 · Júnior: R$ 3.500 – R$ 6.500 · Pleno/Sênior: R$ 7.000 – R$ 20.000+",
    curiosities: [
      "O registro no CREA é necessário para assinar projetos como engenheiro em muitas frentes.",
      "Estágio técnico durante o curso pesa muito na hora da primeira vaga, mais do que nota de faculdade.",
      "Engenharia de Produção é uma das poucas que mistura técnica com gestão de pessoas e processos.",
    ],
    technicalSkills: ["Cálculo e matemática aplicada", "Softwares de projeto/CAD da área", "Normas técnicas do setor", "Gestão básica de projetos"],
    softSkills: ["Resolução prática de problemas", "Trabalho em equipe multidisciplinar", "Atenção a segurança e precisão", "Comunicação técnica clara"],
  },
  {
    slug: "educacao",
    label: "Educação",
    dayToDay:
      "O centro da rotina é a sala de aula: planejamento de aulas, correção de atividades e o tempo em si com os alunos. Quem vai para gestão ou coordenação lida mais com organização pedagógica, reuniões com pais e times de professores do que com aula direta.",
    salaryRange: "Estágio/monitoria: R$ 700 – R$ 1.500 · Professor iniciante: R$ 2.000 – R$ 3.800 · Coordenação/gestão: R$ 4.500 – R$ 10.000+",
    curiosities: [
      "Concursos públicos municipais e estaduais são uma das portas de entrada mais buscadas por estabilidade.",
      "Cada vez mais professores complementam a renda criando conteúdo educacional (vídeos, cursos, redes sociais).",
      "Dar aula particular ou monitoria durante a faculdade já conta como experiência real na área.",
    ],
    technicalSkills: ["Planejamento de aula/currículo", "Didática e métodos de ensino", "Avaliação de aprendizagem", "Ferramentas digitais educacionais"],
    softSkills: ["Paciência", "Comunicação adaptada ao público", "Gestão de sala/turma", "Escuta e empatia com alunos"],
  },
  {
    slug: "marketing",
    label: "Marketing",
    dayToDay:
      "Rotina orientada a campanhas e métricas: planejar conteúdo, acompanhar performance de anúncios, reuniões com outras áreas (vendas, produto) e ajustes constantes baseados em dados. Prazos costumam ser curtos e a prioridade muda com frequência.",
    salaryRange: "Estágio: R$ 1.000 – R$ 2.200 · Júnior: R$ 2.500 – R$ 4.800 · Pleno/Sênior: R$ 5.500 – R$ 15.000+",
    curiosities: [
      "É uma das áreas mais abertas a quem não fez faculdade da área, portfólio e resultado prático pesam muito.",
      "Boa parte das vagas júnior pede domínio de ferramentas (Meta Ads, Google Analytics) mais do que teoria de marketing.",
      "Gerenciar rede social própria ou de terceiros já conta como experiência real para o currículo.",
    ],
    technicalSkills: ["Ferramentas de anúncio (Meta/Google Ads)", "Leitura de métricas e dados", "Redação publicitária/copywriting", "Ferramentas de design básico"],
    softSkills: ["Criatividade aplicada a resultado", "Adaptação rápida a mudanças", "Comunicação persuasiva", "Organização com múltiplos projetos"],
  },
  {
    slug: "design",
    label: "Design",
    dayToDay:
      "O trabalho gira em torno de projetos: entender um problema, criar alternativas visuais ou de produto, testar com usuários ou apresentar para o cliente, e refinar. Muitos designers trabalham em ciclos curtos (sprints) junto com times de produto e tecnologia.",
    salaryRange: "Estágio: R$ 1.000 – R$ 2.300 · Júnior: R$ 2.800 – R$ 5.000 · Pleno/Sênior: R$ 6.000 – R$ 16.000+",
    curiosities: [
      "Portfólio (behance, site próprio) costuma valer mais do que diploma na hora da contratação.",
      "UX/UI Design cresceu muito nos últimos anos por causa da demanda de produtos digitais.",
      "Muitos designers começam fazendo freelas antes da primeira vaga CLT.",
    ],
    technicalSkills: ["Ferramentas de design (Figma e similares)", "Fundamentos de composição/tipografia", "Prototipagem", "Noções de usabilidade"],
    softSkills: ["Receber e aplicar feedback", "Apresentar e defender ideias", "Empatia com o usuário final", "Organização de entregas por prazo"],
  },
  {
    slug: "administracao",
    label: "Administração e Negócios",
    dayToDay:
      "É uma das áreas mais amplas: pode significar cuidar de operações do dia a dia, liderar pessoas, analisar números financeiros ou planejar estratégia. A rotina muda bastante conforme a frente escolhida, mas organização e reuniões fazem parte da maioria delas.",
    salaryRange: "Estágio: R$ 1.000 – R$ 2.200 · Júnior: R$ 2.500 – R$ 5.000 · Pleno/Sênior/Gestão: R$ 6.000 – R$ 18.000+",
    curiosities: [
      "É um curso comum para quem quer empreender, dá base para abrir e organizar o próprio negócio.",
      "Empresa júnior durante a faculdade é uma das formas mais valorizadas de ganhar experiência prática.",
      "A formação abre portas para praticamente qualquer setor, não só empresas tradicionais.",
    ],
    technicalSkills: ["Excel/planilhas avançadas", "Noções de finanças e indicadores", "Gestão de processos", "Ferramentas de gestão de projetos"],
    softSkills: ["Liderança", "Negociação", "Visão estratégica", "Organização e priorização"],
  },
  {
    slug: "financas",
    label: "Finanças e Contabilidade",
    dayToDay:
      "Trabalho concentrado em análise de números: fechamento contábil, relatórios financeiros, conferência de dados e, em níveis mais altos, decisões de investimento ou planejamento tributário. Prazos de fechamento (mensal, trimestral) marcam bastante a rotina.",
    salaryRange: "Estágio: R$ 1.100 – R$ 2.400 · Júnior: R$ 2.800 – R$ 5.500 · Pleno/Sênior: R$ 6.500 – R$ 20.000+",
    curiosities: [
      "O registro no CRC é exigido para atuar como contador, mesmo com o diploma em mãos.",
      "É uma das áreas com maior estabilidade de demanda, toda empresa precisa de alguém cuidando das finanças.",
      "Cursos de Excel financeiro e certificações (como CFA, para investimentos) pesam bastante além do diploma.",
    ],
    technicalSkills: ["Excel financeiro avançado", "Normas contábeis e tributárias", "Análise de demonstrativos financeiros", "Sistemas de gestão financeira (ERPs)"],
    softSkills: ["Atenção a detalhes", "Ética e discrição com dados sensíveis", "Organização com prazos fixos", "Comunicação de números para não especialistas"],
  },
  {
    slug: "comunicacao",
    label: "Comunicação e Jornalismo",
    dayToDay:
      "Rotina de apuração, escrita e edição, seja para uma matéria jornalística, um release de assessoria ou um conteúdo digital. Prazos apertados (deadlines) são constantes, e boa parte do trabalho é revisar e reescrever até o texto ficar redondo.",
    salaryRange: "Estágio: R$ 900 – R$ 2.000 · Júnior: R$ 2.300 – R$ 4.500 · Pleno/Sênior: R$ 5.000 – R$ 14.000+",
    curiosities: [
      "Ter um blog, canal ou perfil próprio já funciona como portfólio real para a primeira vaga.",
      "A área se expandiu muito além da redação tradicional, hoje inclui podcast, conteúdo para redes e comunicação corporativa.",
      "Freelances de redação são uma porta de entrada comum antes da primeira vaga CLT.",
    ],
    technicalSkills: ["Redação e revisão de texto", "Apuração e checagem de fatos", "Ferramentas de edição (texto, áudio ou vídeo)", "Noções de SEO/algoritmos de distribuição"],
    softSkills: ["Curiosidade e senso crítico", "Trabalho sob prazo apertado", "Clareza na comunicação", "Adaptar tom para públicos diferentes"],
  },
  {
    slug: "enfermagem",
    label: "Enfermagem",
    dayToDay:
      "Rotina de plantões (12h, 24h ou escalas fixas) com cuidado direto ao paciente: administrar medicação, curativos, monitorar sinais vitais e registrar tudo em prontuário. Trabalho em equipe constante com médicos, técnicos e outros enfermeiros, muitas vezes sob pressão de tempo.",
    salaryRange: "Estágio/técnico: R$ 1.400 – R$ 2.500 · Enfermeiro júnior: R$ 3.000 – R$ 5.500 · Pleno/Sênior/gestão: R$ 6.000 – R$ 14.000+",
    curiosities: [
      "É uma das profissões de saúde com maior número de vagas abertas no país, inclusive em cidades pequenas.",
      "O curso técnico já permite atuar (como técnico de enfermagem) antes mesmo de cursar a graduação completa.",
      "Plantões noturnos e em feriados são praticamente regra, não exceção, na maior parte da carreira.",
    ],
    technicalSkills: ["Procedimentos técnicos (curativo, medicação, punção)", "Registro em prontuário", "Protocolos de biossegurança", "Uso de equipamentos hospitalares"],
    softSkills: ["Calma sob pressão", "Trabalho em equipe multiprofissional", "Empatia com pacientes e famílias", "Resistência física e emocional"],
  },
  {
    slug: "odontologia",
    label: "Odontologia",
    dayToDay:
      "Grande parte do tempo é em consultório, atendendo pacientes em procedimentos que exigem precisão manual e paciência, muitos deles ansiosos ou com medo. Quem tem consultório próprio também lida com gestão de agenda, equipe e finanças do negócio.",
    salaryRange: "Estágio: R$ 1.000 – R$ 2.000 · Recém-formado: R$ 2.500 – R$ 5.000 · Especialista/consultório próprio: R$ 8.000 – R$ 25.000+",
    curiosities: [
      "Boa parte dos dentistas abre consultório próprio nos primeiros anos de carreira, unindo técnica e gestão de negócio.",
      "Especializações (ortodontia, implantodontia) costumam elevar bastante a renda em relação à clínica geral.",
      "É uma das poucas áreas de saúde em que trabalho autônomo é a regra, não a exceção.",
    ],
    technicalSkills: ["Procedimentos clínicos de precisão manual", "Uso de equipamentos e materiais odontológicos", "Leitura de radiografias", "Noções básicas de gestão de consultório"],
    softSkills: ["Paciência com pacientes ansiosos", "Atenção a detalhes", "Comunicação clara sobre tratamentos", "Organização de agenda e prazos"],
  },
  {
    slug: "farmacia",
    label: "Farmácia",
    dayToDay:
      "Varia entre atendimento direto ao público (farmácia comunitária), rotina de bancada em laboratório (análises clínicas ou indústria) e conferência de processos regulatórios. Precisão e atenção a detalhes são constantes, já que erros afetam diretamente a saúde de quem usa os produtos.",
    salaryRange: "Estágio: R$ 1.000 – R$ 2.200 · Júnior: R$ 2.800 – R$ 5.000 · Pleno/Sênior (indústria): R$ 6.000 – R$ 15.000+",
    curiosities: [
      "A indústria farmacêutica costuma pagar melhor do que a farmácia de bairro, mas exige mais especialização técnica.",
      "É uma das áreas de saúde com maior variedade de caminhos: clínica, indústria, laboratório e vigilância sanitária.",
      "O farmacêutico responsável técnico tem responsabilidade legal sobre tudo que é vendido no estabelecimento.",
    ],
    technicalSkills: ["Farmacologia e interação medicamentosa", "Análises laboratoriais", "Normas de vigilância sanitária", "Manipulação/controle de qualidade"],
    softSkills: ["Atenção extrema a detalhes", "Ética e responsabilidade", "Comunicação com pacientes leigos", "Organização de processos regulatórios"],
  },
  {
    slug: "fisioterapia",
    label: "Fisioterapia",
    dayToDay:
      "Atendimentos individuais com foco em reabilitação: avaliar o paciente, definir exercícios/técnicas e acompanhar a evolução ao longo de semanas ou meses. Quem atua no esporte também acompanha treinos e jogos para prevenção de lesões.",
    salaryRange: "Estágio: R$ 900 – R$ 1.800 · Júnior: R$ 2.500 – R$ 4.500 · Pleno/Sênior/clínica própria: R$ 5.500 – R$ 14.000+",
    curiosities: [
      "É comum começar como autônomo, atendendo em clínicas parceiras ou domiciliar, antes de abrir consultório próprio.",
      "Fisioterapia esportiva cresceu muito com a profissionalização de academias e clubes.",
      "O acompanhamento de cada paciente costuma ser de médio a longo prazo, diferente de consultas pontuais.",
    ],
    technicalSkills: ["Avaliação funcional/postural", "Técnicas manuais e de reabilitação", "Prescrição de exercícios terapêuticos", "Uso de equipamentos (eletroterapia, etc.)"],
    softSkills: ["Paciência com evolução gradual", "Empatia e escuta", "Motivação do paciente ao longo do tratamento", "Organização de agenda"],
  },
  {
    slug: "nutricao",
    label: "Nutrição",
    dayToDay:
      "Consultas para montar planos alimentares individuais, acompanhando exames e evolução do paciente ao longo do tempo. Quem trabalha em unidades de alimentação (escolas, hospitais, empresas) foca mais em gestão de cardápio, equipe e custos.",
    salaryRange: "Estágio: R$ 900 – R$ 1.800 · Júnior: R$ 2.300 – R$ 4.200 · Pleno/Sênior/consultório: R$ 5.000 – R$ 12.000+",
    curiosities: [
      "Nutrição esportiva e estética cresceram muito com o aumento do interesse por saúde e performance física.",
      "Criar conteúdo em redes sociais virou uma forma comum de nutricionistas construírem clientela própria.",
      "Trabalhar em unidades de alimentação (hospitais, escolas) costuma dar mais estabilidade do que consultório próprio no início.",
    ],
    technicalSkills: ["Avaliação nutricional e antropométrica", "Elaboração de planos alimentares", "Gestão de unidades de alimentação", "Leitura de exames bioquímicos"],
    softSkills: ["Escuta ativa sobre hábitos e rotina", "Comunicação sem julgamento", "Motivação e acompanhamento constante", "Organização de agenda de consultas"],
  },
  {
    slug: "psicologia",
    label: "Psicologia",
    dayToDay:
      "Sessões individuais (presenciais ou online) com escuta ativa e condução terapêutica ao longo de semanas ou anos, no caso clínico. Quem atua em RH ou escolas foca mais em processos seletivos, treinamentos ou acompanhamento pedagógico do que em terapia individual.",
    salaryRange: "Estágio: R$ 800 – R$ 1.800 · Recém-formado (sessão avulsa): R$ 80 – R$ 200/sessão · Consultório consolidado: R$ 6.000 – R$ 15.000+",
    curiosities: [
      "A terapia online expandiu muito o alcance de psicólogos recém-formados, permitindo atender pacientes de outras cidades.",
      "É obrigatório registro no Conselho Regional de Psicologia (CRP) para atuar como psicólogo.",
      "Boa parte dos psicólogos clínicos começa atendendo a preço social até formar uma agenda estável.",
    ],
    technicalSkills: ["Abordagens terapêuticas (TCC, psicanálise, etc.)", "Avaliação psicológica", "Condução de processos seletivos (se RH)", "Registro e sigilo de prontuário"],
    softSkills: ["Escuta ativa e empatia", "Regulação emocional própria", "Ética e sigilo profissional", "Paciência com processos de longo prazo"],
  },
  {
    slug: "veterinaria",
    label: "Medicina Veterinária",
    dayToDay:
      "Em clínica de pets, o dia é de consultas, cirurgias e emergências com donos ansiosos pelo bem-estar do animal. Em produção animal/agropecuária, a rotina inclui visitas a fazendas, manejo de rebanho e questões sanitárias em maior escala.",
    salaryRange: "Estágio: R$ 1.000 – R$ 2.000 · Recém-formado: R$ 2.500 – R$ 5.000 · Especialista/clínica própria: R$ 7.000 – R$ 20.000+",
    curiosities: [
      "O mercado pet cresceu muito nos últimos anos, ampliando bastante as vagas em clínicas veterinárias urbanas.",
      "Plantões noturnos e emergenciais fazem parte da rotina de quem atua em clínicas 24h.",
      "Veterinária de grandes animais costuma exigir bastante deslocamento até propriedades rurais.",
    ],
    technicalSkills: ["Procedimentos clínicos e cirúrgicos", "Diagnóstico por exame/imagem", "Manejo animal (pet ou produção)", "Farmacologia veterinária"],
    softSkills: ["Calma em emergências", "Comunicação com tutores/produtores", "Resistência física para trabalho de campo", "Empatia com animais e donos"],
  },
  {
    slug: "educacao-fisica",
    label: "Educação Física",
    dayToDay:
      "Em academia, o foco é montar e acompanhar treinos individuais ao longo do tempo. Na escola, a rotina é de aulas práticas com turmas, com bastante gestão de grupo e segurança. No esporte de alto rendimento, envolve planejamento de temporada e acompanhamento próximo de atletas.",
    salaryRange: "Estágio: R$ 800 – R$ 1.600 · Personal/professor júnior: R$ 2.000 – R$ 4.000 · Pleno/Sênior/gestão esportiva: R$ 4.500 – R$ 12.000+",
    curiosities: [
      "Personal trainer é uma das formas mais comuns de trabalho autônomo dentro da área, com renda variável conforme número de alunos.",
      "Concursos públicos para professor de educação física costumam ter boa estabilidade e carga horária definida.",
      "A área se expandiu para bem-estar corporativo, com empresas contratando profissionais para programas internos.",
    ],
    technicalSkills: ["Prescrição de treino/exercício", "Avaliação física", "Didática para turmas (se escolar)", "Noções de fisiologia do exercício"],
    softSkills: ["Motivação de alunos/atletas", "Gestão de grupo/turma", "Comunicação clara e encorajadora", "Disciplina e constância"],
  },
  {
    slug: "arquitetura",
    label: "Arquitetura e Urbanismo",
    dayToDay:
      "Alterna entre tempo de escritório (desenhando projetos em software, reuniões com clientes) e visitas a obras para acompanhar execução. Prazos de entrega de projeto e aprovação em prefeitura fazem parte constante da rotina.",
    salaryRange: "Estágio: R$ 1.100 – R$ 2.200 · Júnior: R$ 2.800 – R$ 5.000 · Pleno/Sênior/escritório próprio: R$ 6.000 – R$ 18.000+",
    curiosities: [
      "O registro no CAU (Conselho de Arquitetura e Urbanismo) é obrigatório para assinar projetos.",
      "Muitos arquitetos combinam trabalho em escritório com projetos autônomos (freelas) desde cedo na carreira.",
      "Portfólio visual (site, Instagram, Behance) pesa tanto quanto o currículo tradicional nessa área.",
    ],
    technicalSkills: ["Softwares de projeto (CAD, Revit, SketchUp)", "Normas técnicas e código de obras", "Cálculo estrutural básico", "Gestão de obra"],
    softSkills: ["Criatividade aplicada a restrições reais", "Apresentação e defesa de projetos", "Negociação com clientes", "Organização de prazos e etapas"],
  },
  {
    slug: "biologicas",
    label: "Ciências Biológicas",
    dayToDay:
      "Quem está em pesquisa/academia divide o tempo entre laboratório, campo (coleta de dados) e escrita de artigos científicos. Quem dá aula foca em preparar e ministrar aulas; quem atua com meio ambiente participa de vistorias, laudos e projetos de conservação.",
    salaryRange: "Estágio/IC: R$ 700 – R$ 1.500 · Júnior/professor: R$ 2.200 – R$ 4.000 · Pesquisador/consultor sênior: R$ 5.000 – R$ 14.000+",
    curiosities: [
      "Grande parte da carreira em pesquisa depende de bolsas (mestrado/doutorado) antes de chegar a um cargo estável.",
      "Biotecnologia é uma das frentes que mais cresceu dentro da área nos últimos anos.",
      "Trabalho de campo pode significar dias ou semanas fora de casa, dependendo do projeto (mata, mar, etc.).",
    ],
    technicalSkills: ["Técnicas de laboratório", "Coleta e análise de dados de campo", "Redação científica", "Softwares de análise estatística"],
    softSkills: ["Rigor metodológico", "Paciência com processos longos de pesquisa", "Didática (se ensino)", "Adaptação a condições de campo"],
  },
  {
    slug: "agronomia",
    label: "Agronomia e Ciências Agrárias",
    dayToDay:
      "Rotina de campo constante: visitas a propriedades, acompanhamento de safra, análise de solo e orientação técnica a produtores. Quem atua em gestão do agronegócio foca mais em planejamento, compras e resultado financeiro da produção.",
    salaryRange: "Estágio: R$ 1.200 – R$ 2.500 · Júnior: R$ 3.000 – R$ 5.500 · Pleno/Sênior/consultoria: R$ 6.500 – R$ 16.000+",
    curiosities: [
      "É uma das áreas com maior demanda em cidades do interior, muitas vezes com mais oportunidades do que nas capitais.",
      "Muitos agrônomos vêm de família produtora, mas não é pré-requisito, só ajuda a entender a rotina de campo.",
      "Sustentabilidade e agricultura de precisão (tecnologia no campo) são as frentes que mais crescem na área.",
    ],
    technicalSkills: ["Análise de solo e manejo de cultura", "Uso de tecnologia agrícola (drones, sensores)", "Gestão de produção rural", "Controle fitossanitário"],
    softSkills: ["Resistência para trabalho de campo", "Comunicação com produtores rurais", "Tomada de decisão sob condições variáveis (clima, safra)", "Organização de cronograma agrícola"],
  },
  {
    slug: "exatas",
    label: "Matemática, Estatística e Física",
    dayToDay:
      "Quem dá aula foca em preparar e ministrar aulas de conceitos abstratos para diferentes níveis. Quem atua com dados/estatística passa boa parte do tempo analisando números e construindo modelos; pesquisadores dividem tempo entre estudo teórico e produção de artigos.",
    salaryRange: "Estágio/monitoria: R$ 800 – R$ 1.600 · Professor/analista júnior: R$ 2.500 – R$ 5.000 · Sênior/atuário/pesquisador: R$ 6.000 – R$ 18.000+",
    curiosities: [
      "Estatística e ciência de dados viraram uma das portas de entrada mais bem pagas para quem gosta de exatas, mesmo fora da academia.",
      "Atuária é uma das profissões menos conhecidas da área, mas com salários entre os mais altos do mercado.",
      "Dar aula particular durante a faculdade é uma forma comum de já começar a ganhar experiência de ensino.",
    ],
    technicalSkills: ["Modelagem matemática/estatística", "Programação para análise de dados", "Rigor em demonstrações/cálculos", "Didática (se ensino)"],
    softSkills: ["Pensamento lógico-abstrato", "Paciência para explicar conceitos complexos", "Atenção a detalhes numéricos", "Persistência diante de problemas difíceis"],
  },
  {
    slug: "letras",
    label: "Letras, Tradução e Idiomas",
    dayToDay:
      "Quem traduz passa boa parte do tempo sozinho, em prazos por projeto/palavra. Quem ensina idiomas foca em aulas e preparação de material didático. Quem revisa textos trabalha com prazos editoriais, ajustando gramática, clareza e estilo de outros autores.",
    salaryRange: "Estágio: R$ 700 – R$ 1.500 · Júnior (tradução/aulas): R$ 2.000 – R$ 4.000 · Pleno/Sênior (tradução especializada): R$ 4.500 – R$ 12.000+",
    curiosities: [
      "Grande parte dos tradutores e revisores trabalha como freelancer, cobrando por palavra ou por projeto.",
      "Certificações internacionais de idioma (Cambridge, TOEFL) pesam tanto quanto o diploma em vagas de ensino.",
      "Legendagem e localização de jogos/apps são frentes relativamente novas com demanda crescente.",
    ],
    technicalSkills: ["Domínio avançado de idioma(s)", "Técnicas de tradução/revisão", "Ferramentas de tradução assistida (CAT tools)", "Didática (se ensino de idiomas)"],
    softSkills: ["Atenção a detalhes e precisão", "Organização para trabalho por projeto/prazo", "Paciência com nuances de linguagem", "Comunicação intercultural"],
  },
  {
    slug: "humanas",
    label: "História, Geografia e Ciências Sociais",
    dayToDay:
      "Quem dá aula foca em preparar e ministrar aulas para diferentes níveis. Pesquisadores dividem tempo entre arquivo/campo e escrita acadêmica. Quem atua com geoprocessamento trabalha com softwares de mapas e dados territoriais para projetos públicos ou privados.",
    salaryRange: "Estágio/IC: R$ 700 – R$ 1.500 · Professor/analista júnior: R$ 2.200 – R$ 4.000 · Pesquisador/consultor sênior: R$ 5.000 – R$ 12.000+",
    curiosities: [
      "Concursos públicos (educação, órgãos de patrimônio, políticas públicas) são um dos principais caminhos de carreira estável na área.",
      "Geoprocessamento é uma das frentes mais técnicas e bem remuneradas dentro das ciências humanas.",
      "Produção de conteúdo sobre história e sociedade (podcasts, redes) virou uma forma alternativa de atuação.",
    ],
    technicalSkills: ["Pesquisa e análise documental/estatística", "Softwares de geoprocessamento (se aplicável)", "Redação acadêmica", "Didática (se ensino)"],
    softSkills: ["Pensamento crítico", "Curiosidade investigativa", "Comunicação de temas complexos", "Paciência com pesquisa de longo prazo"],
  },
  {
    slug: "servico-social",
    label: "Serviço Social e Relações Internacionais",
    dayToDay:
      "No serviço social, a rotina envolve atendimento direto a famílias em vulnerabilidade, visitas domiciliares e articulação com a rede de assistência. Em relações internacionais, o trabalho varia entre análise de cenários geopolíticos, comércio exterior ou preparação para carreira diplomática.",
    salaryRange: "Estágio: R$ 800 – R$ 1.800 · Júnior (assistente social/analista): R$ 2.500 – R$ 4.500 · Pleno/Sênior/diplomata: R$ 5.000 – R$ 15.000+",
    curiosities: [
      "Assistente social é uma profissão regulamentada, com registro obrigatório no CRESS para atuar.",
      "A carreira diplomática (Instituto Rio Branco) é extremamente concorrida, mas relações internacionais abre portas em comércio exterior e ONGs também.",
      "Boa parte das vagas de serviço social está em órgãos públicos (CRAS, CREAS, hospitais).",
    ],
    technicalSkills: ["Análise de políticas públicas/sociais", "Elaboração de laudos e relatórios sociais", "Idiomas (se relações internacionais)", "Mediação de conflitos"],
    softSkills: ["Empatia com vulnerabilidade social", "Escuta ativa e acolhimento", "Argumentação e negociação", "Resiliência emocional"],
  },
  {
    slug: "artes",
    label: "Artes Visuais, Cênicas e Música",
    dayToDay:
      "Combina tempo de criação/ensaio individual ou em grupo com apresentações, mostras ou gravações. Muitos artistas dividem a rotina entre produção própria e aulas, freelas ou produção cultural para manter renda estável.",
    salaryRange: "Cachês iniciais: R$ 100 – R$ 500/apresentação · Profissional estabelecido: R$ 2.500 – R$ 8.000/mês (renda variável) · Referência na área: R$ 10.000+",
    curiosities: [
      "A renda costuma ser bem variável e vir de múltiplas fontes: aulas, apresentações, encomendas e editais culturais.",
      "Editais de fomento cultural (municipais, estaduais, federais) são uma fonte importante de renda para muitos artistas.",
      "Ensinar (oficinas, aulas particulares) é uma forma comum de complementar renda enquanto a carreira artística se consolida.",
    ],
    technicalSkills: ["Técnica específica da linguagem (voz, instrumento, atuação, plástica)", "Produção e captação de recursos (editais)", "Ensaio e apresentação ao vivo", "Ferramentas de registro/gravação"],
    softSkills: ["Resiliência com rejeição/instabilidade", "Trabalho colaborativo", "Autogestão de carreira", "Expressividade e presença de palco"],
  },
  {
    slug: "moda",
    label: "Moda",
    dayToDay:
      "Envolve pesquisa de tendências, criação de peças/coleções, prova e ajuste de modelagem, e acompanhamento de produção. Quem atua com consultoria de imagem foca em atendimento individual, entendendo o estilo e as necessidades do cliente.",
    salaryRange: "Estágio: R$ 1.000 – R$ 2.000 · Júnior: R$ 2.300 – R$ 4.200 · Pleno/Sênior/marca própria: R$ 5.000 – R$ 15.000+",
    curiosities: [
      "Muitos profissionais de moda começam com marca própria pequena antes de trabalhar em grandes empresas.",
      "Moda sustentável e upcycling cresceram como resposta à crítica ao consumo rápido de roupas.",
      "Portfólio (físico ou digital) costuma valer mais do que o diploma na hora de conseguir as primeiras oportunidades.",
    ],
    technicalSkills: ["Modelagem e costura", "Desenho de moda/ilustração", "Softwares de design (Illustrator, CLO 3D)", "Noções de precificação e produção"],
    softSkills: ["Criatividade aplicada a tendências", "Atenção a detalhes de acabamento", "Comunicação com clientes/fornecedores", "Organização de prazos de coleção"],
  },
  {
    slug: "gastronomia-turismo",
    label: "Gastronomia, Hotelaria e Turismo",
    dayToDay:
      "Na cozinha, a rotina é de preparo intenso em horário de pico (rush), com trabalho em pé e sob pressão de tempo. Em hotelaria e turismo, o foco é atendimento ao cliente, organização de reservas/roteiros e resolução de imprevistos no momento em que acontecem.",
    salaryRange: "Estágio: R$ 900 – R$ 1.800 · Júnior (cozinheiro/recepcionista): R$ 1.800 – R$ 3.500 · Chef/gerente sênior: R$ 5.000 – R$ 15.000+",
    curiosities: [
      "É uma das áreas com rotina mais intensa em horários não convencionais: noites, fins de semana e feriados.",
      "Muitos chefs começam literalmente lavando louça e subindo posição por posição dentro da cozinha.",
      "Turismo tem forte sazonalidade, épocas de alta e baixa temporada mudam bastante o volume de trabalho.",
    ],
    technicalSkills: ["Técnicas de cozinha/confeitaria", "Gestão de estoque e custos", "Atendimento e organização de eventos/roteiros", "Normas de higiene e segurança alimentar"],
    softSkills: ["Trabalho sob pressão em horário de pico", "Resistência física", "Atendimento e hospitalidade", "Trabalho em equipe em ritmo acelerado"],
  },
  {
    slug: "audiovisual",
    label: "Cinema, TV e Audiovisual",
    dayToDay:
      "Alterna entre fases bem distintas: pré-produção (roteiro, planejamento), produção (gravação, geralmente em equipe e com prazo apertado) e pós-produção (edição, longas horas sozinho ou em dupla). Prazos de entrega marcam praticamente todo o processo.",
    salaryRange: "Estágio/freela iniciante: R$ 800 – R$ 2.000/projeto · Júnior: R$ 2.500 – R$ 4.500 · Pleno/Sênior/diretor: R$ 5.500 – R$ 15.000+",
    curiosities: [
      "Grande parte do mercado funciona por projeto (freelance), não por CLT fixa, a rede de contatos pesa muito.",
      "Criar conteúdo próprio (canal, curtas) é uma forma comum de construir portfólio antes da primeira produtora.",
      "A pós-produção (edição) é uma das portas de entrada mais acessíveis, já que dá para aprender e praticar sozinho com poucos recursos.",
    ],
    technicalSkills: ["Operação de câmera/equipamentos", "Softwares de edição/pós-produção", "Roteiro e narrativa visual", "Captação e edição de som"],
    softSkills: ["Trabalho em equipe sob prazo", "Criatividade narrativa", "Adaptação a imprevistos de produção", "Networking constante"],
  },
  {
    slug: "seguranca-publica",
    label: "Segurança Pública e Carreiras Militares",
    dayToDay:
      "Rotina de escalas e plantões, com forte disciplina hierárquica e protocolos definidos. Envolve desde policiamento e atendimento de ocorrências até investigação, perícia ou atuação em operações específicas, dependendo da carreira escolhida.",
    salaryRange: "Praça/soldado iniciante: R$ 3.000 – R$ 5.500 · Carreira consolidada: R$ 6.000 – R$ 12.000 · Oficial/delegado/perito: R$ 10.000 – R$ 25.000+",
    curiosities: [
      "A entrada na maioria das carreiras é por concurso público, com preparação que costuma levar meses ou anos.",
      "Preparo físico é avaliado formalmente na maioria dos concursos, não só o conhecimento teórico.",
      "Perícia criminal é uma das frentes mais técnicas da área, exigindo formação específica (ciências exatas, biológicas ou direito) além do concurso.",
    ],
    technicalSkills: ["Conhecimento de legislação e procedimentos", "Preparo físico e tático", "Uso de equipamentos e protocolos de segurança", "Elaboração de relatórios/laudos"],
    softSkills: ["Disciplina e hierarquia", "Controle emocional sob pressão", "Trabalho em equipe estruturado", "Tomada de decisão rápida em emergências"],
  },
];

export function getCareerGuideEntry(slug: string): CareerGuideEntry | undefined {
  return CAREER_GUIDE.find((e) => e.slug === slug);
}

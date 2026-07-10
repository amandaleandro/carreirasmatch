export type InternshipChecklistItem = {
  key: string;
  title: string;
  description: string;
};

export const INTERNSHIP_CHECKLIST_ITEMS: InternshipChecklistItem[] = [
  {
    key: "termo_compromisso",
    title: "Termo de Compromisso de Estágio (TCE)",
    description:
      "Documento assinado por você, pela empresa e pela instituição de ensino, obrigatório para todo estágio (Lei 11.788/2008). Sem ele, o estágio não é válido.",
  },
  {
    key: "convenio_instituicao",
    title: "Convênio entre empresa e instituição de ensino",
    description:
      "A empresa precisa ter convênio ativo com sua faculdade/escola (direto ou via agente de integração) antes de assinar o termo.",
  },
  {
    key: "seguro_obrigatorio",
    title: "Seguro contra acidentes pessoais",
    description:
      "Obrigatório por lei, custeado pela empresa (ou pela instituição de ensino, se acordado). Confirme que a apólice está ativa desde o primeiro dia.",
  },
  {
    key: "carga_horaria",
    title: "Carga horária dentro do limite legal",
    description:
      "Máximo de 6h/dia e 30h/semana para estudantes de ensino superior, profissionalizante e ensino médio regular (4h/dia e 20h/semana para outros níveis), salvo calendário escolar com jornada especial.",
  },
  {
    key: "supervisor_local",
    title: "Supervisor no local de trabalho",
    description:
      "A empresa precisa indicar um profissional da área para orientar e avaliar seu estágio.",
  },
  {
    key: "bolsa_e_auxilios",
    title: "Bolsa-auxílio e auxílio-transporte",
    description:
      "Obrigatórios sempre que o estágio não for obrigatório para a formação (curricular obrigatório pode dispensar). Confirme os valores antes de assinar.",
  },
  {
    key: "recesso_remunerado",
    title: "Recesso remunerado",
    description:
      "30 dias de recesso a cada 12 meses de estágio (ou proporcional), preferencialmente durante as férias escolares, com pagamento da bolsa se ela for prevista.",
  },
  {
    key: "relatorio_atividades",
    title: "Relatório de atividades",
    description:
      "Vá guardando (ou peça para a empresa emitir) relatórios periódicos das atividades — servem de comprovação para a faculdade e para seu currículo depois.",
  },
  {
    key: "prazo_maximo",
    title: "Prazo máximo de 2 anos na mesma empresa",
    description:
      "Salvo estagiários com deficiência, o estágio não pode ultrapassar 2 anos contínuos na mesma parte concedente.",
  },
];

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
};

export const PUBLIC_JOB_CATEGORIES: PublicJobCategory[] = [
  {
    slug: "sem-experiencia",
    title: "Vagas sem experiência | CarreirasMatch",
    h1: "Vagas sem experiência",
    description: "Vagas de entrada, primeiro emprego, jovem aprendiz e oportunidades que não exigem experiência.",
    where: { entryLevel: true },
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
  },
  {
    slug: "estagio",
    title: "Vagas de estágio | CarreirasMatch",
    h1: "Vagas de estágio",
    description: "Vagas de estágio e trainee coletadas automaticamente.",
    where: { seniority: "Estagio" },
  },
  {
    slug: "jovem-aprendiz",
    title: "Vagas de jovem aprendiz | CarreirasMatch",
    h1: "Vagas de jovem aprendiz",
    description: "Vagas de jovem aprendiz e aprendizagem para entrada no mercado.",
    where: { q: ["jovem aprendiz", "menor aprendiz", "aprendiz"] },
  },
  {
    slug: "home-office",
    title: "Vagas home office | CarreirasMatch",
    h1: "Vagas home office",
    description: "Vagas remotas e oportunidades de trabalho de casa.",
    where: { workModel: "Remoto" },
  },
  {
    slug: "administrativo",
    title: "Vagas administrativas | CarreirasMatch",
    h1: "Vagas administrativas",
    description: "Vagas administrativas, auxiliares e assistentes.",
    where: { area: "Administrativo" },
  },
  {
    slug: "atendimento",
    title: "Vagas de atendimento ao cliente | CarreirasMatch",
    h1: "Vagas de atendimento ao cliente",
    description: "Vagas de atendimento, suporte ao cliente, recepção e relacionamento.",
    where: {
      q: ["atendimento", "atendente", "recepcionista", "recepção", "recepcao", "call center", "sac", "televendas"],
    },
  },
  {
    slug: "comercial",
    title: "Vagas comerciais e de vendas | CarreirasMatch",
    h1: "Vagas comerciais e de vendas",
    description: "Vagas comerciais, vendas internas, consultoria comercial e SDR.",
    where: { area: "Vendas" },
  },
  {
    slug: "marketing",
    title: "Vagas de marketing | CarreirasMatch",
    h1: "Vagas de marketing",
    description: "Vagas de marketing digital, social media, conteúdo e campanhas.",
    where: { area: "Marketing" },
  },
  {
    slug: "financeiro",
    title: "Vagas na área financeira | CarreirasMatch",
    h1: "Vagas na área financeira",
    description: "Vagas financeiras, contas a pagar, análise financeira e administrativo financeiro.",
    where: { area: "Financeiro" },
  },
  {
    slug: "logistica",
    title: "Vagas de logística | CarreirasMatch",
    h1: "Vagas de logística",
    description: "Vagas de logística, estoque, expedição e operações.",
    where: { area: "Logistica" },
  },
  {
    slug: "tecnologia",
    title: "Vagas de tecnologia | CarreirasMatch",
    h1: "Vagas de tecnologia",
    description: "Vagas de tecnologia, desenvolvimento, dados e suporte técnico.",
    where: { area: "Tecnologia" },
  },
];

export function findPublicJobCategory(slug: string): PublicJobCategory | undefined {
  return PUBLIC_JOB_CATEGORIES.find((category) => category.slug === slug);
}

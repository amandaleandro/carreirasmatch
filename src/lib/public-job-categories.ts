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
    title: "Vagas sem experiencia | CarreirasMatch",
    h1: "Vagas sem experiencia",
    description: "Vagas de entrada, primeiro emprego, jovem aprendiz e oportunidades que nao exigem experiencia.",
    where: { entryLevel: true },
  },
  {
    slug: "primeiro-emprego",
    title: "Vagas primeiro emprego | CarreirasMatch",
    h1: "Vagas para primeiro emprego",
    description: "Oportunidades para quem esta comecando a carreira.",
    where: { entryLevel: true, q: ["primeiro emprego", "sem experiencia", "aprendiz"] },
  },
  {
    slug: "estagio",
    title: "Vagas de estagio | CarreirasMatch",
    h1: "Vagas de estagio",
    description: "Vagas de estagio e trainee coletadas automaticamente.",
    where: { seniority: "Estagio" },
  },
  {
    slug: "jovem-aprendiz",
    title: "Vagas jovem aprendiz | CarreirasMatch",
    h1: "Vagas jovem aprendiz",
    description: "Vagas de jovem aprendiz e aprendizagem para entrada no mercado.",
    where: { q: ["jovem aprendiz", "aprendiz"] },
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
    title: "Vagas administrativo | CarreirasMatch",
    h1: "Vagas administrativo",
    description: "Vagas administrativas, auxiliares e assistentes.",
    where: { area: "Administrativo" },
  },
  {
    slug: "atendimento",
    title: "Vagas atendimento | CarreirasMatch",
    h1: "Vagas atendimento ao cliente",
    description: "Vagas de atendimento, suporte ao cliente, recepcao e relacionamento.",
    where: { q: ["atendimento", "cliente", "recepcionista", "suporte"] },
  },
  {
    slug: "comercial",
    title: "Vagas comercial e vendas | CarreirasMatch",
    h1: "Vagas comercial e vendas",
    description: "Vagas comerciais, vendas internas, consultoria comercial e SDR.",
    where: { area: "Vendas" },
  },
  {
    slug: "marketing",
    title: "Vagas marketing | CarreirasMatch",
    h1: "Vagas marketing",
    description: "Vagas de marketing digital, social media, conteudo e campanhas.",
    where: { area: "Marketing" },
  },
  {
    slug: "financeiro",
    title: "Vagas financeiro | CarreirasMatch",
    h1: "Vagas financeiro",
    description: "Vagas financeiras, contas a pagar, analise financeira e administrativo financeiro.",
    where: { area: "Financeiro" },
  },
  {
    slug: "logistica",
    title: "Vagas logistica | CarreirasMatch",
    h1: "Vagas logistica",
    description: "Vagas de logistica, estoque, expedicao e operacoes.",
    where: { area: "Logistica" },
  },
  {
    slug: "tecnologia",
    title: "Vagas tecnologia | CarreirasMatch",
    h1: "Vagas tecnologia",
    description: "Vagas de tecnologia, desenvolvimento, dados e suporte tecnico.",
    where: { area: "Tecnologia" },
  },
];

export function findPublicJobCategory(slug: string): PublicJobCategory | undefined {
  return PUBLIC_JOB_CATEGORIES.find((category) => category.slug === slug);
}

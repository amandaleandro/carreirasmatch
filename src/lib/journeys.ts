/**
 * Camada de apresentação por jornada (arquitetura de ofertas de 06/08/2026).
 *
 * Não modela nada novo em Product/Plan — só agrupa e nomeia o que já existe
 * em commercial-products.ts e commercial-plan-catalog.ts para uso em
 * landing pages e na home. Preço e regra de acesso continuam vindo de lá.
 */

export const JOURNEY_KEYS = ["career", "study", "company", "partner", "freelancer"] as const;
export type JourneyKey = (typeof JOURNEY_KEYS)[number];

export type Journey = {
  key: JourneyKey;
  name: string;
  promise: string;
  tagline: string;
  free: { label: string; href: string };
  // Parceiros e freelancer não têm os 4 níveis comerciais das outras jornadas
  // hoje (freelancer é gratuito, parceiro só tem crédito avulso, sem
  // assinatura) — por isso opcionais, em vez de inventar um nível que não existe.
  oneOff?: { label: string; productCode: string; href: string };
  subscription?: { label: string; planKeys: string[]; href: string };
};

export const JOURNEYS: Record<JourneyKey, Journey> = {
  career: {
    key: "career",
    name: "Conseguir uma vaga",
    promise: "Você mostra onde quer chegar. O CarreirasMatch organiza a rota.",
    tagline: "Pare de se candidatar no escuro.",
    free: { label: "Meu Match Inicial", href: "/analise" },
    oneOff: { label: "Plano de Candidatura", productCode: "analysis.full", href: "/analise" },
    subscription: { label: "Rota Profissional", planKeys: ["essential", "pro", "complete"], href: "/rota-profissional" },
  },
  study: {
    key: "study",
    name: "Estudar para uma aprovação",
    promise: "Transforme seu objetivo de aprovação em um plano claro de estudo.",
    tagline: "Saiba o que estudar hoje.",
    free: { label: "Diagnóstico de Preparação", href: "/estudos/diagnostico" },
    oneOff: { label: "Plano de Estudos", productCode: "analysis.full", href: "/tools/concurso/plano-de-estudo" },
    subscription: { label: "Rota de Aprovação", planKeys: ["essential", "pro", "complete"], href: "/rota-profissional?segment=concurseiro" },
  },
  company: {
    key: "company",
    name: "Contratar melhor",
    promise: "Descubra quem realmente combina com a sua vaga.",
    tagline: "Da vaga publicada aos candidatos priorizados.",
    free: { label: "Diagnóstico da Vaga", href: "/empresas/diagnostico" },
    oneOff: { label: "Triagem Match", productCode: "credits.analysis.5", href: "/empresa/triagem" },
    subscription: { label: "CarreirasMatch Empresas", planKeys: ["essential", "pro", "complete"], href: "/empresa/billing" },
  },
  partner: {
    key: "partner",
    name: "Divulgar cursos",
    promise: "Mostre seu curso para quem precisa dele para avançar.",
    tagline: "Apareça para quem acabou de descobrir que precisa aprender o que você ensina.",
    free: { label: "Perfil do Parceiro", href: "/parceiro/cadastro" },
    oneOff: { label: "Curso em Destaque", productCode: "ad_pack_5", href: "/parceiro/dashboard/anunciar" },
    // Sem assinatura: hoje é só o pacote de créditos de destaque (ver partner-billing.ts).
  },
  freelancer: {
    key: "freelancer",
    name: "Encontrar projetos",
    promise: "Encontre projetos que combinam com o que você sabe fazer.",
    tagline: "Construa reputação a cada projeto entregue.",
    free: { label: "Perfil profissional", href: "/freelancers" },
    // Marketplace gratuito hoje, sem produto avulso nem assinatura própria.
  },
};

export function getJourney(key: JourneyKey): Journey {
  return JOURNEYS[key];
}

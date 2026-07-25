/** Converte os slugs da taxonomia de carreiras em decks já disponíveis nos jogos. */
const GAME_AREA_ALIASES: Record<string, string> = {
  ti: "tecnologia",
  tecnologia: "tecnologia",
  medicina: "saude",
  enfermagem: "saude",
  odontologia: "saude",
  fisioterapia: "saude",
  psicologia: "saude",
  marketing: "marketing",
  comunicacao: "marketing",
  design: "design",
  negocios: "negocios",
  administracao: "negocios",
  financas: "negocios",
  direito: "negocios",
};

export function gameAreaFromSlug(slug: string | null | undefined, fallback = "tecnologia") {
  return (slug && GAME_AREA_ALIASES[slug]) || fallback;
}

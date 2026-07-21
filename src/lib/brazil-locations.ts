export const BRAZIL_STATE_NAMES: Record<string, string> = {
  AC: "Acre",
  AL: "Alagoas",
  AP: "Amapá",
  AM: "Amazonas",
  BA: "Bahia",
  CE: "Ceará",
  DF: "Distrito Federal",
  ES: "Espírito Santo",
  GO: "Goiás",
  MA: "Maranhão",
  MT: "Mato Grosso",
  MS: "Mato Grosso do Sul",
  MG: "Minas Gerais",
  PA: "Pará",
  PB: "Paraíba",
  PR: "Paraná",
  PE: "Pernambuco",
  PI: "Piauí",
  RJ: "Rio de Janeiro",
  RN: "Rio Grande do Norte",
  RS: "Rio Grande do Sul",
  RO: "Rondônia",
  RR: "Roraima",
  SC: "Santa Catarina",
  SP: "São Paulo",
  SE: "Sergipe",
  TO: "Tocantins",
};

export function stripDiacritics(value: string): string {
  return value.normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

// O campo livre `location` (e o `city` de PublicOpportunity) vem de dezenas de
// fontes com formatação inconsistente - algumas mantêm acento ("São Paulo"),
// outras não ("Sao Paulo"). Um filtro por "contains" comum só bate quando a
// grafia é idêntica, então geramos as duas variantes para comparar com OR.
export function locationSearchVariants(value: string): string[] {
  const trimmed = value.trim();
  if (!trimmed) return [];
  const stripped = stripDiacritics(trimmed);
  return stripped === trimmed ? [trimmed] : [trimmed, stripped];
}

// Filtrar por estado usando só a sigla (ex.: "SP") falha pra maioria das vagas,
// já que várias fontes (Adzuna, LinkedIn) gravam o nome completo do estado
// ("São Paulo", "State of São Paulo") em vez da UF. Aqui geramos a sigla e as
// variantes com/sem acento do nome por extenso pra comparar todas com OR.
export function stateSearchVariants(uf: string): string[] {
  const code = uf.trim().toUpperCase();
  const fullName = BRAZIL_STATE_NAMES[code];
  const variants = new Set<string>();
  if (code) variants.add(code);
  if (fullName) {
    for (const variant of locationSearchVariants(fullName)) variants.add(variant);
  }
  return [...variants];
}

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

const REMOTE_ONLY_PATTERN = /^(remoto|remote|home\s*-?\s*office|anywhere|worldwide|brasil|brazil)$/i;

const LOCATION_SEPARATORS = /[,/|]|(?:\s-\s)/;

const NOISE_SEGMENTS = /^(brasil|brazil|br)$/i;

// UFs ordenadas por tamanho do nome (desc) para casar "Rio Grande do Sul" antes
// de um eventual "Rio de Janeiro" via prefixo comum não é um risco aqui porque
// cada state usa `\b...\b`, mas mantemos a ordem por clareza de leitura.
const STATE_MATCHERS: { code: string; pattern: RegExp }[] = Object.keys(BRAZIL_STATE_NAMES).map((code) => {
  const variants = stateSearchVariants(code)
    .map((variant) => variant.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .sort((a, b) => b.length - a.length);
  return { code, pattern: new RegExp(`\\b(${variants.join("|")})\\b`, "i") };
});

function titleCase(value: string): string {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => (word.length <= 2 ? word : word[0].toUpperCase() + word.slice(1).toLowerCase()))
    .join(" ");
}

// Sigla de UF (2 letras) isolada num segmento - sempre é o estado, nunca a cidade.
function isStateCodeSegment(segment: string): boolean {
  const upper = segment.trim().toUpperCase();
  return upper.length === 2 && upper in BRAZIL_STATE_NAMES;
}

// Nome por extenso de UF (com/sem acento) num segmento - é o estado só quando é o
// ÚNICO segmento do texto (ex.: raw = "Rio de Janeiro" sozinho). Quando aparece
// ao lado de uma sigla (ex.: "São Paulo, SP"), é o padrão comum "Cidade, UF" e a
// capital homônima do estado é a leitura correta - por isso essa checagem some
// nesse caso (ver `hasExplicitCodeSegment` em `parseBrazilLocation`).
const ALL_STATE_FULLNAME_VARIANTS_LOWER = new Set(
  Object.values(BRAZIL_STATE_NAMES).flatMap((name) => locationSearchVariants(name).map((v) => v.toLowerCase())),
);

function isFullStateNameSegment(segment: string): boolean {
  return ALL_STATE_FULLNAME_VARIANTS_LOWER.has(segment.toLowerCase());
}

/**
 * Extrai {city, state} de um texto livre de localização vindo de qualquer fonte
 * de vaga/curso ("São Paulo, SP", "Sao Paulo - SP", "SP", "Rio de Janeiro",
 * "Remoto"...). Heurística determinística, sem chamada externa: identifica a UF
 * comparando o texto contra as variantes canônicas de cada uma das 27 UFs, e
 * usa o que sobra (sem o trecho do estado/ruído) como cidade. Retorna campos
 * vazios quando não há UF reconhecível ou o texto é remoto/genérico.
 *
 * Quando o único segmento do texto é o nome do estado (ex.: "São Paulo", que
 * também é o nome da capital, sem nenhuma sigla de UF ao lado), a cidade fica
 * vazia de propósito, não dá pra distinguir estado de capital homônima sem
 * mais contexto, e assumir errado é pior que não saber.
 */
export function parseBrazilLocation(raw: string | null | undefined): { city: string; state: string } {
  const trimmed = (raw ?? "").trim();
  if (!trimmed || REMOTE_ONLY_PATTERN.test(trimmed)) return { city: "", state: "" };

  let state = "";
  let stateMatchLength = 0;
  for (const { code, pattern } of STATE_MATCHERS) {
    const match = trimmed.match(pattern);
    if (match && match[0].length > stateMatchLength) {
      state = code;
      stateMatchLength = match[0].length;
    }
  }

  const segments = trimmed
    .split(LOCATION_SEPARATORS)
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0 && !NOISE_SEGMENTS.test(segment));

  const hasExplicitCodeSegment = segments.some(isStateCodeSegment);

  const cityCandidate = segments.find((segment) => {
    if (isStateCodeSegment(segment)) return false;
    if (REMOTE_ONLY_PATTERN.test(segment)) return false;
    if (isFullStateNameSegment(segment) && !hasExplicitCodeSegment) return false;
    return true;
  });

  const city = cityCandidate ? titleCase(cityCandidate) : "";
  return { city, state };
}

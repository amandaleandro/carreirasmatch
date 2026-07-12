// Greenhouse e Lever não têm filtro de país na API — empresas com presença
// global (ex.: Remote.com, Capco) retornam vagas de dezenas de países junto
// com as do Brasil. Esse heurístico mantém só o que é relevante pro público
// brasileiro: local desconhecido, Brasil/LatAm explícito, ou remoto global
// sem país específico. Descarta vagas amarradas a outro país/região.
const BRAZIL_OR_GLOBAL_PATTERN =
  /brazil|brasil|latam|latin america|am[eé]rica latina|south america|\bamericas\b|\bglobal\b|worldwide|anywhere/i;

// "Remote-<região>" / "Remote - <região>" é o rótulo padrão de empresas como
// Remote.com/Capco para vagas presas a uma região específica (ex.:
// "Remote-Western Europe", "Remote-Iberia"). Se não bateu no whitelist acima,
// é uma região não-Brasil. Isso NÃO pega "Remoto"/"Remote" isolado (sem
// região anexada), que é como empresas brasileiras costumam rotular.
const REMOTE_WITH_FOREIGN_REGION_PATTERN = /remote\s*-\s*\S/i;

const OTHER_COUNTRY_PATTERN =
  /\b(germany|poland|spain|portugal|ireland|austria|france|italy|england|scotland|uk|united kingdom|netherlands|denmark|norway|sweden|finland|nordics?|switzerland|belgium|ukraine|latvia|lithuania|estonia|czech(ia)?|slovakia|slovenia|hungary|romania|bulgaria|greece|croatia|serbia|turkey|israel|india|malaysia|singapore|philippines|thailand|vietnam|indonesia|taiwan|pakistan|bangladesh|sri lanka|hong kong|japan|south korea|china|russia|kazakhstan|australia|new zealand|canada|united states|usa|us|mexico|colombia|chile|peru|argentina|uruguay|paraguay|bolivia|ecuador|venezuela|africa|nigeria|kenya|egypt|morocco|tunisia|uae|united arab emirates|saudi arabia|emea|apac|dach|western europe|eastern europe|southern europe|northern europe|central europe|balkans|baltics|iberia|scandinavia|noram|central america)\b/i;

export function isBrazilRelevantLocation(location?: string): boolean {
  if (!location) return true;
  if (BRAZIL_OR_GLOBAL_PATTERN.test(location)) return true;
  if (REMOTE_WITH_FOREIGN_REGION_PATTERN.test(location)) return false;
  return !OTHER_COUNTRY_PATTERN.test(location);
}

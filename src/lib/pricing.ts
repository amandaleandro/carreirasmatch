export function parseBRLToCents(price: string): number {
  const match = price.match(/([\d.]+,\d{2}|\d+)/);
  if (!match) throw new Error(`Preço inválido: "${price}"`);
  const normalized = match[1].replace(/\./g, "").replace(",", ".");
  return Math.round(parseFloat(normalized) * 100);
}

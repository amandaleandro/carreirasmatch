export function parseBRLToCents(price: string): number {
  const match = price.match(/([\d.]+,\d{2}|\d+)/);
  if (!match) throw new Error(`Preço inválido: "${price}"`);
  const normalized = match[1].replace(/\./g, "").replace(",", ".");
  return Math.round(parseFloat(normalized) * 100);
}

export function formatCentsToBRL(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

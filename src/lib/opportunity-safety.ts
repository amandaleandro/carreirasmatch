const RISK_PATTERNS: Array<[RegExp, string, number]> = [
  [/\b(pague|pagamento|taxa|depósito|pix)\b/i, "Solicitação de pagamento", 45],
  [/\b(whatsapp|telegram)\b/i, "Contato somente por mensageiro", 10],
  [/\bganhos? (?:rápidos?|garantidos?)\b/i, "Promessa de ganho garantido", 30],
  [/\bsem entrevista\b/i, "Contratação sem entrevista", 20],
  [/\bdados? bancários?\b/i, "Pedido de dados bancários", 35],
  [/\bcompre (?:o )?(?:curso|material|kit)\b/i, "Compra obrigatória", 45],
];

export function assessOpportunityRisk(input: {
  title: string;
  description: string;
  url: string;
  official: boolean;
}) {
  const text = `${input.title} ${input.description}`;
  const reasons: string[] = [];
  let score = input.official ? 0 : 10;
  for (const [pattern, reason, points] of RISK_PATTERNS) {
    if (pattern.test(text)) {
      reasons.push(reason);
      score += points;
    }
  }
  try {
    const host = new URL(input.url).hostname;
    if (!input.official && !host.endsWith(".gov.br") && !host.endsWith(".edu.br")) {
      reasons.push("Fonte não governamental");
      score += 10;
    }
  } catch {
    reasons.push("Endereço inválido");
    score += 50;
  }
  return { score: Math.min(100, score), reasons: [...new Set(reasons)] };
}

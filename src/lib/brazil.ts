export const BRAZIL_TIME_ZONE = "America/Sao_Paulo";

export function formatBrazilDate(
  value: Date | string | number,
  options: Intl.DateTimeFormatOptions = {}
): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: BRAZIL_TIME_ZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    ...options,
  }).format(new Date(value));
}

export function formatBrazilDateTime(
  value: Date | string | number,
  options: Intl.DateTimeFormatOptions = {}
): string {
  return formatBrazilDate(value, {
    hour: "2-digit",
    minute: "2-digit",
    ...options,
  });
}


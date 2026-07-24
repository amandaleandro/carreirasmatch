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

export function getBrazilGreeting(name?: string): string {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: BRAZIL_TIME_ZONE,
    hour: "numeric",
    hour12: false,
  });
  const hour = parseInt(formatter.format(new Date()), 10);

  let greeting = "Olá";
  if (hour >= 5 && hour < 12) {
    greeting = "Bom dia";
  } else if (hour >= 12 && hour < 18) {
    greeting = "Boa tarde";
  } else {
    greeting = "Boa noite";
  }

  const firstName = name ? name.trim().split(" ")[0] : "";
  return firstName ? `${greeting}, ${firstName}!` : `${greeting}!`;
}


export const GAME_PHASES = [
  { id: 1, label: "Base", description: "Aprenda os fundamentos" },
  { id: 2, label: "Prática", description: "Aumente a dificuldade" },
  { id: 3, label: "Desafio", description: "Teste seu domínio" },
] as const;

export type GamePhase = (typeof GAME_PHASES)[number]["id"];

export function normalizeGamePhase(value: string | null | undefined): GamePhase {
  const phase = Number(value);
  return phase === 2 || phase === 3 ? phase : 1;
}

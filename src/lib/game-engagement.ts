export type EngagementScore = {
  game: string;
  area: string;
  score: number;
  createdAt: Date | string;
};

export function getGameLevel(xp: number) {
  return Math.max(1, Math.floor(xp / 800) + 1);
}

export function getLevelProgress(xp: number) {
  const currentLevelXp = (getGameLevel(xp) - 1) * 800;
  return Math.min(100, Math.round(((xp - currentLevelXp) / 800) * 100));
}

export function getGameStreak(scores: EngagementScore[], today = new Date()) {
  const days = new Set(scores.map((item) => new Date(item.createdAt).toISOString().slice(0, 10)));
  let streak = 0;
  const cursor = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  while (days.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function getGameBadges(scores: EngagementScore[]) {
  const badges: { icon: string; label: string; description: string }[] = [];
  const games = new Set(scores.map((item) => item.game));
  const total = scores.length;
  if (total >= 1) badges.push({ icon: "🎮", label: "Primeira partida", description: "Você começou sua evolução." });
  if (total >= 5) badges.push({ icon: "⚡", label: "Ritmo de treino", description: "5 partidas concluídas." });
  if (total >= 15) badges.push({ icon: "🧠", label: "Mente em prática", description: "15 partidas registradas." });
  if (games.size >= 4) badges.push({ icon: "🧭", label: "Explorador", description: "Você treinou 4 formatos diferentes." });
  return badges.slice(-3).reverse();
}

export function getDailyChallenge(scores: EngagementScore[], today = new Date()) {
  const options = [
    { game: "quiz", title: "Acerte uma decisão da sua área", reward: 150 },
    { game: "memory", title: "Memorize 4 termos profissionais", reward: 180 },
    { game: "forca", title: "Descubra 3 palavras da sua trilha", reward: 200 },
    { game: "dilemas", title: "Resolva um dilema de carreira", reward: 220 },
  ];
  const index = (today.getDate() + today.getMonth()) % options.length;
  const challenge = options[index];
  const completed = scores.some((item) => item.game === challenge.game && new Date(item.createdAt) >= new Date(today.getFullYear(), today.getMonth(), today.getDate()));
  return { ...challenge, completed };
}

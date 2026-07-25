export type LevelInfo = {
  level: number;
  title: string;
  currentXp: number;
  xpForNextLevel: number;
  progressPercent: number;
};

export type DailyQuest = {
  id: string;
  title: string;
  description: string;
  rewardXp: number;
  completed: boolean;
  claimed: boolean;
};

export const LEVEL_TITLES: { minLevel: number; title: string }[] = [
  { minLevel: 1, title: "Estreante" },
  { minLevel: 3, title: "Aprendiz de Mercado" },
  { minLevel: 5, title: "Analista Promissor" },
  { minLevel: 8, title: "Especialista em Ação" },
  { minLevel: 12, title: "Líder Estratégico" },
  { minLevel: 15, title: "Mestre de Carreira" },
  { minLevel: 20, title: "Lenda do CarreirasMatch" },
];

export function calculateLevel(xp: number): LevelInfo {
  // XP formula: Each level requires level * 200 XP
  let level = 1;
  let remainingXp = xp;
  let xpForNext = 200;

  while (remainingXp >= xpForNext) {
    remainingXp -= xpForNext;
    level++;
    xpForNext = level * 200;
  }

  const titleObj = [...LEVEL_TITLES].reverse().find((t) => level >= t.minLevel);
  const title = titleObj ? titleObj.title : "Iniciante";
  const progressPercent = Math.min(100, Math.round((remainingXp / xpForNext) * 100));

  return {
    level,
    title,
    currentXp: remainingXp,
    xpForNextLevel: xpForNext,
    progressPercent,
  };
}

const DEFAULT_QUESTS: Omit<DailyQuest, "completed" | "claimed">[] = [
  {
    id: "q1",
    title: "Dilemas de Carreira",
    description: "Jogue 1 rodada do Simulador de Dilemas.",
    rewardXp: 150,
  },
  {
    id: "q2",
    title: "Desafio de Conhecimento",
    description: "Conclua uma rodada do Quiz ou Duelo 1v1.",
    rewardXp: 200,
  },
  {
    id: "q3",
    title: "Agilidade Corporativa",
    description: "Experimente o Speed Typer ou Inbox Zero.",
    rewardXp: 150,
  },
];

const STORAGE_KEY = "carreiras_match_gamification_v1";

type GamificationState = {
  totalXp: number;
  streakDays: number;
  lastPlayDate: string; // YYYY-MM-DD
  quests: DailyQuest[];
  questsDate: string; // YYYY-MM-DD
};

export function getGamificationState(): GamificationState {
  if (typeof window === "undefined") {
    return {
      totalXp: 350,
      streakDays: 3,
      lastPlayDate: new Date().toISOString().split("T")[0],
      quests: DEFAULT_QUESTS.map((q) => ({ ...q, completed: false, claimed: false })),
      questsDate: new Date().toISOString().split("T")[0],
    };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const today = new Date().toISOString().split("T")[0];

    if (raw) {
      const parsed: GamificationState = JSON.parse(raw);
      // Reset quests if new day
      if (parsed.questsDate !== today) {
        parsed.questsDate = today;
        parsed.quests = DEFAULT_QUESTS.map((q) => ({ ...q, completed: false, claimed: false }));
      }
      return parsed;
    }
  } catch (e) {
    console.error("Failed to load gamification state", e);
  }

  // Default initial state
  const today = new Date().toISOString().split("T")[0];
  const initialState: GamificationState = {
    totalXp: 450,
    streakDays: 4,
    lastPlayDate: today,
    quests: [
      { ...DEFAULT_QUESTS[0], completed: true, claimed: false },
      { ...DEFAULT_QUESTS[1], completed: false, claimed: false },
      { ...DEFAULT_QUESTS[2], completed: false, claimed: false },
    ],
    questsDate: today,
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialState));
  } catch {}

  return initialState;
}

export function saveGamificationState(state: GamificationState) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("Failed to save gamification state", e);
  }
}

export function addXp(amount: number): GamificationState {
  const state = getGamificationState();
  const today = new Date().toISOString().split("T")[0];

  // Update streak if played today or consecutive day
  if (state.lastPlayDate !== today) {
    const lastDate = new Date(state.lastPlayDate);
    const currDate = new Date(today);
    const diffDays = Math.round((currDate.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));

    if (diffDays === 1) {
      state.streakDays += 1;
    } else if (diffDays > 1) {
      state.streakDays = 1;
    }
    state.lastPlayDate = today;
  }

  state.totalXp += amount;
  saveGamificationState(state);
  return state;
}

export function claimQuestReward(questId: string): GamificationState {
  const state = getGamificationState();
  const quest = state.quests.find((q) => q.id === questId);

  if (quest && quest.completed && !quest.claimed) {
    quest.claimed = true;
    state.totalXp += quest.rewardXp;
    saveGamificationState(state);
  }

  return state;
}

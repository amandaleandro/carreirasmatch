import { prisma } from "@/lib/prisma";
import { markFirstAction } from "@/lib/first-action";

export const STUDY_ACTIVITY_TOOLS = {
  flashcards_ensino_medio: "Flashcards (Ensino Médio)",
  redacao_enem: "Redação (ENEM)",
  simulado_enem: "Simulado (ENEM)",
  simulado_concurso: "Simulado de concurso",
  redacao_concurso: "Redação (concurso)",
  flashcards_concurso: "Flashcards de concurso",
  oab_segunda_fase: "Peça OAB (2ª fase)",
  edital: "Leitura de edital",
} as const;

export type StudyActivityTool = keyof typeof STUDY_ACTIVITY_TOOLS;

/** Registra uma atividade de estudo concluída. Nunca lança: falha de log não pode
 * derrubar a resposta da ferramenta de IA que a originou. */
export async function logStudyActivity(userId: string, tool: StudyActivityTool, score?: number | null) {
  try {
    await prisma.studyActivityLog.create({
      data: { userId, tool, score: typeof score === "number" ? score : null },
    });
    void markFirstAction(userId);
  } catch (error) {
    console.error("[logStudyActivity] Falha ao registrar atividade:", error);
  }
}

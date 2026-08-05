import { prisma } from "@/lib/prisma";

/**
 * Marca a primeira ação de valor real do usuário (resumo criado, vaga analisada,
 * entrevista praticada, atividade de estudo concluída — ver docs/PLANOS_PERMISSOES_ANALYTICS_2026.md,
 * estágio "Ativação"/"Valor" do funil). Idempotente e seguro de chamar de vários
 * lugares sem duplicar: usa updateMany condicionado a firstActionAt ainda nulo
 * para reivindicar o marco atomicamente, então só quem "vence" a corrida grava o
 * evento de funil `first_action_completed`.
 *
 * Retorna true só na primeira vez em que é realmente marcado para este usuário.
 */
export async function markFirstAction(userId: string): Promise<boolean> {
  try {
    const result = await prisma.user.updateMany({
      where: { id: userId, firstActionAt: null },
      data: { firstActionAt: new Date() },
    });

    if (result.count === 1) {
      await prisma.funnelEvent.create({
        data: {
          name: "first_action_completed",
          userId,
          properties: JSON.stringify({}),
        },
      });
      return true;
    }

    return false;
  } catch (error) {
    console.error("[markFirstAction] Falha ao registrar primeira ação:", error);
    return false;
  }
}

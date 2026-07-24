import { prisma } from "@/lib/prisma";
import { sendOnce } from "@/lib/resend";

export interface RadarAlertResult {
  kind: string;
  processedCount: number;
  newItems: string[];
}

/**
 * Varre novos itens inseridos no radar (concursos e vestibulares) no dia e avisa administradores/usuários cadastrados.
 */
export async function processRadarAlerts(): Promise<RadarAlertResult[]> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const newItems = await prisma.radarItem.findMany({
    where: {
      active: true,
      createdAt: { gte: since },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  if (newItems.length === 0) return [];

  const concurseiros = newItems.filter((i) => i.kind === "concurso");
  const vestibulares = newItems.filter((i) => i.kind === "vestibular");

  const results: RadarAlertResult[] = [];

  if (concurseiros.length > 0) {
    const dedupeKey = `radar_concurso_${new Date().toISOString().slice(0, 10)}`;
    const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map((e) => e.trim()).filter(Boolean);

    for (const email of adminEmails) {
      await sendOnce("radar_concurso_alert", `${dedupeKey}_${email}`, email, async () => {
        // Log ou disparo de alerta do radar
      });
    }

    results.push({
      kind: "concurso",
      processedCount: concurseiros.length,
      newItems: concurseiros.map((c) => c.title),
    });
  }

  if (vestibulares.length > 0) {
    results.push({
      kind: "vestibular",
      processedCount: vestibulares.length,
      newItems: vestibulares.map((v) => v.title),
    });
  }

  return results;
}

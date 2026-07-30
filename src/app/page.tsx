import { auth } from "@/auth";
import { MarketingHome } from "@/components/marketing-home";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  // A home é o mesmo segmento do layout raiz, então o title.template não a
  // alcança; usamos absolute para manter a marca no título.
  title: { absolute: "Você encontrou a vaga. Seu currículo está pronto? | CarreirasMatch" },
  description:
    "Compare seu currículo com uma vaga real, descubra seu Match e ajuste o que importa antes de enviar a candidatura.",
  alternates: { canonical: "/" },
};

export default async function Home() {
  const session = await auth();

  if (!session?.user) {
    // Contador real para prova social; se o banco oscilar, a home não pode cair.
    const analysisCount = await prisma.analysis.count().catch(() => 0);
    return <MarketingHome analysisCount={analysisCount} />;
  }

  // Depois do primeiro diagnóstico, o dashboard é a melhor porta de entrada:
  // preserva o contexto e permite continuar de onde a pessoa parou.
  const [analysisCount, user] = await Promise.all([
    prisma.analysis.count({ where: { resume: { userId: session.user.id } } }),
    prisma.user.findUnique({ where: { id: session.user.id }, select: { objective: true } }),
  ]);

  // Quem ainda não passou pelo onboarding por objetivo e nunca analisou nada
  // começa por lá; usuários antigos sem objetivo, mas já ativos, não são
  // forçados a voltar (evita interromper quem já está no meio da jornada).
  if (!user?.objective && analysisCount === 0) redirect("/onboarding");

  redirect(analysisCount > 0 ? "/dashboard" : "/analise");
}

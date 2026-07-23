import { auth } from "@/auth";
import { MarketingHome } from "@/components/marketing-home";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  // A home é o mesmo segmento do layout raiz, então o title.template não a
  // alcança; usamos absolute para manter a marca no título.
  title: { absolute: "Compare seu currículo com a vaga | CarreirasMatch" },
  description:
    "Entenda sua aderência a uma vaga real, veja o que ajustar no currículo e prepare seus próximos passos antes de se candidatar.",
  alternates: { canonical: "/" },
};

export default async function Home() {
  const session = await auth();

  if (!session?.user) {
    // Contador real para prova social; se o banco oscilar, a home não pode cair.
    const analysisCount = await prisma.analysis.count().catch(() => 0);
    return <MarketingHome analysisCount={analysisCount} />;
  }

  redirect("/analise");
}

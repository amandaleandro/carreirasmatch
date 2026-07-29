import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { TRACK_LABELS, type CareerTrack } from "@/components/analysis-display";

export const dynamic = "force-dynamic";

/**
 * Selo público verificável (estilo "verified badge"): página aberta que o
 * candidato linka no LinkedIn/currículo para provar que o currículo foi
 * analisado e qual nota tirou. Mostra só primeiro nome + nota + trilha + data
 * — sem vaga, sem currículo, sem contato. Cada selo compartilhado é um
 * backlink e uma impressão de marca.
 */

export const metadata: Metadata = {
  title: "Selo de Currículo Verificado",
  description: "Verificação pública de análise de currículo feita no CarreirasMatch.",
};

function firstName(full: string | null | undefined): string {
  return (full ?? "").trim().split(/\s+/)[0] || "Candidato(a)";
}

export default async function SeloPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const analysis = await prisma.analysis.findUnique({
    where: { id },
    select: {
      overallScore: true,
      atsScore: true,
      careerTrack: true,
      createdAt: true,
      resume: { select: { user: { select: { name: true } } } },
    },
  });
  if (!analysis) notFound();

  const name = firstName(analysis.resume.user?.name);
  const score = analysis.overallScore;
  const ringColor = score >= 70 ? "#22C55E" : score >= 50 ? "#F59E0B" : "#EF4444";
  const trackLabel = TRACK_LABELS[analysis.careerTrack as CareerTrack] ?? analysis.careerTrack;

  return (
    <main className="min-h-screen bg-[#F8FAFC] dark:bg-[#071827] font-sans flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full space-y-6">
        <div className="rounded-3xl border border-[#E2E8F0] dark:border-neutral-800 bg-white dark:bg-neutral-900 p-8 text-center space-y-5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#22C55E]/10 border border-[#22C55E]/25 text-[#22C55E] text-[10px] font-bold uppercase tracking-wider">
            ✓ Currículo analisado e verificado
          </span>

          <div
            className="mx-auto flex h-32 w-32 items-center justify-center rounded-full border-8 text-4xl font-bold text-[#071827] dark:text-white"
            style={{ borderColor: ringColor }}
          >
            {score}
          </div>

          <div className="space-y-1">
            <h1 className="text-xl font-title font-bold text-[#071827] dark:text-white">
              {name} analisou o currículo no CarreirasMatch
            </h1>
            <p className="text-sm text-[#64748B]">
              Nota de aderência <strong>{score}/100</strong> · nota ATS{" "}
              <strong>{analysis.atsScore}/100</strong>
            </p>
            <p className="text-xs text-[#64748B]">
              Trilha: {trackLabel} ·{" "}
              {analysis.createdAt.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
            </p>
          </div>

          <p className="text-[11px] text-[#64748B] leading-relaxed">
            Este selo confirma que o currículo passou por uma análise de aderência contra uma vaga
            real, com verificação de palavras-chave e compatibilidade com sistemas de triagem (ATS).
          </p>
        </div>

        <div className="rounded-2xl border border-[#2563EB]/20 bg-[#2563EB]/5 p-5 text-center space-y-2">
          <p className="text-sm font-bold text-[#071827] dark:text-white">
            Quer saber a nota do seu currículo?
          </p>
          <p className="text-xs text-[#64748B]">
            Teste grátis em segundos: nota de 0 a 100, palavras-chave que faltam e leitura do ATS.
          </p>
          <Link
            href="/nota-do-curriculo"
            className="inline-block rounded-xl bg-[#2563EB] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1D4ED8] transition-colors"
          >
            Analisar meu currículo grátis →
          </Link>
        </div>
      </div>
    </main>
  );
}

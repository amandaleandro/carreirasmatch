import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { FileText, Briefcase, Calendar, Sparkles, Eye } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ResumeIndexPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  // Busca o último diagnóstico realizado para termos o link rápido para edição
  const latestAnalysis = await prisma.analysis.findFirst({
    where: { resume: { userId: session.user.id } },
    orderBy: { createdAt: "desc" },
    select: { id: true, resume: { select: { fileName: true, createdAt: true } } },
  });

  // Busca todas as análises onde o usuário efetuou otimizações customizadas
  const customizedAnalyses = await prisma.analysis.findMany({
    where: {
      resume: { userId: session.user.id },
      resumeOverride: { not: null },
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      jobTitle: true,
      overallScore: true,
      atsScore: true,
      createdAt: true,
      resumeOverride: true,
      resume: {
        select: {
          fileName: true,
        },
      },
    },
  });

  if (!latestAnalysis) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 w-full text-center space-y-4 font-sans">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400">
          <FileText className="h-6 w-6" />
        </div>
        <h1 className="text-xl font-bold text-[#071827] dark:text-white">Sua Biblioteca de Currículos</h1>
        <p className="text-xs text-[#64748B] max-w-md mx-auto leading-relaxed">
          Aqui ficarão armazenadas todas as versões personalizadas do seu currículo. Faça seu primeiro diagnóstico de vaga para começar!
        </p>
        <Link
          href="/"
          className="inline-block mt-4 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs px-5 py-2.5 shadow-sm shadow-[#2563EB]/25 transition-all cursor-pointer"
        >
          Fazer minha primeira análise
        </Link>
      </div>
    );
  }

  return (
    <main className="px-4 md:px-8 py-6 max-w-5xl mx-auto w-full space-y-5 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] dark:border-neutral-800 pb-4">
        <div>
          <span className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider rounded-full px-2.5 py-0.5 bg-[#2563EB]/10 text-[#2563EB] border border-[#2563EB]/15">
            Área de Currículos
          </span>
          <h1 className="text-xl md:text-2xl font-title font-bold text-[#071827] dark:text-white mt-1">Biblioteca de Currículos</h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Gerencie e acesse suas versões otimizadas de currículo para cada candidatura.
          </p>
        </div>
      </div>

      {/* Seção Currículo Base */}
      <section className="rounded-3xl border border-[#E2E8F0] dark:border-neutral-800 bg-[#FFFFFF] dark:bg-neutral-900/40 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-[#2563EB]/10 text-[#2563EB] rounded-xl shrink-0">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-[#071827] dark:text-white">Currículo Base Atual</h2>
              <p className="text-xs text-[#64748B] mt-0.5 font-semibold truncate max-w-md">
                Arquivo: {latestAnalysis.resume.fileName || "curriculo-base.pdf"}
              </p>
              <p className="text-[10px] text-[#64748B]/75 mt-1 font-medium">
                Enviado em: {new Date(latestAnalysis.resume.createdAt).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })}
              </p>
            </div>
          </div>
          <Link
            href={`/resume/${latestAnalysis.id}`}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold px-4 py-2.5 shadow-sm shadow-[#2563EB]/25 transition-all self-start sm:self-auto cursor-pointer"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Otimizar Currículo Base</span>
          </Link>
        </div>
      </section>

      {/* Seção Versões Customizadas */}
      <section className="space-y-3.5">
        <h2 className="text-sm font-bold text-[#071827] dark:text-white">Versões Customizadas para Vagas</h2>
        {customizedAnalyses.length === 0 ? (
          <div className="text-center py-10 rounded-3xl border border-dashed border-[#E2E8F0] dark:border-neutral-800 bg-[#FFFFFF] dark:bg-neutral-900/40 p-6 space-y-2">
            <Briefcase className="h-8 w-8 text-[#64748B]/50 mx-auto mb-1" />
            <p className="text-xs font-bold text-[#071827] dark:text-white">
              Você ainda não salvou nenhuma otimização de currículo.
            </p>
            <p className="text-[11px] text-[#64748B] max-w-xs mx-auto leading-relaxed">
              Ao ajustar seu currículo no Otimizador para qualquer vaga específica, a versão personalizada aparecerá salva aqui.
            </p>
            <Link
              href={`/resume/${latestAnalysis.id}`}
              className="inline-block mt-4 text-xs font-bold text-[#2563EB] hover:underline cursor-pointer"
            >
              Começar a otimizar agora →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {customizedAnalyses.map((a) => {
              const dateStr = new Date(a.createdAt).toLocaleDateString("pt-BR", {
                timeZone: "America/Sao_Paulo",
                day: "2-digit",
                month: "short",
                year: "numeric",
              });

              return (
                <div
                  key={a.id}
                  className="rounded-3xl border border-[#E2E8F0] dark:border-neutral-800 bg-[#FFFFFF] dark:bg-neutral-900/40 p-5 hover:shadow-md transition-all flex flex-col justify-between gap-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-500/10 border border-emerald-500/15 px-2 py-0.5 rounded-md">
                          Versão Otimizada
                        </span>
                        <h3 className="font-bold text-sm text-[#071827] dark:text-white mt-2 leading-snug">
                          {a.jobTitle}
                        </h3>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-[10px] text-[#64748B] font-bold">Score ATS</p>
                        <p className="text-base font-extrabold text-blue-600 dark:text-blue-400">{a.atsScore}%</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-[#64748B] pt-2 border-t border-neutral-100 dark:border-neutral-850">
                      <span className="flex items-center gap-1 font-semibold">
                        <FileText className="h-3.5 w-3.5" />
                        Base: {a.resume.fileName || "curriculo.pdf"}
                      </span>
                      <span className="flex items-center gap-1 font-semibold">
                        <Calendar className="h-3.5 w-3.5" />
                        Criado: {dateStr}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-3 border-t border-neutral-100 dark:border-neutral-850 mt-auto">
                    <Link
                      href={`/resume/${a.id}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#2563EB] hover:text-[#1D4ED8] cursor-pointer"
                    >
                      <Eye className="h-4 w-4" />
                      <span>Ver e Otimizar →</span>
                    </Link>
                    <span className="text-[10px] text-[#64748B] font-bold">
                      Match: {a.overallScore}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

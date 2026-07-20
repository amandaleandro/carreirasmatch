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
      <div className="max-w-3xl mx-auto px-4 py-16 w-full text-center">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 mb-4">
          <FileText className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Sua Biblioteca de Currículos</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-2">
          Aqui ficarão armazenadas todas as versões personalizadas do seu currículo. Faça seu primeiro diagnóstico de vaga para começar!
        </p>
        <Link
          href="/"
          className="inline-block mt-6 rounded-xl bg-blue-600 text-white font-semibold px-6 py-3 shadow-sm shadow-blue-600/20 hover:bg-blue-700 transition-all cursor-pointer"
        >
          Fazer minha primeira análise
        </Link>
      </div>
    );
  }

  return (
    <main className="px-4 md:px-8 py-8 max-w-7xl mx-auto w-full space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Biblioteca de Currículos</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-1">
          Gerencie e acesse suas versões otimizadas de currículo para cada candidatura.
        </p>
      </div>

      {/* Seção Currículo Base */}
      <section className="card-premium p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl shrink-0">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h2 className="font-semibold text-lg">Currículo Base Atual</h2>
              <p className="text-sm text-neutral-500 mt-0.5 font-medium truncate max-w-md">
                Arquivo: {latestAnalysis.resume.fileName || "curriculo-base.pdf"}
              </p>
              <p className="text-xs text-neutral-400 mt-1">
                Enviado em: {new Date(latestAnalysis.resume.createdAt).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })}
              </p>
            </div>
          </div>
          <Link
            href={`/resume/${latestAnalysis.id}`}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 shadow-sm shadow-blue-600/25 transition-all self-start sm:self-auto cursor-pointer"
          >
            <Sparkles className="h-4 w-4" />
            <span>Otimizar Currículo Base</span>
          </Link>
        </div>
      </section>

      {/* Seção Versões Customizadas */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight">Versões Customizadas para Vagas</h2>
        {customizedAnalyses.length === 0 ? (
          <div className="text-center py-12 rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950">
            <Briefcase className="h-8 w-8 text-neutral-400 mx-auto mb-3" />
            <p className="text-sm text-neutral-600 dark:text-neutral-400 font-medium">
              Você ainda não salvou nenhuma otimização de currículo.
            </p>
            <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
              Ao ajustar seu currículo no Otimizador para qualquer vaga específica, a versão personalizada aparecerá salva aqui.
            </p>
            <Link
              href={`/resume/${latestAnalysis.id}`}
              className="inline-block mt-4 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
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
                  className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 px-2 py-0.5 rounded-md">
                          Versão Otimizada
                        </span>
                        <h3 className="font-bold text-base mt-2 leading-snug">
                          {a.jobTitle}
                        </h3>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-xs text-neutral-500 font-medium">Score ATS</p>
                        <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{a.atsScore}%</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-500 pt-2 border-t border-neutral-100 dark:border-neutral-900">
                      <span className="flex items-center gap-1">
                        <FileText className="h-3.5 w-3.5" />
                        Base: {a.resume.fileName || "curriculo.pdf"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        Criado: {dateStr}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-3 border-t border-neutral-100 dark:border-neutral-900 mt-auto">
                    <Link
                      href={`/resume/${a.id}`}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 cursor-pointer"
                    >
                      <Eye className="h-4 w-4" />
                      <span>Ver e Otimizar →</span>
                    </Link>
                    <span className="text-xs text-neutral-400">
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

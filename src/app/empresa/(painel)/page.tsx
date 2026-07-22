import Link from "next/link";
import {
  Sparkles,
  Plus,
  FileSearch,
  Briefcase,
  Users,
  CreditCard,
  Building2,
  ArrowRight,
  CheckCircle2,
  Clock,
  UserCheck,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireCompanyPage, FREE_SCREENING_LIMIT } from "@/lib/company-auth";

export const dynamic = "force-dynamic";

export default async function CompanyDashboardPage() {
  const { company } = await requireCompanyPage();

  const [jobs, openVagas, acceptedContacts] = await Promise.all([
    prisma.companyJob.findMany({
      where: { companyId: company.id },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { candidates: true } } },
    }),
    prisma.companyVaga.count({ where: { companyId: company.id, status: "open" } }),
    prisma.talentContactRequest.count({ where: { companyId: company.id, status: "accepted" } }),
  ]);

  const freeRemaining = Math.max(0, FREE_SCREENING_LIMIT - company.screeningCount);
  const remaining = freeRemaining + company.screeningCredits;

  const stats = [
    { label: "Triagens Realizadas", value: jobs.length, href: "/empresa", icon: FileSearch, color: "blue" },
    { label: "Vagas Abertas", value: openVagas, href: "/empresa/vagas", icon: Briefcase, color: "indigo" },
    { label: "Contatos Liberados", value: acceptedContacts, href: "/empresa/contatos", icon: UserCheck, color: "emerald" },
  ];

  return (
    <main className="max-w-6xl mx-auto px-4 md:px-8 py-8 space-y-8 font-sans">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider rounded-full px-3 py-1 mb-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <Building2 className="w-3.5 h-3.5" />
            Painel de Recrutamento
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Painel da Empresa
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm">
            Descreva a vaga, envie os currículos em PDF e receba um ranking por aderência técnica.
          </p>
        </div>

        <Link
          href="/empresa/triagem/nova"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold px-5 py-2.5 shadow-md shadow-blue-500/20 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Triagem</span>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Link
              key={s.label}
              href={s.href}
              className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xs hover:border-blue-500/60 transition-all duration-200 flex items-center justify-between"
            >
              <div className="space-y-1">
                <p className="text-3xl font-extrabold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {s.value}
                </p>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{s.label}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20">
                <Icon className="w-5 h-5" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Screening Credits Notification */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 py-4 shadow-2xs">
        <div className="flex items-center gap-3 text-xs sm:text-sm">
          <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
          {remaining > 0 ? (
            <span className="text-slate-700 dark:text-slate-300">
              Você tem <strong className="text-slate-900 dark:text-white">{remaining}</strong> {remaining === 1 ? "triagem" : "triagens"} disponível(is)
              {freeRemaining > 0 && company.screeningCredits > 0 ? ` (${freeRemaining} gratuita(s) + ${company.screeningCredits} compradas)` : ""}.
            </span>
          ) : (
            <span className="text-rose-600 dark:text-rose-400 font-semibold">Seus créditos de triagem acabaram.</span>
          )}
        </div>
        <Link
          href="/empresa/billing"
          className="shrink-0 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
        >
          <span>Comprar créditos</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* How it works Banner for New Companies */}
      {jobs.length === 0 && openVagas === 0 && (
        <div className="rounded-3xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/20 p-6 sm:p-8 space-y-4">
          <div>
            <h2 className="font-bold text-base text-blue-950 dark:text-blue-100 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              Como funciona o recrutamento com IA
            </h2>
            <p className="text-xs text-blue-900/80 dark:text-blue-200/80 mt-1">
              Três formas práticas de encontrar candidatos ideais:
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-4 pt-2">
            {[
              { n: 1, h: "/empresa/triagem/nova", t: "Triagem por currículos", d: "Suba os PDFs que você já recebeu e receba um ranking por aderência." },
              { n: 2, h: "/empresa/vagas/nova", t: "Cadastrar uma vaga", d: "Descreva a vaga (ou gere com IA) e o sistema traz os candidatos recomendados." },
              { n: 3, h: "/empresa/talentos", t: "Buscar no banco de talentos", d: "Pesquise diretamente por profissionais disponíveis na plataforma." },
            ].map((step) => (
              <Link
                key={step.n}
                href={step.h}
                className="group rounded-2xl border border-blue-200/60 dark:border-blue-800/60 bg-white dark:bg-slate-900 p-4 shadow-2xs hover:border-blue-400 transition-all space-y-2"
              >
                <div className="flex items-center gap-2">
                  <span className="h-6 w-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                    {step.n}
                  </span>
                  <span className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                    {step.t}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{step.d}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Talent Bank CTA */}
      <Link
        href="/empresa/talentos"
        className="group flex items-center justify-between gap-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xs hover:border-blue-500/60 transition-all"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20 shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
              Banco de Talentos CarreirasMatch
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Busque candidatos verificados que optaram por ser encontrados por empresas.
            </p>
          </div>
        </div>
        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all shrink-0" />
      </Link>

      {/* Recent Screenings Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <FileSearch className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Suas Triagens Recentes
          </h2>
          {jobs.length > 0 && (
            <span className="text-xs text-slate-500">{jobs.length} triagem(ns) realizada(s)</span>
          )}
        </div>

        {jobs.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-10 text-center shadow-2xs space-y-3">
            <FileSearch className="h-10 w-10 mx-auto text-slate-400" />
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Você ainda não fez nenhuma triagem</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
              Suba arquivos de currículos recebidos para que a IA analise a aderência com a sua vaga.
            </p>
            <div className="pt-2">
              <Link
                href="/empresa/triagem/nova"
                className="inline-flex items-center gap-2 font-bold text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                <span>Criar a primeira triagem</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.map((job) => (
              <Link
                key={job.id}
                href={`/empresa/triagem/${job.id}`}
                className="group flex items-center justify-between gap-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xs hover:border-blue-500/60 transition-all"
              >
                <div className="min-w-0 space-y-1">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate group-hover:text-blue-600 transition-colors">
                    {job.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {job._count.candidates} {job._count.candidates === 1 ? "currículo" : "currículos"}
                    </span>
                    <span>·</span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {job.createdAt.toLocaleDateString("pt-BR")}
                    </span>
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

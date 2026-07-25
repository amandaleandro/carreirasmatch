import type { Metadata } from "next";
import Link from "next/link";
import { getMarketInsights } from "@/lib/market-insights";
import { TRACK_LABELS, type CareerTrack } from "@/components/analysis-display";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Termômetro do Currículo: dados reais de milhares de análises",
  description:
    "Dados agregados e anônimos das análises de currículo do CarreirasMatch: nota média dos candidatos, as habilidades que mais faltam nos currículos e como está o mercado por momento profissional.",
  alternates: { canonical: "/insights" },
};

/**
 * Conteúdo de autoridade/PR (estilo LinkedIn Workforce Report): agregados
 * anônimos do banco de análises viram uma página pública citável — imprensa,
 * backlinks e SEO — e um argumento de venda ("veja o que falta em todo mundo").
 */
export default async function InsightsPage() {
  const insights = await getMarketInsights();
  const monthLabel = new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  return (
    <main className="min-h-screen bg-[#F8FAFC] dark:bg-[#071827] font-sans">
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-10">
        <header className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2563EB]/10 border border-[#2563EB]/20 text-[#2563EB] text-[10px] font-bold uppercase tracking-wider">
            Dados agregados e anônimos · {monthLabel}
          </span>
          <h1 className="text-2xl sm:text-4xl font-title font-bold tracking-tight text-[#071827] dark:text-white">
            Termômetro do <span className="text-[#2563EB]">Currículo</span>
          </h1>
          <p className="text-sm text-[#64748B] dark:text-slate-400 leading-relaxed">
            O que {insights.totalAnalyses.toLocaleString("pt-BR")} análises de currículo × vaga
            revelam sobre o que falta nos currículos brasileiros — atualizado continuamente a partir
            de dados agregados, sem nenhuma informação pessoal.
          </p>
        </header>

        <section className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            { value: insights.totalAnalyses.toLocaleString("pt-BR"), label: "análises realizadas" },
            { value: `${insights.averageScore}/100`, label: "nota média de aderência" },
            { value: `${insights.applyNowPercent}%`, label: "prontos para aplicar de primeira" },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-[#E2E8F0] dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 text-center"
            >
              <p className="text-2xl font-black text-[#2563EB]">{s.value}</p>
              <p className="text-[11px] text-[#64748B] mt-1">{s.label}</p>
            </div>
          ))}
        </section>

        <section className="rounded-3xl border border-[#E2E8F0] dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 space-y-4">
          <h2 className="font-title font-bold text-base text-[#071827] dark:text-white">
            As habilidades que mais faltam nos currículos
          </h2>
          <p className="text-xs text-[#64748B]">
            Termos exigidos pelas vagas e ausentes nos currículos, nas análises mais recentes.
          </p>
          {insights.topMissingKeywords.length === 0 && (
            <p className="text-xs text-[#64748B]">Ainda coletando dados suficientes — volte em breve.</p>
          )}
          <ol className="space-y-2">
            {insights.topMissingKeywords.map((k, i) => (
              <li key={k.term} className="flex items-center gap-3">
                <span className="w-6 text-xs font-bold text-[#64748B]">{i + 1}.</span>
                <span className="text-sm font-semibold text-[#071827] dark:text-white flex-1 capitalize">
                  {k.term}
                </span>
                <div className="hidden sm:block w-40 h-2 rounded-full bg-[#F8FAFC] dark:bg-neutral-800 border border-[#E2E8F0] dark:border-neutral-700 overflow-hidden">
                  <div
                    className="h-full bg-[#EF4444]/70 rounded-full"
                    style={{ width: `${Math.round((k.count / insights.topMissingKeywords[0].count) * 100)}%` }}
                  />
                </div>
                <span className="text-[10px] font-bold text-[#64748B] w-20 text-right">
                  {k.count} vagas
                </span>
              </li>
            ))}
          </ol>
        </section>

        <section className="rounded-3xl border border-[#E2E8F0] dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 space-y-4">
          <h2 className="font-title font-bold text-base text-[#071827] dark:text-white">
            Nota média por momento profissional
          </h2>
          <div className="space-y-3">
            {insights.scoreByTrack.map((t) => (
              <div key={t.track}>
                <div className="flex justify-between text-xs mb-1 font-semibold">
                  <span className="text-[#64748B]">
                    {TRACK_LABELS[t.track as CareerTrack] ?? t.track}
                  </span>
                  <span className="text-[#071827] dark:text-white font-extrabold">
                    {t.averageScore}/100
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-[#F8FAFC] dark:bg-neutral-800 border border-[#E2E8F0] dark:border-neutral-700 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#2563EB]"
                    style={{ width: `${t.averageScore}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-[#2563EB]/20 bg-[#2563EB]/5 p-6 text-center space-y-2">
          <h2 className="font-title font-bold text-base text-[#071827] dark:text-white">
            Onde o seu currículo entra nessa estatística?
          </h2>
          <p className="text-xs text-[#64748B]">
            Descubra sua nota e compare-se com os dados acima — grátis, em segundos.
          </p>
          <Link
            href="/nota-do-curriculo"
            className="inline-block rounded-xl bg-[#2563EB] px-6 py-3 text-sm font-semibold text-white hover:bg-[#1D4ED8] transition-colors"
          >
            Analisar meu currículo grátis →
          </Link>
        </section>

        <p className="text-[10px] text-[#64748B] text-center leading-relaxed max-w-xl mx-auto">
          Metodologia: dados 100% agregados e anônimos das análises de currículo × vaga realizadas na
          plataforma. Nenhum currículo, vaga ou dado pessoal individual é exposto. Ao citar estes
          dados, referencie &ldquo;CarreirasMatch — Termômetro do Currículo&rdquo; com link para esta página.
        </p>
      </div>
    </main>
  );
}

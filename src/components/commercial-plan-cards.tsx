import { Check, Sparkles } from "lucide-react";
import Link from "next/link";

type Plan = {
  key: string;
  name: string;
  priceCents: number;
  recurring: boolean;
  durationDays: number | null;
  highlighted: boolean;
  entitlements: Array<{ limit: number | null; featureDefinition: { name: string } }>;
};

function formatPrice(cents: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}

const FEATURE_LABELS: Record<string, string> = {
  "ai.simple_action": "Orientações para sua candidatura",
  "analysis.job.full": "Análises completas da vaga",
  "resume.by_job": "Currículos adaptados para cada vaga",
  "interview.complete": "Preparações completas para entrevista",
  "profile.github.analysis": "Revisões do perfil no GitHub",
  "university.subject.insight": "Resumos e explicações de disciplinas",
  "career.growth.plan.generate": "Planos para desenvolver sua carreira",
  "job.application.create": "Candidaturas registradas",
  "study.tool.use": "Ferramentas para seus estudos",
};

export function CommercialPlanCards({
  plans,
  title = "Escolha a profundidade da sua jornada",
  subtitle = "Os limites abaixo são controlados pelo backend e podem evoluir com o produto.",
}: {
  plans: Plan[];
  title?: string;
  subtitle?: string;
}) {
  return (
    <section className="mx-auto max-w-6xl px-4 pt-8">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">Planos</p>
        <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">{title}</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{subtitle}</p>
      </div>
      <div className={`mt-8 grid gap-4 md:grid-cols-2 ${plans.length <= 3 ? "xl:grid-cols-3" : "xl:grid-cols-5"}`}>
        {plans.map((plan) => {
          const highlights = plan.entitlements.filter((item) => item.limit !== 0).slice(0, 4);
          return (
            <article key={plan.key} className={`relative rounded-3xl border p-5 ${plan.highlighted ? "border-blue-500 bg-blue-50/70 shadow-lg shadow-blue-500/10 dark:bg-blue-950/30" : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"}`}>
              {plan.highlighted && <span className="absolute -top-3 left-5 inline-flex items-center gap-1 rounded-full bg-blue-600 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white"><Sparkles className="h-3 w-3" />Mais escolhido</span>}
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{plan.name}</h3>
              <p className="mt-3 text-2xl font-extrabold text-slate-900 dark:text-white">{formatPrice(plan.priceCents)}<span className="text-xs font-medium text-slate-500">{plan.recurring ? "/mês" : plan.durationDays ? `/${plan.durationDays} dias` : ""}</span></p>
              <ul className="mt-5 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                {highlights.map((item) => <li key={item.featureDefinition.name} className="flex gap-2"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" /><span>{FEATURE_LABELS[item.featureDefinition.name] ?? item.featureDefinition.name}: {item.limit === null ? "sem limite" : `${item.limit}/ciclo`}</span></li>)}
              </ul>
              <Link
                href={plan.key === "free" ? "/register" : `/assinar?plan=${encodeURIComponent(plan.key)}`}
                className={`mt-6 inline-flex w-full items-center justify-center rounded-xl px-4 py-3 text-xs font-bold transition-colors ${plan.highlighted ? "bg-blue-600 text-white hover:bg-blue-700" : "border border-slate-300 text-slate-700 hover:border-blue-500 hover:text-blue-600 dark:border-slate-700 dark:text-slate-200 dark:hover:border-blue-400 dark:hover:text-blue-400"}`}
              >
                {plan.key === "free" ? "Começar grátis" : "Ir para o checkout"}
              </Link>
            </article>
          );
        })}
      </div>
    </section>
  );
}

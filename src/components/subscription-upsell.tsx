import Link from "next/link";
import { Sparkles, CheckCircle2, ArrowRight, ShieldCheck, Zap } from "lucide-react";

export function SubscriptionUpsell({
  segment,
  context = "diagnostic",
}: {
  segment: string;
  context?: "diagnostic" | "limit";
}) {
  return (
    <aside className="rounded-3xl border border-blue-200 dark:border-blue-900/60 bg-gradient-to-br from-blue-50/80 via-white to-indigo-50/60 dark:from-slate-900 dark:via-slate-900 dark:to-blue-950/40 p-6 md:p-8 shadow-md relative overflow-hidden font-sans space-y-5">
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider rounded-full px-3 py-1 bg-blue-600 text-white shadow-xs">
          <Sparkles className="w-3.5 h-3.5" />
          Acelere sua Carreira
        </span>
        <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-3 py-1 rounded-full border border-blue-200/60 dark:border-blue-900/60">
          Por apenas R$ 24,90/mês
        </span>
      </div>

      <div className="space-y-2">
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white leading-tight">
          {context === "diagnostic"
            ? "Por que assinar o Plano Profissional por R$ 24,90/mês?"
            : "Você atingiu o limite gratuito. Assine para continuar analisando sem parar!"}
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
          Candidatar-se sem adaptar seu currículo reduz drasticamente suas chances de ser chamado. Com o plano ilimitado, você prepara seu perfil para cada vaga em segundos.
        </p>
      </div>

      {/* Checklist de Vantagens */}
      <div className="grid sm:grid-cols-2 gap-3 pt-1">
        {[
          "Análises de vaga & match ilimitados por IA",
          "Simulador interativo de perguntas de entrevista",
          "Ajustes de palavras-chave para passar nos robôs (ATS)",
          "Cartas de apresentação e mensagens para recrutadores",
          "Geração de currículos otimizados em PDF",
          "Sem fidelidade: cancele a qualquer momento com 1 clique",
        ].map((benefit) => (
          <div key={benefit} className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{benefit}</span>
          </div>
        ))}
      </div>

      <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <ShieldCheck className="w-4 h-4 text-blue-500" />
          <span>Menos de R$ 0,83 por dia · Sem taxa de cancelamento</span>
        </div>

        <Link
          href={`/assinar?segment=${encodeURIComponent(segment)}`}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-6 py-3 text-sm shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02]"
        >
          <span>Assinar agora por R$ 24,90/mês</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </aside>
  );
}

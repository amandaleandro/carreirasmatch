import { Target, Search, ClipboardList, Send, CalendarCheck, TrendingUp, type LucideIcon } from "lucide-react";

// Método transversal da arquitetura de ofertas (06/08/2026): as 6 etapas que
// organizam todas as jornadas (candidato, estudos, empresas), não só a de vagas.
export const ROTA_MATCH_STEPS: { icon: LucideIcon; label: string }[] = [
  { icon: Target, label: "Objetivo" },
  { icon: Search, label: "Diagnóstico" },
  { icon: ClipboardList, label: "Preparação" },
  { icon: Send, label: "Ação" },
  { icon: CalendarCheck, label: "Acompanhamento" },
  { icon: TrendingUp, label: "Evolução" },
];

export function RotaMatchSteps({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-wrap items-center justify-center gap-2 sm:gap-3 ${className}`}>
      {ROTA_MATCH_STEPS.map(({ icon: Icon, label }, index) => (
        <div key={label} className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-semibold text-slate-200">
            <Icon className="h-3.5 w-3.5 text-blue-300" />
            {label}
          </div>
          {index < ROTA_MATCH_STEPS.length - 1 && (
            <span className="text-slate-500" aria-hidden="true">→</span>
          )}
        </div>
      ))}
    </div>
  );
}

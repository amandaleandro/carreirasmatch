import { Check } from "lucide-react";

const STEPS = [
  { key: "objective", label: "Objetivo", description: "Definir seu cargo desejado" },
  { key: "resume", label: "Currículo", description: "Ter um currículo pronto" },
  { key: "job", label: "Vaga", description: "Encontrar uma oportunidade" },
  { key: "match", label: "Match", description: "Entender sua aderência" },
  { key: "preparation", label: "Preparação", description: "Corrigir as lacunas" },
  { key: "application", label: "Candidatura", description: "Aplicar com contexto" },
  { key: "interview", label: "Entrevista", description: "Treinar e comparecer" },
] as const;

export function JourneyStepper({ current }: { current: (typeof STEPS)[number]["key"] }) {
  const currentIndex = STEPS.findIndex((step) => step.key === current);

  return (
    <section className="ds-card p-4 sm:p-5" aria-labelledby="journey-stepper-title">
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-primary)]">Sua jornada</p>
          <h2 id="journey-stepper-title" className="mt-1 text-sm font-bold text-[var(--foreground)]">Um passo de cada vez</h2>
        </div>
        <p className="text-xs text-[var(--muted-foreground)]">Etapa atual: <strong className="text-[var(--foreground)]">{STEPS[currentIndex].label}</strong></p>
      </div>
      <ol className="flex flex-col gap-3 sm:flex-row sm:items-start" aria-label="Etapas da jornada de carreira">
        {STEPS.map((step, index) => {
          const isDone = index < currentIndex;
          const isCurrent = index === currentIndex;
          return (
            <li key={step.key} className="flex min-w-0 flex-1 items-start gap-2 sm:flex-col sm:items-stretch">
              <div className="flex shrink-0 items-center sm:w-full">
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${isDone ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white" : isCurrent ? "border-[var(--color-primary)] bg-[var(--surface)] text-[var(--color-primary)] ring-4 ring-blue-500/10" : "border-[var(--border-color)] bg-[var(--surface)] text-[var(--muted-foreground)]"}`} aria-current={isCurrent ? "step" : undefined}>
                  {isDone ? <Check aria-hidden="true" className="h-4 w-4" /> : index + 1}
                </span>
                {index < STEPS.length - 1 && (
                  <span aria-hidden="true" className={`ml-1 hidden h-px flex-1 sm:block ${index < currentIndex ? "bg-[var(--color-primary)]" : "bg-[var(--border-color)]"}`} />
                )}
              </div>
              <div className="min-w-0 sm:mt-2">
                <p className={`text-xs font-bold ${isCurrent ? "text-[var(--foreground)]" : "text-[var(--muted-foreground)]"}`}>{step.label}</p>
                <p className="mt-0.5 text-[10px] leading-snug text-[var(--muted-foreground)]">{step.description}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

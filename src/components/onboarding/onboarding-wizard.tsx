"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { CAREER_SEGMENT_OPTIONS, type CareerSegment } from "@/lib/career-segments";
import { COMMON_PROFESSIONAL_AREAS, COMMON_STUDY_AREAS } from "@/lib/course-catalog";
import { OBJECTIVE_DEADLINE_OPTIONS, objectivesForSegment } from "@/lib/onboarding-objectives";
import { track, ANALYTICS_EVENTS } from "@/lib/analytics";

const TOTAL_STEPS = 6;

const DIAGNOSIS_QUESTIONS = [
  { key: "hasResume", label: "Já tem um currículo pronto?" },
  { key: "hasApplied", label: "Já está se candidatando atualmente?" },
] as const;

function StepShell({
  step,
  title,
  children,
}: {
  step: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-3 duration-300">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <span
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i < step ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-800"
              }`}
            />
          ))}
        </div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
          Etapa {step} de {TOTAL_STEPS}
        </p>
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          {title}
        </h1>
      </div>
      {children}
    </div>
  );
}

function OptionButton({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-2xl border px-4 py-3.5 text-left text-sm font-semibold transition-all ${
        selected
          ? "border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
          : "border-slate-200 bg-white text-slate-700 hover:border-blue-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
      }`}
    >
      {children}
    </button>
  );
}

export function OnboardingWizard({
  initialSegment,
  initialArea,
}: {
  initialSegment: CareerSegment | null;
  initialArea: string | null;
}) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [segment, setSegment] = useState<CareerSegment | "">(initialSegment ?? "");
  const [objective, setObjective] = useState("");
  const [area, setArea] = useState(initialArea ?? "");
  const [deadline, setDeadline] = useState("");
  const [diagnosis, setDiagnosis] = useState<Record<string, boolean | null>>({ hasResume: null, hasApplied: null });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const objectives = useMemo(() => objectivesForSegment(segment || null), [segment]);
  const selectedObjective = objectives.find((o) => o.value === objective) ?? null;
  const areaSuggestions = segment === "student" || segment === "internship" ? COMMON_STUDY_AREAS : COMMON_PROFESSIONAL_AREAS;

  async function finish() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/onboarding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ careerSegment: segment, objective, objectiveDeadline: deadline, professionalArea: area }),
      });
      if (!res.ok) throw new Error("Não foi possível salvar seu objetivo agora.");
      track(ANALYTICS_EVENTS.ONBOARDING_COMPLETED, { careerSegment: segment, objective });
      setStep(6);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-10 sm:py-16">
      {step === 1 && (
        <StepShell step={1} title="Onde você está hoje?">
          <div className="space-y-2.5">
            {CAREER_SEGMENT_OPTIONS.map((option) => (
              <OptionButton
                key={option.value}
                selected={segment === option.value}
                onClick={() => {
                  setSegment(option.value);
                  setObjective("");
                }}
              >
                {option.label}
              </OptionButton>
            ))}
          </div>
          <button
            type="button"
            disabled={!segment}
            onClick={() => setStep(2)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-3.5 text-sm font-bold text-white transition-all hover:bg-blue-700 disabled:opacity-40"
          >
            Continuar <ArrowRight className="h-4 w-4" />
          </button>
        </StepShell>
      )}

      {step === 2 && (
        <StepShell step={2} title="O que você quer conquistar agora?">
          <div className="space-y-2.5">
            {objectives.map((option) => (
              <OptionButton key={option.value} selected={objective === option.value} onClick={() => setObjective(option.value)}>
                {option.label}
              </OptionButton>
            ))}
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setStep(1)} className="rounded-full border border-slate-200 px-5 py-3.5 text-sm font-semibold text-slate-600 dark:border-slate-800 dark:text-slate-300">
              Voltar
            </button>
            <button
              type="button"
              disabled={!objective}
              onClick={() => setStep(3)}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-3.5 text-sm font-bold text-white transition-all hover:bg-blue-700 disabled:opacity-40"
            >
              Continuar <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </StepShell>
      )}

      {step === 3 && (
        <StepShell step={3} title="Qual área mais combina com seu objetivo?">
          <div className="space-y-1.5">
            <input
              type="text"
              list="onboarding-areas"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="Ex: Administração, Tecnologia, Enfermagem..."
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            />
            <datalist id="onboarding-areas">
              {areaSuggestions.map((option) => <option key={option} value={option} />)}
            </datalist>
            <p className="text-xs text-slate-400">Pode deixar em branco se ainda não sabe — dá para ajustar depois.</p>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setStep(2)} className="rounded-full border border-slate-200 px-5 py-3.5 text-sm font-semibold text-slate-600 dark:border-slate-800 dark:text-slate-300">
              Voltar
            </button>
            <button
              type="button"
              onClick={() => setStep(4)}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-3.5 text-sm font-bold text-white transition-all hover:bg-blue-700"
            >
              Continuar <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </StepShell>
      )}

      {step === 4 && (
        <StepShell step={4} title="Quando você deseja alcançar isso?">
          <div className="space-y-2.5">
            {OBJECTIVE_DEADLINE_OPTIONS.map((option) => (
              <OptionButton key={option.value} selected={deadline === option.value} onClick={() => setDeadline(option.value)}>
                {option.label}
              </OptionButton>
            ))}
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setStep(3)} className="rounded-full border border-slate-200 px-5 py-3.5 text-sm font-semibold text-slate-600 dark:border-slate-800 dark:text-slate-300">
              Voltar
            </button>
            <button
              type="button"
              disabled={!deadline}
              onClick={() => setStep(5)}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-3.5 text-sm font-bold text-white transition-all hover:bg-blue-700 disabled:opacity-40"
            >
              Continuar <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </StepShell>
      )}

      {step === 5 && (
        <StepShell step={5} title="Só mais duas perguntas rápidas">
          <div className="space-y-4">
            {DIAGNOSIS_QUESTIONS.map((q) => (
              <div key={q.key} className="space-y-2">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{q.label}</p>
                <div className="flex gap-2.5">
                  {([["Sim", true], ["Ainda não", false]] as const).map(([label, value]) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => setDiagnosis((d) => ({ ...d, [q.key]: value }))}
                      className={`flex-1 rounded-xl border px-4 py-2.5 text-xs font-bold transition-all ${
                        diagnosis[q.key] === value
                          ? "border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                          : "border-slate-200 bg-white text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {error && <p className="text-xs font-semibold text-red-600">{error}</p>}
          <div className="flex gap-3">
            <button type="button" onClick={() => setStep(4)} className="rounded-full border border-slate-200 px-5 py-3.5 text-sm font-semibold text-slate-600 dark:border-slate-800 dark:text-slate-300">
              Voltar
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={finish}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-3.5 text-sm font-bold text-white transition-all hover:bg-blue-700 disabled:opacity-60"
            >
              {saving ? "Salvando..." : "Ver meu primeiro passo"} <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </StepShell>
      )}

      {step === 6 && selectedObjective && (
        <StepShell step={6} title="Seu primeiro passo está pronto">
          <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-5 dark:border-blue-900 dark:bg-blue-950/30 space-y-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 dark:text-blue-300">
              <CheckCircle2 className="h-4 w-4" /> Objetivo registrado
            </span>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{selectedObjective.label}</p>
            {!diagnosis.hasResume && (
              <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                Como você ainda não tem um currículo pronto, comece por aí — é a base para tudo o mais.
              </p>
            )}
          </div>
          <Link
            href={!diagnosis.hasResume ? "/curriculo-sem-experiencia" : selectedObjective.cta.href}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-3.5 text-sm font-bold text-white transition-all hover:bg-blue-700"
          >
            {!diagnosis.hasResume ? "Criar meu currículo" : selectedObjective.cta.label} <ArrowRight className="h-4 w-4" />
          </Link>
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="w-full text-center text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            Ir para Minha Jornada
          </button>
        </StepShell>
      )}
    </div>
  );
}

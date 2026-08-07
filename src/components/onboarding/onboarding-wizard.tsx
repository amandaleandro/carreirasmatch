"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { COMMON_PROFESSIONAL_AREAS, COMMON_STUDY_AREAS } from "@/lib/course-catalog";
import { GOAL_OPTIONS, GOAL_TO_SEGMENT, findObjective, type OnboardingGoal } from "@/lib/onboarding-objectives";
import { track, ANALYTICS_EVENTS } from "@/lib/analytics";

const TOTAL_STEPS = 5;
const DRAFT_KEY = "carreiramatch:analyze-draft";

type ResumeChoice = "upload" | "create" | "skip";
type WorkModel = "remote" | "local" | "any";

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

function OptionCard({
  selected,
  onClick,
  title,
  description,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  description?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-2xl border px-4 py-3.5 text-left transition-all ${
        selected
          ? "border-blue-600 bg-blue-50 dark:bg-blue-950/40"
          : "border-slate-200 bg-white hover:border-blue-300 dark:border-slate-800 dark:bg-slate-900"
      }`}
    >
      <p className={`text-sm font-bold ${selected ? "text-blue-700 dark:text-blue-300" : "text-slate-800 dark:text-slate-100"}`}>
        {title}
      </p>
      {description && (
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{description}</p>
      )}
    </button>
  );
}

function BackNextRow({
  onBack,
  onNext,
  nextLabel = "Continuar",
  nextDisabled,
  saving,
}: {
  onBack?: () => void;
  onNext: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  saving?: boolean;
}) {
  return (
    <div className="flex gap-3">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="rounded-full border border-slate-200 px-5 py-3.5 text-sm font-semibold text-slate-600 dark:border-slate-800 dark:text-slate-300"
        >
          Voltar
        </button>
      )}
      <button
        type="button"
        disabled={nextDisabled || saving}
        onClick={onNext}
        className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-3.5 text-sm font-bold text-white transition-all hover:bg-blue-700 disabled:opacity-40"
      >
        {saving ? "Salvando..." : nextLabel} <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}

export function OnboardingWizard({
  initialArea,
}: {
  initialSegment: string | null;
  initialArea: string | null;
}) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState<OnboardingGoal | "">("");
  const [area, setArea] = useState(initialArea ?? "");
  const [resumeChoice, setResumeChoice] = useState<ResumeChoice | "">("");
  const [workModel, setWorkModel] = useState<WorkModel | "">("");
  const [city, setCity] = useState("");
  const [jobText, setJobText] = useState("");
  const [jobLink, setJobLink] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const areaSuggestions = goal === "internship" ? COMMON_STUDY_AREAS : COMMON_PROFESSIONAL_AREAS;
  const isPrepareSpecificJob = goal === "prepare_specific_job";
  const segment = goal ? GOAL_TO_SEGMENT[goal] : null;
  const objective = goal ? findObjective(segment, goal) : null;

  async function finish() {
    if (!goal || !segment) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/onboarding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          careerSegment: segment,
          objective: goal,
          professionalArea: area,
          onboardingResumeChoice: resumeChoice || "skip",
          preferredWorkModel: isPrepareSpecificJob ? undefined : workModel || "any",
          city: workModel === "local" ? city : undefined,
        }),
      });
      if (!res.ok) throw new Error("Não foi possível salvar seu objetivo agora.");
      track(ANALYTICS_EVENTS.ONBOARDING_COMPLETED, { careerSegment: segment, objective: goal });

      if (isPrepareSpecificJob && (jobText.trim() || jobLink.trim())) {
        try {
          localStorage.setItem(
            DRAFT_KEY,
            JSON.stringify({ jobText, jobLink, jobTitle: area, savedAt: Date.now() })
          );
        } catch {
          // localStorage indisponível (modo privado etc.) — segue sem pré-preencher.
        }
      }

      setStep(5);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setSaving(false);
    }
  }

  function finalHref() {
    if (resumeChoice === "create") return "/curriculo-sem-experiencia";
    if (isPrepareSpecificJob || resumeChoice === "upload") return "/analise";
    return objective?.cta.href ?? "/dashboard";
  }

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-10 sm:py-16">
      {step === 1 && (
        <StepShell step={1} title="O que você quer conquistar agora?">
          <div className="space-y-2.5">
            {GOAL_OPTIONS.map((option) => (
              <OptionCard
                key={option.value}
                selected={goal === option.value}
                title={option.label}
                description={option.description}
                onClick={() => {
                  setGoal(option.value);
                  track(ANALYTICS_EVENTS.JOURNEY_SELECTED, { goal: option.value });
                }}
              />
            ))}
          </div>
          <BackNextRow onNext={() => setStep(2)} nextDisabled={!goal} />
        </StepShell>
      )}

      {step === 2 && (
        <StepShell step={2} title="Para qual cargo você quer ir?">
          <div className="space-y-1.5">
            <input
              type="text"
              list="onboarding-areas"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="Ex.: Analista de Dados"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            />
            <datalist id="onboarding-areas">
              {areaSuggestions.map((option) => (
                <option key={option} value={option} />
              ))}
            </datalist>
            <p className="text-xs text-slate-400">Não precisa ter certeza. Você poderá alterar depois.</p>
          </div>
          <BackNextRow onBack={() => setStep(1)} onNext={() => setStep(3)} nextLabel="Definir meu objetivo" />
        </StepShell>
      )}

      {step === 3 && (
        <StepShell step={3} title="Você já tem um currículo?">
          <div className="space-y-2.5">
            <OptionCard
              selected={resumeChoice === "upload"}
              title="Sim, enviar meu currículo"
              description="Você faz o upload em PDF na próxima etapa."
              onClick={() => setResumeChoice("upload")}
            />
            <OptionCard
              selected={resumeChoice === "create"}
              title="Ainda não, criar meu currículo"
              description="Montamos um currículo do zero com você."
              onClick={() => setResumeChoice("create")}
            />
            <OptionCard
              selected={resumeChoice === "skip"}
              title="Quero fazer isso depois"
              onClick={() => setResumeChoice("skip")}
            />
          </div>
          <BackNextRow onBack={() => setStep(2)} onNext={() => setStep(4)} nextDisabled={!resumeChoice} />
        </StepShell>
      )}

      {step === 4 && isPrepareSpecificJob && (
        <StepShell step={4} title="Qual vaga você quer preparar?">
          <div className="space-y-3">
            <input
              type="text"
              value={jobLink}
              onChange={(e) => setJobLink(e.target.value)}
              placeholder="Cole o link da vaga"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            />
            <p className="text-center text-xs font-semibold text-slate-400">ou</p>
            <textarea
              value={jobText}
              onChange={(e) => setJobText(e.target.value)}
              placeholder="Cole a descrição da vaga"
              rows={5}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            />
          </div>
          {error && <p className="text-xs font-semibold text-red-600">{error}</p>}
          <BackNextRow onBack={() => setStep(3)} onNext={finish} nextLabel="Analisar esta vaga" saving={saving} />
        </StepShell>
      )}

      {step === 4 && !isPrepareSpecificJob && (
        <StepShell step={4} title="Vamos encontrar oportunidades para você.">
          <div className="space-y-2.5">
            <OptionCard selected={workModel === "remote"} title="Remoto" onClick={() => setWorkModel("remote")} />
            <OptionCard selected={workModel === "local"} title="Cidade/região" onClick={() => setWorkModel("local")} />
            {workModel === "local" && (
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Sua cidade"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              />
            )}
            <OptionCard selected={workModel === "any"} title="Tanto faz" onClick={() => setWorkModel("any")} />
          </div>
          {error && <p className="text-xs font-semibold text-red-600">{error}</p>}
          <BackNextRow onBack={() => setStep(3)} onNext={finish} nextLabel="Ver oportunidades" nextDisabled={!workModel} saving={saving} />
        </StepShell>
      )}

      {step === 5 && (
        <StepShell step={5} title="Sua rota começou.">
          <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-5 dark:border-blue-900 dark:bg-blue-950/30 space-y-2.5">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 dark:text-blue-300">
              <CheckCircle2 className="h-4 w-4" /> Rota criada
            </span>
            <p className="text-sm text-slate-700 dark:text-slate-200">
              <strong>Objetivo:</strong> {area || objective?.label}
            </p>
            <p className="text-sm text-slate-700 dark:text-slate-200">
              <strong>Currículo:</strong>{" "}
              {resumeChoice === "upload" ? "a enviar" : resumeChoice === "create" ? "a criar" : "pendente"}
            </p>
            <p className="text-sm text-slate-700 dark:text-slate-200">
              <strong>Primeira ação:</strong> {objective?.cta.label ?? "analisar uma oportunidade"}
            </p>
          </div>
          <Link
            href={finalHref()}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-3.5 text-sm font-bold text-white transition-all hover:bg-blue-700"
          >
            Ver meu próximo passo <ArrowRight className="h-4 w-4" />
          </Link>
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="w-full text-center text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            Ir para Minha Rota
          </button>
        </StepShell>
      )}
    </div>
  );
}

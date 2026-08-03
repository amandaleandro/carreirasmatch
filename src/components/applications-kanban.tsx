"use client";

import { useTransition } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Building2,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { updateApplicationStatus } from "@/app/applications/actions";
import { triggerConfetti } from "@/lib/confetti";
import { track, ANALYTICS_EVENTS } from "@/lib/analytics";
import { useFeedback } from "@/components/feedback-provider";

type ApplicationItem = {
  id: string;
  company: string;
  jobTitle: string;
  jobUrl?: string | null;
  location?: string | null;
  status: string;
  fitScore?: number | null;
  appliedAt?: Date | null;
  interviewAt?: Date | null;
  deadline?: Date | null;
  notes?: string | null;
  analysisId?: string | null;
};

const KANBAN_COLUMNS = [
  {
    id: "saved",
    label: "Salvas",
    desc: "Vagas boas pra ficar de olho",
    color: "bg-sky-500/10 text-sky-600 border-sky-200 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-900/60",
    dot: "bg-sky-500",
  },
  {
    id: "resume_review",
    label: "Ajustar Currículo",
    desc: "Adapte seu perfil antes de candidatar",
    color: "bg-amber-500/10 text-amber-600 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/60",
    dot: "bg-amber-500",
  },
  {
    id: "applied",
    label: "Aplicadas",
    desc: "Vagas em que você se candidatou",
    color: "bg-blue-500/10 text-blue-600 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/60",
    dot: "bg-blue-500",
  },
  {
    id: "interview",
    label: "Entrevistas",
    desc: "Conversas marcadas ou em andamento",
    color: "bg-purple-500/10 text-purple-600 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-900/60",
    dot: "bg-purple-500",
  },
  {
    id: "technical_test",
    label: "Teste tÃ©cnico",
    desc: "Desafios, cases e provas em andamento",
    color: "bg-fuchsia-500/10 text-fuchsia-600 border-fuchsia-200 dark:bg-fuchsia-950/40 dark:text-fuchsia-400 dark:border-fuchsia-900/60",
    dot: "bg-fuchsia-500",
  },
  {
    id: "offer",
    label: "Proposta",
    desc: "Oferta de trabalho recebida",
    color: "bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/60",
    dot: "bg-emerald-500",
  },
  {
    id: "rejected",
    label: "Finalizadas",
    desc: "Processos encerrados para aprender com o resultado",
    color: "bg-slate-500/10 text-slate-600 border-slate-200 dark:bg-slate-900/60 dark:text-slate-400 dark:border-slate-800",
    dot: "bg-slate-500",
  },
];

function nextActionFor(status: string) {
  switch (status) {
    case "saved":
      return "Analisar a vaga e decidir se vale o esforço";
    case "resume_review":
    case "tailor_resume":
      return "Ajustar o currículo com base no Match";
    case "applied":
      return "Acompanhar a resposta e preparar o follow-up";
    case "interview":
      return "Treinar as perguntas prováveis da entrevista";
    case "technical_test":
      return "Revisar os requisitos e concluir o teste";
    case "offer":
      return "Avaliar a proposta e preparar a negociação";
    case "rejected":
      return "Registrar o aprendizado para a próxima candidatura";
    default:
      return "Definir o próximo passo";
  }
}

export function ApplicationsKanban({ items }: { items: ApplicationItem[] }) {
  const [isPending, startTransition] = useTransition();
  const { notify } = useFeedback();

  function handleStatusChange(id: string, newStatus: string) {
    if (newStatus === "interview" || newStatus === "offer") {
      triggerConfetti({ count: 75, originY: 0.5 });
    }
    // Métrica de impacto: usuário avançou de verdade (entrevista marcada / proposta
    // recebida), não só usou uma ferramenta. Ver ANALYTICS_EVENTS.
    if (newStatus === "interview") {
      track(ANALYTICS_EVENTS.INTERVIEW_REPORTED, { applicationId: id });
    }
    if (newStatus === "offer") {
      track(ANALYTICS_EVENTS.JOB_REPORTED, { applicationId: id });
    }
    startTransition(async () => {
      const fd = new FormData();
      fd.append("status", newStatus);
      try {
        await updateApplicationStatus(id, fd);
        notify("success", "Etapa da candidatura atualizada.");
      } catch (error) {
        notify("error", error instanceof Error ? error.message : "Não foi possível atualizar a candidatura.");
      }
    });
  }


  return (
    <div className="w-full font-sans">
      <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
        {KANBAN_COLUMNS.map((col) => {
          const colItems = items.filter((item) => item.status === col.id);
          return (
            <div
              key={col.id}
              className="w-72 shrink-0 rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 p-4 space-y-3.5 flex flex-col justify-between"
            >
              <div className="space-y-3.5">
                {/* Column Header */}
                <div className="space-y-1 pb-3 border-b border-slate-200/80 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border ${col.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${col.dot}`} />
                      {col.label}
                    </span>
                    <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                      {colItems.length}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">{col.desc}</p>
                </div>

                {/* Cards List */}
                {colItems.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-6 text-center text-xs font-semibold text-slate-400 dark:text-slate-500 bg-white/40 dark:bg-slate-950/40">
                    Nenhuma vaga aqui
                  </div>
                ) : (
                  <div className="space-y-3">
                    {colItems.map((item) => (
                      <div
                        key={item.id}
                        className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-2xs hover:border-blue-500/60 transition-all space-y-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-snug group-hover:text-blue-600 transition-colors">
                              {item.jobTitle}
                            </h4>
                            {item.company && (
                              <p className="text-xs font-semibold text-slate-500 flex items-center gap-1 mt-1 truncate">
                                <Building2 className="w-3 h-3 shrink-0 text-slate-400" />
                                {item.company}
                              </p>
                            )}
                          </div>

                          {item.fitScore !== null && item.fitScore !== undefined && (
                            <span className="shrink-0 text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-900">
                              {item.fitScore}% match
                            </span>
                          )}
                        </div>

                        {item.interviewAt && (
                          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 p-2.5 rounded-xl border border-purple-200 dark:border-purple-900">
                            <CalendarDays className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                            <span>Entrevista: {new Date(item.interviewAt).toLocaleDateString("pt-BR")}</span>
                          </div>
                        )}

                        <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-2.5 dark:border-blue-900/50 dark:bg-blue-950/30">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">PrÃ³xima aÃ§Ã£o</p>
                          <p className="mt-1 text-[11px] font-semibold leading-relaxed text-slate-700 dark:text-slate-200">
                            {nextActionFor(item.status)}
                          </p>
                        </div>

                        {item.notes && (
                          <p className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl text-[11px] leading-relaxed">
                            {item.notes}
                          </p>
                        )}

                        {/* Card Controls & Status Selector */}
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 text-xs">
                          <select
                            value={item.status}
                            disabled={isPending}
                            aria-busy={isPending}
                            onChange={(e) => handleStatusChange(item.id, e.target.value)}
                            className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2 py-1 text-[11px] font-bold text-slate-700 dark:text-slate-300 outline-none cursor-pointer hover:border-blue-500 transition-colors max-w-[130px]"
                          >
                            {KANBAN_COLUMNS.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.label}
                              </option>
                            ))}
                          </select>

                          <div className="flex items-center gap-2">
                            {item.jobUrl && (
                              <a
                                href={item.jobUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-slate-400 hover:text-blue-600"
                                title="Abrir vaga"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                            <Link
                              href={item.analysisId ? `/report/${item.analysisId}` : "/analise"}
                              className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-0.5"
                            >
                              <span>IA</span>
                              <ChevronRight className="w-3 h-3" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

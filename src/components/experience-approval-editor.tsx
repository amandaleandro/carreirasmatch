"use client";

import { useState } from "react";
import { Sparkles, Check, Pencil, X, RotateCcw } from "lucide-react";
import type { ExperienceSuggestion } from "@/lib/groq";

export type ApprovalState = "pending" | "approved" | "edited" | "ignored";

export type ExperienceApproval = {
  approvalState: ApprovalState;
  editedText: string | null;
};

interface ExperienceApprovalEditorProps {
  suggestions: ExperienceSuggestion[];
  approvals: ExperienceApproval[];
  onChange: (index: number, approval: ExperienceApproval) => void;
}

/**
 * Editor "antes e depois" das experiências reescritas pela IA. Nada é aplicado
 * ao currículo exportado sem passar por aqui: o usuário decide, item a item,
 * usar a reescrita sugerida, editá-la, ou ignorá-la e manter o texto original.
 */
export function ExperienceApprovalEditor({ suggestions, approvals, onChange }: ExperienceApprovalEditorProps) {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/40 p-5 md:p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-neutral-900 dark:text-white">
            Antes e depois: aprove as reescritas
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Nada é adicionado ao seu currículo sem sua aprovação. Use, edite ou ignore cada sugestão.
          </p>
        </div>
      </div>

      <div className="space-y-5">
        {suggestions.map((item, idx) => {
          const approval = approvals[idx] ?? { approvalState: "pending", editedText: null };
          return (
            <ExperienceApprovalItem
              key={idx}
              item={item}
              approval={approval}
              onChange={(next) => onChange(idx, next)}
            />
          );
        })}
      </div>
    </div>
  );
}

function ExperienceApprovalItem({
  item,
  approval,
  onChange,
}: {
  item: ExperienceSuggestion;
  approval: ExperienceApproval;
  onChange: (approval: ExperienceApproval) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(approval.editedText ?? item.suggested);

  return (
    <div className="p-5 rounded-2xl bg-neutral-50/60 dark:bg-neutral-950/40 border border-neutral-200/80 dark:border-neutral-800 space-y-3">
      <div className="flex items-center justify-between border-b border-neutral-200/60 dark:border-neutral-800 pb-3">
        <span className="text-xs font-semibold text-neutral-900 dark:text-white">
          {item.role} — <span className="text-neutral-500">{item.company}</span>
        </span>
        <StatusBadge state={approval.approvalState} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <div className="p-3.5 rounded-xl bg-neutral-100/70 dark:bg-neutral-900/60 border border-neutral-200/60 dark:border-neutral-800 space-y-1">
          <p className="font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider text-[10px]">Antes</p>
          <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">{item.current}</p>
        </div>
        <div className="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-300/60 dark:border-emerald-800/50 space-y-1">
          <p className="font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider text-[10px]">Depois (sugestão)</p>
          {editing ? (
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-emerald-300 dark:border-emerald-800 bg-white dark:bg-neutral-900 px-2 py-1.5 text-xs text-neutral-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          ) : (
            <p className="text-neutral-900 dark:text-white leading-relaxed">
              {approval.approvalState === "edited" && approval.editedText ? approval.editedText : item.suggested}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-1">
        {editing ? (
          <>
            <button
              type="button"
              onClick={() => {
                onChange({ approvalState: "edited", editedText: draft });
                setEditing(false);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold px-3 py-1.5 transition-all cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" /> Salvar edição
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-lg px-3 py-1.5 text-[11px] font-semibold text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-all cursor-pointer"
            >
              Cancelar
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => onChange({ approvalState: "approved", editedText: null })}
              disabled={approval.approvalState === "approved"}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-[11px] font-semibold px-3 py-1.5 transition-all cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" /> Usar melhoria
            </button>
            <button
              type="button"
              onClick={() => {
                setDraft(approval.editedText ?? item.suggested);
                setEditing(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 text-[11px] font-semibold px-3 py-1.5 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5" /> Editar
            </button>
            <button
              type="button"
              onClick={() => onChange({ approvalState: "ignored", editedText: null })}
              disabled={approval.approvalState === "ignored"}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-semibold text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 disabled:opacity-50 transition-all cursor-pointer"
            >
              <X className="w-3.5 h-3.5" /> Ignorar
            </button>
            {approval.approvalState !== "pending" && (
              <button
                type="button"
                onClick={() => onChange({ approvalState: "pending", editedText: null })}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-semibold text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Desfazer
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ state }: { state: ApprovalState }) {
  if (state === "approved") {
    return (
      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
        Aprovado
      </span>
    );
  }
  if (state === "edited") {
    return (
      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
        Editado
      </span>
    );
  }
  if (state === "ignored") {
    return (
      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-neutral-500/10 text-neutral-500 dark:text-neutral-400 border border-neutral-500/20">
        Ignorado (mantém original)
      </span>
    );
  }
  return (
    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
      Aguardando revisão
    </span>
  );
}

/** Aplica as aprovações às sugestões: ignorado/pendente mantém o texto original ("current"). */
export function applyApprovals(
  suggestions: ExperienceSuggestion[],
  approvals: ExperienceApproval[]
): ExperienceSuggestion[] {
  return suggestions.map((item, idx) => {
    const approval = approvals[idx];
    if (!approval || approval.approvalState === "pending" || approval.approvalState === "ignored") {
      return { ...item, suggested: item.current };
    }
    if (approval.approvalState === "edited" && approval.editedText) {
      return { ...item, suggested: approval.editedText };
    }
    return item;
  });
}

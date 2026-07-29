"use client";

import { useState } from "react";
import type { BulletAnalysisSummary, BulletCheckStatus } from "@/lib/bullet-analysis";
import type { StructuredResume } from "@/lib/groq";

const CARD =
  "rounded-3xl border border-[#E2E8F0] dark:border-neutral-800 bg-[#FFFFFF] dark:bg-neutral-900/40 p-5 md:p-6";

const STATUS_STYLE: Record<BulletCheckStatus, { icon: string; text: string }> = {
  pass: { icon: "✓", text: "text-[#22C55E]" },
  warning: { icon: "!", text: "text-[#F59E0B]" },
  fail: { icon: "✕", text: "text-[#EF4444]" },
};

/** Diagnóstico determinístico por experiência (verbo de ação, métricas, tamanho, clichês). */
export function BulletDiagnosticsCard({ analysis }: { analysis: BulletAnalysisSummary }) {
  const [open, setOpen] = useState<number | null>(0);
  const scoreColor =
    analysis.score >= 75 ? "text-[#22C55E]" : analysis.score >= 50 ? "text-[#F59E0B]" : "text-[#EF4444]";

  return (
    <div className={CARD}>
      <div className="mb-3.5 flex items-center gap-2.5">
        <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ring-1 bg-[#2563EB]/10 text-[#2563EB] ring-[#2563EB]/20">
          🧾
        </span>
        <h3 className="font-title font-bold text-xs md:text-sm text-[#071827] dark:text-white tracking-tight">
          Qualidade das descrições de experiência
        </h3>
        <span className={`ml-auto text-sm font-extrabold ${scoreColor}`}>{analysis.score}%</span>
      </div>
      <p className="text-[10px] text-[#64748B] mb-3">
        Checagem automática, experiência por experiência: verbos de ação, resultados com números,
        tamanho e clichês — os mesmos critérios que recrutadores e robôs de triagem usam.
      </p>
      <div className="space-y-2">
        {analysis.diagnostics.map((d, i) => {
          const fails = d.checks.filter((c) => c.status !== "pass").length;
          const isOpen = open === i;
          return (
            <div key={i} className="rounded-xl border border-[#E2E8F0] dark:border-neutral-800 overflow-hidden">
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                className="w-full flex items-center gap-2 px-3.5 py-2.5 text-left cursor-pointer hover:bg-[#F8FAFC] dark:hover:bg-neutral-900 transition-colors"
              >
                <span className="text-xs font-bold text-[#071827] dark:text-white truncate">
                  {d.role || "Experiência"}
                </span>
                {d.company && <span className="text-[10px] text-[#64748B] truncate">· {d.company}</span>}
                <span
                  className={`ml-auto shrink-0 text-[10px] font-bold ${
                    fails === 0 ? "text-[#22C55E]" : "text-[#F59E0B]"
                  }`}
                >
                  {fails === 0 ? "Tudo certo" : `${fails} ajuste${fails > 1 ? "s" : ""}`}
                </span>
                <span className="text-[#64748B] text-xs">{isOpen ? "▴" : "▾"}</span>
              </button>
              {isOpen && (
                <ul className="px-3.5 pb-3 space-y-1.5 border-t border-[#E2E8F0] dark:border-neutral-800 pt-2.5">
                  {d.checks.map((c) => (
                    <li key={c.key} className="flex items-start gap-2 text-xs">
                      <span className={`font-bold shrink-0 ${STATUS_STYLE[c.status].text}`}>
                        {STATUS_STYLE[c.status].icon}
                      </span>
                      <span className="text-[#64748B] dark:text-neutral-300 leading-relaxed">
                        <strong className="text-[#071827] dark:text-white">{c.label}:</strong> {c.detail}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** "Como o robô lê seu currículo": o resultado literal do parser, campo a campo. */
export function AtsResumeView({
  resume,
  missingBasicInfo,
}: {
  resume: StructuredResume;
  missingBasicInfo: string[];
}) {
  const [open, setOpen] = useState(false);

  const contactFields: { label: string; value: string }[] = [
    { label: "Nome", value: resume.contact.name },
    { label: "E-mail", value: resume.contact.email },
    { label: "Telefone", value: resume.contact.phone },
    { label: "Localidade", value: resume.contact.location },
    { label: "LinkedIn", value: resume.contact.linkedin },
    { label: "GitHub", value: resume.contact.github },
    { label: "Portfólio", value: resume.contact.portfolio },
  ];

  return (
    <div className={CARD}>
      <div className="mb-2 flex items-center gap-2.5">
        <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ring-1 bg-[#64748B]/10 text-[#64748B] ring-[#64748B]/20">
          🤖
        </span>
        <h3 className="font-title font-bold text-xs md:text-sm text-[#071827] dark:text-white tracking-tight">
          Visão do ATS: como o robô lê seu currículo
        </h3>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="ml-auto text-[10px] font-bold text-[#2563EB] hover:underline cursor-pointer"
        >
          {open ? "Ocultar" : "Ver leitura"}
        </button>
      </div>
      <p className="text-[10px] text-[#64748B]">
        Sistemas de triagem (ATS) convertem seu PDF nestes campos antes de qualquer humano ler.
        O que não aparece aqui, o robô não viu.
      </p>

      {missingBasicInfo.length > 0 && (
        <p className="mt-2 text-[10px] font-semibold text-[#F59E0B]">
          ⚠️ O robô não encontrou: {missingBasicInfo.join(", ")}.
        </p>
      )}

      {open && (
        <div className="mt-4 space-y-4 text-xs">
          <div>
            <p className="text-[9px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5">Contato</p>
            <ul className="grid gap-1 sm:grid-cols-2">
              {contactFields.map((f) => (
                <li key={f.label} className="flex items-center gap-1.5">
                  <span className={f.value ? "text-[#22C55E]" : "text-[#EF4444]"}>
                    {f.value ? "✓" : "✕"}
                  </span>
                  <span className="font-semibold text-[#071827] dark:text-white">{f.label}:</span>
                  <span className="text-[#64748B] truncate">{f.value || "não encontrado"}</span>
                </li>
              ))}
            </ul>
          </div>

          {resume.skills.length > 0 && (
            <div>
              <p className="text-[9px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5">
                Habilidades lidas ({resume.skills.length})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {resume.skills.map((s, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-semibold rounded-full border border-[#E2E8F0] dark:border-neutral-700 px-2 py-0.5 text-[#64748B] dark:text-neutral-300"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {resume.experiences.length > 0 && (
            <div>
              <p className="text-[9px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5">
                Experiências lidas ({resume.experiences.length})
              </p>
              <ul className="space-y-1.5">
                {resume.experiences.map((e, i) => (
                  <li key={i} className="text-[#64748B] dark:text-neutral-300">
                    <span className="font-semibold text-[#071827] dark:text-white">{e.role}</span>
                    {e.company && ` — ${e.company}`}
                    {e.period ? (
                      <span className="text-[10px]"> ({e.period})</span>
                    ) : (
                      <span className="text-[10px] text-[#EF4444]"> (período não identificado)</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-[9px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5">Formação</p>
              {resume.education.length === 0 ? (
                <p className="text-[#EF4444]">✕ Nenhuma formação identificada</p>
              ) : (
                <ul className="space-y-1 text-[#64748B] dark:text-neutral-300">
                  {resume.education.map((ed, i) => (
                    <li key={i}>
                      ✓ {ed.degree}
                      {ed.institution && ` — ${ed.institution}`}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <p className="text-[9px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5">
                Idiomas e certificações
              </p>
              {resume.languages.length === 0 && resume.certifications.length === 0 ? (
                <p className="text-[#64748B]">Nenhum item identificado</p>
              ) : (
                <ul className="space-y-1 text-[#64748B] dark:text-neutral-300">
                  {resume.languages.map((l, i) => (
                    <li key={`l${i}`}>✓ {l.language}{l.level && ` (${l.level})`}</li>
                  ))}
                  {resume.certifications.map((c, i) => (
                    <li key={`c${i}`}>✓ {c}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** Benchmark: posição do overallScore frente às demais análises da mesma trilha. */
export function ScorePercentileCard({
  betterThanPercent,
  trackLabel,
}: {
  betterThanPercent: number;
  trackLabel: string;
}) {
  const tone =
    betterThanPercent >= 70
      ? "border-[#22C55E]/25 bg-[#22C55E]/5 text-[#22C55E]"
      : betterThanPercent >= 40
      ? "border-[#F59E0B]/25 bg-[#F59E0B]/5 text-[#F59E0B]"
      : "border-[#EF4444]/25 bg-[#EF4444]/5 text-[#EF4444]";
  return (
    <div className={`rounded-2xl border p-4 flex items-center gap-4 ${tone}`}>
      <span className="text-2xl font-bold tracking-tight shrink-0">
        {betterThanPercent}%
      </span>
      <p className="text-xs leading-relaxed font-medium">
        Este match ficou à frente de <strong>{betterThanPercent}%</strong> das análises já feitas na
        trilha <strong>{trackLabel.toLowerCase()}</strong> na plataforma.
      </p>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Clipboard, Copy, LoaderCircle, ShieldCheck, Sparkles } from "lucide-react";

type Kit = {
  summary: string;
  tailoredResumeBullets: string[];
  coverLetter: string;
  recruiterMessage: string;
  referralRequest: string;
  formAnswers: { question: string; answer: string }[];
  interviewQuestions: string[];
  preparationPlan: string[];
  traceability: { change: string; source: string; requirement: string; confidence: string }[];
};

export function ApplicationKitGenerator({ applicationId }: { applicationId: string }) {
  const [kit, setKit] = useState<Kit | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState("pt-BR");

  async function generate() {
    setLoading(true); setError(null);
    try {
      const response = await fetch("/api/tools/application-kit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ applicationId, language }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Erro ao gerar kit.");
      setKit(data.kit);
    } catch (err) { setError(err instanceof Error ? err.message : "Erro ao gerar kit."); }
    finally { setLoading(false); }
  }

  async function copy(text: string) {
    await navigator.clipboard.writeText(text);
  }

  if (!kit) return (
    <section className="rounded-2xl border border-blue-200 bg-blue-50/60 p-5 dark:border-blue-900/60 dark:bg-blue-950/20">
      <div className="flex items-start gap-3"><Sparkles className="mt-0.5 h-5 w-5 text-blue-600" /><div><h2 className="text-base font-bold text-slate-900 dark:text-white">Gerar candidatura completa</h2><p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">Crie currículo adaptado, carta, mensagens, respostas e plano de entrevista usando apenas evidências reais do seu perfil.</p></div></div>
      {error && <p className="mt-3 text-xs font-semibold text-rose-600">{error}</p>}
      <div className="mt-4 flex flex-wrap items-center gap-2"><select aria-label="Idioma do kit" value={language} onChange={(event) => setLanguage(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"><option value="pt-BR">Português</option><option value="en">English</option><option value="es">Español</option></select><button type="button" onClick={generate} disabled={loading} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50">{loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}{loading ? "Gerando kit..." : "Gerar kit completo"}</button></div>
    </section>
  );

  const textBlock = (title: string, text: string) => <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-950"><div className="flex items-center justify-between gap-2"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{title}</p><button type="button" onClick={() => copy(text)} className="text-slate-400 hover:text-blue-600" title="Copiar"><Copy className="h-3.5 w-3.5" /></button></div><p className="mt-2 whitespace-pre-line text-xs leading-relaxed text-slate-700 dark:text-slate-300">{text}</p></div>;

  return <section className="space-y-4 rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm dark:border-emerald-900/50 dark:bg-slate-900">
    <div className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-emerald-500" /><div><h2 className="text-base font-bold text-slate-900 dark:text-white">Kit de candidatura</h2><p className="text-xs text-slate-500 dark:text-slate-400">{kit.summary}</p></div></div>
    {textBlock("Carta de apresentação", kit.coverLetter)}
    {textBlock("Mensagem ao recrutador", kit.recruiterMessage)}
    {textBlock("Pedido de indicação", kit.referralRequest)}
    <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-950"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Bullets para o currículo</p><ul className="mt-2 space-y-2 text-xs text-slate-700 dark:text-slate-300">{kit.tailoredResumeBullets.map((item) => <li key={item} className="flex gap-2"><Clipboard className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-500" />{item}</li>)}</ul></div>
    <div className="grid gap-4 sm:grid-cols-2"><div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Plano de preparação</p><ol className="mt-2 list-decimal space-y-1 pl-4 text-xs text-slate-600 dark:text-slate-300">{kit.preparationPlan.map((item) => <li key={item}>{item}</li>)}</ol></div><div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Perguntas prováveis</p><ul className="mt-2 space-y-1 text-xs text-slate-600 dark:text-slate-300">{kit.interviewQuestions.map((item) => <li key={item}>• {item}</li>)}</ul></div></div>
    {kit.formAnswers.length > 0 && <div>{textBlock("Respostas para formulários", kit.formAnswers.map((item) => `Pergunta: ${item.question}\nResposta: ${item.answer}`).join("\n\n"))}</div>}
    <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3 dark:border-amber-900/50 dark:bg-amber-950/20"><p className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">Rastreabilidade das alterações</p><ul className="mt-2 space-y-2 text-xs text-slate-700 dark:text-slate-300">{kit.traceability.map((item) => <li key={`${item.change}-${item.source}`}><strong>{item.change}</strong> — origem: {item.source}; requisito: {item.requirement}; confiança: {item.confidence}.</li>)}</ul></div>
    <button type="button" onClick={generate} disabled={loading} className="text-xs font-bold text-blue-600 hover:underline dark:text-blue-400">{loading ? "Gerando nova versão..." : "Gerar nova versão"}</button>
  </section>;
}

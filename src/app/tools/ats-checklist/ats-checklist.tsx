"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckSquare, Sparkles, FileCheck } from "lucide-react";

const ITEMS = [
  ["Contato", "Nome, telefone, e-mail profissional e cidade aparecem no topo."],
  ["Objetivo", "O cargo desejado está escrito de forma clara e específica."],
  ["Palavras-chave", "O currículo repete naturalmente competências importantes da vaga."],
  ["Experiência", "Cada experiência mostra ações e resultados, não apenas responsabilidades."],
  ["Resultados", "Há números, volumes, prazos ou melhorias sempre que possível."],
  ["Formação", "Curso, instituição e período estão organizados de forma simples."],
  ["Leitura", "Não há tabelas complexas, caixas de texto, gráficos ou excesso de colunas."],
  ["Formato", "Títulos das seções são convencionais, como Experiência e Formação."],
  ["Tamanho", "O conteúdo ocupa uma ou duas páginas e não repete informações."],
  ["Revisão", "Ortografia, datas e links foram conferidos antes do envio."],
] as const;

export function AtsChecklist() {
  const [checked, setChecked] = useState<string[]>([]);
  const score = Math.round((checked.length / ITEMS.length) * 100);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 sm:px-6 py-8 md:py-12 space-y-8">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/tools"
          className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar para Ferramentas</span>
        </Link>

        <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider rounded-full px-3 py-1 bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60">
          <FileCheck className="w-3.5 h-3.5 text-slate-500" />
          <span>Checklist ATS</span>
        </span>
      </div>

      {/* Header Section */}
      <header className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Checklist de Currículo para ATS
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
          Marque cada item que seu currículo já atende e descubra o que precisa de revisão para passar nos robôs de seleção.
        </p>
      </header>

      {/* Score Progress Bar Card */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-900 text-white p-6 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm font-medium text-slate-300">Nível de Preparação do Currículo</span>
          <strong className="text-2xl sm:text-3xl font-bold tracking-tight">{score}%</strong>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-emerald-400 transition-all duration-300"
            style={{ width: `${score}%` }}
          />
        </div>
        <p className="text-xs text-slate-400">
          {score === 100
            ? "Parabéns! Seu currículo atende aos principais critérios para ATS."
            : `${checked.length} de ${ITEMS.length} itens verificados.`}
        </p>
      </div>

      {/* Checklist Items */}
      <div className="space-y-3">
        {ITEMS.map(([title, description]) => {
          const active = checked.includes(title);
          return (
            <label
              key={title}
              className={`flex cursor-pointer items-start gap-4 rounded-2xl border p-4 sm:p-5 transition-all shadow-sm ${
                active
                  ? "border-emerald-300 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20"
                  : "border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700"
              }`}
            >
              <input
                type="checkbox"
                checked={active}
                onChange={() =>
                  setChecked((items) =>
                    active ? items.filter((item) => item !== title) : [...items, title]
                  )
                }
                className="mt-1 h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400 dark:border-slate-700 dark:bg-slate-800 accent-emerald-600"
              />
              <div className="space-y-0.5">
                <strong className="block text-sm font-semibold text-slate-900 dark:text-white">
                  {title}
                </strong>
                <span className="block text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {description}
                </span>
              </div>
            </label>
          );
        })}
      </div>

      {/* Bottom CTA */}
      <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200/80 dark:border-slate-800">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Quer testar seu currículo real contra uma vaga específica?
        </p>
        <Link
          href="/analise"
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-5 py-2.5 text-sm font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-sm shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          <span>Fazer Análise de Vaga</span>
        </Link>
      </div>
    </main>
  );
}

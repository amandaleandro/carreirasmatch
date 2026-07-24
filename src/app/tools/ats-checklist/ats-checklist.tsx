"use client";

import { useState } from "react";
import Link from "next/link";

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
    <main className="mx-auto w-full max-w-3xl px-4 py-12">
      <Link href="/tools" className="text-sm font-semibold text-blue-600 hover:underline dark:text-blue-400">← Voltar para Ferramentas</Link>
      <header className="mb-8 mt-4">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Cadastro grátis</span>
        <h1 className="mt-2 text-3xl font-bold">Checklist de currículo ATS</h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">Marque cada item que seu currículo já atende e descubra o que revisar antes da candidatura.</p>
      </header>
      <div className="mb-6 rounded-2xl bg-blue-600 p-5 text-white">
        <div className="flex items-end justify-between"><span className="text-sm font-semibold">Preparação do currículo</span><strong className="text-3xl">{score}%</strong></div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/20"><div className="h-full rounded-full bg-white transition-all" style={{ width: `${score}%` }} /></div>
      </div>
      <div className="space-y-3">
        {ITEMS.map(([title, description]) => {
          const active = checked.includes(title);
          return (
            <label key={title} className={`flex cursor-pointer gap-3 rounded-2xl border p-4 transition-colors ${active ? "border-emerald-300 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/20" : "border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950"}`}>
              <input type="checkbox" checked={active} onChange={() => setChecked((items) => active ? items.filter((item) => item !== title) : [...items, title])} className="mt-1 h-4 w-4 accent-emerald-600" />
              <span><strong className="block text-sm">{title}</strong><span className="mt-1 block text-sm text-neutral-600 dark:text-neutral-400">{description}</span></span>
            </label>
          );
        })}
      </div>
      <Link href="/curriculo-gratis" className="mt-8 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700">Criar meu currículo grátis</Link>
    </main>
  );
}

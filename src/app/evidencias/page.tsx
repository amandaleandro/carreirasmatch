"use client";

import { useState } from "react";
import Link from "next/link";
import { ShieldCheck, Plus, Sparkles, CheckCircle2, Award, Briefcase, Trash2, ArrowLeft } from "lucide-react";

export type EvidenceItem = {
  id: string;
  category: "projeto" | "resultado" | "certificacao" | "ferramenta";
  title: string;
  description: string;
  metrics?: string;
  verifiedAt: string;
};

const INITIAL_EVIDENCES: EvidenceItem[] = [
  {
    id: "1",
    category: "resultado",
    title: "Otimização de Performance Web",
    description: "Redução do tempo de carregamento da página principal em 45% utilizando Lazy Loading e Next.js.",
    metrics: "45% mais rápido / +15k usuários atingidos",
    verifiedAt: "2026-06-15",
  },
  {
    id: "2",
    category: "certificacao",
    title: "Certificação AWS Cloud Practitioner",
    description: "Conhecimentos validados em arquitetura de nuvem, segurança e infraestrutura.",
    metrics: "Emitido em Mai/2026",
    verifiedAt: "2026-05-10",
  },
];

export default function EvidenciasPage() {
  const [items, setItems] = useState<EvidenceItem[]>(INITIAL_EVIDENCES);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<EvidenceItem["category"]>("resultado");
  const [description, setDescription] = useState("");
  const [metrics, setMetrics] = useState("");

  function handleAddEvidence(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    const newItem: EvidenceItem = {
      id: Date.now().toString(),
      category,
      title: title.trim(),
      description: description.trim(),
      metrics: metrics.trim() || undefined,
      verifiedAt: new Date().toISOString().split("T")[0],
    };

    setItems([newItem, ...items]);
    setTitle("");
    setDescription("");
    setMetrics("");
    setShowModal(false);
  }

  function handleDelete(id: string) {
    setItems(items.filter((item) => item.id !== id));
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="space-y-1">
          <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white mb-2">
            <ArrowLeft className="w-3.5 h-3.5" /> Voltar ao Painel
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
              <ShieldCheck className="w-7 h-7 text-emerald-500" />
              Banco de Evidências Profissionais
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
            Cadastre suas conquistas reais, projetos e métricas. A inteligência do CarreirasMatch utiliza este banco para otimizar seus currículos com <strong className="text-slate-900 dark:text-white">garantia de zero alucinação</strong>.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-extrabold px-5 py-3 shadow-md transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          Adicionar Nova Evidência
        </button>
      </div>

      {/* Trava Antialucinação Banner */}
      <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/30 p-4 sm:p-5 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h3 className="text-xs sm:text-sm font-bold text-emerald-900 dark:text-emerald-300">
            Trava Anti-Alucinação Ativa
          </h3>
          <p className="text-xs text-emerald-700 dark:text-emerald-400 leading-relaxed">
            Ao gerar o Kit de Candidatura para uma vaga, a IA só inclui bullets e métricas respaldados pelas evidências cadastradas aqui. Seu currículo fica impecável sem inventar nada.
          </p>
        </div>
      </div>

      {/* Lista de Evidências */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
          Suas Evidências Verificadas ({items.length})
        </h2>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-8 text-center space-y-3">
            <p className="text-xs text-slate-500">Você ainda não possui evidências cadastradas.</p>
            <button
              onClick={() => setShowModal(true)}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
            >
              + Adicionar primeira evidência
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3 shadow-xs relative group"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {item.category === "resultado" && <Award className="w-3 h-3 text-amber-500" />}
                    {item.category === "projeto" && <Briefcase className="w-3 h-3 text-blue-500" />}
                    {item.category === "certificacao" && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                    {item.category}
                  </span>

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-slate-400 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Excluir evidência"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {item.metrics && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                    <span>📊 {item.metrics}</span>
                    <span className="text-[10px] text-slate-400">Verificado em {item.verifiedAt}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Criação de Evidência */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-5 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                Cadastrar Nova Evidência Profissional
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddEvidence} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Categoria
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as EvidenceItem["category"])}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500"
                >
                  <option value="resultado">Resultado / Métrica de Sucesso</option>
                  <option value="projeto">Projeto de Impacto</option>
                  <option value="certificacao">Certificação ou Curso</option>
                  <option value="ferramenta">Domínio Técnico / Ferramenta</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Título da Evidência
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Reestruturação do Funil de Vendas"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Descrição detalhada do que foi feito
                </label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descreva o contexto, os desafios e sua atuação direta..."
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Métrica / Indicador Quantitativo (Opcional)
                </label>
                <input
                  type="text"
                  value={metrics}
                  onChange={(e) => setMetrics(e.target.value)}
                  placeholder="Ex: Aumento de 30% na conversão / R$ 50k economizados"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-1/2 rounded-xl border border-slate-200 dark:border-slate-800 p-3 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-1/2 rounded-xl bg-blue-600 hover:bg-blue-500 p-3 text-xs font-extrabold text-white shadow-md"
                >
                  Salvar Evidência
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

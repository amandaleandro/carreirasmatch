"use client";

import { useState } from "react";
import { AtsStandaloneAnalysis } from "@/lib/ats-checker";
import { useRouter } from "next/navigation";

interface AtsVerifierResultProps {
  data: AtsStandaloneAnalysis;
  rawText: string;
}

export function AtsVerifierResult({ data, rawText }: AtsVerifierResultProps) {
  const [showRawText, setShowRawText] = useState(false);
  const [jobText, setJobText] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [showJobModal, setShowJobModal] = useState(false);
  const router = useRouter();

  function getScoreColor(score: number) {
    if (score >= 80) return "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800";
    if (score >= 60) return "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800";
    return "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800";
  }

  function handleCompareWithJob(e: React.FormEvent) {
    e.preventDefault();
    if (!jobText.trim()) return;

    // Salva o texto no sessionStorage para a tela de análise pegar automaticamente
    sessionStorage.setItem("cm_carried_resume_text", rawText);
    sessionStorage.setItem("cm_carried_job_text", jobText);
    sessionStorage.setItem("cm_carried_job_title", jobTitle || "Vaga desejada");

    router.push("/analise");
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* O Sistema dos 3 Scores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Score 1: Leitura ATS */}
        <div className={`p-6 rounded-2xl border ${getScoreColor(data.atsReadabilityScore)} shadow-sm relative overflow-hidden`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider opacity-80">Score 1</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/60 dark:bg-black/30 border border-current">
              Leitura ATS
            </span>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl font-bold">{data.atsReadabilityScore}</span>
            <span className="text-sm font-semibold opacity-70">/100</span>
          </div>
          <p className="mt-2 text-xs font-medium opacity-90">
            {data.atsReadabilityScore >= 80
              ? "Excelente! O robô extrai seu arquivo com clareza."
              : "Atenção: O sistema encontrou dificuldades em algumas seções."}
          </p>
        </div>

        {/* Score 2: Qualidade do Conteúdo */}
        <div className={`p-6 rounded-2xl border ${getScoreColor(data.resumeQualityScore)} shadow-sm relative overflow-hidden`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider opacity-80">Score 2</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/60 dark:bg-black/30 border border-current">
              Qualidade do CV
            </span>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl font-bold">{data.resumeQualityScore}</span>
            <span className="text-sm font-semibold opacity-70">/100</span>
          </div>
          <p className="mt-2 text-xs font-medium opacity-90">
            {data.resumeQualityScore >= 80
              ? "Boa estrutura de impacto, verbos e conquistas."
              : "Pode ser melhorado com métricas e verbos de ação mais fortes."}
          </p>
        </div>

        {/* Score 3: Aderência à Vaga (Locked - CTA de Conversão) */}
        <div className="p-6 rounded-2xl border border-dashed border-blue-300 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20 text-blue-900 dark:text-blue-200 shadow-sm flex flex-col justify-between relative group hover:border-blue-500 transition-colors">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Score 3</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                Aderência à Vaga
              </span>
            </div>
            <div className="mt-4 flex items-center gap-2 text-blue-600 dark:text-blue-400">
              <span className="text-3xl font-bold">?</span>
              <span className="text-xs font-semibold">Desbloqueável com uma vaga</span>
            </div>
            <p className="mt-2 text-xs text-blue-700 dark:text-blue-300">
              Seu currículo pode ser 100% legível, mas ele mostra o que a vaga procura?
            </p>
          </div>
          <button
            onClick={() => setShowJobModal(true)}
            className="mt-4 w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Calcular Aderência com uma Vaga
          </button>
        </div>
      </div>

      {/* Avaliação Geral */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span>📋</span> Diagnóstico Inicial
        </h3>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          {data.summary}
        </p>

        {/* O que o robô do ATS conseguiu identificar */}
        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-500 dark:text-slate-400 block">Nome & Contato</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {data.detectedContactInfo.name || "Identificado"}
            </span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 block">Experiências</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {data.detectedContactInfo.experiencesCount} identificadas
            </span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 block">Habilidades/Skills</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {data.detectedContactInfo.skillsCount} identificadas
            </span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 block">LinkedIn</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {data.detectedContactInfo.linkedin ? "Encontrado" : "Não detectado"}
            </span>
          </div>
        </div>
      </div>

      {/* Prova Visual: O que o robô do ATS leu */}
      <div className="bg-slate-900 text-slate-100 rounded-2xl p-6 shadow-lg border border-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <span>🤖</span> O que o robô do ATS provavelmente leu
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Esta é a representação em texto puro que os sistemas automáticos extraem do seu PDF.
            </p>
          </div>
          <button
            onClick={() => setShowRawText(!showRawText)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg text-slate-200 transition-colors"
          >
            {showRawText ? "Ocultar Texto" : "Visualizar Texto do ATS"}
          </button>
        </div>

        {showRawText && (
          <div className="mt-4 p-4 bg-black/60 rounded-xl font-mono text-xs text-emerald-400 border border-slate-800 max-h-60 overflow-y-auto whitespace-pre-wrap leading-relaxed">
            {data.extractedTextPreview || rawText}
          </div>
        )}
      </div>

      {/* Checklist do ATS */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
          Checklist Estrutural do ATS
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {data.atsChecklist.map((item, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <span className="mt-0.5">
                {item.status === "pass" && "✅"}
                {item.status === "warning" && "⚠️"}
                {item.status === "fail" && "❌"}
              </span>
              <div>
                <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">{item.label}</h5>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Problemas de Formatação & Leitura */}
      {data.formattingIssues.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <span>🔍</span> Ajustes Recomendados na Formatação
          </h3>
          <div className="space-y-3">
            {data.formattingIssues.map((issue, i) => (
              <div
                key={i}
                className={`p-4 rounded-xl border text-xs ${
                  issue.severity === "critical"
                    ? "bg-rose-50/70 border-rose-200 dark:bg-rose-950/30 dark:border-rose-900/50 text-rose-900 dark:text-rose-200"
                    : issue.severity === "warning"
                    ? "bg-amber-50/70 border-amber-200 dark:bg-amber-950/30 dark:border-amber-900/50 text-amber-900 dark:text-amber-200"
                    : "bg-blue-50/70 border-blue-200 dark:bg-blue-950/30 dark:border-blue-900/50 text-blue-900 dark:text-blue-200"
                }`}
              >
                <div className="font-bold flex items-center gap-2">
                  <span className="uppercase text-[10px] tracking-wider px-2 py-0.5 rounded font-bold bg-white/60 dark:bg-black/40">
                    {issue.severity}
                  </span>
                  {issue.title}
                </div>
                <p className="mt-1.5 opacity-90">{issue.description}</p>
                <div className="mt-2 pt-2 border-t border-current/10 font-medium">
                  💡 <strong>Sugestão:</strong> {issue.suggestion}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sugestões de Melhoria de Conteúdo */}
      {data.qualityFixes.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <span>✍️</span> Melhorias de Conteúdo e Escrita
          </h3>
          <div className="space-y-4">
            {data.qualityFixes.map((fix, i) => (
              <div key={i} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs space-y-1.5">
                <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-semibold uppercase text-[10px]">
                    {fix.category}
                  </span>
                  {fix.issue}
                </div>
                <p className="text-slate-600 dark:text-slate-300"><strong>Ação:</strong> {fix.action}</p>
                <div className="p-2 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-lg text-emerald-800 dark:text-emerald-300">
                  <strong>Exemplo Prático:</strong> &ldquo;{fix.example}&rdquo;
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ponte de Alta Conversão */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-3xl p-8 shadow-xl text-center space-y-4">
        <h3 className="text-xl sm:text-2xl font-bold">
          Seu currículo está lido pelo ATS. Agora ele está preparado para a Vaga dos Seus Sonhos?
        </h3>
        <p className="text-sm text-blue-100 max-w-2xl mx-auto leading-relaxed">
          Passar pela leitura técnica do robô é só a primeira metade do caminho. O <strong>Score de Aderência (Score 3)</strong> compara suas palavras-chave e experiências diretamente contra a oportunidade que você quer.
        </p>
        <button
          onClick={() => setShowJobModal(true)}
          className="inline-flex items-center gap-2 px-8 py-4 bg-white hover:bg-blue-50 text-blue-700 rounded-2xl font-bold text-sm shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
        >
          <span>🎯</span> Comparar com uma Vaga Real Gratuitamente
        </button>
      </div>

      {/* Modal / Overlay para Inserir Vaga */}
      {showJobModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative space-y-4 animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowJobModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              ✕
            </button>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>🎯</span> Insira a Vaga Desejada
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Cole a descrição ou link da oportunidade para desbloquear o Score de Aderência, palavras-chave e perguntas de entrevista.
            </p>
            <form onSubmit={handleCompareWithJob} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Título do Cargo (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Desenvolvedor Front-end, Auxiliar de RH"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Descrição da Vaga ou Link *
                </label>
                <textarea
                  rows={5}
                  required
                  placeholder="Cole aqui os requisitos, responsabilidades ou o link do anúncio no LinkedIn/Gupy..."
                  value={jobText}
                  onChange={(e) => setJobText(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowJobModal(false)}
                  className="px-4 py-2.5 rounded-xl font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all"
                >
                  Calcular Aderência à Vaga
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

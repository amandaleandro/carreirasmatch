"use client";

import { useState } from "react";
import { PublicSiteHeader } from "@/components/public-site-header";
import { SiteFooter } from "@/components/site-footer";
import { EnsinoMedioToolsNav } from "@/components/ensino-medio-tools-nav";
import { EnemAnalysisResult } from "@/lib/ensino-medio-tools";
import {
  Calculator,
  Sparkles,
  Briefcase,
  RotateCcw,
} from "lucide-react";

export default function EnemCalculatorPage() {
  const [linguagens, setLinguagens] = useState(640);
  const [humanas, setHumanas] = useState(660);
  const [natureza, setNatureza] = useState(620);
  const [matematica, setMatematica] = useState(720);
  const [redacao, setRedacao] = useState(880);
  const [targetCourse, setTargetCourse] = useState("Engenharia de Software");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<EnemAnalysisResult | null>(null);

  const handleCalculate = async () => {
    if (!targetCourse.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/ensino-medio/calculadora-enem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          linguagens,
          humanas,
          natureza,
          matematica,
          redacao,
          targetCourse,
        }),
      });

      if (res.status === 401) {
        window.location.href = `/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`;
        return;
      }

      if (!res.ok) throw new Error("Erro na API da calculadora.");

      const json = await res.json();
      if (json.error) throw new Error(json.error);

      setResult(json);
    } catch (err) {
      console.error(err);
      setError("Falha ao calcular a média. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50 font-sans">
      <PublicSiteHeader />
      <EnsinoMedioToolsNav />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 md:px-8 py-8 space-y-8">
        <header className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 px-3 py-1 text-xs font-bold uppercase tracking-wider">
            <Calculator className="h-3.5 w-3.5" />
            Simulador de Pesos SISU com Gemini AI
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white">
            Calculadora de Média Ponderada do ENEM
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 text-xs md:text-sm leading-relaxed">
            Insira suas notas das 5 provas do ENEM e o curso desejado para ver a média ponderada com pesos universitários e sua chance estimada no SISU/PROUNI.
          </p>
        </header>

        {!result ? (
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
            {/* Curso Alvo */}
            <div className="space-y-2">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-neutral-500">
                Curso Desejado
              </label>
              <input
                type="text"
                value={targetCourse}
                onChange={(e) => setTargetCourse(e.target.value)}
                placeholder="Ex: Medicina, Direito, Enfermagem, Engenharia de Software..."
                className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs md:text-sm font-bold text-neutral-900 dark:text-white"
              />
            </div>

            {/* Sliders das 5 notas */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Linguagens */}
              <div className="space-y-2 p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
                <div className="flex justify-between text-xs font-bold">
                  <span>Linguagens e Códigos</span>
                  <span className="text-blue-600 dark:text-blue-400">{linguagens} pts</span>
                </div>
                <input
                  type="range"
                  min={300}
                  max={1000}
                  step={10}
                  value={linguagens}
                  onChange={(e) => setLinguagens(Number(e.target.value))}
                  className="w-full accent-blue-600"
                />
              </div>

              {/* Humanas */}
              <div className="space-y-2 p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
                <div className="flex justify-between text-xs font-bold">
                  <span>Ciências Humanas</span>
                  <span className="text-amber-600 dark:text-amber-400">{humanas} pts</span>
                </div>
                <input
                  type="range"
                  min={300}
                  max={1000}
                  step={10}
                  value={humanas}
                  onChange={(e) => setHumanas(Number(e.target.value))}
                  className="w-full accent-amber-600"
                />
              </div>

              {/* Natureza */}
              <div className="space-y-2 p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
                <div className="flex justify-between text-xs font-bold">
                  <span>Ciências da Natureza</span>
                  <span className="text-rose-600 dark:text-rose-400">{natureza} pts</span>
                </div>
                <input
                  type="range"
                  min={300}
                  max={1000}
                  step={10}
                  value={natureza}
                  onChange={(e) => setNatureza(Number(e.target.value))}
                  className="w-full accent-rose-600"
                />
              </div>

              {/* Matemática */}
              <div className="space-y-2 p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
                <div className="flex justify-between text-xs font-bold">
                  <span>Matemática</span>
                  <span className="text-indigo-600 dark:text-indigo-400">{matematica} pts</span>
                </div>
                <input
                  type="range"
                  min={300}
                  max={1000}
                  step={10}
                  value={matematica}
                  onChange={(e) => setMatematica(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>

              {/* Redação */}
              <div className="space-y-2 p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 md:col-span-2">
                <div className="flex justify-between text-xs font-bold">
                  <span>Redação</span>
                  <span className="text-emerald-600 dark:text-emerald-400">{redacao} pts</span>
                </div>
                <input
                  type="range"
                  min={300}
                  max={1000}
                  step={20}
                  value={redacao}
                  onChange={(e) => setRedacao(Number(e.target.value))}
                  className="w-full accent-emerald-600"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-semibold">
                {error}
              </div>
            )}

            <button
              onClick={handleCalculate}
              disabled={loading || !targetCourse.trim()}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-extrabold text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Sparkles className="h-4 w-4 animate-spin" />
                  Calculando Média Ponderada...
                </>
              ) : (
                <>
                  <Calculator className="h-4 w-4" />
                  Calcular Média Ponderada & Ver Análise
                </>
              )}
            </button>
          </div>
        ) : (
          /* Resultado da Calculadora */
          <div className="space-y-6">
            {/* Cards de Média */}
            <div className="grid gap-6 md:grid-cols-2">
              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 text-center space-y-2 shadow-2xs">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Média Simples (Aritmética)
                </span>
                <div className="text-4xl font-bold text-neutral-900 dark:text-white">
                  {result.simpleAverage} <span className="text-sm text-neutral-400 font-medium">pts</span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 text-white rounded-3xl p-6 text-center space-y-2 shadow-md">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-200">
                  Média Ponderada Estimada para {result.course}
                </span>
                <div className="text-4xl font-bold text-amber-300">
                  {result.weightedAverage} <span className="text-sm text-white font-medium">pts</span>
                </div>
              </div>
            </div>

            {/* Avaliação de Chances & Pesos Usados */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 md:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-4">
                <div>
                  <h3 className="text-lg font-extrabold text-neutral-900 dark:text-white">
                    Avaliação de Competitividade no SISU / PROUNI
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1">
                    {result.chancesAssessment}
                  </p>
                </div>
                <button
                  onClick={() => setResult(null)}
                  className="px-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-xs font-bold flex items-center gap-1.5 shrink-0"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Recalcular
                </button>
              </div>

              {/* Pesos Utilizados */}
              <div className="space-y-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-neutral-400">
                  Pesos Típicos para {result.course}
                </span>
                <div className="grid grid-cols-5 gap-2 text-center text-xs">
                  <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-200 font-bold">
                    Ling: {result.weightsUsed.linguagens}x
                  </div>
                  <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 font-bold">
                    Hum: {result.weightsUsed.humanas}x
                  </div>
                  <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 font-bold">
                    Nat: {result.weightsUsed.natureza}x
                  </div>
                  <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-200 font-bold">
                    Mat: {result.weightsUsed.matematica}x
                  </div>
                  <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 font-bold">
                    Red: {result.weightsUsed.redacao}x
                  </div>
                </div>
              </div>

              {/* Cursos Técnicos Alternativos */}
              {result.alternativeTechnicalCourses.length > 0 && (
                <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 space-y-2">
                  <div className="flex items-center gap-2 font-extrabold text-purple-900 dark:text-purple-200 text-xs">
                    <Briefcase className="h-4 w-4 text-purple-600" />
                    Opções de Cursos Técnicos Rápidos na Mesma Área:
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs font-semibold">
                    {result.alternativeTechnicalCourses.map((c, i) => (
                      <span key={i} className="px-3 py-1 rounded-full bg-white dark:bg-neutral-900 text-purple-700 dark:text-purple-300 border border-purple-200">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}

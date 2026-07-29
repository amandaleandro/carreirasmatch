"use client";

import { useState } from "react";
import Link from "next/link";
import { HIGH_SCHOOL_SUBJECTS, YearId, getTopicsByYear } from "@/lib/ensino-medio-types";
import { EnsinoMedioYearSelector } from "@/components/ensino-medio-year-selector";
import { EnsinoMedioGamification } from "@/components/ensino-medio-gamification";
import {
  BookOpen,
  Sparkles,
  Trophy,
  Calculator,
  Dna,
  Zap,
  FlaskConical,
  Landmark,
  Globe,
  Brain,
  ArrowRight,
  FileEdit,
  Calendar,
  Scale,
  Bot,
  Award,
  FileText,
  Timer,
  GitBranch,
} from "lucide-react";

const ICON_MAP: Record<string, React.ReactNode> = {
  Calculator: <Calculator className="h-6 w-6 text-blue-600 dark:text-blue-400" />,
  BookOpen: <BookOpen className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />,
  Dna: <Dna className="h-6 w-6 text-rose-600 dark:text-rose-400" />,
  Zap: <Zap className="h-6 w-6 text-amber-600 dark:text-amber-400" />,
  FlaskConical: <FlaskConical className="h-6 w-6 text-purple-600 dark:text-purple-400" />,
  Landmark: <Landmark className="h-6 w-6 text-amber-700 dark:text-amber-300" />,
  Globe: <Globe className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />,
  Brain: <Brain className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />,
};

export function EnsinoMedioHubClient() {
  const [selectedYear, setSelectedYear] = useState<YearId>("all");

  return (
    <div className="space-y-12">
      {/* Hero Header */}
      <header className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-indigo-500/10 border border-blue-500/20 px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400">
          <Sparkles className="h-3.5 w-3.5" />
          Suíte Completa do Ensino Médio por Anos (1º, 2º, 3º & ENEM)
        </div>
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-neutral-900 dark:text-white leading-tight">
          Estude para a Escola e para o ENEM por Ano Escolar
        </h1>
        <p className="text-neutral-600 dark:text-neutral-300 text-sm md:text-base leading-relaxed max-w-2xl mx-auto">
          Resumos didáticos da BNCC para 1º Ano, 2º Ano e 3º Ano/ENEM, simulados por série, flashcards 3D, temporizador Pomodoro e tutor virtual 24h.
        </p>
      </header>

      {/* Painel de Gamificação e Nível do Estudante */}
      <EnsinoMedioGamification />

      {/* Seletor Interativo por Ano Escolar */}
      <section className="bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
        <EnsinoMedioYearSelector
          selectedYear={selectedYear}
          onSelectYear={setSelectedYear}
        />
      </section>

      {/* Grid das Ferramentas Inteligentes de IA */}
      <section className="space-y-4">
        <h2 className="text-xl font-extrabold text-neutral-900 dark:text-white flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-600" />
          Ferramentas Inteligentes de Estudo (Gemini AI)
        </h2>

        <div className="grid gap-4 md:grid-cols-3">
          {/* Tool 0: Simulado por Ano */}
          <Link
            href="/ensino-medio/simulado"
            className="p-6 rounded-3xl bg-amber-500/5 dark:bg-amber-950/20 border border-amber-500/30 hover:border-amber-500 transition-all space-y-3 shadow-2xs hover:shadow-md group"
          >
            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-600 w-fit group-hover:scale-110 transition-transform">
              <Trophy className="h-6 w-6" />
            </div>
            <h3 className="font-extrabold text-base text-neutral-900 dark:text-white group-hover:text-amber-600">
              Simulado por Ano Escolar 🏆
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Faça testes inéditos focados na grade curricular do 1º Ano, 2º Ano ou 3º Ano/ENEM com diagnósticos em tempo real.
            </p>
          </Link>

          {/* Tool 0.2: Flashcards 3D */}
          <Link
            href="/ensino-medio/flashcards"
            className="p-6 rounded-3xl bg-purple-500/5 dark:bg-purple-950/20 border border-purple-500/30 hover:border-purple-500 transition-all space-y-3 shadow-2xs hover:shadow-md group"
          >
            <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-600 w-fit group-hover:scale-110 transition-transform">
              <Zap className="h-6 w-6" />
            </div>
            <h3 className="font-extrabold text-base text-neutral-900 dark:text-white group-hover:text-purple-600">
              Flashcards 3D de Memorização ⚡
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Revise fórmulas, datas e conceitos em cartões 3D interativos com técnica de repetição espaçada por série.
            </p>
          </Link>

          {/* Tool 0.4: Temporizador Foco */}
          <Link
            href="/ensino-medio/foco"
            className="p-6 rounded-3xl bg-emerald-500/5 dark:bg-emerald-950/20 border border-emerald-500/30 hover:border-emerald-500 transition-all space-y-3 shadow-2xs hover:shadow-md group"
          >
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 w-fit group-hover:scale-110 transition-transform">
              <Timer className="h-6 w-6" />
            </div>
            <h3 className="font-extrabold text-base text-neutral-900 dark:text-white group-hover:text-emerald-600">
              Temporizador Pomodoro Foco ⏱️
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Estude em blocos de 25 minutos com ciclos de pausa para manter a disciplina escolar e zerar as distrações.
            </p>
          </Link>

          {/* Tool 0.6: Mapas Mentais */}
          <Link
            href="/ensino-medio/mapa-mental"
            className="p-6 rounded-3xl bg-indigo-500/5 dark:bg-indigo-950/20 border border-indigo-500/30 hover:border-indigo-500 transition-all space-y-3 shadow-2xs hover:shadow-md group"
          >
            <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-600 w-fit group-hover:scale-110 transition-transform">
              <GitBranch className="h-6 w-6" />
            </div>
            <h3 className="font-extrabold text-base text-neutral-900 dark:text-white group-hover:text-indigo-600">
              Gerador de Mapas Mentais 🧠
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Transforme tópicos complexos em diagramas conceituais ramificados para estudo visual passo a passo.
            </p>
          </Link>

          {/* Tool 0.8: Lista de Exercícios */}
          <Link
            href="/ensino-medio/exercicios"
            className="p-6 rounded-3xl bg-blue-500/5 dark:bg-blue-950/20 border border-blue-500/30 hover:border-blue-500 transition-all space-y-3 shadow-2xs hover:shadow-md group"
          >
            <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-600 w-fit group-hover:scale-110 transition-transform">
              <FileText className="h-6 w-6" />
            </div>
            <h3 className="font-extrabold text-base text-neutral-900 dark:text-white group-hover:text-blue-600">
              Gerador de Exercícios PDF
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Crie listas completas de estudo por matéria e por série para resolver na tela ou salvar/imprimir em formato PDF.
            </p>
          </Link>

          {/* Tool 1: Redação */}
          <Link
            href="/ensino-medio/redacao"
            className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-blue-500 transition-all space-y-3 shadow-2xs hover:shadow-md group"
          >
            <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-600 w-fit group-hover:scale-110 transition-transform">
              <FileEdit className="h-6 w-6" />
            </div>
            <h3 className="font-extrabold text-base text-neutral-900 dark:text-white group-hover:text-blue-600">
              Corretor de Redação ENEM
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Avaliação oficial de 0 a 1000 pontos nas 5 competências do ENEM com análise gramatical e sugestões de repertório.
            </p>
          </Link>

          {/* Tool 2: Calculadora ENEM */}
          <Link
            href="/ensino-medio/calculadora-enem"
            className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-emerald-500 transition-all space-y-3 shadow-2xs hover:shadow-md group"
          >
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 w-fit group-hover:scale-110 transition-transform">
              <Calculator className="h-6 w-6" />
            </div>
            <h3 className="font-extrabold text-base text-neutral-900 dark:text-white group-hover:text-emerald-600">
              Calculadora Média ENEM
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Simule suas notas no ENEM e calcule a média ponderada com os pesos das universidades para o curso dos seus sonhos.
            </p>
          </Link>

          {/* Tool 3: Cronograma */}
          <Link
            href="/ensino-medio/cronograma"
            className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-purple-500 transition-all space-y-3 shadow-2xs hover:shadow-md group"
          >
            <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-600 w-fit group-hover:scale-110 transition-transform">
              <Calendar className="h-6 w-6" />
            </div>
            <h3 className="font-extrabold text-base text-neutral-900 dark:text-white group-hover:text-purple-600">
              Cronograma de Estudos
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Planejador semanal personalizado conforme seu tempo livre e matérias onde você mais precisa melhorar no ano.
            </p>
          </Link>

          {/* Tool 4: Comparador */}
          <Link
            href="/ensino-medio/comparador"
            className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-indigo-500 transition-all space-y-3 shadow-2xs hover:shadow-md group"
          >
            <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-600 w-fit group-hover:scale-110 transition-transform">
              <Scale className="h-6 w-6" />
            </div>
            <h3 className="font-extrabold text-base text-neutral-900 dark:text-white group-hover:text-indigo-600">
              Faculdade vs Curso Técnico
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Compare estimativas de nota de corte no SISU, mensalidade, tempo de curso e velocidade de entrada no mercado.
            </p>
          </Link>

          {/* Tool 5: Tutor AI 24h */}
          <Link
            href="/ensino-medio/tutor"
            className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-emerald-500 transition-all space-y-3 shadow-2xs hover:shadow-md group"
          >
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 w-fit group-hover:scale-110 transition-transform">
              <Bot className="h-6 w-6" />
            </div>
            <h3 className="font-extrabold text-base text-neutral-900 dark:text-white group-hover:text-emerald-600">
              Tutor Virtual AI 24h
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Chat de monitoria para tirar qualquer dúvida de dever de casa e entender resoluções passo a passo.
            </p>
          </Link>

          {/* Tool 6: Redações Nota 1000 */}
          <Link
            href="/ensino-medio/redacao-nota-1000"
            className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-rose-500 transition-all space-y-3 shadow-2xs hover:shadow-md group"
          >
            <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-600 w-fit group-hover:scale-110 transition-transform">
              <Award className="h-6 w-6" />
            </div>
            <h3 className="font-extrabold text-base text-neutral-900 dark:text-white group-hover:text-rose-600">
              Redações Nota 1000
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Analise redações modelo parágrafo por parágrafo com explicações detalhadas por competência e repertório.
            </p>
          </Link>
        </div>
      </section>

      {/* Grid de Disciplinas do Ensino Médio Filtradas por Ano */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-4">
          <div>
            <h2 className="text-2xl font-extrabold text-neutral-900 dark:text-white">
              Matérias & Conteúdos da BNCC
            </h2>
            <p className="text-xs md:text-sm text-neutral-500">
              {selectedYear === "all"
                ? "Exibindo os tópicos dos 3 Anos do Ensino Médio."
                : `Exibindo o programa de estudos focado no ${
                    selectedYear === "1o-ano"
                      ? "1º Ano"
                      : selectedYear === "2o-ano"
                      ? "2º Ano"
                      : "3º Ano & ENEM"
                  }.`}
            </p>
          </div>
          <Link
            href="/jogos"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
          >
            <Trophy className="h-4 w-4" />
            Ver Jogos Gamificados
          </Link>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {HIGH_SCHOOL_SUBJECTS.map((subject) => {
            const yearTopics = getTopicsByYear(subject, selectedYear);
            return (
              <Link
                key={subject.slug}
                href={`/ensino-medio/${subject.slug}${selectedYear !== "all" ? `?ano=${selectedYear}` : ""}`}
                className="group rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 flex flex-col justify-between hover:border-blue-500 dark:hover:border-blue-500 shadow-2xs hover:shadow-md transition-all relative overflow-hidden"
              >
                <div className="space-y-4">
                  <div className="rounded-2xl bg-neutral-100 dark:bg-neutral-800 p-3.5 w-fit group-hover:scale-110 transition-transform">
                    {ICON_MAP[subject.iconName] || <BookOpen className="h-6 w-6 text-blue-600" />}
                  </div>

                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400">
                      {subject.category}
                    </span>
                    <h3 className="text-lg font-extrabold text-neutral-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {subject.name}
                    </h3>
                  </div>

                  <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed line-clamp-2">
                    {subject.description}
                  </p>

                  {/* Amostra dos Tópicos do Ano Selecionado */}
                  <div className="space-y-1.5 pt-2">
                    <span className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                      Principais tópicos ({yearTopics.length}):
                    </span>
                    <ul className="space-y-1">
                      {yearTopics.slice(0, 3).map((item) => (
                        <li key={item.topic} className="text-[11px] text-neutral-600 dark:text-neutral-300 truncate flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />
                          <span className="truncate">{item.topic}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800/60 mt-4 flex items-center justify-between text-[11px]">
                  <span className="font-bold text-neutral-500">Acessar matérias</span>
                  <span className="flex items-center gap-1 font-extrabold text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform">
                    Estudar <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}

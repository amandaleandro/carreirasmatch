import Link from "next/link";
import { Sparkles, BookOpen, ArrowRight, Gamepad2 } from "lucide-react";
import { EnsinoMedioGamification } from "@/components/ensino-medio-gamification";

export function EnsinoMedioHubClient() {
  return (
    <div className="space-y-12">
      {/* Hero Header */}
      <header className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
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

      {/* Menu principal: cada seção é sua própria tela */}
      <section className="grid gap-5 sm:grid-cols-2">
        <Link
          href="/ensino-medio/ferramentas"
          className="group rounded-3xl border border-blue-500/30 bg-blue-500/5 dark:bg-blue-950/20 p-8 space-y-3 hover:border-blue-500 hover:shadow-md transition-all"
        >
          <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-600 w-fit group-hover:scale-110 transition-transform">
            <Sparkles className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-extrabold text-neutral-900 dark:text-white group-hover:text-blue-600">
            Ferramentas Inteligentes de Estudo
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Simulados por ano, flashcards 3D, Pomodoro, mapas mentais, corretor de redação ENEM e mais — tudo com IA Gemini.
          </p>
          <span className="inline-flex items-center gap-1 text-xs font-extrabold text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform">
            Ver ferramentas <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </Link>

        <Link
          href="/ensino-medio/materias"
          className="group rounded-3xl border border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-950/20 p-8 space-y-3 hover:border-emerald-500 hover:shadow-md transition-all"
        >
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 w-fit group-hover:scale-110 transition-transform">
            <BookOpen className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-extrabold text-neutral-900 dark:text-white group-hover:text-emerald-600">
            Matérias & Conteúdos da BNCC
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Resumos didáticos filtrados por matéria e por ano escolar (1º, 2º, 3º Ano/ENEM).
          </p>
          <span className="inline-flex items-center gap-1 text-xs font-extrabold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform">
            Ver matérias <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </Link>
      </section>

      <Link
        href="/jogos"
        className="flex items-center justify-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
      >
        <Gamepad2 className="h-4 w-4" />
        Ver Jogos Gamificados
      </Link>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { DailyQuestsCard } from "@/components/daily-quests-card";
import { VOCATION_AREAS } from "@/lib/vocation-areas";
import { GAME_PHASES } from "@/lib/game-progression";
import {
  Keyboard,
  Sparkles,
  Brain,
  Type,
  Skull,
  Scale,
  ListOrdered,
  Search,
  FileText,
  Tag,
  ArrowRight,
  Flame,
  Zap,
  Swords,
} from "lucide-react";

type GameItem = {
  id: string;
  href: string;
  title: string;
  description: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  buttonBg: string;
  stages: string[]; // "ensino-medio" | "primeiro-emprego" | "profissional"
  areaSlugs?: string[]; // If empty/undefined, supports all 30+ areas
  isNew?: boolean;
};

export type GamesProfile = {
  name: string | null;
  segment: string | null;
  area: string | null;
  areaSlug: string | null;
  currentArea: string | null;
  studyCourse: string | null;
};

const ALL_GAMES: GameItem[] = [
  {
    id: "dilemas",
    href: "/jogos/dilemas",
    title: "Simulador de Dilemas (RPG)",
    description: "Tome decisões rápidas diante de dilemas reais de trabalho ou estudo. Equilibre sua Reputação, Recursos, Pessoas e Saúde Mental para sobreviver!",
    icon: Flame,
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-500",
    buttonBg: "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700",
    stages: ["ensino-medio", "primeiro-emprego", "profissional"],
    isNew: true,
  },
  {
    id: "inbox",
    href: "/jogos/inbox",
    title: "Inbox Zero Challenge",
    description: "Desafio acelerado de priorização de e-mails corporativos. Separe o que é Urgente, Agendar, Delegar ou Descartar antes do tempo estourar!",
    icon: Zap,
    iconBg: "bg-cyan-500/10",
    iconColor: "text-cyan-500",
    buttonBg: "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700",
    stages: ["ensino-medio", "primeiro-emprego", "profissional"],
    isNew: true,
  },
  {
    id: "duelo",
    href: "/jogos/duelo",
    title: "Batalha 1v1 vs IA",
    description: "Duelo relâmpago com barras de HP em tempo real contra a MatchBot IA. Acerte perguntas técnicas da sua área para desferir golpes críticos!",
    icon: Swords,
    iconBg: "bg-purple-500/10",
    iconColor: "text-purple-500",
    buttonBg: "bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700",
    stages: ["ensino-medio", "primeiro-emprego", "profissional"],
    isNew: true,
  },
  {
    id: "typer",
    href: "/jogos/digitar",
    title: "Speed Typer",
    description: "Treine velocidade de digitação com textos de redação do ENEM, e-mails corporativos, termos jurídicos, petições e trechos de código.",
    icon: Keyboard,
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-600 dark:text-blue-400",
    buttonBg: "bg-blue-600 hover:bg-blue-700",
    stages: ["ensino-medio", "primeiro-emprego", "profissional"],
  },
  {
    id: "quiz",
    href: "/jogos/quiz",
    title: "Show do Match (Quiz)",
    description: "Quiz de conhecimentos de mercado e matérias. Responda perguntas sobre Medicina, Direito, TI, Engenharia, ENEM, Finanças e mais de 30 áreas!",
    icon: Sparkles,
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-600 dark:text-amber-400",
    buttonBg: "bg-amber-500 hover:bg-amber-600",
    stages: ["ensino-medio", "primeiro-emprego", "profissional"],
  },
  {
    id: "memory",
    href: "/jogos/memoria",
    title: "Termos Pareados (Memória)",
    description: "Combine conceitos, siglas e ferramentas técnicas específicas da sua área de atuação ou matérias do ENEM no menor tempo possível.",
    icon: Brain,
    iconBg: "bg-purple-500/10",
    iconColor: "text-purple-600 dark:text-purple-400",
    buttonBg: "bg-purple-600 hover:bg-purple-700",
    stages: ["ensino-medio", "primeiro-emprego", "profissional"],
  },
  {
    id: "termo",
    href: "/jogos/termo",
    title: "Termo Profissional",
    description: "Adivinhe a palavra secreta de 5 letras relacionada a mercado de trabalho, cargos ou matérias escolares em até 6 tentativas com dicas de cores.",
    icon: Type,
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    buttonBg: "bg-emerald-600 hover:bg-emerald-700",
    stages: ["ensino-medio", "primeiro-emprego", "profissional"],
  },
  {
    id: "forca",
    href: "/jogos/forca",
    title: "Forca Profissional",
    description: "Descubra termos técnicos, normas, conselhos de classe (CRM, OAB, CREA) e ferramentas do seu campo profissional letra por letra.",
    icon: Skull,
    iconBg: "bg-rose-500/10",
    iconColor: "text-rose-600 dark:text-rose-400",
    buttonBg: "bg-rose-600 hover:bg-rose-700",
    stages: ["ensino-medio", "primeiro-emprego", "profissional"],
  },
  {
    id: "vf",
    href: "/jogos/vf",
    title: "Verdadeiro ou Falso",
    description: "Teste rápido contra o relógio: julgue fatos e mitos sobre carreira, regras trabalhistas, vestibular e rotina profissional da sua área.",
    icon: Scale,
    iconBg: "bg-indigo-500/10",
    iconColor: "text-indigo-600 dark:text-indigo-400",
    buttonBg: "bg-indigo-600 hover:bg-indigo-700",
    stages: ["ensino-medio", "primeiro-emprego", "profissional"],
  },
  {
    id: "ordenar",
    href: "/jogos/ordenar",
    title: "Ordene o Processo",
    description: "Reordene etapas de processos reais: funil de seleção de estágio, cronograma de estudos para vestibular, projeto de software ou atendimento médico.",
    icon: ListOrdered,
    iconBg: "bg-teal-500/10",
    iconColor: "text-teal-600 dark:text-teal-400",
    buttonBg: "bg-teal-600 hover:bg-teal-700",
    stages: ["ensino-medio", "primeiro-emprego", "profissional"],
  },
  {
    id: "cacapalavras",
    href: "/jogos/cacapalavras",
    title: "Caça-Palavras Profissional",
    description: "Encontre os termos técnicos da área selecionada ou vocabulário do ENEM escondidos na grade de letras antes do tempo se esgotar.",
    icon: Search,
    iconBg: "bg-orange-500/10",
    iconColor: "text-orange-600 dark:text-orange-400",
    buttonBg: "bg-orange-600 hover:bg-orange-700",
    stages: ["ensino-medio", "primeiro-emprego", "profissional"],
  },
  {
    id: "curriculo",
    href: "/jogos/curriculo",
    title: "Monte o Currículo",
    description: "Reorganize seções de currículos para diferentes perfis (Primeiro Emprego, Transição de Carreira, Nível Técnico ou Graduação).",
    icon: FileText,
    iconBg: "bg-cyan-500/10",
    iconColor: "text-cyan-600 dark:text-cyan-400",
    buttonBg: "bg-cyan-600 hover:bg-cyan-700",
    stages: ["ensino-medio", "primeiro-emprego", "profissional"],
  },
];

const DAILY_ROUTE = [
  { game: "quiz", label: "Aquecimento", title: "Teste seus conhecimentos", href: "/jogos/quiz" },
  { game: "memory", label: "Prática", title: "Fixe os termos importantes", href: "/jogos/memoria" },
  { game: "dilemas", label: "Desafio", title: "Tome uma decisão de carreira", href: "/jogos/dilemas" },
] as const;

export function GamesCatalog({
  profile,
  playedToday = [],
  recentGames = [],
}: {
  profile: GamesProfile;
  playedToday?: string[];
  recentGames?: string[];
}) {
  const profileStage = profile.segment === "student"
    ? "ensino-medio"
    : profile.segment === "internship" || profile.segment === "apprentice" || profile.segment === "first_job"
    ? "primeiro-emprego"
    : profile.segment === "career_change" || profile.segment === "career_pro"
    ? "profissional"
    : "todos";
  const [selectedCategory, setSelectedCategory] = useState<string>(profile.areaSlug ?? profileStage);
  const [selectedPhase, setSelectedPhase] = useState<number>(1);
  const completedToday = DAILY_ROUTE.filter((step) => playedToday.includes(step.game)).length;
  const nextStep = DAILY_ROUTE.find((step) => !playedToday.includes(step.game)) ?? DAILY_ROUTE[0];
  const nextHref = profile.areaSlug ? `${nextStep.href}?area=${profile.areaSlug}` : nextStep.href;

  // Determine active area label if an area slug is selected
  const activeArea = VOCATION_AREAS.find((a) => a.slug === selectedCategory);

  // Filter games matching selected category
  const filteredGames = ALL_GAMES.filter((game) => {
    if (selectedCategory === "todos") return true;
    if (selectedCategory === "ensino-medio" || selectedCategory === "primeiro-emprego") {
      return game.stages.includes(selectedCategory);
    }
    // If an area slug is selected, all games support it!
    return true;
  });

  return (
    <div className="space-y-8">
      {profile.segment && (profile.area || profile.studyCourse) ? (
        <div className="rounded-3xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-5 dark:border-blue-900/60 dark:from-blue-950/40 dark:to-indigo-950/30">
          <p className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-300">Jogos recomendados para você</p>
          <h2 className="mt-1 text-lg font-extrabold text-blue-950 dark:text-white">{profile.area ?? profile.studyCourse}</h2>
          <p className="mt-1 text-xs leading-relaxed text-blue-800/80 dark:text-blue-200/80">
            {profile.segment === "career_change" && profile.currentArea
              ? `Desafios para fazer a transição de ${profile.currentArea} para ${profile.area}.`
              : profile.studyCourse
              ? `Conteúdo adaptado ao seu curso de ${profile.studyCourse}.`
              : "Desafios, termos e situações alinhados ao seu objetivo profissional."}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-4 text-sm text-neutral-600 dark:border-neutral-700 dark:bg-neutral-900/40 dark:text-neutral-300">
          Informe sua área e objetivo no <Link href="/settings" className="font-bold text-blue-600 hover:underline">perfil</Link> para receber jogos personalizados.
        </div>
      )}
      {/* Banner de Nível, XP, Streak & Missões Diárias */}
      <section className="rounded-3xl border border-indigo-200 bg-white p-5 shadow-sm dark:border-indigo-900/60 dark:bg-neutral-900/60">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-300">Sua trilha de hoje</p>
            <h2 className="mt-1 text-lg font-extrabold text-neutral-900 dark:text-white">3 jogos, 10 minutos e uma habilidade a mais</h2>
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
              {completedToday === 3 ? "Trilha concluída. Volte amanhã para um novo desafio." : `${completedToday}/3 etapas concluídas · próximo: ${nextStep.title}.`}
            </p>
          </div>
          {completedToday < 3 && (
            <Link href={nextHref} className="inline-flex shrink-0 items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-indigo-700 active:scale-95">
              Continuar trilha
            </Link>
          )}
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {DAILY_ROUTE.map((step, index) => {
            const done = playedToday.includes(step.game);
            return (
              <div key={step.game} className={`rounded-2xl border p-3 ${done ? "border-emerald-200 bg-emerald-50 dark:border-emerald-900/60 dark:bg-emerald-950/30" : "border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950/40"}`}>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400">0{index + 1}</span>
                  <span className={`text-[10px] font-bold ${done ? "text-emerald-600 dark:text-emerald-400" : "text-neutral-400"}`}>{done ? "Concluído" : step.label}</span>
                </div>
                <p className="mt-2 text-[11px] font-bold text-neutral-800 dark:text-neutral-200">{step.title}</p>
              </div>
            );
          })}
        </div>
        {recentGames.length > 0 && completedToday === 0 && (
          <p className="mt-3 text-[11px] text-neutral-500 dark:text-neutral-400">Você já jogou {recentGames.length} tipo(s) de jogo. Continue sua evolução hoje.</p>
        )}
      </section>
      <section className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900/60">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-neutral-400">Progressão da trilha</p>
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">Escolha o nível dos desafios para sua área.</p>
          </div>
          <div className="flex gap-2">
            {GAME_PHASES.map((phase) => (
              <button
                key={phase.id}
                type="button"
                onClick={() => setSelectedPhase(phase.id)}
                className={`rounded-xl px-3 py-2 text-[11px] font-bold transition ${selectedPhase === phase.id ? "bg-indigo-600 text-white shadow-sm" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300"}`}
              >
                Fase {phase.id} · {phase.label}
              </button>
            ))}
          </div>
        </div>
      </section>
      <DailyQuestsCard />

      {/* Seletor de Categorias & Áreas */}
      {/* Banner de Área Selecionada */}
      {activeArea && (
        <div className="rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block">
              Trilha Selecionada
            </span>
            <h3 className="text-sm font-bold text-blue-950 dark:text-blue-100">
              {activeArea.label} ({activeArea.subareas.length} Especialidades)
            </h3>
            <p className="text-xs text-blue-700 dark:text-blue-300 line-clamp-1">
              Jogando com vocabulário e desafios de: {activeArea.subareas.slice(0, 5).join(", ")}...
            </p>
          </div>
          <button
            onClick={() => setSelectedCategory("todos")}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline shrink-0"
          >
            Ver catálogo geral
          </button>
        </div>
      )}

      {/* Grid de Minijogos */}
      <div className="grid gap-4 md:grid-cols-3">
        {filteredGames.map((game) => {
          const Icon = game.icon;
          const params = new URLSearchParams({ fase: String(selectedPhase) });
          if (activeArea) params.set("area", activeArea.slug);
          else if (selectedCategory !== "todos") params.set("categoria", selectedCategory);
          const gameHref = `${game.href}?${params.toString()}`;

          return (
            <div
              key={game.id}
              className="group rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/40 p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all relative overflow-hidden"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className={`rounded-2xl ${game.iconBg} ${game.iconColor} p-3.5 w-fit`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    {game.isNew && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-500 text-white shadow-sm animate-pulse">
                        <Flame className="h-2.5 w-2.5 fill-white" /> NOVO
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700">
                      <Tag className="h-2.5 w-2.5" />
                      {activeArea ? activeArea.label : "Todas as 30+ Áreas"}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-bold text-neutral-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {game.title}
                  </h3>
                  <p className="text-neutral-500 dark:text-neutral-400 text-xs leading-relaxed mt-1.5">
                    {game.description}
                  </p>
                </div>
              </div>

              <Link
                href={gameHref}
                className={`mt-6 w-full inline-flex items-center justify-center gap-1.5 rounded-xl ${game.buttonBg} text-white px-4 py-2.5 text-xs font-bold shadow-sm transition-all text-center active:scale-[0.98]`}
              >
                Jogar Agora {activeArea ? `(${activeArea.label})` : ""}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}

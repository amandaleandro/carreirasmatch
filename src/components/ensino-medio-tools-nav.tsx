"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  FileEdit,
  Calendar,
  Scale,
  Bot,
  HelpCircle,
  Calculator,
  Sparkles,
  Award,
  Trophy,
  FileText,
  Zap,
  Timer,
  GitBranch,
} from "lucide-react";

export function EnsinoMedioToolsNav() {
  const pathname = usePathname();

  const links = [
    { href: "/ensino-medio", label: "Matérias & Jogos", icon: BookOpen },
    { href: "/ensino-medio/simulado", label: "Simulado por Ano 🏆", icon: Trophy },
    { href: "/ensino-medio/flashcards", label: "Flashcards 3D ⚡", icon: Zap },
    { href: "/ensino-medio/foco", label: "Temporizador Foco ⏱️", icon: Timer },
    { href: "/ensino-medio/mapa-mental", label: "Mapas Mentais 🧠", icon: GitBranch },
    { href: "/ensino-medio/exercicios", label: "Lista de Exercícios", icon: FileText },
    { href: "/ensino-medio/redacao", label: "Corretor Redação", icon: FileEdit },
    { href: "/ensino-medio/redacao-nota-1000", label: "Redações Nota 1000", icon: Award },
    { href: "/ensino-medio/calculadora-enem", label: "Calculadora ENEM", icon: Calculator },
    { href: "/ensino-medio/cronograma", label: "Cronograma de Estudos", icon: Calendar },
    { href: "/ensino-medio/comparador", label: "Faculdade vs Técnico", icon: Scale },
    { href: "/ensino-medio/tutor", label: "Tutor AI 24h", icon: Bot },
    { href: "/ensino-medio/questao-do-dia", label: "Questão do Dia", icon: HelpCircle },
  ];

  return (
    <nav className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 sticky top-0 z-20 shadow-2xs">
      <div className="max-w-6xl mx-auto px-4 md:px-8 flex items-center justify-between overflow-x-auto no-scrollbar py-2.5 gap-2">
        <div className="flex items-center gap-1.5 shrink-0 pr-4 border-r border-neutral-200 dark:border-neutral-800">
          <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
            Ensino Médio AI
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

import Link from "next/link";
import {
  Trophy,
  Zap,
  Timer,
  GitBranch,
  FileText,
  FileEdit,
  Calculator,
  Calendar,
  Scale,
  Bot,
  Award,
} from "lucide-react";

const TOOLS = [
  {
    href: "/ensino-medio/simulado",
    title: "Simulado por Ano Escolar 🏆",
    desc: "Faça testes inéditos focados na grade curricular do 1º Ano, 2º Ano ou 3º Ano/ENEM com diagnósticos em tempo real.",
    icon: Trophy,
    color: "amber",
    filled: true,
  },
  {
    href: "/ensino-medio/flashcards",
    title: "Flashcards 3D de Memorização ⚡",
    desc: "Revise fórmulas, datas e conceitos em cartões 3D interativos com técnica de repetição espaçada por série.",
    icon: Zap,
    color: "purple",
    filled: true,
  },
  {
    href: "/ensino-medio/foco",
    title: "Temporizador Pomodoro Foco ⏱️",
    desc: "Estude em blocos de 25 minutos com ciclos de pausa para manter a disciplina escolar e zerar as distrações.",
    icon: Timer,
    color: "emerald",
    filled: true,
  },
  {
    href: "/ensino-medio/mapa-mental",
    title: "Gerador de Mapas Mentais 🧠",
    desc: "Transforme tópicos complexos em diagramas conceituais ramificados para estudo visual passo a passo.",
    icon: GitBranch,
    color: "indigo",
    filled: true,
  },
  {
    href: "/ensino-medio/exercicios",
    title: "Gerador de Exercícios PDF",
    desc: "Crie listas completas de estudo por matéria e por série para resolver na tela ou salvar/imprimir em formato PDF.",
    icon: FileText,
    color: "blue",
    filled: true,
  },
  {
    href: "/ensino-medio/redacao",
    title: "Corretor de Redação ENEM",
    desc: "Avaliação oficial de 0 a 1000 pontos nas 5 competências do ENEM com análise gramatical e sugestões de repertório.",
    icon: FileEdit,
    color: "blue",
    filled: false,
  },
  {
    href: "/ensino-medio/calculadora-enem",
    title: "Calculadora Média ENEM",
    desc: "Simule suas notas no ENEM e calcule a média ponderada com os pesos das universidades para o curso dos seus sonhos.",
    icon: Calculator,
    color: "emerald",
    filled: false,
  },
  {
    href: "/ensino-medio/cronograma",
    title: "Cronograma de Estudos",
    desc: "Planejador semanal personalizado conforme seu tempo livre e matérias onde você mais precisa melhorar no ano.",
    icon: Calendar,
    color: "purple",
    filled: false,
  },
  {
    href: "/ensino-medio/comparador",
    title: "Faculdade vs Curso Técnico",
    desc: "Compare estimativas de nota de corte no SISU, mensalidade, tempo de curso e velocidade de entrada no mercado.",
    icon: Scale,
    color: "indigo",
    filled: false,
  },
  {
    href: "/ensino-medio/tutor",
    title: "Tutor Virtual AI 24h",
    desc: "Chat de monitoria para tirar qualquer dúvida de dever de casa e entender resoluções passo a passo.",
    icon: Bot,
    color: "emerald",
    filled: false,
  },
  {
    href: "/ensino-medio/redacao-nota-1000",
    title: "Redações Nota 1000",
    desc: "Analise redações modelo parágrafo por parágrafo com explicações detalhadas por competência e repertório.",
    icon: Award,
    color: "rose",
    filled: false,
  },
] as const;

const COLOR_CLASSES: Record<string, { border: string; bg: string; icon: string; hoverText: string }> = {
  amber: { border: "border-amber-500/30 hover:border-amber-500", bg: "bg-amber-500/5 dark:bg-amber-950/20", icon: "bg-amber-500/10 text-amber-600", hoverText: "group-hover:text-amber-600" },
  purple: { border: "border-purple-500/30 hover:border-purple-500", bg: "bg-purple-500/5 dark:bg-purple-950/20", icon: "bg-purple-500/10 text-purple-600", hoverText: "group-hover:text-purple-600" },
  emerald: { border: "border-emerald-500/30 hover:border-emerald-500", bg: "bg-emerald-500/5 dark:bg-emerald-950/20", icon: "bg-emerald-500/10 text-emerald-600", hoverText: "group-hover:text-emerald-600" },
  indigo: { border: "border-indigo-500/30 hover:border-indigo-500", bg: "bg-indigo-500/5 dark:bg-indigo-950/20", icon: "bg-indigo-500/10 text-indigo-600", hoverText: "group-hover:text-indigo-600" },
  blue: { border: "border-blue-500/30 hover:border-blue-500", bg: "bg-blue-500/5 dark:bg-blue-950/20", icon: "bg-blue-500/10 text-blue-600", hoverText: "group-hover:text-blue-600" },
  rose: { border: "border-rose-500/30 hover:border-rose-500", bg: "bg-rose-500/5 dark:bg-rose-950/20", icon: "bg-rose-500/10 text-rose-600", hoverText: "group-hover:text-rose-600" },
};

export function EnsinoMedioToolsGrid() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {TOOLS.map(({ href, title, desc, icon: Icon, color, filled }) => {
        const c = COLOR_CLASSES[color];
        return (
          <Link
            key={href}
            href={href}
            className={`p-6 rounded-3xl border transition-all space-y-3 shadow-2xs hover:shadow-md group ${c.border} ${
              filled ? c.bg : "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800"
            }`}
          >
            <div className={`p-3 rounded-2xl w-fit group-hover:scale-110 transition-transform ${c.icon}`}>
              <Icon className="h-6 w-6" />
            </div>
            <h3 className={`font-extrabold text-base text-neutral-900 dark:text-white ${c.hoverText}`}>
              {title}
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">{desc}</p>
          </Link>
        );
      })}
    </div>
  );
}

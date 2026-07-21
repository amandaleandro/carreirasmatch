"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/brand-logo";
import {
  LayoutDashboard,
  Search,
  Rss,
  KanbanSquare,
  FileText,
  User,
  Sparkles,
  Target,
  CalendarDays,
  BarChart3,
  Wrench,
  LifeBuoy,
  ShieldCheck,
  HelpCircle,
  TrendingUp,
  GraduationCap,
  Landmark,
  ScrollText,
  Briefcase,
  Handshake,
  Gamepad2,
  Flame,
  type LucideIcon,
} from "lucide-react";
import { useUiPanels } from "@/components/ui-panels";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  tour?: string;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/desafio", label: "Desafio do Match ⚡", icon: Flame, tour: "nav-desafio" },
  { href: "/analise", label: "Análise de Vaga", icon: Search, tour: "nav-analise" },
  { href: "/feed", label: "Feed de Vagas", icon: Rss, tour: "nav-feed" },
  { href: "/todas-as-vagas", label: "Todas as Vagas", icon: Briefcase, tour: "nav-todas-vagas" },
  { href: "/applications", label: "Candidaturas", icon: KanbanSquare, tour: "nav-applications" },
  { href: "/freelancer", label: "Freelancer", icon: Handshake, tour: "nav-freelancer" },
  { href: "/jogos", label: "Jogos", icon: Gamepad2, tour: "nav-jogos" },
  { href: "/resume", label: "Meu Currículo", icon: FileText, tour: "nav-resume" },
  { href: "/profile", label: "Desenvolvimento", icon: Sparkles },
  { href: "/action-plan", label: "Plano de Ação", icon: Target },
  { href: "/interviews", label: "Entrevistas", icon: CalendarDays },
  { href: "/history", label: "Relatórios", icon: BarChart3 },
  { href: "/tools", label: "Ferramentas", icon: Wrench, tour: "nav-tools" },
  { href: "/mentorias", label: "Mentorias", icon: GraduationCap, tour: "nav-mentorias" },
  { href: "/concursos", label: "Radar de concursos", icon: Landmark, tour: "nav-concursos" },
  { href: "/vestibulares", label: "Radar de vestibulares", icon: ScrollText, tour: "nav-vestibulares" },
  { href: "/suporte", label: "Suporte", icon: LifeBuoy },
  { href: "/settings", label: "Perfil", icon: User },
];

const COMING_SOON_ITEMS: { label: string; icon: NavItem["icon"] }[] = [];

const ADMIN_NAV_ITEM: NavItem = { href: "/admin", label: "Admin", icon: ShieldCheck };
const INFLUENCER_NAV_ITEM: NavItem = { href: "/influencer", label: "Influencer", icon: TrendingUp };

export function SidebarNav({
  isAdmin = false,
  isInfluencer = false,
}: {
  isAdmin?: boolean;
  isInfluencer?: boolean;
}) {
  const pathname = usePathname();
  const { openNews, openTour } = useUiPanels();
  const navItems = [
    ...NAV_ITEMS,
    ...(isInfluencer ? [INFLUENCER_NAV_ITEM] : []),
    ...(isAdmin ? [ADMIN_NAV_ITEM] : []),
  ];

  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col bg-gradient-to-b from-[#0d1830] via-[#0b1526] to-[#080e1c] text-white h-screen sticky top-0 border-r border-white/5">
      <div className="px-5 py-6 border-b border-white/5">
        <BrandLogo heightClassName="h-12" onDark />
      </div>

      <nav className="flex-1 min-h-0 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const active = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              data-tour={item.tour}
              className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                active
                  ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md shadow-blue-950/40"
                  : "text-slate-300 hover:bg-white/[0.06] hover:text-white hover:translate-x-0.5"
              }`}
            >
              <Icon strokeWidth={1.75} className={`h-5 w-5 shrink-0 transition-colors ${active ? "text-white" : "text-slate-400 group-hover:text-blue-400"}`} />
              {item.label}
            </Link>
          );
        })}

        {COMING_SOON_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              title="Em breve"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-500 cursor-not-allowed"
            >
              <Icon strokeWidth={1.75} className="h-5 w-5 shrink-0" />
              {item.label}
              <span className="ml-auto text-[10px] uppercase tracking-wide bg-white/5 rounded px-1.5 py-0.5">
                em breve
              </span>
            </div>
          );
        })}
      </nav>

      <div className="p-4 space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={openNews}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2 py-2 text-xs font-semibold text-slate-200 transition-colors hover:bg-white/10 hover:text-white"
            aria-haspopup="dialog"
          >
            <Sparkles className="h-4 w-4 shrink-0" strokeWidth={1.9} />
            Novidades
          </button>
          <button
            type="button"
            onClick={openTour}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2 py-2 text-xs font-semibold text-slate-200 transition-colors hover:bg-white/10 hover:text-white"
          >
            <HelpCircle className="h-4 w-4 shrink-0" strokeWidth={1.9} />
            Tour
          </button>
        </div>

        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 p-4 shadow-lg shadow-blue-950/40">
          <div className="absolute -right-4 -top-6 h-20 w-20 rounded-full bg-blue-400/20 blur-xl" />
          <p className="text-sm font-semibold flex items-center gap-1.5 relative">
            🏆 Plano Profissional
          </p>
          <p className="text-xs text-blue-100 mt-1.5 leading-relaxed relative">
            Aproveite todos os recursos para acelerar sua carreira.
          </p>
          <Link
            href="/tools"
            className="mt-3 block text-center text-sm font-semibold bg-white text-blue-700 rounded-md py-2 hover:bg-blue-50 transition-colors relative"
          >
            Ver meu plano
          </Link>
        </div>
      </div>
    </aside>
  );
}

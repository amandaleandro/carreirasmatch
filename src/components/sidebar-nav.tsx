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
  BookOpen,
  type LucideIcon,
} from "lucide-react";
import { useUiPanels } from "@/components/ui-panels";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  tour?: string;
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

const NAV_GROUPS: NavGroup[] = [
  {
    title: "Principal",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/resume", label: "Meu Currículo", icon: FileText, tour: "nav-resume" },
      { href: "/evidencias", label: "Banco de Evidências 🛡️", icon: ShieldCheck },
      { href: "/analise", label: "Análise de Vaga", icon: Search, tour: "nav-analise" },
    ],
  },
  {
    title: "Oportunidades",
    items: [
      { href: "/radar", label: "Radar de Oportunidades 📡", icon: Rss, tour: "nav-radar" },
      { href: "/feed", label: "Feed de Vagas", icon: Rss, tour: "nav-feed" },
      { href: "/todas-as-vagas", label: "Todas as Vagas", icon: Briefcase, tour: "nav-todas-vagas" },
      { href: "/applications", label: "Candidaturas", icon: KanbanSquare, tour: "nav-applications" },
      { href: "/tools/clipper", label: "Clipper de Vagas ✂️", icon: Wrench },
      { href: "/tools/compare-jobs", label: "Comparador de Vagas 📊", icon: BarChart3 },
      { href: "/freelancer", label: "Freelancer", icon: Handshake, tour: "nav-freelancer" },
    ],
  },

  {
    title: "Crescimento & IA",
    items: [
      { href: "/interviews", label: "Entrevistas", icon: CalendarDays },
      { href: "/action-plan", label: "Plano de Ação", icon: Target },
      { href: "/desafio", label: "Desafio do Match ⚡", icon: Flame, tour: "nav-desafio" },
      { href: "/jogos", label: "Jogos", icon: Gamepad2, tour: "nav-jogos" },
      { href: "/profile", label: "Desenvolvimento", icon: Sparkles },
    ],
  },
  {
    title: "Recursos & Suporte",
    items: [
      { href: "/tools", label: "Ferramentas", icon: Wrench, tour: "nav-tools" },
      { href: "/ensino-medio", label: "Ensino Médio & ENEM 🎓", icon: BookOpen, tour: "nav-ensino-medio" },
      { href: "/mentorias", label: "Mentorias", icon: GraduationCap, tour: "nav-mentorias" },
      { href: "/concursos", label: "Radar Concursos", icon: Landmark, tour: "nav-concursos" },
      { href: "/vestibulares", label: "Radar Vestibulares", icon: ScrollText, tour: "nav-vestibulares" },
      { href: "/history", label: "Relatórios", icon: BarChart3 },
      { href: "/suporte", label: "Suporte", icon: LifeBuoy },
      { href: "/settings", label: "Perfil", icon: User },
    ],
  },
];

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

  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col bg-[#071827] text-white h-screen sticky top-0 border-r border-slate-800/80">
      <div className="px-5 py-6 border-b border-slate-800/80">
        <BrandLogo heightClassName="h-12" onDark />
      </div>

      <nav className="flex-1 min-h-0 overflow-y-auto px-3 py-4 space-y-5">
        {NAV_GROUPS.map((group) => (
          <div key={group.title} className="space-y-1">
            <h3 className="px-3 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              {group.title}
            </h3>
            {group.items.map((item) => {
              const active = pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  data-tour={item.tour}
                  className={`group flex items-center gap-3 rounded-xl px-3.5 py-2 text-sm transition-all ${
                    active
                      ? "bg-[#0e2032] text-white font-bold border border-blue-500/30 shadow-xs"
                      : "text-[#94a3b8] hover:bg-white/[0.05] hover:text-white hover:translate-x-0.5 font-medium"
                  }`}
                >
                  <Icon strokeWidth={2} className={`h-4.5 w-4.5 shrink-0 transition-colors ${active ? "text-blue-500" : "text-[#64748b] group-hover:text-blue-400"}`} />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}

        {(isAdmin || isInfluencer) && (
          <div className="space-y-1 pt-2 border-t border-slate-800/60">
            <h3 className="px-3 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              Gestão
            </h3>
            {isInfluencer && (
              <Link
                href={INFLUENCER_NAV_ITEM.href}
                className={`group flex items-center gap-3 rounded-xl px-3.5 py-2 text-sm transition-all ${
                  pathname.startsWith(INFLUENCER_NAV_ITEM.href)
                    ? "bg-[#0e2032] text-white font-bold border border-blue-500/30"
                    : "text-[#94a3b8] hover:bg-white/[0.05] hover:text-white font-medium"
                }`}
              >
                <TrendingUp strokeWidth={2} className="h-4.5 w-4.5 text-[#64748b] group-hover:text-blue-400" />
                <span>Influencer</span>
              </Link>
            )}
            {isAdmin && (
              <Link
                href={ADMIN_NAV_ITEM.href}
                className={`group flex items-center gap-3 rounded-xl px-3.5 py-2 text-sm transition-all ${
                  pathname.startsWith(ADMIN_NAV_ITEM.href)
                    ? "bg-[#0e2032] text-white font-bold border border-blue-500/30"
                    : "text-[#94a3b8] hover:bg-white/[0.05] hover:text-white font-medium"
                }`}
              >
                <ShieldCheck strokeWidth={2} className="h-4.5 w-4.5 text-[#64748b] group-hover:text-blue-400" />
                <span>Admin</span>
              </Link>
            )}
          </div>
        )}
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

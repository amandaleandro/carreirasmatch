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
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  tour?: string;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/analise", label: "Análise de Vaga", icon: Search, tour: "nav-analise" },
  { href: "/feed", label: "Feed de Vagas", icon: Rss, tour: "nav-feed" },
  { href: "/applications", label: "Candidaturas", icon: KanbanSquare, tour: "nav-applications" },
  { href: "/resume", label: "Meu Currículo", icon: FileText, tour: "nav-resume" },
  { href: "/profile", label: "Sugestões de Melhoria", icon: Sparkles },
  { href: "/action-plan", label: "Plano de Ação", icon: Target },
  { href: "/interviews", label: "Entrevistas", icon: CalendarDays },
  { href: "/history", label: "Relatórios", icon: BarChart3 },
  { href: "/tools", label: "Ferramentas", icon: Wrench, tour: "nav-tools" },
  { href: "/settings", label: "Perfil", icon: User },
];

const COMING_SOON_ITEMS: { label: string; icon: NavItem["icon"] }[] = [];

const ADMIN_NAV_ITEM: NavItem = { href: "/admin", label: "Admin", icon: ShieldCheck };

export function SidebarNav({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname();
  const navItems = isAdmin ? [...NAV_ITEMS, ADMIN_NAV_ITEM] : NAV_ITEMS;

  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col bg-gradient-to-b from-[#0d1830] via-[#0b1526] to-[#080e1c] text-white h-screen sticky top-0 border-r border-white/5">
      <div className="px-5 py-6 border-b border-white/5">
        <BrandLogo heightClassName="h-10" onDark />
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
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
              <Icon strokeWidth={1.75} className={`h-5 w-5 shrink-0 transition-colors ${active ? "text-white" : "text-slate-400 group-hover:text-amber-400"}`} />
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

      <div className="p-4">
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 p-4 shadow-lg shadow-blue-950/40">
          <div className="absolute -right-4 -top-6 h-20 w-20 rounded-full bg-amber-400/20 blur-xl" />
          <p className="text-sm font-semibold flex items-center gap-1.5 relative">
            🏆 Plano Profissional
          </p>
          <p className="text-xs text-blue-100 mt-1.5 leading-relaxed relative">
            Aproveite todos os recursos para acelerar sua carreira.
          </p>
          <Link
            href="/tools"
            className="mt-3 block text-center text-sm font-semibold bg-white text-blue-700 rounded-md py-2 hover:bg-amber-400 hover:text-blue-950 transition-colors relative"
          >
            Ver meu plano
          </Link>
        </div>
      </div>
    </aside>
  );
}

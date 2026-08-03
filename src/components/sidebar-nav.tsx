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
  FileEdit,
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
import type { CareerSegment } from "@/lib/career-segments";

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
      { href: "/radar", label: "Alertas de vagas", icon: Rss, tour: "nav-radar" },
      { href: "/feed", label: "Feed de Vagas", icon: Rss, tour: "nav-feed" },
      { href: "/todas-as-vagas", label: "Todas as Vagas", icon: Briefcase, tour: "nav-todas-vagas" },
      { href: "/applications", label: "Candidaturas", icon: KanbanSquare, tour: "nav-applications" },
      { href: "/tools/compare-jobs", label: "Comparador de Vagas 📊", icon: BarChart3 },
      { href: "/freelancer", label: "Freelancer", icon: Handshake, tour: "nav-freelancer" },
    ],
  },

  {
    title: "Crescimento & IA",
    items: [
      { href: "/interviews", label: "Entrevistas", icon: CalendarDays },
      { href: "/action-plan", label: "Plano de Ação", icon: Target },
      { href: "/evolucao", label: "Evolução Profissional", icon: TrendingUp },
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
      { href: "/universidade", label: "Universidade", icon: GraduationCap },
      { href: "/mentorias", label: "Mentorias", icon: GraduationCap, tour: "nav-mentorias" },
      { href: "/concursos", label: "Radar Concursos", icon: Landmark, tour: "nav-concursos" },
      { href: "/vestibulares", label: "Radar Vestibulares", icon: ScrollText, tour: "nav-vestibulares" },
      { href: "/history", label: "Relatórios", icon: BarChart3 },
      { href: "/suporte", label: "Suporte", icon: LifeBuoy },
      { href: "/settings", label: "Perfil", icon: User },
    ],
  },
];

const STUDENT_NAV_GROUPS: NavGroup[] = [
  {
    title: "Minha jornada",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/ensino-medio", label: "Ensino Médio & ENEM 🎓", icon: BookOpen, tour: "nav-ensino-medio" },
      { href: "/faculdade-ou-tecnico", label: "Faculdade ou Técnico", icon: GraduationCap },
      { href: "/universidade", label: "Universidade", icon: GraduationCap },
      { href: "/cursos-gratuitos", label: "Cursos gratuitos", icon: BookOpen, tour: "nav-tools" },
    ],
  },
  {
    title: "Explorar oportunidades",
    items: [
      { href: "/vestibulares", label: "Radar Vestibulares", icon: ScrollText, tour: "nav-vestibulares" },
      { href: "/mentorias", label: "Mentorias", icon: GraduationCap, tour: "nav-mentorias" },
      { href: "/jogos", label: "Jogos", icon: Gamepad2, tour: "nav-jogos" },
    ],
  },
  {
    title: "Recursos & Suporte",
    items: [
      { href: "/suporte", label: "Suporte", icon: LifeBuoy },
      { href: "/settings", label: "Perfil", icon: User },
    ],
  },
];

const APPRENTICE_NAV_GROUPS: NavGroup[] = [
  {
    title: "Minha jornada",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/jovem-aprendiz", label: "Jovem Aprendiz", icon: GraduationCap },
      { href: "/ensino-medio", label: "Ensino Médio & ENEM 🎓", icon: BookOpen },
    ],
  },
  {
    title: "Preparação",
    items: [
      { href: "/tools/apprentice-areas", label: "Áreas de atuação", icon: Target },
      { href: "/tools/apprentice-companies", label: "Empresas", icon: Briefcase },
      { href: "/tools/apprentice-guide", label: "Guia do Aprendiz", icon: BookOpen, tour: "nav-tools" },
      { href: "/cursos-gratuitos", label: "Cursos gratuitos", icon: BookOpen },
    ],
  },
  {
    title: "Vagas",
    items: [
      { href: "/feed", label: "Feed de Vagas", icon: Rss, tour: "nav-feed" },
      { href: "/radar", label: "Alertas de vagas", icon: Target },
      { href: "/todas-as-vagas", label: "Todas as Vagas", icon: Briefcase, tour: "nav-todas-vagas" },
      { href: "/applications", label: "Candidaturas", icon: KanbanSquare, tour: "nav-applications" },
    ],
  },
  {
    title: "Suporte",
    items: [
      { href: "/mentorias", label: "Mentorias", icon: GraduationCap, tour: "nav-mentorias" },
      { href: "/suporte", label: "Suporte", icon: LifeBuoy },
      { href: "/settings", label: "Perfil", icon: User },
    ],
  },
];

const FIRST_JOB_NAV_GROUPS: NavGroup[] = [
  {
    title: "Minha jornada",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/primeiro-emprego", label: "Primeiro emprego", icon: Briefcase },
      { href: "/curriculo-sem-experiencia", label: "Currículo sem experiência", icon: FileText },
    ],
  },
  {
    title: "Preparação",
    items: [
      { href: "/tools/first-job-guide", label: "Guia do primeiro emprego", icon: BookOpen },
      { href: "/vagas-de-hoje", label: "Vagas de hoje", icon: Search },
      { href: "/cursos-gratuitos", label: "Cursos gratuitos", icon: BookOpen },
    ],
  },
  {
    title: "Vagas",
    items: [
      { href: "/feed", label: "Feed de Vagas", icon: Rss, tour: "nav-feed" },
      { href: "/radar", label: "Alertas de vagas", icon: Target },
      { href: "/todas-as-vagas", label: "Todas as Vagas", icon: Briefcase, tour: "nav-todas-vagas" },
      { href: "/applications", label: "Candidaturas", icon: KanbanSquare, tour: "nav-applications" },
    ],
  },
  {
    title: "Suporte",
    items: [
      { href: "/mentorias", label: "Mentorias", icon: GraduationCap, tour: "nav-mentorias" },
      { href: "/suporte", label: "Suporte", icon: LifeBuoy },
      { href: "/settings", label: "Perfil", icon: User },
    ],
  },
];

const INTERNSHIP_NAV_GROUPS: NavGroup[] = [
  {
    title: "Minha jornada",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/estagio", label: "Estágios", icon: Briefcase },
      { href: "/feed", label: "Feed de estágios", icon: Rss, tour: "nav-feed" },
      { href: "/analise", label: "Análise de Vaga", icon: Search, tour: "nav-analise" },
    ],
  },
  {
    title: "Organização",
    items: [
      { href: "/tools/internship-guide", label: "Guia de estágio", icon: BookOpen },
      { href: "/tools/internship-checklist", label: "Checklist de estágio", icon: FileText },
      { href: "/tools/internship-calculator", label: "Calculadora de bolsa", icon: BarChart3 },
      { href: "/resume", label: "Meu Currículo", icon: FileText, tour: "nav-resume" },
    ],
  },
  {
    title: "Vagas",
    items: [
      { href: "/feed", label: "Feed de Vagas", icon: Rss },
      { href: "/radar", label: "Alertas de vagas", icon: Target },
      { href: "/todas-as-vagas", label: "Todas as Vagas", icon: Briefcase },
      { href: "/applications", label: "Candidaturas", icon: KanbanSquare, tour: "nav-applications" },
    ],
  },
  {
    title: "Suporte",
    items: [
      { href: "/mentorias", label: "Mentorias", icon: GraduationCap },
      { href: "/suporte", label: "Suporte", icon: LifeBuoy },
      { href: "/settings", label: "Perfil", icon: User },
    ],
  },
];

const CONCURSEIRO_NAV_GROUPS: NavGroup[] = [
  {
    title: "Minha preparação",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/concursos", label: "Radar de Concursos", icon: Landmark, tour: "nav-concursos" },
      { href: "/concurso", label: "Preparação para concurso", icon: ScrollText },
    ],
  },
  {
    title: "Ferramentas de estudo",
    items: [
      { href: "/tools/concurso", label: "Plano e simulados", icon: BookOpen, tour: "nav-tools" },
      { href: "/tools/leitor-edital", label: "Leitor de edital", icon: FileText },
      { href: "/tools/essay-grader", label: "Corretor de redação", icon: FileEdit },
    ],
  },
  {
    title: "Suporte",
    items: [
      { href: "/mentorias", label: "Mentorias", icon: GraduationCap, tour: "nav-mentorias" },
      { href: "/suporte", label: "Suporte", icon: LifeBuoy },
      { href: "/settings", label: "Perfil", icon: User },
    ],
  },
];

const OAB_NAV_GROUPS: NavGroup[] = [
  {
    title: "Minha preparação",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/oab", label: "Preparação para OAB", icon: Landmark },
    ],
  },
  {
    title: "Ferramentas de estudo",
    items: [
      { href: "/tools/oab", label: "Simulados OAB", icon: BookOpen, tour: "nav-tools" },
      { href: "/tools/oab/segunda-fase", label: "Segunda fase", icon: FileText },
    ],
  },
  {
    title: "Suporte",
    items: [
      { href: "/mentorias", label: "Mentorias", icon: GraduationCap, tour: "nav-mentorias" },
      { href: "/suporte", label: "Suporte", icon: LifeBuoy },
      { href: "/settings", label: "Perfil", icon: User },
    ],
  },
];

function navGroupsForSegment(segment: CareerSegment | null | undefined): NavGroup[] {
  switch (segment) {
    case "student":
      return STUDENT_NAV_GROUPS;
    case "apprentice":
      return APPRENTICE_NAV_GROUPS;
    case "first_job":
      return FIRST_JOB_NAV_GROUPS;
    case "internship":
      return INTERNSHIP_NAV_GROUPS;
    case "concurseiro":
      return CONCURSEIRO_NAV_GROUPS;
    case "oab":
      return OAB_NAV_GROUPS;
    default:
      return NAV_GROUPS;
  }
}

const ADMIN_NAV_ITEM: NavItem = { href: "/admin", label: "Admin", icon: ShieldCheck };
const INFLUENCER_NAV_ITEM: NavItem = { href: "/influencer", label: "Influencer", icon: TrendingUp };

export function SidebarNav({
  isAdmin = false,
  isInfluencer = false,
  segment = null,
}: {
  isAdmin?: boolean;
  isInfluencer?: boolean;
  segment?: CareerSegment | null;
}) {
  const pathname = usePathname();
  const { openNews, openTour } = useUiPanels();

  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col bg-[#071827] text-white h-screen sticky top-0 border-r border-slate-800/80">
      <div className="px-5 py-5 border-b border-slate-800/80">
        <BrandLogo heightClassName="h-10" onDark />
      </div>

      <nav className="flex-1 min-h-0 overflow-y-auto px-3 py-4 space-y-5">
        {navGroupsForSegment(segment).map((group) => (
          <div key={group.title} className="space-y-1">
            <h3 className="px-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
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
                  aria-current={active ? "page" : undefined}
                  className={`group flex items-center gap-3 rounded-xl px-3.5 py-2 text-xs transition-all ${
                    active
                      ? "bg-blue-600/20 text-blue-400 font-bold border border-blue-500/30"
                      : "text-slate-300 hover:bg-white/5 hover:text-white font-medium"
                  }`}
                >
                  <Icon
                    strokeWidth={2}
                    className={`h-4 w-4 shrink-0 transition-colors ${
                      active ? "text-blue-400" : "text-slate-400 group-hover:text-blue-300"
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}

        {(isAdmin || isInfluencer) && (
          <div className="space-y-1 pt-2 border-t border-slate-800/60">
            <h3 className="px-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              Gestão
            </h3>
            {isInfluencer && (
              <Link
                href={INFLUENCER_NAV_ITEM.href}
                className={`group flex items-center gap-3 rounded-xl px-3.5 py-2 text-xs transition-all ${
                  pathname.startsWith(INFLUENCER_NAV_ITEM.href)
                    ? "bg-blue-600/20 text-blue-400 font-bold border border-blue-500/30"
                    : "text-slate-300 hover:bg-white/5 hover:text-white font-medium"
                }`}
              >
                <TrendingUp strokeWidth={2} className="h-4 w-4 text-slate-400 group-hover:text-blue-300" />
                <span>Influencer</span>
              </Link>
            )}
            {isAdmin && (
              <Link
                href={ADMIN_NAV_ITEM.href}
                className={`group flex items-center gap-3 rounded-xl px-3.5 py-2 text-xs transition-all ${
                  pathname.startsWith(ADMIN_NAV_ITEM.href)
                    ? "bg-blue-600/20 text-blue-400 font-bold border border-blue-500/30"
                    : "text-slate-300 hover:bg-white/5 hover:text-white font-medium"
                }`}
              >
                <ShieldCheck strokeWidth={2} className="h-4 w-4 text-slate-400 group-hover:text-blue-300" />
                <span>Admin</span>
              </Link>
            )}
          </div>
        )}
      </nav>

      <div className="p-4 space-y-3 border-t border-slate-800/60">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={openNews}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-2 py-2 text-xs font-semibold text-slate-200 transition-colors hover:bg-white/10 hover:text-white"
            aria-haspopup="dialog"
          >
            <Sparkles className="h-3.5 w-3.5 shrink-0" strokeWidth={1.9} />
            Novidades
          </button>
          <button
            type="button"
            onClick={openTour}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-2 py-2 text-xs font-semibold text-slate-200 transition-colors hover:bg-white/10 hover:text-white"
          >
            <HelpCircle className="h-3.5 w-3.5 shrink-0" strokeWidth={1.9} />
            Tour
          </button>
        </div>

        <div className="rounded-2xl border border-blue-500/20 bg-slate-900/80 p-4 shadow-sm">
          <p className="text-xs font-bold text-white flex items-center gap-1.5">
            🏆 Plano Profissional
          </p>
          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
            Acesso ampliado a análises e simuladores, conforme a cota do plano.
          </p>
          <Link
            href="/tools"
            className="mt-3 block text-center text-xs font-bold bg-blue-600 text-white rounded-xl py-2 hover:bg-blue-500 transition-colors"
          >
            Ver detalhes
          </Link>
        </div>
      </div>
    </aside>
  );
}

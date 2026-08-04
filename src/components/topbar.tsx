"use client";

import { useRouter } from "next/navigation";
import { useState, FormEvent } from "react";
import { LogoutButton } from "@/components/logout-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { BrandLogo } from "@/components/brand-logo";
import Link from "next/link";
import { Menu, X, Search, Sparkles, HelpCircle } from "lucide-react";
import { useUiPanels } from "@/components/ui-panels";
import type { CareerSegment } from "@/lib/career-segments";

const MOBILE_LINKS_BY_SEGMENT: Partial<Record<CareerSegment, { href: string; label: string }[]>> = {
  student: [
    { href: "/ensino-medio", label: "Ensino Médio & ENEM 🎓" },
    { href: "/faculdade-ou-tecnico", label: "Faculdade ou Técnico" },
    { href: "/cursos-gratuitos", label: "Cursos gratuitos" },
    { href: "/vestibulares", label: "Radar de vestibulares" },
    { href: "/mentorias", label: "Mentorias" },
    { href: "/jogos", label: "Jogos" },
  ],
  apprentice: [
    { href: "/jovem-aprendiz", label: "Jovem Aprendiz" },
    { href: "/ensino-medio", label: "Ensino Médio & ENEM 🎓" },
    { href: "/tools/apprentice-areas", label: "Áreas de atuação" },
    { href: "/tools/apprentice-companies", label: "Empresas" },
    { href: "/tools/apprentice-guide", label: "Guia do Aprendiz" },
    { href: "/cursos-gratuitos", label: "Cursos gratuitos" },
    { href: "/feed", label: "Feed de Vagas" },
    { href: "/radar", label: "Alertas de vagas" },
    { href: "/todas-as-vagas", label: "Todas as Vagas" },
    { href: "/applications", label: "Candidaturas" },
  ],
  first_job: [
    { href: "/primeiro-emprego", label: "Primeiro emprego" },
    { href: "/curriculo-sem-experiencia", label: "Currículo sem experiência" },
    { href: "/tools/first-job-guide", label: "Guia do primeiro emprego" },
    { href: "/vagas-de-hoje", label: "Vagas de hoje" },
    { href: "/cursos-gratuitos", label: "Cursos gratuitos" },
    { href: "/feed", label: "Feed de Vagas" },
    { href: "/radar", label: "Alertas de vagas" },
    { href: "/todas-as-vagas", label: "Todas as Vagas" },
    { href: "/applications", label: "Candidaturas" },
  ],
  internship: [
    { href: "/estagio", label: "Estágios" },
    { href: "/feed", label: "Feed de estágios" },
    { href: "/analise", label: "Análise de Vaga" },
    { href: "/tools/internship-guide", label: "Guia de estágio" },
    { href: "/tools/internship-checklist", label: "Checklist de estágio" },
    { href: "/tools/internship-calculator", label: "Calculadora de bolsa" },
    { href: "/resume", label: "Meu Currículo" },
    { href: "/radar", label: "Alertas de vagas" },
    { href: "/todas-as-vagas", label: "Todas as Vagas" },
    { href: "/applications", label: "Candidaturas" },
  ],
  concurseiro: [
    { href: "/concursos", label: "Radar de Concursos" },
    { href: "/concurso", label: "Preparação para concurso" },
    { href: "/tools/concurso", label: "Plano e simulados" },
    { href: "/tools/leitor-edital", label: "Leitor de edital" },
    { href: "/tools/essay-grader", label: "Corretor de redação" },
  ],
  oab: [
    { href: "/oab", label: "Preparação para OAB" },
    { href: "/tools/oab", label: "Simulados OAB" },
    { href: "/tools/oab/segunda-fase", label: "Segunda fase" },
  ],
};

const DEFAULT_EXTRA_MOBILE_LINKS = [
  { href: "/evidencias", label: "Banco de Evidências" },
  { href: "/radar", label: "Alertas de vagas" },
  { href: "/todas-as-vagas", label: "Todas as Vagas" },
  { href: "/applications", label: "Candidaturas" },
  { href: "/tools/compare-jobs", label: "Comparador de Vagas" },
  { href: "/freelancer", label: "Freelancer" },
  { href: "/interviews", label: "Entrevistas" },
  { href: "/evolucao", label: "Evolução Profissional" },
  { href: "/jogos", label: "Jogos" },
  { href: "/profile", label: "Desenvolvimento" },
  { href: "/ensino-medio", label: "Ensino Médio & ENEM" },
  { href: "/universidade", label: "Universidade" },
  { href: "/mentorias", label: "Mentorias" },
  { href: "/concursos", label: "Radar Concursos" },
  { href: "/vestibulares", label: "Radar Vestibulares" },
  { href: "/history", label: "Relatórios" },
  { href: "/suporte", label: "Suporte" },
  { href: "/settings", label: "Perfil" },
] as const;

export function Topbar({
  userName,
  userEmail,
  userImage,
  segment = null,
  isAdmin = false,
  isInfluencer = false,
}: {
  userName: string;
  userEmail: string;
  userImage?: string | null;
  segment?: CareerSegment | null;
  isAdmin?: boolean;
  isInfluencer?: boolean;
}) {
  const router = useRouter();
  const { openNews, openTour } = useUiPanels();
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const segmentLinks = segment ? MOBILE_LINKS_BY_SEGMENT[segment] ?? [] : [];
  const supplementalMobileLinks = segment
    ? DEFAULT_EXTRA_MOBILE_LINKS.filter(
        (link) =>
          !segmentLinks.some((segmentLink) => segmentLink.href === link.href) &&
          link.href !== "/suporte" &&
          link.href !== "/settings",
      )
    : [];

  const initials = userName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/history?q=${encodeURIComponent(q)}` : "/history");
  }

  return (
    <>
      <header className="glass-header sticky top-0 z-20 flex items-center justify-between gap-4 px-4 py-3 md:px-6">
        {/* Mobile menu toggle */}
        <button
          type="button"
          onClick={() => setMobileNavOpen((v) => !v)}
          className="p-2 rounded-xl border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden"
          aria-label="Menu"
        >
          {mobileNavOpen ? (
            <X className="h-5 w-5" strokeWidth={1.75} />
          ) : (
            <Menu className="h-5 w-5" strokeWidth={1.75} />
          )}
        </button>

        <form onSubmit={handleSearch} data-tour="topbar-search" className="flex-1 max-w-xs md:max-w-md">
          <div className="relative">
            <Search
              strokeWidth={1.75}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="search"
              placeholder="Buscar histórico ou ferramenta..."
              className="w-full rounded-full border border-slate-200/90 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-900/70 pl-10 pr-4 py-2 text-xs md:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none transition-all focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </form>

        <div className="flex items-center gap-3">
          <ThemeToggle className="hidden sm:inline-flex" />

          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-2.5 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all"
            >
              {userImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={userImage}
                  alt={userName}
                  className="h-8 w-8 md:h-9 md:w-9 rounded-full object-cover shadow-xs border border-slate-200 dark:border-slate-700"
                />
              ) : (
                <span className="h-8 w-8 md:h-9 md:w-9 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs md:text-sm font-bold shadow-xs">
                  {initials || "?"}
                </span>
              )}
              <span className="hidden sm:block text-left pr-1">
                <span className="block text-xs font-semibold leading-tight text-slate-900 dark:text-slate-100">
                  {userName}
                </span>
                <span className="block text-[10px] text-slate-500 font-medium">Plano Profissional</span>
              </span>
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-xl py-2 z-30 animate-in fade-in slide-in-from-top-2">
                <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800/80">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{userName}</p>
                  <p className="text-[11px] text-slate-500 truncate">{userEmail}</p>
                </div>
                <div className="py-1">
                  <Link
                    href="/settings"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                  >
                    Configurações da conta
                  </Link>
                  <Link
                    href="/history"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                  >
                    Histórico de análises
                  </Link>
                </div>
                <div className="border-t border-slate-100 dark:border-slate-800/80 pt-1 px-2">
                  <LogoutButton className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors" />
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileNavOpen && (
        <div
          className="md:hidden fixed inset-0 z-30 bg-slate-950/50 backdrop-blur-xs"
          onClick={() => setMobileNavOpen(false)}
        >
          <nav
            className="w-72 h-full bg-[#071827] text-white p-6 flex flex-col justify-between border-r border-slate-800/80"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <BrandLogo heightClassName="h-8" onDark />
                <button type="button" className="text-slate-400 p-1 rounded-lg" onClick={() => setMobileNavOpen(false)}>
                  <X className="h-5 w-5" strokeWidth={1.75} />
                </button>
              </div>

              <div className="space-y-1">
                <Link
                  href="/dashboard"
                  onClick={() => setMobileNavOpen(false)}
                  className="block px-3 py-2 text-sm text-slate-200 hover:bg-white/10 rounded-xl font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  href="/tools"
                  onClick={() => setMobileNavOpen(false)}
                  className="block px-3 py-2 text-sm text-slate-200 hover:bg-white/10 rounded-xl font-semibold"
                >
                  Ferramentas
                </Link>
                {segmentLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMobileNavOpen(false)}
                        className="block px-3 py-2 text-sm text-slate-300 hover:bg-white/10 rounded-xl"
                      >
                        {link.label}
                      </Link>
                    ))}
                {supplementalMobileLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileNavOpen(false)}
                    className="block px-3 py-2 text-sm text-slate-300 hover:bg-white/10 rounded-xl"
                  >
                    {link.label}
                  </Link>
                ))}
                {isInfluencer && (
                  <Link
                    href="/influencer"
                    onClick={() => setMobileNavOpen(false)}
                    className="block px-3 py-2 text-sm text-slate-300 hover:bg-white/10 rounded-xl"
                  >
                    Painel de Influencer
                  </Link>
                )}
                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileNavOpen(false)}
                    className="block px-3 py-2 text-sm text-slate-300 hover:bg-white/10 rounded-xl"
                  >
                    Administração
                  </Link>
                )}
                {(!segment || segment === "career_change" || segment === "career_pro") &&
                  DEFAULT_EXTRA_MOBILE_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileNavOpen(false)}
                      className="block px-3 py-2 text-sm text-slate-300 hover:bg-white/10 rounded-xl"
                    >
                      {link.label}
                    </Link>
                  ))}
                {segment && segment !== "career_change" && segment !== "career_pro" && (
                  <>
                    <Link
                      href="/suporte"
                      onClick={() => setMobileNavOpen(false)}
                      className="block px-3 py-2 text-sm text-slate-300 hover:bg-white/10 rounded-xl"
                    >
                      Suporte
                    </Link>
                    <Link
                      href="/settings"
                      onClick={() => setMobileNavOpen(false)}
                      className="block px-3 py-2 text-sm text-slate-300 hover:bg-white/10 rounded-xl"
                    >
                      Perfil
                    </Link>
                  </>
                )}
                {(!segment || segment === "career_change" || segment === "career_pro") && (
                  <>
                    <Link
                      href="/analise"
                      onClick={() => setMobileNavOpen(false)}
                      className="block px-3 py-2 text-sm text-slate-300 hover:bg-white/10 rounded-xl"
                    >
                      Análise de Vaga
                    </Link>
                    <Link
                      href="/feed"
                      onClick={() => setMobileNavOpen(false)}
                      className="block px-3 py-2 text-sm text-slate-300 hover:bg-white/10 rounded-xl"
                    >
                      Feed de Vagas
                    </Link>
                    <Link
                      href="/resume"
                      onClick={() => setMobileNavOpen(false)}
                      className="block px-3 py-2 text-sm text-slate-300 hover:bg-white/10 rounded-xl"
                    >
                      Meu Currículo
                    </Link>
                    <Link
                      href="/action-plan"
                      onClick={() => setMobileNavOpen(false)}
                      className="block px-3 py-2 text-sm text-slate-300 hover:bg-white/10 rounded-xl"
                    >
                      Plano de Ação
                    </Link>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-white/10">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setMobileNavOpen(false);
                    openNews();
                  }}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-2 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Novidades
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMobileNavOpen(false);
                    openTour();
                  }}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-2 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10"
                >
                  <HelpCircle className="h-3.5 w-3.5" />
                  Tour
                </button>
              </div>

              <LogoutButton className="flex w-full items-center justify-center gap-2 px-3 py-2.5 text-xs font-semibold text-red-300 hover:bg-white/10 rounded-xl" />
            </div>
          </nav>
        </div>
      )}
    </>
  );
}

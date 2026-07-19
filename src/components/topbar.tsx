"use client";

import { useRouter } from "next/navigation";
import { useState, FormEvent } from "react";
import { LogoutButton } from "@/components/logout-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { BrandLogo } from "@/components/brand-logo";
import Link from "next/link";
import { Menu, X, Search, Sparkles, HelpCircle } from "lucide-react";
import { useUiPanels } from "@/components/ui-panels";

export function Topbar({
  userName,
  userEmail,
  userImage,
}: {
  userName: string;
  userEmail: string;
  userImage?: string | null;
}) {
  const router = useRouter();
  const { openNews, openTour } = useUiPanels();
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

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
      <header className="flex items-center justify-between gap-4 border-b border-neutral-200/75 dark:border-neutral-800 px-4 md:px-6 py-3 bg-white/80 dark:bg-[#090d16]/80 backdrop-blur-md sticky top-0 z-20 w-full">
        {/* Mobile menu toggle */}
        <button
          type="button"
          onClick={() => setMobileNavOpen((v) => !v)}
          className="md:hidden p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900"
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
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="search"
              placeholder="Buscar..."
              className="w-full rounded-full border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 pl-9 pr-4 py-1.5 text-xs md:text-sm outline-none transition-all focus:border-blue-500 focus:bg-white dark:focus:bg-[#090d16]"
            />
          </div>
        </form>

        <ThemeToggle className="hidden sm:inline-flex" />

        <div className="flex items-center gap-2 md:gap-3">
        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2.5 group"
          >
            {userImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={userImage}
                alt={userName}
                className="h-8 w-8 md:h-9 md:w-9 rounded-full object-cover shadow-sm"
              />
            ) : (
              <span className="h-8 w-8 md:h-9 md:w-9 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center text-xs md:text-sm font-semibold shadow-sm">
                {initials || "?"}
              </span>
            )}
            <span className="hidden sm:block text-left">
              <span className="block text-sm font-medium leading-tight">{userName}</span>
              <span className="block text-xs text-neutral-500 leading-tight">Plano Profissional</span>
            </span>
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-52 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-lg py-2 z-30">
              <p className="px-3 py-1.5 text-[10px] md:text-xs text-neutral-500 truncate">{userEmail}</p>
              <div className="border-t border-neutral-100 dark:border-neutral-800 my-1" />
              <div className="px-3 py-1.5">
                <LogoutButton />
              </div>
            </div>
          )}
        </div>

        <LogoutButton className="hidden sm:flex items-center gap-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors" />
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileNavOpen && (
        <div className="md:hidden fixed inset-0 z-10 bg-neutral-950/40 backdrop-blur-sm" onClick={() => setMobileNavOpen(false)}>
          <nav 
            className="w-64 h-full bg-[#0b1526] text-white p-5 flex flex-col justify-between border-r border-white/5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <BrandLogo heightClassName="h-10" onDark />
                <button type="button" className="text-slate-400" onClick={() => setMobileNavOpen(false)}>
                  <X className="h-5 w-5" strokeWidth={1.75} />
                </button>
              </div>

              <div className="space-y-1.5">
                <Link href="/dashboard" onClick={() => setMobileNavOpen(false)} className="block px-3 py-2 text-sm text-slate-200 hover:bg-white/5 rounded-lg">Dashboard</Link>
                <Link href="/analise" onClick={() => setMobileNavOpen(false)} className="block px-3 py-2 text-sm text-slate-200 hover:bg-white/5 rounded-lg">Análise de Vaga</Link>
                <Link href="/feed" onClick={() => setMobileNavOpen(false)} className="block px-3 py-2 text-sm text-slate-200 hover:bg-white/5 rounded-lg">Feed de Vagas</Link>
                <Link href="/applications" onClick={() => setMobileNavOpen(false)} className="block px-3 py-2 text-sm text-slate-200 hover:bg-white/5 rounded-lg">Candidaturas</Link>
                <Link href="/resume" onClick={() => setMobileNavOpen(false)} className="block px-3 py-2 text-sm text-slate-200 hover:bg-white/5 rounded-lg">Meu Currículo</Link>
                <Link href="/profile" onClick={() => setMobileNavOpen(false)} className="block px-3 py-2 text-sm text-slate-200 hover:bg-white/5 rounded-lg">Sugestões de Melhoria</Link>
                <Link href="/action-plan" onClick={() => setMobileNavOpen(false)} className="block px-3 py-2 text-sm text-slate-200 hover:bg-white/5 rounded-lg">Plano de Ação</Link>
                <Link href="/interviews" onClick={() => setMobileNavOpen(false)} className="block px-3 py-2 text-sm text-slate-200 hover:bg-white/5 rounded-lg">Entrevistas</Link>
                <Link href="/history" onClick={() => setMobileNavOpen(false)} className="block px-3 py-2 text-sm text-slate-200 hover:bg-white/5 rounded-lg">Relatórios</Link>
                <Link href="/tools" onClick={() => setMobileNavOpen(false)} className="block px-3 py-2 text-sm text-slate-200 hover:bg-white/5 rounded-lg">Ferramentas</Link>
                <Link href="/mentorias" onClick={() => setMobileNavOpen(false)} className="block px-3 py-2 text-sm text-slate-200 hover:bg-white/5 rounded-lg">Mentorias</Link>
                <Link href="/concursos" onClick={() => setMobileNavOpen(false)} className="block px-3 py-2 text-sm text-slate-200 hover:bg-white/5 rounded-lg">Radar de concursos</Link>
                <Link href="/vestibulares" onClick={() => setMobileNavOpen(false)} className="block px-3 py-2 text-sm text-slate-200 hover:bg-white/5 rounded-lg">Radar de vestibulares</Link>
                <Link href="/suporte" onClick={() => setMobileNavOpen(false)} className="block px-3 py-2 text-sm text-slate-200 hover:bg-white/5 rounded-lg">Suporte</Link>
                <Link href="/settings" onClick={() => setMobileNavOpen(false)} className="block px-3 py-2 text-sm text-slate-200 hover:bg-white/5 rounded-lg">Perfil</Link>
                <div className="mt-2 pt-2 border-t border-white/5">
                  <LogoutButton className="flex w-full items-center gap-2 px-3 py-2 text-sm font-medium text-red-300 hover:bg-white/5 rounded-lg" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                type="button"
                onClick={() => {
                  setMobileNavOpen(false);
                  openNews();
                }}
                className="flex items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10 hover:text-white"
                aria-haspopup="dialog"
              >
                <Sparkles className="h-4 w-4 shrink-0" strokeWidth={1.9} />
                Novidades
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileNavOpen(false);
                  openTour();
                }}
                className="flex items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10 hover:text-white"
              >
                <HelpCircle className="h-4 w-4 shrink-0" strokeWidth={1.9} />
                Tour
              </button>
            </div>

            <div className="rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 p-4">
              <p className="text-xs font-semibold">🏆 Plano Profissional</p>
              <Link
                href="/tools"
                onClick={() => setMobileNavOpen(false)}
                className="mt-2.5 block text-center text-xs font-semibold bg-white text-blue-700 rounded-md py-1.5"
              >
                Ver plano
              </Link>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signOut } from "next-auth/react";
import { BrandLogo } from "@/components/brand-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  CreditCard,
  LogOut,
  Menu,
  X,
  type LucideIcon,
} from "lucide-react";

type NavItem = { href: string; label: string; icon: LucideIcon };

const NAV_ITEMS: NavItem[] = [
  { href: "/empresa", label: "Triagens", icon: LayoutDashboard },
  { href: "/empresa/vagas", label: "Vagas", icon: Briefcase },
  { href: "/empresa/talentos", label: "Banco de talentos", icon: Users },
  { href: "/empresa/billing", label: "Créditos", icon: CreditCard },
];

// /empresa é prefixo de tudo, então o ativo do "Triagens" precisa ser explícito:
// dashboard e a página de resultado de uma triagem (/empresa/triagem/*).
function itemActive(pathname: string, href: string): boolean {
  if (href === "/empresa") {
    return pathname === "/empresa" || pathname.startsWith("/empresa/triagem/");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function CompanyShell({
  companyName,
  remaining,
  children,
}: {
  companyName: string;
  remaining: number;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const navLinks = (onNavigate?: () => void) =>
    NAV_ITEMS.map((item) => {
      const active = itemActive(pathname, item.href);
      const Icon = item.icon;
      return (
        <Link
          key={item.href}
          href={item.href}
          onClick={onNavigate}
          className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
            active
              ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md shadow-blue-950/40"
              : "text-slate-300 hover:bg-white/[0.06] hover:text-white hover:translate-x-0.5"
          }`}
        >
          <Icon
            strokeWidth={1.75}
            className={`h-5 w-5 shrink-0 transition-colors ${active ? "text-white" : "text-slate-400 group-hover:text-amber-400"}`}
          />
          {item.label}
        </Link>
      );
    });

  const creditsCard = (onNavigate?: () => void) => (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 p-4 shadow-lg shadow-blue-950/40">
      <div className="absolute -right-4 -top-6 h-20 w-20 rounded-full bg-amber-400/20 blur-xl" />
      <p className="text-sm font-semibold relative">Saldo de triagens</p>
      <p className="text-2xl font-bold text-white mt-0.5 relative">{remaining}</p>
      <p className="text-xs text-blue-100 mt-1 leading-relaxed relative">
        {remaining > 0
          ? `${remaining === 1 ? "triagem disponível" : "triagens disponíveis"}`
          : "Sem créditos. Compre um pacote para continuar."}
      </p>
      <Link
        href="/empresa/billing"
        onClick={onNavigate}
        className="mt-3 block text-center text-sm font-semibold bg-white text-blue-700 rounded-md py-2 hover:bg-amber-400 hover:text-blue-950 transition-colors relative"
      >
        Comprar créditos
      </Link>
    </div>
  );

  return (
    <div className="flex min-h-screen">
      {/* Sidebar desktop */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col bg-gradient-to-b from-[#0d1830] via-[#0b1526] to-[#080e1c] text-white h-screen sticky top-0 border-r border-white/5">
        <div className="px-5 py-6 border-b border-white/5">
          <Link href="/empresa" aria-label="CarreirasMatch">
            <BrandLogo heightClassName="h-12" onDark />
          </Link>
          <span className="mt-3 inline-flex items-center text-[10px] font-semibold uppercase tracking-wider rounded-full px-2.5 py-0.5 bg-white/10 text-blue-200">
            Área da empresa
          </span>
        </div>

        <nav className="flex-1 min-h-0 overflow-y-auto px-3 py-4 space-y-1">{navLinks()}</nav>

        <div className="p-4">{creditsCard()}</div>
      </aside>

      {/* Coluna de conteúdo */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center justify-between gap-4 border-b border-neutral-200/75 dark:border-neutral-800 px-4 md:px-6 py-3 bg-white/80 dark:bg-[#090d16]/80 backdrop-blur-md sticky top-0 z-20 w-full">
          <button
            type="button"
            onClick={() => setMobileNavOpen((v) => !v)}
            className="md:hidden p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900"
            aria-label="Menu"
          >
            {mobileNavOpen ? <X className="h-5 w-5" strokeWidth={1.75} /> : <Menu className="h-5 w-5" strokeWidth={1.75} />}
          </button>

          <div className="flex-1" />

          <ThemeToggle className="hidden sm:inline-flex" />

          <span className="hidden sm:block text-sm font-medium text-neutral-700 dark:text-neutral-200 truncate max-w-[12rem]">
            {companyName}
          </span>

          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/empresa/login" })}
            className="flex items-center gap-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
          >
            <LogOut className="h-4 w-4" strokeWidth={1.75} />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </header>

        <main className="flex-1 bg-neutral-50 dark:bg-neutral-950" data-authenticated>
          {children}
        </main>
      </div>

      {/* Drawer mobile */}
      {mobileNavOpen && (
        <div
          className="md:hidden fixed inset-0 z-30 bg-neutral-950/40 backdrop-blur-sm"
          onClick={() => setMobileNavOpen(false)}
        >
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
              <div className="space-y-1.5">{navLinks(() => setMobileNavOpen(false))}</div>
            </div>

            <div className="space-y-3">
              {creditsCard(() => setMobileNavOpen(false))}
              <button
                type="button"
                onClick={() => {
                  setMobileNavOpen(false);
                  signOut({ callbackUrl: "/empresa/login" });
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-300 hover:bg-white/5"
              >
                <LogOut className="h-4 w-4" strokeWidth={1.75} />
                Sair
              </button>
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}

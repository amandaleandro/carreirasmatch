"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";

export const journeys = [
  { label: "Descobrir", href: "/faculdade-ou-tecnico", items: [["Teste vocacional", "/tools/vocation-test"], ["Teste comportamental", "/tools/behavioral-test"], ["Faculdade ou técnico", "/faculdade-ou-tecnico"], ["Mercado de trabalho", "/mercado-de-trabalho"]] },
  { label: "Aprender", href: "/ensino-medio", items: [["Ensino médio", "/ensino-medio"], ["Universidade", "/universidade"], ["Concursos", "/concurso"], ["OAB", "/oab"], ["Ferramentas de estudo", "/tools"]] },
  { label: "Conquistar", href: "/analise", items: [["Analisar currículo e vaga", "/analise"], ["Criar currículo", "/curriculo-gratis"], ["Verificar ATS", "/verificador-ats"], ["Encontrar vagas", "/todas-as-vagas"], ["Preparar entrevista", "/tools/interview-simulator"], ["Acompanhar candidaturas", "/applications"]] },
  { label: "Evoluir", href: "/insights", items: [["Evolução profissional", "/evolucao"], ["Melhorar LinkedIn", "/tools/linkedin-optimizer"], ["Revisar GitHub", "/tools/github-review"], ["Mapa de competências", "/tools/matriz-de-skills"], ["Plano de ação", "/action-plan"], ["Transição de carreira", "/transicao"]] },
  { label: "Freelancer", href: "/freelancers", items: [["Encontrar projetos", "/projetos"], ["Criar perfil", "/freelancer"], ["Meus contratos", "/freelancer/contratos"], ["Precificação inteligente", "/freelancer/precificacao"]] },
] as const;

export const institutional = [["Para empresas", "/empresas"], ["Para instituições", "/parceiro"]] as const;

function JourneyDropdown({ journey, open, onToggle, onClose }: { journey: (typeof journeys)[number]; open: boolean; onToggle: () => void; onClose: () => void }) {
  return <div className="relative">
    <button type="button" aria-expanded={open} aria-haspopup="true" onClick={onToggle} className="cursor-pointer whitespace-nowrap hover:text-white transition-colors">{journey.label}</button>
    {open && <div className="absolute left-1/2 top-full z-50 mt-3 w-max min-w-56 -translate-x-1/2 rounded-2xl border border-white/10 bg-[#0b2032] p-2 shadow-xl">
      {journey.items.map(([label, href]) => <Link key={href} href={href} onClick={onClose} className="block whitespace-nowrap rounded-lg px-3 py-2 text-xs font-medium text-slate-300 hover:bg-white/5 hover:text-white transition-colors">{label}</Link>)}
    </div>}
  </div>;
}

export function PublicNav() {
  const [openJourney, setOpenJourney] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => { if (navRef.current && !navRef.current.contains(event.target as Node)) setOpenJourney(null); };
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setOpenJourney(null); };
    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => { document.removeEventListener("mousedown", closeOnOutsideClick); document.removeEventListener("keydown", closeOnEscape); };
  }, []);

  return <nav ref={navRef} aria-label="Navegação principal" className="hidden items-center gap-6 text-xs font-semibold text-slate-300 xl:flex">
    {journeys.map((journey) => <JourneyDropdown key={journey.label} journey={journey} open={openJourney === journey.label} onToggle={() => setOpenJourney((current) => current === journey.label ? null : journey.label)} onClose={() => setOpenJourney(null)} />)}
    <span className="h-4 w-px bg-white/15" aria-hidden="true" />
    {institutional.map(([label, href]) => <Link key={href} href={href} className="whitespace-nowrap hover:text-white transition-colors">{label}</Link>)}
  </nav>;
}

export function PublicNavMobile() {
  return <details className="group relative xl:hidden">
    <summary aria-label="Abrir menu" className="flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded-full border border-white/20 text-white marker:content-none [&::-webkit-details-marker]:hidden"><Menu className="h-4.5 w-4.5" /></summary>
    <div className="absolute right-0 top-full z-50 mt-3 max-h-[70vh] w-72 overflow-y-auto rounded-2xl border border-white/10 bg-[#0b2032] p-3 shadow-xl">
      {journeys.map((journey) => <div key={journey.label} className="mb-2 last:mb-0">
        <Link href={journey.href} className="block rounded-lg px-3 py-2 text-xs font-bold text-white">{journey.label}</Link>
        <div className="ml-2 space-y-0.5 border-l border-white/10 pl-2">{journey.items.map(([label, href]) => <Link key={href} href={href} className="block rounded-lg px-2 py-1.5 text-xs text-slate-300 hover:bg-white/5 hover:text-white transition-colors">{label}</Link>)}</div>
      </div>)}
      <div className="mt-2 space-y-0.5 border-t border-white/10 pt-2">{institutional.map(([label, href]) => <Link key={href} href={href} className="block rounded-lg px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-white/5 hover:text-white transition-colors">{label}</Link>)}</div>
    </div>
  </details>;
}

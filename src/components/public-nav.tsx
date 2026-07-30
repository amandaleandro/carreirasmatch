import Link from "next/link";
import { Menu } from "lucide-react";

/**
 * Menu público oficial: as 5 jornadas do CarreirasMatch (docs/arquitetura de
 * navegação v1.0) mais os dois públicos institucionais. Usa <details> nativo
 * para os dropdowns, sem JS extra e acessível por teclado.
 */
export const journeys = [
  {
    label: "Descobrir",
    href: "/faculdade-ou-tecnico",
    items: [
      ["Teste vocacional", "/tools/vocation-test"],
      ["Teste comportamental", "/tools/behavioral-test"],
      ["Faculdade ou técnico", "/faculdade-ou-tecnico"],
      ["Mercado de trabalho", "/mercado-de-trabalho"],
    ],
  },
  {
    label: "Aprender",
    href: "/ensino-medio",
    items: [
      ["Ensino médio", "/ensino-medio"],
      ["Universidade", "/universidade"],
      ["Concursos", "/concurso"],
      ["OAB", "/oab"],
      ["Ferramentas de estudo", "/tools"],
    ],
  },
  {
    label: "Conquistar",
    href: "/analise",
    items: [
      ["Analisar currículo e vaga", "/analise"],
      ["Criar currículo", "/curriculo-gratis"],
      ["Verificar ATS", "/verificador-ats"],
      ["Encontrar vagas", "/todas-as-vagas"],
      ["Preparar entrevista", "/tools/interview-simulator"],
      ["Acompanhar candidaturas", "/applications"],
    ],
  },
  {
    label: "Evoluir",
    href: "/insights",
    items: [
      ["Evolução profissional", "/evolucao"],
      ["Melhorar LinkedIn", "/tools/linkedin-optimizer"],
      ["Revisar GitHub", "/tools/github-review"],
      ["Mapa de competências", "/tools/matriz-de-skills"],
      ["Plano de ação", "/action-plan"],
      ["Transição de carreira", "/transicao"],
    ],
  },
  {
    label: "Freelancer",
    href: "/freelancers",
    items: [
      ["Encontrar projetos", "/projetos"],
      ["Criar perfil", "/freelancer"],
      ["Meus contratos", "/freelancer/contratos"],
      ["Precificação inteligente", "/freelancer/precificacao"],
    ],
  },
] as const;

export const institutional = [
  ["Para empresas", "/empresas"],
  ["Para instituições", "/parceiro"],
] as const;

function JourneyDropdown({ journey }: { journey: (typeof journeys)[number] }) {
  return (
    <details className="group relative">
      <summary className="cursor-pointer list-none hover:text-white transition-colors marker:content-none [&::-webkit-details-marker]:hidden">
        {journey.label}
      </summary>
      <div className="absolute left-1/2 top-full z-20 mt-3 w-56 -translate-x-1/2 rounded-2xl border border-white/10 bg-[#0b2032] p-2 shadow-xl">
        {journey.items.map(([label, href]) => (
          <Link
            key={href}
            href={href}
            className="block rounded-lg px-3 py-2 text-xs font-medium text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
          >
            {label}
          </Link>
        ))}
      </div>
    </details>
  );
}

/** Menu de topo com dropdowns, visível a partir de md. */
export function PublicNav() {
  return (
    <nav aria-label="Navegação principal" className="hidden items-center gap-6 text-xs font-semibold text-slate-300 md:flex">
      {journeys.map((journey) => (
        <JourneyDropdown key={journey.label} journey={journey} />
      ))}
      <span className="h-4 w-px bg-white/15" aria-hidden="true" />
      {institutional.map(([label, href]) => (
        <Link key={href} href={href} className="hover:text-white transition-colors">
          {label}
        </Link>
      ))}
    </nav>
  );
}

/** Botão hamburguer com painel expansível, visível só abaixo de md. */
export function PublicNavMobile() {
  return (
    <details className="group relative md:hidden">
      <summary
        aria-label="Abrir menu"
        className="flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded-full border border-white/20 text-white marker:content-none [&::-webkit-details-marker]:hidden"
      >
        <Menu className="h-4.5 w-4.5" />
      </summary>
      <div className="absolute right-0 top-full z-30 mt-3 max-h-[70vh] w-72 overflow-y-auto rounded-2xl border border-white/10 bg-[#0b2032] p-3 shadow-xl">
        {journeys.map((journey) => (
          <div key={journey.label} className="mb-2 last:mb-0">
            <Link
              href={journey.href}
              className="block rounded-lg px-3 py-2 text-xs font-bold text-white"
            >
              {journey.label}
            </Link>
            <div className="ml-2 space-y-0.5 border-l border-white/10 pl-2">
              {journey.items.map(([label, href]) => (
                <Link
                  key={href}
                  href={href}
                  className="block rounded-lg px-2 py-1.5 text-xs text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        ))}
        <div className="mt-2 space-y-0.5 border-t border-white/10 pt-2">
          {institutional.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className="block rounded-lg px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </details>
  );
}

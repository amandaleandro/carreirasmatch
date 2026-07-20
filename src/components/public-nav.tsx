import Link from "next/link";

/**
 * Single source of truth for the public (logged-out) primary navigation.
 * Rendered both on the dark hero header (ContentPage) and the light header
 * (PublicSiteHeader) via the `onDark` flag, so the menu stays in sync
 * across every marketing / content page.
 *
 * The `show` classes progressively reveal items as the viewport widens so the
 * long menu never wraps awkwardly on small screens.
 */
const NAV_LINKS: { href: string; label: string; show: string }[] = [
  { href: "/vagas-de-hoje", label: "Vagas de hoje", show: "" },
  { href: "/vagas-publicas", label: "SINE e prefeituras", show: "hidden lg:inline" },
  { href: "/cursos-gratuitos", label: "Cursos gratuitos", show: "hidden xl:inline" },
  { href: "/mentorias", label: "Mentorias", show: "hidden xl:inline" },
  { href: "/concursos", label: "Concursos", show: "hidden lg:inline" },
  { href: "/vestibulares", label: "Vestibulares", show: "hidden lg:inline" },
  { href: "/mercado-de-trabalho", label: "Mercado", show: "hidden xl:inline" },
  { href: "/blog", label: "Blog", show: "" },
  { href: "/gratuito", label: "Ferramentas grátis", show: "hidden md:inline" },
  { href: "/comece", label: "Como funciona", show: "hidden sm:inline" },
];

export function PublicNav({ onDark = false }: { onDark?: boolean }) {
  const base = onDark
    ? "text-white/70 hover:text-white"
    : "text-neutral-600 dark:text-neutral-300 hover:text-blue-600 dark:hover:text-blue-400";

  return (
    <nav className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm font-medium">
      {NAV_LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`${link.show} ${base} transition-colors whitespace-nowrap`}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}

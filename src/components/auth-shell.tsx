import Link from "next/link";
import type { ReactNode } from "react";
import { BrandLogo } from "@/components/brand-logo";

export function AuthShell({
  eyebrow,
  headline,
  description,
  highlights,
  children,
}: {
  eyebrow: string;
  headline: string;
  description: string;
  highlights: string[];
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <div className="hidden lg:flex lg:w-[42%] xl:w-[38%] flex-col justify-between bg-gradient-to-br from-blue-950 via-blue-900 to-slate-950 px-10 py-10 xl:px-14 xl:py-14 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(96,165,250,0.18),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(34,197,94,0.10),transparent_40%)]" />

        <Link href="/" className="relative">
          <BrandLogo heightClassName="h-11" onDark />
        </Link>

        <div className="relative">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider rounded-full px-3 py-1 mb-5 bg-blue-500/15 text-blue-300 border border-blue-400/30">
            {eyebrow}
          </span>
          <h1 className="text-3xl xl:text-4xl font-bold text-white leading-tight">
            {headline}
          </h1>
          <p className="text-white/70 mt-4 text-sm leading-relaxed max-w-sm">
            {description}
          </p>
          <div className="mt-8 space-y-3">
            {highlights.map((highlight) => (
              <div key={highlight} className="flex items-center gap-3 text-sm text-white/85">
                <span className="h-5 w-5 shrink-0 rounded-full bg-blue-500/20 text-blue-300 flex items-center justify-center text-[11px] font-bold">
                  ✓
                </span>
                {highlight}
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-[11px] text-white/40">
          © {new Date().getFullYear()} CarreirasMatch. Todos os direitos reservados.
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12 lg:py-16 bg-neutral-50 dark:bg-neutral-950">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8 flex flex-col items-center text-center">
            <Link href="/">
              <BrandLogo heightClassName="h-11" />
            </Link>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

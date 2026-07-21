"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Flame, X, ArrowRight } from "lucide-react";

const STORAGE_KEY = "desafio-banner:v1:dismissed";

export function DesafioBanner() {
  const pathname = usePathname();
  const router = useRouter();
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    try {
      setDismissed(Boolean(window.localStorage.getItem(STORAGE_KEY)));
    } catch {
      setDismissed(false);
    }
  }, []);

  // Exibir em todas as telas, exceto na própria página do desafio (/desafio)
  const isHidden = pathname === "/desafio" || pathname.startsWith("/desafio/");
  if (dismissed || isHidden) return null;

  function close(e: React.MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    setDismissed(true);
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
  }

  function handleBannerClick() {
    router.push("/desafio");
  }

  return (
    <div
      onClick={handleBannerClick}
      className="group relative cursor-pointer flex items-center justify-between gap-3 bg-gradient-to-r from-blue-600 via-blue-500 to-sky-500 px-4 py-2.5 text-white sm:px-6 shadow-sm hover:from-blue-700 hover:to-sky-600 transition-all z-50 select-none"
    >
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <Flame className="h-4 w-4 shrink-0 text-amber-300 animate-pulse" strokeWidth={2.2} />
        <p className="min-w-0 flex-1 truncate text-xs font-medium sm:text-sm">
          <span className="font-bold underline decoration-blue-200 decoration-1 underline-offset-2">
            Desafio do Match:
          </span>{" "}
          descubra seu % de aderência com a vaga dos sonhos e ganhe um Kit Candidatura grátis!
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-bold text-blue-700 group-hover:bg-blue-50 shadow-xs transition-colors">
          Participar
          <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" strokeWidth={2} />
        </span>
        <button
          type="button"
          onClick={close}
          aria-label="Fechar banner do desafio"
          className="shrink-0 rounded-full p-1 text-white/80 hover:bg-white/20 hover:text-white transition-colors"
        >
          <X className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}

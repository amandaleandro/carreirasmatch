"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flame, X, ArrowRight } from "lucide-react";

const STORAGE_KEY = "desafio-banner:v1:dismissed";

export function DesafioBanner() {
  const pathname = usePathname();
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    try {
      setDismissed(Boolean(window.localStorage.getItem(STORAGE_KEY)));
    } catch {
      setDismissed(false);
    }
  }, []);

  // Boundary explícito (=== ou +"/") pra não esconder o banner em rotas que só
  // coincidem no prefixo, como "/empresas" (landing pública, não é "/empresa/...").
  const hiddenOn = ["/desafio", "/login", "/register", "/empresa", "/parceiro", "/redefinir-senha", "/esqueci-senha"];
  const isHidden = hiddenOn.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (dismissed || isHidden) return null;

  function close() {
    setDismissed(true);
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-sky-500 px-4 py-2.5 text-white sm:px-6">
      <Flame className="h-4 w-4 shrink-0" strokeWidth={2} />
      <p className="min-w-0 flex-1 truncate text-xs font-medium sm:text-sm">
        <span className="font-bold">Desafio do Match:</span> descubra seu % de aderência com a vaga dos sonhos e ganhe um diagnóstico completo grátis indicando amigos.
      </p>
      <Link
        href="/desafio"
        className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-semibold text-blue-700 transition hover:bg-blue-50"
      >
        Participar
        <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
      </Link>
      <button
        type="button"
        onClick={close}
        aria-label="Fechar banner do desafio"
        className="shrink-0 rounded-full p-1 text-white/80 transition hover:bg-white/10 hover:text-white"
      >
        <X className="h-4 w-4" strokeWidth={2} />
      </button>
    </div>
  );
}

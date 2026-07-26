"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

type Props = { game: string; phase?: number };

export function CareerGameContext({ game, phase = 1 }: Props) {
  const [context, setContext] = useState<string | null>(null);
  const [area, setArea] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch(`/api/jogos/personalizados?game=${encodeURIComponent(game)}&fase=${phase}`)
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (active && data?.context) {
          setContext(data.context);
          setArea(data.area ?? null);
        }
      })
      .catch(() => undefined);
    return () => { active = false; };
  }, [game, phase]);

  if (!context) return null;

  return (
    <div className="flex items-start gap-2 rounded-2xl border border-blue-100 bg-blue-50/80 px-4 py-3 text-xs text-blue-800 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-200">
      <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
      <div>
        <p className="font-bold">Trilha personalizada{area ? ` · ${area}` : ""}</p>
        <p className="mt-0.5 leading-relaxed opacity-80">{context} Os desafios desta rodada ajudam a transformar esse foco em prática.</p>
      </div>
    </div>
  );
}

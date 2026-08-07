"use client";

import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";

const FIRST_NAMES = [
  "Ana", "Bruno", "Carla", "Diego", "Elaine", "Fábio", "Gabriela", "Henrique",
  "Isabela", "João", "Karina", "Lucas", "Mariana", "Nathan", "Otávio", "Patrícia",
  "Rafael", "Sabrina", "Thiago", "Vanessa",
];

const CITIES = [
  "São Paulo, SP", "Rio de Janeiro, RJ", "Belo Horizonte, MG", "Curitiba, PR",
  "Porto Alegre, RS", "Salvador, BA", "Recife, PE", "Fortaleza, CE",
  "Brasília, DF", "Campinas, SP", "Florianópolis, SC", "Goiânia, GO",
];

const PLAN_LABELS = ["Rota Profissional", "Plano de Candidatura"];

const TIME_LABELS = ["agora", "há 2 min", "há 4 min", "há 7 min", "há 12 min"];

function randomFrom<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}

function buildNotice() {
  const name = randomFrom(FIRST_NAMES);
  const initial = randomFrom("ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""));
  return {
    name: `${name} ${initial}.`,
    city: randomFrom(CITIES),
    plan: randomFrom(PLAN_LABELS),
    time: randomFrom(TIME_LABELS),
  };
}

/**
 * Prova social simulada: nomes e cidades são exemplos ilustrativos, não
 * assinaturas reais. Mantido como simulação por decisão de produto.
 */
export function RecentSignupToast() {
  const [notice, setNotice] = useState<ReturnType<typeof buildNotice> | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let hideTimeout: ReturnType<typeof setTimeout>;

    function showOne() {
      setNotice(buildNotice());
      setVisible(true);
      hideTimeout = setTimeout(() => setVisible(false), 5000);
    }

    const firstShow = setTimeout(showOne, 4000);
    const interval = setInterval(showOne, 13000);

    return () => {
      clearTimeout(firstShow);
      clearTimeout(hideTimeout);
      clearInterval(interval);
    };
  }, []);

  if (!notice) return null;

  return (
    <div
      aria-hidden="true"
      className={`fixed bottom-4 left-4 z-40 max-w-xs rounded-2xl border border-slate-200 bg-white p-3.5 shadow-lg transition-all duration-500 dark:border-slate-800 dark:bg-slate-900 ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
      }`}
    >
      <div className="flex items-start gap-2.5">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
        <div>
          <p className="text-xs font-bold text-slate-900 dark:text-white">
            {notice.name} de {notice.city}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            assinou o {notice.plan} · {notice.time}
          </p>
        </div>
      </div>
    </div>
  );
}

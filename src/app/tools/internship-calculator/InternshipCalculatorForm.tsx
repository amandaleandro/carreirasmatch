"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { compareInternshipOffers, type InternshipOfferInput } from "@/lib/internship-calculator";

function emptyOffer(label: string): InternshipOfferInput {
  return { label, stipend: 0, transportAid: 0, mealAid: 0, hoursPerDay: 6, daysPerWeek: 5 };
}

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function InternshipCalculatorForm() {
  const [offers, setOffers] = useState<InternshipOfferInput[]>([
    emptyOffer("Proposta 1"),
    emptyOffer("Proposta 2"),
  ]);

  const results = useMemo(() => compareInternshipOffers(offers), [offers]);
  const bestIndex = useMemo(() => {
    if (results.every((r) => r.totalMonthly === 0)) return -1;
    return results.reduce((best, r, i) => (r.totalMonthly > results[best].totalMonthly ? i : best), 0);
  }, [results]);

  function updateOffer(index: number, field: keyof InternshipOfferInput, value: string) {
    setOffers((prev) =>
      prev.map((o, i) =>
        i === index
          ? { ...o, [field]: field === "label" ? value : Number(value) || 0 }
          : o
      )
    );
  }

  function addOffer() {
    if (offers.length < 3) setOffers((prev) => [...prev, emptyOffer(`Proposta ${prev.length + 1}`)]);
  }

  function removeOffer(index: number) {
    if (offers.length > 2) setOffers((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-12 w-full">
      <Link href="/tools" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
        ← Voltar para ferramentas
      </Link>
      <header className="mt-4 mb-10">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Calculadora de bolsa-auxílio
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-2">
          Compare propostas de estágio considerando bolsa, vale-transporte, vale-refeição e carga
          horária — para ver de fato quanto sobra por mês e por hora trabalhada.
        </p>
      </header>

      <div className="space-y-5">
        {offers.map((offer, i) => (
          <div
            key={i}
            className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 space-y-3"
          >
            <div className="flex items-center justify-between gap-2">
              <input
                type="text"
                value={offer.label}
                onChange={(e) => updateOffer(i, "label", e.target.value)}
                className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm font-semibold"
              />
              {offers.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeOffer(i)}
                  className="text-sm text-red-500 hover:underline shrink-0"
                >
                  Remover
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm">
                Bolsa-auxílio (R$)
                <input
                  type="number"
                  min={0}
                  value={offer.stipend || ""}
                  onChange={(e) => updateOffer(i, "stipend", e.target.value)}
                  className="mt-1 w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
                />
              </label>
              <label className="text-sm">
                Vale-transporte (R$)
                <input
                  type="number"
                  min={0}
                  value={offer.transportAid || ""}
                  onChange={(e) => updateOffer(i, "transportAid", e.target.value)}
                  className="mt-1 w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
                />
              </label>
              <label className="text-sm">
                Vale-refeição/alimentação (R$)
                <input
                  type="number"
                  min={0}
                  value={offer.mealAid || ""}
                  onChange={(e) => updateOffer(i, "mealAid", e.target.value)}
                  className="mt-1 w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
                />
              </label>
              <label className="text-sm">
                Horas por dia
                <input
                  type="number"
                  min={1}
                  max={6}
                  value={offer.hoursPerDay || ""}
                  onChange={(e) => updateOffer(i, "hoursPerDay", e.target.value)}
                  className="mt-1 w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
                />
              </label>
              <label className="text-sm">
                Dias por semana
                <input
                  type="number"
                  min={1}
                  max={7}
                  value={offer.daysPerWeek || ""}
                  onChange={(e) => updateOffer(i, "daysPerWeek", e.target.value)}
                  className="mt-1 w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
                />
              </label>
            </div>
          </div>
        ))}

        {offers.length < 3 && (
          <button
            type="button"
            onClick={addOffer}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            + Adicionar outra proposta
          </button>
        )}
      </div>

      <div className="mt-10 space-y-4">
        <h2 className="font-semibold text-lg">Comparação</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((r, i) => (
            <div
              key={i}
              className={`rounded-xl border p-4 space-y-2 ${
                i === bestIndex
                  ? "border-emerald-400 dark:border-emerald-600 bg-emerald-50 dark:bg-emerald-950/30"
                  : "border-neutral-200 dark:border-neutral-800"
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="font-medium text-sm">{r.label}</p>
                {i === bestIndex && (
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    Melhor total
                  </span>
                )}
              </div>
              <p className="text-2xl font-bold">{currencyFormatter.format(r.totalMonthly)}</p>
              <p className="text-xs text-neutral-500">por mês (bolsa + VT + VR)</p>
              <div className="pt-2 text-sm text-neutral-600 dark:text-neutral-400 space-y-1">
                <p>{r.hoursPerWeek}h/semana · {r.hoursPerMonth.toFixed(0)}h/mês</p>
                <p>{currencyFormatter.format(r.valuePerHour)} por hora trabalhada</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-neutral-500">
          Valores estimados a partir das médias informadas. Lembre-se que a Lei 11.788/2008 limita a
          carga horária a 6h/dia (ou 30h/semana) para estágios não-obrigatórios de estudantes de
          ensino superior e profissionalizante.
        </p>
      </div>
    </main>
  );
}

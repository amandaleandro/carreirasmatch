"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

function money(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value || 0);
}

export function SalaryCalculator() {
  const [salary, setSalary] = useState(2500);
  const [meal, setMeal] = useState(500);
  const [transport, setTransport] = useState(250);
  const [other, setOther] = useState(0);
  const [hours, setHours] = useState(44);
  const result = useMemo(() => {
    const monthlyPackage = Math.max(0, salary + meal + transport + other);
    const monthlyHours = Math.max(1, hours * 4.33);
    return { monthlyPackage, hourly: monthlyPackage / monthlyHours, annual: monthlyPackage * 12 };
  }, [salary, meal, transport, other, hours]);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12">
      <Link href="/tools" className="text-sm font-semibold text-blue-600 hover:underline dark:text-blue-400">← Voltar para Ferramentas</Link>
      <header className="mb-8 mt-4">
        <span className="text-xs font-bold uppercase tracking-wider text-amber-600">Cadastro grátis</span>
        <h1 className="mt-2 text-3xl font-bold">Calculadora de salário e benefícios</h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">Veja o valor total da proposta antes de comparar oportunidades. Os valores são brutos e não estimam impostos.</p>
      </header>
      <form className="grid gap-5 sm:grid-cols-2" onSubmit={(event) => event.preventDefault()}>
        <MoneyInput label="Salário bruto mensal" value={salary} onChange={setSalary} />
        <MoneyInput label="Vale-refeição ou alimentação" value={meal} onChange={setMeal} />
        <MoneyInput label="Auxílio-transporte" value={transport} onChange={setTransport} />
        <MoneyInput label="Outros benefícios mensais" value={other} onChange={setOther} />
        <label className="sm:col-span-2 text-sm font-semibold">Horas por semana
          <input type="number" min="1" max="80" value={hours} onChange={(e) => setHours(Number(e.target.value))} className="mt-2 w-full rounded-xl border px-3.5 py-2.5" />
        </label>
      </form>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Result label="Pacote mensal" value={money(result.monthlyPackage)} />
        <Result label="Valor por hora" value={money(result.hourly)} />
        <Result label="Pacote anual" value={money(result.annual)} />
      </div>
    </main>
  );
}

function MoneyInput({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return <label className="text-sm font-semibold">{label}<input type="number" min="0" step="10" value={value} onChange={(e) => onChange(Number(e.target.value))} className="mt-2 w-full rounded-xl border px-3.5 py-2.5" /></label>;
}

function Result({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-950"><p className="text-xs font-semibold uppercase text-neutral-500">{label}</p><p className="mt-2 text-xl font-bold text-emerald-700 dark:text-emerald-400">{value}</p></div>;
}

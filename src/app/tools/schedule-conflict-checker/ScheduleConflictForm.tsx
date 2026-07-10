"use client";

import { useMemo, useState, FormEvent } from "react";
import Link from "next/link";
import { dayLabel, findScheduleConflicts, type ScheduleBlock } from "@/lib/schedule-conflict";

type ClassItem = {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  subject: string;
};

const DAY_OPTIONS = [1, 2, 3, 4, 5, 6, 0].map((value) => ({ value, label: dayLabel(value) }));

function emptyInternshipBlock(): ScheduleBlock {
  return { dayOfWeek: 1, startTime: "09:00", endTime: "18:00", label: "Estágio" };
}

export function ScheduleConflictForm({ initialClassItems }: { initialClassItems: ClassItem[] }) {
  const [classItems, setClassItems] = useState<ClassItem[]>(initialClassItems);
  const [classForm, setClassForm] = useState({ dayOfWeek: 1, startTime: "08:00", endTime: "10:00", subject: "" });
  const [classError, setClassError] = useState<string | null>(null);
  const [savingClass, setSavingClass] = useState(false);

  const [internshipBlocks, setInternshipBlocks] = useState<ScheduleBlock[]>([emptyInternshipBlock()]);

  const conflicts = useMemo(() => {
    const classBlocks: ScheduleBlock[] = classItems.map((c) => ({
      dayOfWeek: c.dayOfWeek,
      startTime: c.startTime,
      endTime: c.endTime,
      label: c.subject,
    }));
    return findScheduleConflicts(classBlocks, internshipBlocks);
  }, [classItems, internshipBlocks]);

  async function addClassItem(e: FormEvent) {
    e.preventDefault();
    setClassError(null);

    if (!classForm.subject.trim()) {
      setClassError("Informe a matéria.");
      return;
    }

    setSavingClass(true);
    try {
      const res = await fetch("/api/user/class-schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(classForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao salvar.");

      setClassItems((prev) => [...prev, data.item as ClassItem]);
      setClassForm((prev) => ({ ...prev, subject: "" }));
    } catch (err) {
      setClassError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setSavingClass(false);
    }
  }

  async function removeClassItem(id: string) {
    setClassItems((prev) => prev.filter((c) => c.id !== id));
    await fetch(`/api/user/class-schedule/${id}`, { method: "DELETE" });
  }

  function updateInternshipBlock(index: number, field: keyof ScheduleBlock, value: string) {
    setInternshipBlocks((prev) =>
      prev.map((b, i) =>
        i === index ? { ...b, [field]: field === "dayOfWeek" ? Number(value) : value } : b
      )
    );
  }

  function addInternshipBlock() {
    if (internshipBlocks.length < 7) setInternshipBlocks((prev) => [...prev, emptyInternshipBlock()]);
  }

  function removeInternshipBlock(index: number) {
    if (internshipBlocks.length > 1) setInternshipBlocks((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-12 w-full">
      <Link href="/tools" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
        ← Voltar para ferramentas
      </Link>
      <header className="mt-4 mb-10">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Conflito de horário: aula x estágio
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-2">
          Cadastre sua grade de aulas e os horários do estágio que está avaliando, para ver se
          batem antes de fechar a vaga.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="font-semibold text-lg">Sua grade de aulas</h2>
        <form onSubmit={addClassItem} className="grid grid-cols-2 sm:grid-cols-5 gap-2 items-end">
          <label className="text-xs text-neutral-500 col-span-1">
            Dia
            <select
              value={classForm.dayOfWeek}
              onChange={(e) => setClassForm((p) => ({ ...p, dayOfWeek: Number(e.target.value) }))}
              className="mt-1 w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-2 py-2 text-sm"
            >
              {DAY_OPTIONS.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs text-neutral-500 col-span-1">
            Início
            <input
              type="time"
              value={classForm.startTime}
              onChange={(e) => setClassForm((p) => ({ ...p, startTime: e.target.value }))}
              className="mt-1 w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-2 py-2 text-sm"
            />
          </label>
          <label className="text-xs text-neutral-500 col-span-1">
            Fim
            <input
              type="time"
              value={classForm.endTime}
              onChange={(e) => setClassForm((p) => ({ ...p, endTime: e.target.value }))}
              className="mt-1 w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-2 py-2 text-sm"
            />
          </label>
          <label className="text-xs text-neutral-500 col-span-2 sm:col-span-1">
            Matéria
            <input
              type="text"
              value={classForm.subject}
              onChange={(e) => setClassForm((p) => ({ ...p, subject: e.target.value }))}
              placeholder="Ex: Cálculo I"
              className="mt-1 w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-2 py-2 text-sm"
            />
          </label>
          <button
            type="submit"
            disabled={savingClass}
            className="rounded-md bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-medium py-2 text-sm disabled:opacity-50"
          >
            {savingClass ? "Salvando..." : "Adicionar"}
          </button>
        </form>
        {classError && <p className="text-sm text-red-500">{classError}</p>}

        <div className="space-y-2">
          {classItems.length === 0 && (
            <p className="text-sm text-neutral-500">Nenhuma aula cadastrada ainda.</p>
          )}
          {classItems.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-neutral-200 dark:border-neutral-800 p-3 text-sm"
            >
              <span>
                <strong>{dayLabel(c.dayOfWeek)}</strong> {c.startTime}–{c.endTime} · {c.subject}
              </span>
              <button
                type="button"
                onClick={() => removeClassItem(c.id)}
                className="text-red-500 hover:underline text-xs shrink-0"
              >
                Remover
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="font-semibold text-lg">Horários do estágio sendo avaliado</h2>
        <p className="text-sm text-neutral-500">
          Não precisa salvar — é só para checar contra sua grade de aulas.
        </p>
        {internshipBlocks.map((block, i) => (
          <div key={i} className="grid grid-cols-2 sm:grid-cols-4 gap-2 items-end">
            <label className="text-xs text-neutral-500">
              Dia
              <select
                value={block.dayOfWeek}
                onChange={(e) => updateInternshipBlock(i, "dayOfWeek", e.target.value)}
                className="mt-1 w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-2 py-2 text-sm"
              >
                {DAY_OPTIONS.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs text-neutral-500">
              Início
              <input
                type="time"
                value={block.startTime}
                onChange={(e) => updateInternshipBlock(i, "startTime", e.target.value)}
                className="mt-1 w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-2 py-2 text-sm"
              />
            </label>
            <label className="text-xs text-neutral-500">
              Fim
              <input
                type="time"
                value={block.endTime}
                onChange={(e) => updateInternshipBlock(i, "endTime", e.target.value)}
                className="mt-1 w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-2 py-2 text-sm"
              />
            </label>
            {internshipBlocks.length > 1 && (
              <button
                type="button"
                onClick={() => removeInternshipBlock(i)}
                className="text-sm text-red-500 hover:underline"
              >
                Remover
              </button>
            )}
          </div>
        ))}
        {internshipBlocks.length < 7 && (
          <button
            type="button"
            onClick={addInternshipBlock}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            + Adicionar outro dia de estágio
          </button>
        )}
      </section>

      <section className="mt-10">
        <h2 className="font-semibold text-lg mb-3">Resultado</h2>
        {conflicts.length === 0 ? (
          <p className="text-sm rounded-lg border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 p-4">
            Nenhum conflito encontrado entre a grade de aulas e o horário do estágio informado.
          </p>
        ) : (
          <div className="space-y-2">
            {conflicts.map((c, i) => (
              <p
                key={i}
                className="text-sm rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 p-4"
              >
                {dayLabel(c.classBlock.dayOfWeek)} {c.classBlock.startTime}–{c.classBlock.endTime}
                {" "}({c.classBlock.label}) colide com o estágio das {c.internshipBlock.startTime}–
                {c.internshipBlock.endTime}.
              </p>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

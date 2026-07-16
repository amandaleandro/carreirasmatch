"use client";

import { useState } from "react";

type StudyScheduleItem = {
  id: string;
  weekStart: Date;
  focus: string;
  task: string;
  done: boolean;
};

function formatWeekStart(date: Date): string {
  return new Date(date).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit" });
}

export function StudyCalendarView({ items }: { items: StudyScheduleItem[] }) {
  const [localItems, setLocalItems] = useState(items);
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());

  async function toggleDone(id: string, done: boolean) {
    setLocalItems((prev) => prev.map((i) => (i.id === id ? { ...i, done } : i)));
    setPendingIds((prev) => new Set(prev).add(id));

    try {
      await fetch(`/api/tools/study-calendar/item/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ done }),
      });
    } catch {
      setLocalItems((prev) => prev.map((i) => (i.id === id ? { ...i, done: !done } : i)));
    } finally {
      setPendingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }

  const weeks = new Map<string, { weekStart: Date; focus: string; items: StudyScheduleItem[] }>();
  for (const item of localItems) {
    const key = new Date(item.weekStart).toISOString();
    if (!weeks.has(key)) {
      weeks.set(key, { weekStart: item.weekStart, focus: item.focus, items: [] });
    }
    weeks.get(key)!.items.push(item);
  }

  const totalDone = localItems.filter((i) => i.done).length;

  return (
    <div className="space-y-6">
      <p className="text-sm text-neutral-500">
        {totalDone} de {localItems.length} tarefas concluídas
      </p>

      {Array.from(weeks.values()).map((week, i) => (
        <div
          key={week.weekStart.toString()}
          className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-5"
        >
          <h3 className="font-semibold mb-1">
            Semana {i + 1}, {formatWeekStart(week.weekStart)}
          </h3>
          <p className="text-sm text-neutral-500 mb-3">{week.focus}</p>
          <ul className="space-y-2">
            {week.items.map((item) => (
              <li key={item.id} className="flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={item.done}
                  disabled={pendingIds.has(item.id)}
                  onChange={(e) => toggleDone(item.id, e.target.checked)}
                  className="h-4 w-4 mt-0.5 accent-blue-600 shrink-0"
                />
                <span
                  className={`text-sm ${
                    item.done
                      ? "line-through text-neutral-400"
                      : "text-neutral-700 dark:text-neutral-300"
                  }`}
                >
                  {item.task}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

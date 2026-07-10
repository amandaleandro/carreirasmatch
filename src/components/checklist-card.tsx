"use client";

import { useState } from "react";

export function ChecklistCard({ items }: { items: string[] }) {
  const [checked, setChecked] = useState<boolean[]>(() => items.map(() => false));

  function toggle(index: number) {
    setChecked((prev) => prev.map((v, i) => (i === index ? !v : v)));
  }

  const doneCount = checked.filter(Boolean).length;

  return (
    <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">Checklist antes de aplicar</h3>
        <span className="text-xs text-neutral-500">
          {doneCount}/{items.length}
        </span>
      </div>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i}>
            <label className="flex items-start gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={checked[i]}
                onChange={() => toggle(i)}
                className="mt-0.5"
              />
              <span
                className={
                  checked[i]
                    ? "line-through text-neutral-400 dark:text-neutral-600"
                    : "text-neutral-700 dark:text-neutral-300"
                }
              >
                {item}
              </span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}

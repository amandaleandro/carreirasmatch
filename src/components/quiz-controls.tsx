"use client";

function optionClassName(checked: boolean) {
  return `flex items-center gap-2.5 rounded-xl border-2 px-3.5 py-2.5 text-sm font-medium cursor-pointer transition-all ${
    checked
      ? "border-blue-600 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 shadow-sm shadow-blue-600/10"
      : "border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-700"
  }`;
}

export function CheckboxGroup({
  options,
  selected,
  onToggle,
}: {
  options: string[];
  selected: string[];
  onToggle: (option: string) => void;
}) {
  return (
    <div className="grid sm:grid-cols-2 gap-2.5">
      {options.map((option) => {
        const checked = selected.includes(option);
        return (
          <label key={option} className={optionClassName(checked)}>
            <input
              type="checkbox"
              checked={checked}
              onChange={() => onToggle(option)}
              className="h-4 w-4 shrink-0 accent-blue-600"
            />
            {option}
          </label>
        );
      })}
    </div>
  );
}

export function RadioGroup({
  name,
  options,
  value,
  onChange,
}: {
  name: string;
  options: string[];
  value: string;
  onChange: (option: string) => void;
}) {
  return (
    <div className="grid sm:grid-cols-2 gap-2.5">
      {options.map((option) => {
        const checked = value === option;
        return (
          <label key={option} className={optionClassName(checked)}>
            <input
              type="radio"
              name={name}
              checked={checked}
              onChange={() => onChange(option)}
              className="h-4 w-4 shrink-0 accent-blue-600"
            />
            {option}
          </label>
        );
      })}
    </div>
  );
}

export function toggleInArray(list: string[], option: string) {
  return list.includes(option) ? list.filter((o) => o !== option) : [...list, option];
}

export function QuizQuestion({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-neutral-800 dark:text-neutral-200 mb-2.5">
        {label}{" "}
        {hint && <span className="text-neutral-400 font-normal">({hint})</span>}
      </label>
      {children}
    </div>
  );
}

export const QUIZ_SUBMIT_BUTTON_CLASS =
  "w-full rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition-all hover:bg-blue-700 disabled:opacity-50";

export const QUIZ_FILE_INPUT_CLASS =
  "block w-full text-sm text-neutral-500 dark:text-neutral-400 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white file:px-4 file:py-2.5 file:text-sm file:font-semibold hover:file:bg-blue-700 file:cursor-pointer file:transition-colors";

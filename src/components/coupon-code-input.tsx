"use client";

import { useState } from "react";

export function CouponCodeInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(Boolean(value));

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
      >
        Tenho um cupom de desconto
      </button>
    );
  }

  return (
    <div className="space-y-1">
      <label htmlFor="coupon-code" className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
        Cupom de desconto
      </label>
      <input
        id="coupon-code"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value.toUpperCase())}
        placeholder="Ex: MARIA10"
        className="w-full rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-3 py-2 text-sm uppercase tracking-wide"
      />
    </div>
  );
}

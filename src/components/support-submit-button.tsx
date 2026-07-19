"use client";

import { LoaderCircle } from "lucide-react";
import { useFormStatus } from "react-dom";

export function SupportSubmitButton({
  children,
  pendingLabel = "Enviando...",
  className,
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  className: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending} className={className}>
      {pending && <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" />}
      <span>{pending ? pendingLabel : children}</span>
    </button>
  );
}

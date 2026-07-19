"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export function LogoutButton({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className={
        className ??
        "flex w-full items-center gap-2 text-sm font-medium text-red-600 dark:text-red-400 hover:underline"
      }
    >
      <LogOut className="h-4 w-4 shrink-0" strokeWidth={1.75} />
      Sair
    </button>
  );
}

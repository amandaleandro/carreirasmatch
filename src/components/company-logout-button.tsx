"use client";

import { signOut } from "next-auth/react";

export function CompanyLogoutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/empresa" })}
      className="text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
    >
      Sair
    </button>
  );
}

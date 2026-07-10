"use client";

import { signOut } from "next-auth/react";

export function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
    >
      Sair
    </button>
  );
}

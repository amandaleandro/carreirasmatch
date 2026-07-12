"use client";

import { useSearchParams } from "next/navigation";
import { ResetPasswordForm } from "@/components/reset-password-form";
import { AuthShell } from "@/components/auth-shell";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  return (
    <AuthShell
      eyebrow="Nova senha"
      headline="Escolha uma nova senha."
      description="Defina uma nova senha para voltar a acessar sua conta."
      highlights={["Link seguro, válido por 1 hora"]}
    >
      <header className="mb-8 text-center lg:text-left">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Redefinir senha
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-2 text-sm">
          Crie uma nova senha para sua conta.
        </p>
      </header>

      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-950/95 shadow-lg shadow-slate-900/5 p-6 md:p-8">
        <ResetPasswordForm token={token} />
      </div>
    </AuthShell>
  );
}

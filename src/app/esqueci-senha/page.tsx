import { ForgotPasswordForm } from "@/components/forgot-password-form";
import { AuthShell } from "@/components/auth-shell";

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      eyebrow="Recuperar acesso"
      headline="Vamos te ajudar a voltar."
      description="Informe seu e-mail e enviaremos um link para você criar uma nova senha."
      highlights={[
        "Link seguro, válido por 1 hora",
        "Sem perder seu histórico e diagnósticos",
      ]}
    >
      <header className="mb-8 text-center lg:text-left">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Esqueci minha senha
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-2 text-sm">
          Enviaremos um link para redefinir sua senha por e-mail.
        </p>
      </header>

      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-950/95 shadow-lg shadow-slate-900/5 p-6 md:p-8">
        <ForgotPasswordForm />
      </div>
    </AuthShell>
  );
}

import { LoginForm } from "@/components/login-form";
import { AuthShell } from "@/components/auth-shell";

export default function LoginPage() {
  const googleEnabled = Boolean(
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
  );

  return (
    <AuthShell
      eyebrow="Bem-vindo de volta"
      headline="Continue de onde parou."
      description="Entre para ver seu diagnóstico, retomar candidaturas e continuar seu plano de carreira."
      highlights={[
        "Diagnóstico e histórico de análises",
        "Candidaturas e planos salvos",
        "Ferramentas de carreira liberadas",
      ]}
    >
      <header className="mb-8 text-center lg:text-left">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">Entrar</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-2 text-sm">
          Acesse sua conta para ver seu diagnóstico e histórico.
        </p>
      </header>

      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-950/95 shadow-lg shadow-slate-900/5 p-6 md:p-8">
        <LoginForm googleEnabled={googleEnabled} />
      </div>
    </AuthShell>
  );
}

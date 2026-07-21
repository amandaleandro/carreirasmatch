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
      <header className="mb-5 text-center lg:text-left">
        <h1 className="text-2xl font-title font-bold tracking-tight text-[#071827] dark:text-white">Entrar</h1>
        <p className="text-[#64748B] dark:text-neutral-400 mt-1 text-xs">
          Acesse sua conta para ver seu diagnóstico e histórico.
        </p>
      </header>

      <div className="rounded-2xl border border-[#E2E8F0] dark:border-neutral-800 bg-[#FFFFFF] dark:bg-neutral-950 shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-5 md:p-6">
        <LoginForm googleEnabled={googleEnabled} />
      </div>
    </AuthShell>
  );
}

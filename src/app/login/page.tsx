import { LoginForm } from "@/components/login-form";
import { BrandLogo } from "@/components/brand-logo";

export default function LoginPage() {
  const googleEnabled = Boolean(
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
  );

  return (
    <main className="max-w-sm mx-auto px-4 py-16 w-full">
      <header className="mb-8 flex flex-col items-center text-center">
        <BrandLogo heightClassName="h-9" />
        <p className="text-neutral-600 dark:text-neutral-400 mt-3 text-sm">
          Entre para ver seu diagnóstico e histórico.
        </p>
      </header>

      <LoginForm googleEnabled={googleEnabled} />
    </main>
  );
}

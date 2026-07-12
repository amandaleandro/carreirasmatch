import Link from "next/link";
import { LoginForm } from "@/components/login-form";
import { BrandLogo } from "@/components/brand-logo";

export default function LoginPage() {
  const googleEnabled = Boolean(
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
  );

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <header className="mb-8 flex flex-col items-center text-center">
          <Link href="/">
            <BrandLogo heightClassName="h-9" />
          </Link>
          <p className="text-neutral-600 dark:text-neutral-400 mt-3 text-sm">
            Entre para ver seu diagnóstico e histórico.
          </p>
        </header>

        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-950/95 shadow-lg shadow-slate-900/5 p-6 md:p-8">
          <LoginForm googleEnabled={googleEnabled} />
        </div>
      </div>
    </main>
  );
}

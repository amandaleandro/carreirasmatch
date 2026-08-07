import Link from "next/link";
import { BrandMark } from "@/components/brand-logo";

export default function NotFound() {
  return (
    <main className="flex min-h-[75vh] items-center justify-center px-6 py-16">
      <div className="card-apple w-full max-w-md p-8 text-center">
        <div className="relative mx-auto h-20 w-20">
          <BrandMark className="h-20 w-20 animate-[lost-tilt_3s_ease-in-out_infinite]" />
          <span
            aria-hidden
            className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-white text-sm shadow-sm dark:bg-slate-800"
          >
            🧭
          </span>
        </div>

        <p className="mt-6 text-6xl font-black tracking-tight text-slate-200 dark:text-slate-700">
          404
        </p>
        <h1 className="mt-1 text-xl font-extrabold text-slate-900 dark:text-slate-100">
          Essa vaga não existe (nem essa página)
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
          Procuramos em todo o currículo e não achamos esse endereço. Deve ter
          caído do processo seletivo — bora voltar pra um lugar que existe?
        </p>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-blue-700"
          >
            Voltar pro início
          </Link>
          <Link
            href="/vagas"
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Ver vagas
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes lost-tilt {
          0%, 100% { transform: rotate(-6deg); }
          50% { transform: rotate(6deg); }
        }
      `}</style>
    </main>
  );
}

"use client";

import { useEffect } from "react";
import { BrandMark } from "@/components/brand-logo";

export default function ErrorPage({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error("Erro não tratado na aplicação", error);
  }, [error]);

  return (
    <main className="flex min-h-[70vh] items-center justify-center px-6 py-16">
      <div className="card-apple w-full max-w-md p-8 text-center">
        <div className="relative mx-auto h-14 w-14">
          <BrandMark className="h-14 w-14 animate-[wobble_2.4s_ease-in-out_infinite]" />
          <span
            aria-hidden
            className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs shadow-sm dark:bg-slate-800"
          >
            😵‍💫
          </span>
        </div>
        <h1 className="mt-5 text-xl font-extrabold text-slate-900 dark:text-slate-100">
          Ih, travou aqui do nosso lado
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
          Foi mal, engasgamos em algum lugar. Seus dados estão seguros —
          respira fundo e tenta de novo.
        </p>
        <button
          type="button"
          onClick={() => unstable_retry()}
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-blue-700"
        >
          Tentar novamente
        </button>
      </div>

      <style>{`
        @keyframes wobble {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-8deg); }
          75% { transform: rotate(8deg); }
        }
      `}</style>
    </main>
  );
}

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
        <BrandMark className="mx-auto h-14 w-14" />
        <h1 className="mt-5 text-xl font-extrabold text-slate-900 dark:text-slate-100">
          Tivemos um problema
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
          Não conseguimos carregar esta página agora. Tente novamente; seus
          dados continuam seguros.
        </p>
        <button
          type="button"
          onClick={() => unstable_retry()}
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-blue-700"
        >
          Tentar novamente
        </button>
      </div>
    </main>
  );
}

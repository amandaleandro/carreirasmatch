import { BrandMark } from "@/components/brand-logo";

export default function Loading() {
  return (
    <main
      aria-busy="true"
      aria-live="polite"
      className="flex min-h-[60vh] items-center justify-center px-6 py-16"
    >
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="relative">
          <BrandMark className="h-12 w-12" />
          <span
            aria-hidden="true"
            className="absolute -inset-2 animate-ping rounded-full bg-blue-500/15"
          />
        </div>
        <div>
          <p className="font-title text-sm font-bold text-slate-900 dark:text-slate-100">
            Carregando sua experiência...
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Só um instante.
          </p>
        </div>
      </div>
    </main>
  );
}

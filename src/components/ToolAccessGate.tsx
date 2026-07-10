import Link from "next/link";

export function ToolAccessGate({ hasSegment }: { hasSegment: boolean }) {
  return (
    <main className="max-w-lg mx-auto px-4 py-16 w-full text-center">
      <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
        <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
          <rect x="5" y="10.5" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="1.6" />
          <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </div>
      <h1 className="text-xl font-bold tracking-tight">
        {hasSegment ? "Ferramenta não disponível para o seu perfil" : "Conte qual é o seu momento"}
      </h1>
      <p className="text-neutral-600 dark:text-neutral-400 mt-2">
        {hasSegment
          ? "Essa ferramenta é recomendada para outro momento de carreira. Você pode atualizar seu perfil a qualquer momento."
          : "Para liberar as ferramentas certas para você, precisamos saber o seu momento de carreira."}
      </p>
      <div className="mt-6 flex items-center justify-center gap-4">
        <Link
          href="/settings"
          className="rounded-md bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-medium px-4 py-2 text-sm"
        >
          {hasSegment ? "Atualizar meu perfil" : "Definir meu perfil"}
        </Link>
        <Link href="/tools" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
          Ver ferramentas disponíveis
        </Link>
      </div>
    </main>
  );
}

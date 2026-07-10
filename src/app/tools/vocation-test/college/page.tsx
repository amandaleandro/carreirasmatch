import Link from "next/link";
import { VOCATION_AREAS } from "@/lib/vocation-areas";

export default async function VocationCollegePage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12 w-full">
      <Link href="/tools/vocation-test" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
        ← Voltar
      </Link>
      <header className="mt-4 mb-10">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Já faço faculdade</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-2">
          Você já escolheu seu curso — vamos direto para achar sua especialização. Escolha a
          área do seu curso abaixo.
        </p>
      </header>

      <div className="grid sm:grid-cols-2 gap-4">
        {VOCATION_AREAS.map((area) => (
          <Link
            key={area.slug}
            href={`/tools/vocation-test/${area.slug}?enrolled=1`}
            className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-5 hover:border-blue-500 transition-colors"
          >
            <h2 className="font-semibold mb-1.5">{area.label}</h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">{area.description}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}

import Link from "next/link";

export function SubscriptionUpsell({
  segment,
  context = "diagnostic",
}: {
  segment: string;
  context?: "diagnostic" | "limit";
}) {
  return (
    <aside className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 shadow-sm dark:border-emerald-900 dark:bg-emerald-950/20">
      <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
        Continue evoluindo
      </p>
      <h2 className="mt-2 text-lg font-semibold">
        {context === "diagnostic"
          ? "Use este diagnóstico em todas as próximas oportunidades"
          : "Continue analisando sem esperar o próximo limite"}
      </h2>
      <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
        O plano reúne novas análises, currículo otimizado, preparação de entrevista,
        plano de ação e acompanhamento das candidaturas.
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Link
          href={`/assinar?segment=${encodeURIComponent(segment)}`}
          className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          Conhecer o plano mensal
        </Link>
        <span className="text-xs text-neutral-500">Cancele quando quiser.</span>
      </div>
    </aside>
  );
}

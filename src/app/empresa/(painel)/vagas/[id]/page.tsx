import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireCompanyPage } from "@/lib/company-auth";
import { parseStoredMatches, hydrateMatches } from "@/lib/company-vaga";
import { VagaMatches } from "@/components/vaga-matches";
import { VagaActions } from "@/components/vaga-actions";

export const dynamic = "force-dynamic";

export default async function VagaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { company } = await requireCompanyPage();
  const { id } = await params;

  const vaga = await prisma.companyVaga.findFirst({
    where: { id, companyId: company.id },
  });
  if (!vaga) notFound();

  const stored = parseStoredMatches(vaga.matchesJson);
  const matches = await hydrateMatches(company.id, stored);

  return (
    <div>
      <div className="max-w-3xl mx-auto px-4 md:px-8 py-10 space-y-6">
        <Link href="/empresa/vagas" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
          ← Voltar para vagas
        </Link>

        <header className="space-y-3">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{vaga.title}</h1>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                    vaga.status === "closed"
                      ? "bg-neutral-200 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
                      : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
                  }`}
                >
                  {vaga.status === "closed" ? "Fechada" : "Aberta"}
                </span>
              </div>
              {[vaga.area, vaga.state].filter(Boolean).length > 0 && (
                <p className="text-sm text-neutral-500 mt-1">{[vaga.area, vaga.state].filter(Boolean).join(" / ")}</p>
              )}
            </div>
            <VagaActions vagaId={vaga.id} status={vaga.status} />
          </div>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 whitespace-pre-line leading-relaxed">
            {vaga.description}
          </p>
        </header>

        <VagaMatches
          vagaId={vaga.id}
          jobTitle={vaga.title}
          initialMatches={matches}
          lastMatchedAt={vaga.lastMatchedAt ? vaga.lastMatchedAt.toISOString() : null}
        />
      </div>
    </div>
  );
}

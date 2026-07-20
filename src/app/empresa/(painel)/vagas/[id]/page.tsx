import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireCompanyPage } from "@/lib/company-auth";
import { parseStoredMatches, hydrateMatches } from "@/lib/company-vaga";
import { VagaMatches } from "@/components/vaga-matches";

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

        <header>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{vaga.title}</h1>
          {[vaga.area, vaga.state].filter(Boolean).length > 0 && (
            <p className="text-sm text-neutral-500 mt-1">{[vaga.area, vaga.state].filter(Boolean).join(" / ")}</p>
          )}
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-3 whitespace-pre-line leading-relaxed">
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

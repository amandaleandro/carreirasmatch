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

  // Candidaturas recebidas pelo feed (quando a vaga está publicada).
  const applications = await prisma.companyJobApplication.findMany({
    where: { vagaId: vaga.id },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true, phone: true, professionalArea: true, city: true, state: true } },
    },
  });

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
                {vaga.publishedToFeed && vaga.status !== "closed" && (
                  <span className="shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
                    No feed
                  </span>
                )}
              </div>
              {[vaga.area, vaga.state].filter(Boolean).length > 0 && (
                <p className="text-sm text-neutral-500 mt-1">{[vaga.area, vaga.state].filter(Boolean).join(" / ")}</p>
              )}
            </div>
            <VagaActions vagaId={vaga.id} status={vaga.status} publishedToFeed={vaga.publishedToFeed} />
          </div>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 whitespace-pre-line leading-relaxed">
            {vaga.description}
          </p>
        </header>

        {vaga.publishedToFeed && (
          <section className="space-y-3">
            <h2 className="font-semibold">
              Candidaturas pelo feed {applications.length > 0 && `(${applications.length})`}
            </h2>
            {applications.length === 0 ? (
              <p className="text-sm text-neutral-500">
                Ninguém se candidatou ainda. Sua vaga está no feed público de vagas dos candidatos.
              </p>
            ) : (
              <ul className="space-y-3">
                {applications.map((a) => (
                  <li key={a.id} className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-5">
                    <h3 className="font-semibold">{a.user.name || "Candidato"}</h3>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      {[a.user.professionalArea, [a.user.city, a.user.state].filter(Boolean).join("/")]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                    <div className="mt-2 text-sm text-neutral-700 dark:text-neutral-300 space-y-0.5">
                      {a.user.email && <p>{a.user.email}</p>}
                      {a.user.phone && <p>{a.user.phone}</p>}
                    </div>
                    {a.message && (
                      <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400 whitespace-pre-line">{a.message}</p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

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

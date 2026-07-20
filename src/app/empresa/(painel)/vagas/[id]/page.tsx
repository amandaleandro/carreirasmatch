import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireCompanyPage } from "@/lib/company-auth";
import { parseStoredMatches, hydrateMatches } from "@/lib/company-vaga";
import { VagaMatches } from "@/components/vaga-matches";
import { VagaActions } from "@/components/vaga-actions";
import { vagaAttributeChips } from "@/lib/vaga-fields";
import { VagaApplications } from "@/components/vaga-applications";

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
              {vagaAttributeChips(vaga).length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {vagaAttributeChips(vaga).map((chip) => (
                    <span key={chip} className="rounded-full bg-neutral-100 dark:bg-neutral-800 px-2.5 py-0.5 text-xs font-medium text-neutral-600 dark:text-neutral-300">
                      {chip}
                    </span>
                  ))}
                </div>
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
              <VagaApplications
                applications={applications.map((a) => ({
                  id: a.id,
                  name: a.user.name || "",
                  email: a.user.email || "",
                  phone: a.user.phone || "",
                  area: a.user.professionalArea || "",
                  city: a.user.city || "",
                  state: a.user.state || "",
                  message: a.message,
                  status: a.status,
                  note: a.note,
                  createdAt: a.createdAt.toISOString(),
                }))}
              />
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

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PublicSiteHeader } from "@/components/public-site-header";
import { SiteFooter } from "@/components/site-footer";
import { vagaAttributeChips } from "@/lib/vaga-fields";

export const dynamic = "force-dynamic";

async function loadCompany(slug: string) {
  return prisma.company.findFirst({
    where: { slug, publicProfile: true },
    select: {
      id: true,
      name: true,
      description: true,
      logoUrl: true,
      city: true,
      state: true,
      vagas: {
        where: { publishedToFeed: true, status: "open" },
        orderBy: { createdAt: "desc" },
        select: { id: true, title: true, area: true, state: true, workModel: true, seniority: true, jobType: true, salaryMin: true },
      },
    },
  });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const company = await loadCompany(slug);
  if (!company) return { title: "Empresa não encontrada" };
  return {
    title: `${company.name} — vagas e perfil`,
    description: company.description.slice(0, 160) || `Vagas abertas e perfil de ${company.name}.`,
    alternates: { canonical: `/empresas/${slug}` },
  };
}

export default async function CompanyPublicProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const company = await loadCompany(slug);
  if (!company) notFound();

  const location = [company.city, company.state].filter(Boolean).join(" / ");

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950">
      <PublicSiteHeader />
      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 md:px-8 py-10 space-y-8">
          <header className="flex items-start gap-4">
            {company.logoUrl && /^https?:\/\//i.test(company.logoUrl) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={company.logoUrl} alt={company.name} className="h-16 w-16 rounded-2xl object-cover border border-neutral-200 dark:border-neutral-800" />
            ) : (
              <span className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center text-2xl font-bold">
                {company.name.slice(0, 1).toUpperCase()}
              </span>
            )}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{company.name}</h1>
              {location && (
                <p className="flex items-center gap-1.5 text-sm text-neutral-500 mt-1">
                  <MapPin className="h-4 w-4" strokeWidth={1.75} /> {location}
                </p>
              )}
            </div>
          </header>

          {company.description && (
            <p className="text-sm text-neutral-700 dark:text-neutral-300 whitespace-pre-line leading-relaxed">
              {company.description}
            </p>
          )}

          <section className="space-y-3">
            <h2 className="font-semibold">Vagas abertas {company.vagas.length > 0 && `(${company.vagas.length})`}</h2>
            {company.vagas.length === 0 ? (
              <p className="text-sm text-neutral-500">Nenhuma vaga aberta no momento.</p>
            ) : (
              <ul className="space-y-3">
                {company.vagas.map((vaga) => (
                  <li key={vaga.id}>
                    <Link
                      href={`/vagas/empresa/${vaga.id}`}
                      className="block rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-5 hover:border-blue-400 dark:hover:border-blue-700 transition-colors"
                    >
                      <h3 className="font-semibold">{vaga.title}</h3>
                      {[vaga.area, vaga.state].filter(Boolean).length > 0 && (
                        <p className="text-sm text-neutral-500 mt-0.5">{[vaga.area, vaga.state].filter(Boolean).join(" / ")}</p>
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
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

import type { Metadata } from "next";
import type { Prisma } from "@/generated/prisma/client";
import Link from "next/link";
import { Search, Filter, GraduationCap } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ContentPage } from "@/components/content-page";
import { RadarList } from "@/components/radar-list";
import { Pagination } from "@/components/Pagination";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Radar de Vestibulares, ENEM & Sisu | CarreirasMatch",
  description:
    "Acompanhe os vestibulares mais recentes: novos editais, inscrições, ENEM, Sisu, ProUni e bolsas, reunidos em um só lugar.",
  alternates: { canonical: "/vestibulares" },
};

const PAGE_SIZE = 20;

export default async function VestibularesRadarPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const params = await searchParams;
  const q = params.q?.trim() || "";
  const page = Math.max(1, Number(params.page) || 1);

  const where: Prisma.RadarItemWhereInput = {
    kind: "vestibular",
    active: true,
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { summary: { contains: q, mode: "insensitive" } },
            { source: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [items, totalItems] = await Promise.all([
    prisma.radarItem.findMany({
      where,
      orderBy: [{ publishedAt: "desc" }, { lastSeenAt: "desc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.radarItem.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));

  return (
    <ContentPage
      eyebrow="Radar de Vestibulares"
      title="Novos Vestibulares, ENEM & Processos Seletivos"
      description="Vestibulares, ENEM, Sisu, ProUni e bolsas mais recentes, reunidos automaticamente de fontes especializadas."
      maxWidthClass="max-w-6xl"
    >
      <div className="space-y-6">
        {/* Search Bar Form */}
        <form className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 p-4 sm:p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
            <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Pesquisar Vestibulares & Exames
            </span>
            {q && (
              <Link href="/vestibulares" className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold">
                Limpar pesquisa ({totalItems} resultado(s))
              </Link>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative min-w-0 flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                name="q"
                defaultValue={q}
                placeholder="Digite a universidade, prova, ENEM, Sisu ou palavra-chave..."
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 pl-10 pr-4 py-2.5 text-sm outline-none focus:border-blue-500 text-slate-900 dark:text-white placeholder:text-slate-400 transition-all"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 text-sm font-semibold transition-colors shadow-md shadow-blue-500/20 inline-flex items-center justify-center gap-2 shrink-0"
            >
              <Filter className="w-4 h-4" />
              <span>Pesquisar</span>
            </button>
          </div>
        </form>

        {/* Content Section */}
        <RadarList
          items={items}
          emptyLabel={
            q
              ? `Nenhum vestibular encontrado para "${q}". Tente buscar por outros termos.`
              : "Ainda não há vestibulares no radar. O conteúdo é atualizado automaticamente ao longo do dia."
          }
        />

        {totalPages > 1 && (
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <Pagination page={page} totalPages={totalPages} basePath="/vestibulares" searchParams={{ q }} />
          </div>
        )}
      </div>
    </ContentPage>
  );
}

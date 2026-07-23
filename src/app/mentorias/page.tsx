import type { Metadata } from "next";
import Link from "next/link";
import { Video, Sparkles, Filter, PlayCircle, BookOpen } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ContentPage } from "@/components/content-page";
import { VideoCard } from "@/components/video-card";
import { Pagination } from "@/components/Pagination";

const VIDEOS_PER_PAGE = 12;

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Vídeos Educativos & Mentorias Gratuitas | CarreirasMatch",
  description:
    "Assista a vídeos educativos, mentorias e cursos gratuitos sobre carreira, tecnologia, idiomas, finanças e desenvolvimento profissional.",
  alternates: { canonical: "/mentorias" },
};

export default async function MentoriasPage({
  searchParams,
}: {
  searchParams: Promise<{ area?: string; page?: string }>;
}) {
  const { area = "", page: pageParam } = await searchParams;
  const where = { active: true, ...(area ? { area } : {}) };
  const parsedPage = Number.parseInt(pageParam ?? "1", 10);
  const total = await prisma.careerVideo.count({ where });
  const totalPages = Math.max(1, Math.ceil(total / VIDEOS_PER_PAGE));
  const page = Math.min(Math.max(Number.isNaN(parsedPage) ? 1 : parsedPage, 1), totalPages);

  const [videos, areas] = await Promise.all([
    prisma.careerVideo.findMany({
      where,
      orderBy: [{ publishedAt: "desc" }, { title: "asc" }],
      skip: (page - 1) * VIDEOS_PER_PAGE,
      take: VIDEOS_PER_PAGE,
    }),
    prisma.careerVideo.findMany({
      where: { active: true },
      distinct: ["area"],
      select: { area: true },
      orderBy: { area: "asc" },
    }),
  ]);

  return (
    <ContentPage
      eyebrow="Biblioteca de Conteúdo & Treinamento"
      title="Vídeos & Mentorias para Evolução Profissional"
      description="Conteúdo educativo gratuito e selecionado sobre carreira, tecnologia, finanças, idiomas, soft skills e inteligência artificial."
      maxWidthClass="max-w-6xl"
    >
      <div className="space-y-8">
        {/* Banner de estatística rápida */}
        <div className="rounded-2xl border border-blue-200 dark:border-blue-900/60 bg-gradient-to-r from-blue-500/10 via-indigo-500/5 to-transparent p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
              <Video className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 dark:text-white text-base">
                  Mentorias e Aulas Gratuitas
                </span>
                <span className="rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2.5 py-0.5 text-xs font-semibold">
                  100% Grátis
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                {total} conteúdo(s) de alta qualidade disponíveis para assistir agora.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/cursos-gratuitos"
              className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 px-4 py-2 text-xs sm:text-sm font-semibold transition-colors inline-flex items-center gap-1.5 shadow-2xs"
            >
              <BookOpen className="w-4 h-4 text-blue-500" />
              <span>Ver Cursos Verificados</span>
            </Link>
          </div>
        </div>

        {/* Categorias Pills Bar */}
        {areas.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5" />
                Filtrar por Área de Interesse:
              </span>
              {area && (
                <Link href="/mentorias" className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">
                  Limpar filtro ({area})
                </Link>
              )}
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              <Link
                href="/mentorias"
                className={`rounded-full px-4 py-2 text-xs sm:text-sm font-medium transition-all ${
                  !area
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/25 ring-2 ring-blue-600/30"
                    : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-slate-50 dark:hover:bg-slate-800/80"
                }`}
              >
                Todas as áreas
              </Link>
              {areas.map((item) => {
                const isActive = area === item.area;
                return (
                  <Link
                    key={item.area}
                    href={`/mentorias?area=${encodeURIComponent(item.area)}`}
                    className={`rounded-full px-4 py-2 text-xs sm:text-sm font-medium transition-all ${
                      isActive
                        ? "bg-blue-600 text-white shadow-md shadow-blue-500/25 ring-2 ring-blue-600/30"
                        : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-slate-50 dark:hover:bg-slate-800/80"
                    }`}
                  >
                    {item.area}
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Content Section: Videos Grid or Empty State */}
        {videos.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-10 text-center shadow-2xs space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto shadow-inner">
              <PlayCircle className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Nenhum vídeo nesta categoria no momento
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
                O conteúdo de mentorias é atualizado periodicamente. Tente selecionar outra área ou limpar os filtros.
              </p>
            </div>

            <div className="pt-2">
              <Link
                href="/mentorias"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 text-sm transition-colors shadow-md shadow-blue-500/20"
              >
                Ver todos os vídeos
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {videos.map((video) => (
                <VideoCard
                  key={video.id}
                  videoId={video.videoId}
                  title={video.title}
                  channel={video.channel}
                  area={video.area}
                  subarea={video.subarea}
                  thumbnail={video.thumbnail}
                  durationSec={video.durationSec}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  basePath="/mentorias"
                  searchParams={{ area }}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </ContentPage>
  );
}

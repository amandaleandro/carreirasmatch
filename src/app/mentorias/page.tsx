import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ContentPage } from "@/components/content-page";
import { VideoCard } from "@/components/video-card";
import { Pagination } from "@/components/Pagination";

const VIDEOS_PER_PAGE = 12;

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Vídeos educativos e mentorias gratuitos | CarreirasMatch",
  description: "Assista a vídeos educativos, mentorias e cursos gratuitos sobre carreira, tecnologia, idiomas, finanças e desenvolvimento profissional.",
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
      eyebrow="Mentorias"
      title="Vídeos para aprender e evoluir"
      description="Conteúdo educativo gratuito do YouTube sobre carreira, tecnologia, idiomas, finanças, comunicação, estudos e outras habilidades úteis."
      wide
    >
      {areas.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <a
            href="/mentorias"
            className={`rounded-full border px-4 py-1.5 text-sm font-medium ${area === "" ? "border-blue-600 bg-blue-600 text-white" : "border-neutral-300 dark:border-neutral-700"}`}
          >
            Todas
          </a>
          {areas.map((item) => (
            <a
              key={item.area}
              href={`/mentorias?area=${encodeURIComponent(item.area)}`}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium ${area === item.area ? "border-blue-600 bg-blue-600 text-white" : "border-neutral-300 dark:border-neutral-700"}`}
            >
              {item.area}
            </a>
          ))}
        </div>
      )}

      {videos.length === 0 ? (
        <p className="mt-8 text-sm text-neutral-500">
          Ainda não há vídeos disponíveis. O conteúdo é atualizado automaticamente a partir do YouTube.
        </p>
      ) : (
        <>
          <p className="mt-5 text-sm text-neutral-500">{total} vídeo(s) encontrado(s).</p>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {videos.map((video) => (
              <VideoCard
                key={video.id}
                videoId={video.videoId}
                title={video.title}
                channel={video.channel}
                area={video.area}
                thumbnail={video.thumbnail}
                durationSec={video.durationSec}
              />
            ))}
          </div>
          <div className="mt-8">
            <Pagination
              page={page}
              totalPages={totalPages}
              basePath="/mentorias"
              searchParams={{ area }}
            />
          </div>
        </>
      )}
    </ContentPage>
  );
}

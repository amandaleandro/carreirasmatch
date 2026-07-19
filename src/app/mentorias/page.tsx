import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ContentPage } from "@/components/content-page";
import { VideoCard } from "@/components/video-card";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Mentorias e vídeos de carreira gratuitos | CarreirasMatch",
  description: "Assista a mentorias e cursos gratuitos de carreira, entrevista, currículo e concursos, selecionados do YouTube.",
  alternates: { canonical: "/mentorias" },
};

export default async function MentoriasPage({
  searchParams,
}: {
  searchParams: Promise<{ area?: string }>;
}) {
  const { area = "" } = await searchParams;
  const videos = await prisma.careerVideo.findMany({
    where: { active: true, ...(area ? { area } : {}) },
    orderBy: [{ area: "asc" }, { publishedAt: "desc" }],
    take: 120,
  });
  const areas = await prisma.careerVideo.findMany({
    where: { active: true },
    distinct: ["area"],
    select: { area: true },
    orderBy: { area: "asc" },
  });

  return (
    <ContentPage
      eyebrow="Mentorias"
      title="Mentorias e vídeos de carreira"
      description="Conteúdo gratuito selecionado do YouTube para você evoluir na carreira — mentoria, entrevista, currículo, concursos e mais."
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
          <p className="mt-5 text-sm text-neutral-500">{videos.length} vídeo(s) encontrado(s).</p>
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
        </>
      )}
    </ContentPage>
  );
}

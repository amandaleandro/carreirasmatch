import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/require-auth";
import { fetchJobFromUrl } from "@/lib/scrape-job";
import { classifyJobForStorage } from "@/lib/feed-tags";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { session, response } = await requireAuth();
    if (!session) return response!;

    const { url } = (await req.json()) as { url?: string };
    if (!url || !url.trim()) {
      return NextResponse.json({ error: "Informe o link da vaga." }, { status: 400 });
    }

    const existing = await prisma.job.findUnique({ where: { url: url.trim() } });
    if (existing) {
      return NextResponse.json({ job: existing });
    }

    const scraped = await fetchJobFromUrl(url.trim());
    if ("error" in scraped) {
      return NextResponse.json({ error: scraped.error }, { status: 422 });
    }

    const job = await prisma.job.create({
      data: {
        url: url.trim(),
        jobTitle: scraped.jobTitle,
        jobText: scraped.jobText,
        location: scraped.location,
        addedByUserId: session.user.id,
        ...classifyJobForStorage({
          jobTitle: scraped.jobTitle,
          jobText: scraped.jobText,
          url: url.trim(),
          location: scraped.location,
        }),
      },
    });

    return NextResponse.json({ job });
  } catch (error) {
    console.error("Erro ao adicionar vaga ao feed:", error);
    return NextResponse.json(
      { error: "Erro ao processar o link. Tente novamente." },
      { status: 500 }
    );
  }
}

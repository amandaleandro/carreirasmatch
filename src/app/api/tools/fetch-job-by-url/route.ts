import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/require-auth";
import { fetchJobFromUrl } from "@/lib/scrape-job";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { session, response } = await requireAuth();
    if (!session) return response!;

    const { url } = (await req.json()) as { url?: string };
    if (!url || !url.trim()) {
      return NextResponse.json({ error: "Informe o link da vaga." }, { status: 400 });
    }

    const cleanUrl = url.trim();

    // Check if we already have it cached in database
    const existing = await prisma.job.findUnique({
      where: { url: cleanUrl },
      select: { jobTitle: true, company: true, jobText: true, location: true },
    });

    if (existing) {
      return NextResponse.json({
        success: true,
        jobTitle: existing.jobTitle,
        companyName: existing.company || "",
        description: existing.jobText,
        location: existing.location || "",
      });
    }

    // Otherwise scrape directly from web URL
    const scraped = await fetchJobFromUrl(cleanUrl);
    if ("error" in scraped) {
      return NextResponse.json({ error: scraped.error }, { status: 422 });
    }

    return NextResponse.json({
      success: true,
      jobTitle: scraped.jobTitle,
      companyName: "",
      description: scraped.jobText,
      location: scraped.location || "",
    });
  } catch (error) {
    console.error("Erro ao puxar dados da vaga por URL:", error);
    return NextResponse.json(
      { error: "Erro ao processar o link da vaga. Verifique a URL e tente novamente." },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/require-auth";
import { prisma } from "@/lib/prisma";
import { extractJobSearchKeywords } from "@/lib/tools";
import { fetchNewJobsFromAllSources } from "@/lib/job-sources";
import { JobSearchTerms } from "@/lib/job-sources/types";
import { normalizeCareerSegment } from "@/lib/career-segments";

const INTERNSHIP_KEYWORDS = ["estágio", "estagiário", "internship"];
const INTERNSHIP_SEGMENTS = new Set(["internship", "student", "apprentice"]);

export async function POST(req: NextRequest) {
  try {
    const { session, response } = await requireAuth();
    if (!session) return response!;

    const [resume, user] = await Promise.all([
      prisma.resume.findFirst({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: { careerSegment: true },
      }),
    ]);

    let searchTerms: JobSearchTerms | undefined;
    if (resume) {
      try {
        searchTerms = await extractJobSearchKeywords(resume.rawText);
      } catch (error) {
        console.error("Erro ao extrair palavras-chave do currículo:", error);
      }
    }

    const segment = normalizeCareerSegment(user?.careerSegment);
    if (searchTerms && segment && INTERNSHIP_SEGMENTS.has(segment)) {
      searchTerms = {
        ...searchTerms,
        keywords: Array.from(new Set([...searchTerms.keywords, ...INTERNSHIP_KEYWORDS])),
      };
    }

    const userIp = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || "";

    const { added, errors } = await fetchNewJobsFromAllSources(searchTerms, { userIp, userAgent });
    return NextResponse.json({ added, errors });
  } catch (error) {
    console.error("Erro ao buscar novas vagas:", error);
    return NextResponse.json(
      { error: "Erro ao buscar novas vagas. Tente novamente." },
      { status: 500 }
    );
  }
}

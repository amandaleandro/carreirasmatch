import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { analyzeResumeAgainstJob, extractStructuredResume, CareerTrack, StructuredResume } from "@/lib/groq";
import { canViewFullDiagnostic, hasActiveSubscriptionAccess } from "@/lib/entitlements";
import { toAnalysisTeaser } from "@/lib/analysis-teaser";
import { normalizeCareerSegment, tracksForSegment } from "@/lib/career-segments";
import { CAREER_OFFER_BY_SEGMENT } from "@/lib/career-offers";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { analysisTotal, analysisDuration } from "@/lib/metrics";
import {
  FREE_ANALYSIS_DAILY_LIMIT,
  FREE_ANALYSIS_MONTHLY_LIMIT,
  getFreeAnalysisAllowance,
} from "@/lib/free-analysis-limit";

import { PDFParse } from "pdf-parse";

const MAX_RESUME_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ANONYMOUS_ANALYSIS_LIMIT = { limit: 10, windowMs: 60 * 60 * 1000 };

const VALID_TRACKS: CareerTrack[] = [
  "internship",
  "career_change",
  "reemployment",
  "growth",
  "apprentice",
];

export async function POST(req: NextRequest) {
  // Cronômetro do histograma; as labels são definidas ao observar (no fim).
  const stopTimer = analysisDuration.startTimer();
  try {
    const session = await auth();
    const userId = session?.user?.id ?? null;
    const hasPaidAccess = userId ? await hasActiveSubscriptionAccess(userId) : false;

    if (!userId) {
      const rateLimit = checkRateLimit(`anon-analyze:${getClientIp(req)}`, ANONYMOUS_ANALYSIS_LIMIT);
      if (!rateLimit.allowed) {
        return NextResponse.json(
          { error: "Muitas análises por aqui. Crie uma conta gratuita para continuar analisando." },
          { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
        );
      }
    } else if (!hasPaidAccess) {
      const ipLimit = checkRateLimit(
        `free-user-analyze:${getClientIp(req)}`,
        ANONYMOUS_ANALYSIS_LIMIT
      );
      if (!ipLimit.allowed) {
        return NextResponse.json(
          { error: "Muitas análises por este acesso. Aguarde um pouco e tente novamente." },
          { status: 429, headers: { "Retry-After": String(ipLimit.retryAfterSeconds) } }
        );
      }

      const allowance = await getFreeAnalysisAllowance(userId);
      if (!allowance.allowed) {
        const error =
          allowance.reason === "monthly"
            ? `Você já usou as ${FREE_ANALYSIS_MONTHLY_LIMIT} análises gratuitas deste mês. Assine para continuar analisando sem esse limite.`
            : `Você já usou as ${FREE_ANALYSIS_DAILY_LIMIT} análises gratuitas de hoje. Tente novamente amanhã ou assine para continuar.`;
        return NextResponse.json(
          {
            error,
            code: allowance.reason === "monthly"
              ? "FREE_MONTHLY_ANALYSIS_LIMIT"
              : "FREE_DAILY_ANALYSIS_LIMIT",
            dailyUsed: allowance.dailyUsed,
            monthlyUsed: allowance.monthlyUsed,
          },
          {
            status: 429,
            headers: { "Retry-After": String(allowance.retryAfterSeconds) },
          }
        );
      }
    }

    const formData = await req.formData();
    const file = formData.get("resume") as File | null;
    const resumeId = formData.get("resumeId") as string | null;
    const jobTitle = formData.get("jobTitle") as string | null;
    const jobText = formData.get("jobText") as string | null;
    const careerTrack = formData.get("careerTrack") as CareerTrack | null;
    const pastFeedback = (formData.get("pastFeedback") as string | null) ?? "";

    if (
      (!file && !resumeId) ||
      !jobTitle ||
      !jobText ||
      !careerTrack ||
      !VALID_TRACKS.includes(careerTrack)
    ) {
      return NextResponse.json(
        {
          error:
            "Envie o currículo (PDF), o cargo desejado, o texto da vaga e seu momento profissional.",
        },
        { status: 400 }
      );
    }

    if (file && file.size > MAX_RESUME_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: "O arquivo do currículo deve ter no máximo 5MB." },
        { status: 413 }
      );
    }

    let existingResume: { id: string; fileName: string; rawText: string } | null = null;
    let resumeText: string;
    let pdfBuffer: Buffer | null = null;
    let carriedResumeStructured: StructuredResume | null = null;

    if (resumeId) {
      if (!userId) {
        return NextResponse.json(
          { error: "Faça login para reutilizar um currículo salvo." },
          { status: 401 }
        );
      }
      existingResume = await prisma.resume.findUnique({
        where: { id: resumeId, userId },
      });
      if (!existingResume) {
        return NextResponse.json(
          { error: "Currículo não encontrado." },
          { status: 404 }
        );
      }
      resumeText = existingResume.rawText;

      const lastEditedAnalysis = await prisma.analysis.findFirst({
        where: { resumeId: existingResume.id, resumeOverride: { not: null } },
        orderBy: { createdAt: "desc" },
        select: { resumeOverride: true, currentSummary: true },
      });
      if (lastEditedAnalysis?.resumeOverride) {
        try {
          const parsedOverride = JSON.parse(lastEditedAnalysis.resumeOverride);
          if (parsedOverride.resumeStructured) {
            carriedResumeStructured = parsedOverride.resumeStructured as StructuredResume;
          }
        } catch {
          // ignore malformed override, fall back to fresh AI extraction
        }
      }
    } else {
      pdfBuffer = Buffer.from(await file!.arrayBuffer());
      const parser = new PDFParse({ data: pdfBuffer });
      const parsed = await parser.getText();
      await parser.destroy();
      resumeText = parsed.text.trim();
    }

    if (!resumeText) {
      return NextResponse.json(
        { error: "Não foi possível extrair texto do PDF enviado." },
        { status: 422 }
      );
    }

    const [candidate, userCourses] = userId
      ? await Promise.all([
          prisma.user.findUnique({
            where: { id: userId },
            select: { professionalArea: true, hasFormalEducation: true, careerSegment: true },
          }),
          prisma.userCourse.findMany({
            where: { userId },
            select: { title: true, provider: true },
          }),
        ])
      : [null, []];

    // Paid users must be analyzed under the "momento profissional" set on their profile,
    // regardless of what the client submitted (the form UI already enforces this, but a
    // tampered/stale request should not be able to bypass it).
    let effectiveCareerTrack: CareerTrack = careerTrack;
    if (userId && candidate && hasPaidAccess) {
      const allowedTracks = tracksForSegment(candidate.careerSegment) as CareerTrack[] | null;
      if (allowedTracks && allowedTracks.length > 0 && !allowedTracks.includes(careerTrack)) {
        effectiveCareerTrack = allowedTracks[0];
      }
    }

    const [analysis, freshResumeStructured] = await Promise.all([
      analyzeResumeAgainstJob(
        resumeText,
        jobTitle,
        jobText,
        effectiveCareerTrack,
        pastFeedback,
        {
          professionalArea: candidate?.professionalArea ?? null,
          hasFormalEducation: candidate?.hasFormalEducation ?? null,
          courses: userCourses.map((c) => (c.provider ? `${c.title} (${c.provider})` : c.title)),
        }
      ),
      // Skip the extraction call entirely when we already have a carried-forward structured resume to reuse.
      carriedResumeStructured ? Promise.resolve(null) : extractStructuredResume(resumeText),
    ]);

    const resume =
      existingResume ??
      (await prisma.resume.create({
        data: {
          fileName: file!.name,
          rawText: resumeText,
          pdfData: pdfBuffer ? new Uint8Array(pdfBuffer) : null,
          userId,
        },
      }));

    const saved = await prisma.analysis.create({
      data: {
        resumeId: resume.id,
        careerTrack: effectiveCareerTrack,
        jobTitle,
        jobText,
        overallScore: analysis.overallScore,
        technicalScore: analysis.technicalScore,
        experienceScore: analysis.experienceScore,
        seniorityScore: analysis.seniorityScore,
        atsScore: analysis.atsScore,
        applicationStatus: analysis.applicationStatus,
        applicationStatusReason: analysis.applicationStatusReason,
        keywordsFound: JSON.stringify(analysis.keywordsFound),
        keywordsMissing: JSON.stringify(analysis.keywordsMissing),
        suggestedSummary: analysis.suggestedSummary,
        strengths: JSON.stringify(analysis.strengths),
        weaknesses: JSON.stringify(analysis.weaknesses),
        fixes: JSON.stringify(analysis.fixes),
        interviewQuestions: JSON.stringify(analysis.interviewQuestions),
        studyPlan: JSON.stringify(analysis.studyPlan),
        talkAboutYourselfAnswer: analysis.talkAboutYourselfAnswer ?? null,
        transferableSkills: analysis.transferableSkills
          ? JSON.stringify(analysis.transferableSkills)
          : null,
        transitionNarrative: analysis.transitionNarrative ?? null,
        whyCareerChangeAnswer: analysis.whyCareerChangeAnswer ?? null,
        bridgeRoles: analysis.bridgeRoles
          ? JSON.stringify(analysis.bridgeRoles)
          : null,
        recruiterMessage: analysis.recruiterMessage,
        alternativeRoles: JSON.stringify(analysis.alternativeRoles ?? []),
        recruiterObjections: analysis.recruiterObjections
          ? JSON.stringify(analysis.recruiterObjections)
          : null,
        applicationStrategy: analysis.applicationStrategy ?? null,
        weeklyApplicationPlan: analysis.weeklyApplicationPlan
          ? JSON.stringify(analysis.weeklyApplicationPlan)
          : null,
        pastFeedback: pastFeedback.trim() || null,
        feedbackAnalysis: analysis.feedbackAnalysis ?? null,
        experienceSuggestions: JSON.stringify(analysis.experienceSuggestions ?? []),
        atsChecklist: JSON.stringify(analysis.atsChecklist ?? []),
        currentSummary: analysis.currentSummary ?? "",
        resumeStructured: JSON.stringify(
          carriedResumeStructured ??
            freshResumeStructured ?? {
              contact: { name: "", email: "", phone: "", location: "", linkedin: "", github: "", portfolio: "" },
              education: [],
              skills: [],
              languages: [],
              certifications: [],
              experiences: [],
            }
        ),
      },
    });

    stopTimer({ career_track: effectiveCareerTrack, outcome: "success" });
    analysisTotal.inc({
      career_track: effectiveCareerTrack,
      logged_in: String(Boolean(userId)),
      outcome: "success",
    });

    const unlocked = userId ? await canViewFullDiagnostic(userId, saved.id) : false;
    const segment = normalizeCareerSegment(candidate?.careerSegment);
    const diagnosticPrice = segment ? CAREER_OFFER_BY_SEGMENT[segment].diagnosticPrice : "R$4,90";

    return NextResponse.json({
      id: saved.id,
      unlocked,
      loggedIn: Boolean(userId),
      diagnosticPrice,
      ...(unlocked ? analysis : toAnalysisTeaser(analysis)),
    });
  } catch (error) {
    stopTimer({ outcome: "error" });
    analysisTotal.inc({ outcome: "error" });
    console.error("Erro ao analisar currículo:", error);

    // 429 = rate limit por minuto; 413 = requisição grande demais para o TPM.
    // A camada multi-provedor já tenta outros provedores antes de chegar aqui;
    // se ainda assim falhar (todos no limite), devolve mensagem amigável.
    const status =
      error && typeof error === "object" && "status" in error
        ? (error as { status?: number }).status
        : undefined;
    if (status === 429 || status === 413) {
      return NextResponse.json(
        {
          error:
            "No momento a análise por IA está com muita demanda. Aguarde alguns instantes e tente novamente.",
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: "Erro ao processar a análise. Tente novamente." },
      { status: 500 }
    );
  }
}

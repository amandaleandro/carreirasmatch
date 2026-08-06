import { NextRequest, NextResponse } from "next/server";
import { requireToolSegmentAccess } from "@/lib/require-auth";
import { reserveFeatureForSession } from "@/lib/feature-access";
import { COMMERCIAL_FEATURE_KEYS } from "@/lib/commercial-plan-catalog";
import { analyzeGithub } from "@/lib/tools";
import {
  GithubProfileError,
  fetchGithubProfileText,
  parseGithubUsername,
} from "@/lib/github-profile";
import { checkRateLimit } from "@/lib/rate-limit";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const { session, response: authResponse } = await requireToolSegmentAccess("/tools/github-review");
  if (!session) return authResponse!;

  const saved = await prisma.toolReviewResult.findUnique({
    where: { userId_type: { userId: session.user.id, type: "github" } },
  });
  if (!saved) return NextResponse.json({ result: null });

  return NextResponse.json({ result: JSON.parse(saved.result), updatedAt: saved.updatedAt });
}

// Buscar o perfil consome a cota da API do GitHub, que é do servidor inteiro
// (60/h sem GITHUB_TOKEN). Limita por usuário para um não derrubar os outros.
const PROFILE_FETCH_LIMIT = { limit: 10, windowMs: 15 * 60 * 1000 };

export async function POST(req: NextRequest) {
  const { session, response: authResponse } = await requireToolSegmentAccess("/tools/github-review");
  if (!session) return authResponse!;

  const { allowed, response: quotaResponse, release } = await reserveFeatureForSession(
    session.user.id,
    COMMERCIAL_FEATURE_KEYS.githubAnalysis
  );
  if (!allowed) return quotaResponse!;

  try {
    const { githubUrl, githubText, targetRole } = await req.json();

    let profileText: string = githubText ?? "";

    if (githubUrl?.trim()) {
      const username = parseGithubUsername(githubUrl);
      if (!username) {
        await release.cancel();
        return NextResponse.json(
          { error: "Link de GitHub inválido. Ex: https://github.com/seu-usuario" },
          { status: 400 }
        );
      }

      const { allowed: withinRate, retryAfterSeconds } = checkRateLimit(
        `github-review:${session.user.id}`,
        PROFILE_FETCH_LIMIT
      );
      if (!withinRate) {
        await release.cancel();
        return NextResponse.json(
          {
            error: `Muitas consultas ao GitHub em pouco tempo. Tente de novo em ${Math.ceil(
              retryAfterSeconds / 60
            )} min.`,
          },
          { status: 429 }
        );
      }

      profileText = await fetchGithubProfileText(username);
    }

    if (!profileText.trim()) {
      await release.cancel();
      return NextResponse.json(
        { error: "Informe o link do seu perfil ou cole a lista de repositórios." },
        { status: 400 }
      );
    }

    const result = await analyzeGithub(profileText, targetRole ?? "");

    await prisma.toolReviewResult.upsert({
      where: { userId_type: { userId: session.user.id, type: "github" } },
      create: { userId: session.user.id, type: "github", input: JSON.stringify({ githubUrl, targetRole }), result: JSON.stringify(result) },
      update: { input: JSON.stringify({ githubUrl, targetRole }), result: JSON.stringify(result) },
    });

    await release.confirm();
    return NextResponse.json(result);
  } catch (error) {
    await release.cancel();
    if (error instanceof GithubProfileError) {
      return NextResponse.json({ error: error.message }, { status: 502 });
    }

    console.error("Erro ao analisar GitHub:", error);
    return NextResponse.json(
      { error: "Erro ao processar. Tente novamente." },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { requireToolAccess } from "@/lib/require-auth";
import { analyzeGithub } from "@/lib/tools";
import {
  GithubProfileError,
  fetchGithubProfileText,
  parseGithubUsername,
} from "@/lib/github-profile";
import { checkRateLimit } from "@/lib/rate-limit";

// Buscar o perfil consome a cota da API do GitHub, que é do servidor inteiro
// (60/h sem GITHUB_TOKEN). Limita por usuário para um não derrubar os outros.
const PROFILE_FETCH_LIMIT = { limit: 10, windowMs: 15 * 60 * 1000 };

export async function POST(req: NextRequest) {
  try {
    const { session, response } = await requireToolAccess("/tools/github-review");
    if (!session) return response!;

    const { githubUrl, githubText, targetRole } = await req.json();

    let profileText: string = githubText ?? "";

    if (githubUrl?.trim()) {
      const username = parseGithubUsername(githubUrl);
      if (!username) {
        return NextResponse.json(
          { error: "Link de GitHub inválido. Ex: https://github.com/seu-usuario" },
          { status: 400 }
        );
      }

      const { allowed, retryAfterSeconds } = checkRateLimit(
        `github-review:${session.user.id}`,
        PROFILE_FETCH_LIMIT
      );
      if (!allowed) {
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
      return NextResponse.json(
        { error: "Informe o link do seu perfil ou cole a lista de repositórios." },
        { status: 400 }
      );
    }

    const result = await analyzeGithub(profileText, targetRole ?? "");
    return NextResponse.json(result);
  } catch (error) {
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

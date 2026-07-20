import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/require-auth";
import { prisma } from "@/lib/prisma";
import { normalizeSkills, parsePortfolio, reaisToCents, type PortfolioItem } from "@/lib/freelance";

// Perfil freelancer do usuário logado. Grátis: qualquer usuário autenticado
// pode criar/editar o seu.
export async function GET() {
  const { session, response } = await requireAuth();
  if (!session) return response;

  const profile = await prisma.freelancerProfile.findUnique({
    where: { userId: session.user.id },
  });
  return NextResponse.json({ profile });
}

export async function PUT(req: Request) {
  const { session, response } = await requireAuth();
  if (!session) return response;

  let body: {
    headline?: string;
    bio?: string;
    category?: string;
    skills?: unknown;
    hourlyRate?: unknown;
    portfolio?: unknown;
    available?: boolean;
    published?: boolean;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }

  const headline = (body.headline ?? "").trim().slice(0, 140);
  const bio = (body.bio ?? "").trim().slice(0, 3000);
  const category = (body.category ?? "").trim().slice(0, 40);
  const skills = normalizeSkills(body.skills);
  const hourlyRateCents = reaisToCents(body.hourlyRate);
  // Reusa o parser (que também sanitiza) passando o portfólio já como JSON.
  const portfolioItems: PortfolioItem[] = parsePortfolio(
    typeof body.portfolio === "string" ? body.portfolio : JSON.stringify(body.portfolio ?? [])
  );
  const available = body.available !== false;
  const published = Boolean(body.published);

  if (published && !headline) {
    return NextResponse.json(
      { error: "Escreva um título profissional antes de publicar o perfil." },
      { status: 400 }
    );
  }

  const data = {
    headline,
    bio,
    category,
    skills: JSON.stringify(skills),
    hourlyRateCents,
    portfolio: JSON.stringify(portfolioItems),
    available,
    published,
  };

  const profile = await prisma.freelancerProfile.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id, ...data },
    update: data,
  });

  return NextResponse.json({ profile });
}

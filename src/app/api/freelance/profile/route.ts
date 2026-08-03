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

export async function POST(req: Request) {
  const { session, response } = await requireAuth();
  if (!session) return response;

  let body: { title?: string; description?: string; skills?: unknown };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Requisição inválida." }, { status: 400 }); }
  const title = (body.title ?? "").trim().slice(0, 140);
  const description = (body.description ?? "").trim().slice(0, 2000);
  if (!title || !description) return NextResponse.json({ error: "Informe o nome e a descrição do projeto." }, { status: 400 });

  const profile = await prisma.freelancerProfile.findUnique({ where: { userId: session.user.id } });
  const portfolioItems = parsePortfolio(profile?.portfolio ?? "[]");
  if (portfolioItems.some((item) => item.title.toLowerCase() === title.toLowerCase())) {
    return NextResponse.json({ error: "Esse projeto já está no seu portfólio." }, { status: 409 });
  }
  if (portfolioItems.length >= 12) return NextResponse.json({ error: "Seu portfólio já atingiu o limite de 12 projetos." }, { status: 400 });

  const skills = normalizeSkills(body.skills);
  const nextPortfolio = [...portfolioItems, { title, url: "", imageUrl: "", description }];
  const saved = await prisma.freelancerProfile.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id, portfolio: JSON.stringify(nextPortfolio), skills: JSON.stringify(skills) },
    update: { portfolio: JSON.stringify(nextPortfolio) },
  });
  return NextResponse.json({ profile: saved });
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
    pixKey?: string;
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
  const pixKey = (body.pixKey ?? "").trim().slice(0, 120);

  if (published && !headline) {
    return NextResponse.json(
      { error: "Escreva um título profissional antes de publicar o perfil." },
      { status: 400 }
    );
  }
  if (published && !pixKey) {
    return NextResponse.json({ error: "Informe uma chave Pix antes de publicar o perfil." }, { status: 400 });
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
    pixKey,
  };

  const profile = await prisma.freelancerProfile.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id, ...data },
    update: data,
  });

  return NextResponse.json({ profile });
}

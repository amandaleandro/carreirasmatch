import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/require-auth";
import { prisma } from "@/lib/prisma";
import {
  normalizeSkills,
  reaisToCents,
  FREELANCE_CATEGORIES,
  BUDGET_TYPES,
  PROJECT_WORK_MODELS,
} from "@/lib/freelance";

// Cria um projeto freelancer. Qualquer usuário logado pode contratar.
export async function POST(req: Request) {
  const { session, response } = await requireAuth();
  if (!session) return response;

  let body: {
    title?: string;
    description?: string;
    category?: string;
    skills?: unknown;
    budgetType?: string;
    budgetMin?: unknown;
    budgetMax?: unknown;
    workModel?: string;
    deadline?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }

  const title = (body.title ?? "").trim().slice(0, 140);
  const description = (body.description ?? "").trim().slice(0, 8000);
  if (!title || !description) {
    return NextResponse.json({ error: "Preencha o título e a descrição do projeto." }, { status: 400 });
  }

  const category = FREELANCE_CATEGORIES.some((c) => c.value === body.category) ? body.category! : "";
  const budgetType = BUDGET_TYPES.some((b) => b.value === body.budgetType) ? body.budgetType! : "fixed";
  const workModel = PROJECT_WORK_MODELS.some((w) => w.value === body.workModel) ? body.workModel! : "remoto";
  const budgetMinCents = reaisToCents(body.budgetMin);
  const budgetMaxCents = reaisToCents(body.budgetMax);

  let deadline: Date | null = null;
  if (body.deadline) {
    const d = new Date(body.deadline);
    if (!Number.isNaN(d.getTime())) deadline = d;
  }

  const project = await prisma.freelanceProject.create({
    data: {
      clientUserId: session.user.id,
      title,
      description,
      category,
      skills: JSON.stringify(normalizeSkills(body.skills)),
      budgetType,
      budgetMinCents,
      budgetMaxCents,
      workModel,
      deadline,
    },
  });

  return NextResponse.json({ id: project.id });
}

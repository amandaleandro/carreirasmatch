import { NextResponse } from "next/server";
import { requireCompanyApi } from "@/lib/company-auth";
import { prisma } from "@/lib/prisma";
import { publishVagaToFeed, unpublishVagaFromFeed } from "@/lib/company-vaga-feed";
import { classifyArea } from "@/lib/area-taxonomy";

// Edita a vaga (dados, status aberto/fechado e/ou publicação no feed).
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { company, response } = await requireCompanyApi();
  if (!company) return response;

  const { id } = await params;
  const vaga = await prisma.companyVaga.findFirst({ where: { id, companyId: company.id } });
  if (!vaga) return NextResponse.json({ error: "Vaga não encontrada." }, { status: 404 });

  let body: {
    title?: string;
    description?: string;
    area?: string;
    state?: string;
    status?: string;
    publishedToFeed?: boolean;
    salaryMin?: unknown;
    workModel?: string;
    seniority?: string;
    jobType?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }

  const data: Record<string, unknown> = {};

  if (body.status !== undefined) {
    if (body.status !== "open" && body.status !== "closed") {
      return NextResponse.json({ error: "Status inválido." }, { status: 400 });
    }
    data.status = body.status;
  }

  if (body.title !== undefined || body.description !== undefined) {
    const title = (body.title ?? "").trim();
    const description = (body.description ?? "").trim();
    if (!title || !description) {
      return NextResponse.json({ error: "Preencha o cargo e a descrição da vaga." }, { status: 400 });
    }
    data.title = title;
    data.description = description;
    data.area = (body.area ?? "").trim();
    data.subarea = classifyArea(`${title} ${description}`, data.area as string).subarea;
    data.state = (body.state ?? "").trim().toUpperCase().slice(0, 2);
  }

  // Campos opcionais do anúncio (aceitos em qualquer edição).
  if (body.salaryMin !== undefined) {
    const n = Number(body.salaryMin);
    data.salaryMin = Number.isFinite(n) && n > 0 ? Math.round(n) : null;
  }
  if (body.workModel !== undefined) data.workModel = String(body.workModel).trim();
  if (body.seniority !== undefined) data.seniority = String(body.seniority).trim();
  if (body.jobType !== undefined) data.jobType = String(body.jobType).trim();

  if (body.publishedToFeed !== undefined) {
    data.publishedToFeed = Boolean(body.publishedToFeed);
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Nada para atualizar." }, { status: 400 });
  }

  // Estado final da vaga após a edição.
  const next = { ...vaga, ...data } as typeof vaga;

  // Sincroniza o feed: só aparece se publicada E aberta.
  const shouldBeInFeed = next.publishedToFeed && next.status !== "closed";
  if (shouldBeInFeed) {
    const feedJobId = await publishVagaToFeed(
      {
        id: vaga.id,
        title: next.title,
        description: next.description,
        area: next.area,
        state: next.state,
        salaryMin: next.salaryMin,
        workModel: next.workModel,
        seniority: next.seniority,
        jobType: next.jobType,
        feedJobId: vaga.feedJobId,
      },
      company.name
    );
    data.feedJobId = feedJobId;
  } else {
    await unpublishVagaFromFeed(vaga.feedJobId);
  }

  await prisma.companyVaga.update({ where: { id }, data });
  return NextResponse.json({ ok: true, publishedToFeed: Boolean(next.publishedToFeed) });
}

// Exclui a vaga (e desativa o Job espelho no feed, se houver).
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { company, response } = await requireCompanyApi();
  if (!company) return response;

  const { id } = await params;
  const vaga = await prisma.companyVaga.findFirst({
    where: { id, companyId: company.id },
    select: { id: true, feedJobId: true },
  });
  if (!vaga) return NextResponse.json({ error: "Vaga não encontrada." }, { status: 404 });

  await unpublishVagaFromFeed(vaga.feedJobId);
  await prisma.companyVaga.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

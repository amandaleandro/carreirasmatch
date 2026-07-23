import { NextResponse } from "next/server";
import { requireCompanyApi } from "@/lib/company-auth";
import { prisma } from "@/lib/prisma";
import { runVagaMatch } from "@/lib/company-vaga";
import { publishVagaToFeed } from "@/lib/company-vaga-feed";
import { classifyArea } from "@/lib/area-taxonomy";

// Cadastra uma vaga e já roda o matching do banco de talentos.
export async function POST(req: Request) {
  const { company, response } = await requireCompanyApi();
  if (!company) return response;

  let body: {
    title?: string;
    description?: string;
    area?: string;
    state?: string;
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

  const title = (body.title ?? "").trim();
  const description = (body.description ?? "").trim();
  const area = (body.area ?? "").trim();
  const state = (body.state ?? "").trim().toUpperCase().slice(0, 2);
  const publish = Boolean(body.publishedToFeed);
  const salaryNum = Number(body.salaryMin);
  const salaryMin = Number.isFinite(salaryNum) && salaryNum > 0 ? Math.round(salaryNum) : null;
  const workModel = (body.workModel ?? "").trim();
  const seniority = (body.seniority ?? "").trim();
  const jobType = (body.jobType ?? "").trim();

  if (!title || !description) {
    return NextResponse.json({ error: "Preencha o cargo e a descrição da vaga." }, { status: 400 });
  }

  if (publish && !company.logoUrl) {
    return NextResponse.json(
      { error: "Adicione o logo da empresa no seu perfil antes de publicar vagas no feed público." },
      { status: 400 }
    );
  }

  // Deriva a subárea a partir do cargo+descrição (não pedimos isso na empresa
  // pra não mudar o formulário), reaproveitando a mesma taxonomia de cursos/vagas.
  const subarea = classifyArea(`${title} ${description}`, area).subarea;

  const vaga = await prisma.companyVaga.create({
    data: { companyId: company.id, title, description, area, subarea, state, salaryMin, workModel, seniority, jobType },
  });

  // Publica no feed já na criação, se marcado.
  if (publish) {
    const feedJobId = await publishVagaToFeed(
      { id: vaga.id, title, description, area, state, salaryMin, workModel, seniority, jobType, feedJobId: null },
      company.name
    );
    await prisma.companyVaga.update({ where: { id: vaga.id }, data: { publishedToFeed: true, feedJobId } });
  }

  // Roda o matching inicial; se a IA falhar, a vaga fica criada e o usuário pode
  // usar "Atualizar candidatos" depois.
  try {
    await runVagaMatch({ id: vaga.id, companyId: company.id, title, description, area, state });
  } catch {
    // silencioso: a vaga já existe, o rematch resolve.
  }

  return NextResponse.json({ id: vaga.id });
}

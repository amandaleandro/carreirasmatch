import { NextResponse } from "next/server";
import { requirePartnerApi } from "@/lib/partner-auth";
import { prisma } from "@/lib/prisma";

function hasErrorCode(error: unknown): error is { code: string } {
  return typeof error === "object" && error !== null && "code" in error;
}

export async function POST(req: Request) {
  const { partner, response } = await requirePartnerApi();
  if (!partner) return response;

  let body: {
    title?: string;
    url?: string;
    area?: string;
    modality?: string;
    free?: boolean;
    certificate?: boolean;
    city?: string;
    state?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }

  const title = (body.title ?? "").trim();
  const url = (body.url ?? "").trim();
  const area = (body.area ?? "").trim();
  const modality = (body.modality ?? "online").trim();
  const free = body.free === undefined ? true : Boolean(body.free);
  const certificate = Boolean(body.certificate);
  const city = (body.city ?? "").trim();
  const state = (body.state ?? "").trim().toUpperCase().slice(0, 2);

  if (!title || !url || !area) {
    return NextResponse.json({ error: "Preencha o título, link oficial e a área do curso." }, { status: 400 });
  }

  try {
    const course = await prisma.externalCourse.create({
      data: {
        title,
        provider: partner.name,
        url,
        area,
        modality,
        free,
        certificate,
        city,
        state,
        active: true,
        source: "partner",
        partnerId: partner.id,
        featured: false,
      },
    });

    return NextResponse.json({ id: course.id });
  } catch (err: unknown) {
    if (hasErrorCode(err) && err.code === "P2002") {
      return NextResponse.json({ error: "Já existe um curso cadastrado com este link." }, { status: 400 });
    }
    console.error("Erro ao cadastrar curso:", err);
    return NextResponse.json({ error: "Erro ao salvar curso no banco." }, { status: 500 });
  }
}

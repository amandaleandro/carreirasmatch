import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { reserveFeatureForRoute } from "@/lib/feature-access";

const schema = z.object({
  title: z.string().trim().min(1).max(240),
  company: z.string().trim().max(160).default(""),
  url: z.string().trim().max(2000).default(""),
  description: z.string().trim().min(1).max(20000),
  matchScore: z.number().int().min(0).max(100),
  effortToAdapt: z.enum(["Baixo", "Médio", "MÃ©dio", "Alto"]),
  keyRequirementsFound: z.array(z.string().max(300)).max(10).default([]),
  criticalGaps: z.array(z.string().max(300)).max(10).default([]),
  recommendationVerdict: z.string().max(1000).default(""),
});

export async function POST(request: Request) {
  const { session, response, release } = await reserveFeatureForRoute("job.application.create");
  if (!session) return response!;
  const userId = session.user.id;

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    await release!.cancel();
    return NextResponse.json({ error: "Dados da vaga incompletos." }, { status: 400 });
  }

  const data = parsed.data;
  const jobUrl = data.url || `comparison://${userId}/${crypto.randomUUID()}`;
  const effortToAdapt = data.effortToAdapt === "MÃ©dio" ? "Médio" : data.effortToAdapt;
  const notes = [
    "Preparada pelo Comparador de Vagas.",
    `Esforço estimado para ajustar: ${effortToAdapt}.`,
    data.keyRequirementsFound.length ? `Requisitos atendidos: ${data.keyRequirementsFound.join("; ")}.` : "",
    data.criticalGaps.length ? `Lacunas a tratar: ${data.criticalGaps.join("; ")}.` : "",
    data.recommendationVerdict,
  ].filter(Boolean).join("\n");

  const job = await prisma.job.upsert({
    where: { url: jobUrl },
    create: {
      url: jobUrl,
      jobTitle: data.title,
      jobText: data.description,
      company: data.company,
      source: "job-comparator",
      addedByUserId: userId,
    },
    update: {
      jobTitle: data.title,
      jobText: data.description,
      company: data.company,
    },
  });

  try {
    const existing = await prisma.application.findFirst({ where: { userId, jobId: job.id } });
    const application = existing
      ? await prisma.application.update({
          where: { id: existing.id },
          data: { jobTitle: data.title, company: data.company, jobUrl, fitScore: data.matchScore, notes },
        })
      : await prisma.application.create({
          data: {
            userId,
            jobId: job.id,
            jobTitle: data.title,
            company: data.company,
            jobUrl,
            fitScore: data.matchScore,
            status: "tailor_resume",
            notes,
          },
        });

    await release!.confirm();
    return NextResponse.json({ success: true, applicationId: application.id });
  } catch (e) {
    await release!.cancel();
    throw e;
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyNpsToken } from "@/lib/nps-token";

const APP_URL = (process.env.APP_URL ?? "https://carreirasmatch.com.br").replace(/\/$/, "");

/**
 * Registra o clique de nota (0-10) do e-mail de NPS. GET porque o clique vem
 * direto de um link no e-mail (sem JS, sem form). Idempotente: a nota mais
 * recente do mesmo `source` sobrescreve a anterior via upsert manual.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("t");
  const scoreRaw = url.searchParams.get("score");
  const source = url.searchParams.get("source") ?? "post_first_analysis";

  const score = Number(scoreRaw);
  if (!token || !Number.isFinite(score) || score < 0 || score > 10) {
    return NextResponse.redirect(`${APP_URL}/`);
  }

  const userId = verifyNpsToken(token);
  if (!userId) {
    return NextResponse.redirect(`${APP_URL}/`);
  }

  const existing = await prisma.npsResponse.findFirst({ where: { userId, source } });
  if (existing) {
    await prisma.npsResponse.update({ where: { id: existing.id }, data: { score } });
  } else {
    await prisma.npsResponse.create({ data: { userId, score, source } });
  }

  return NextResponse.redirect(`${APP_URL}/nps/obrigado?score=${score}`);
}

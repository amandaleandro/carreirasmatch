import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeBrazilPhone } from "@/lib/contact-validation";

/**
 * Recebe eventos da instância Evolution API (configurados no painel dela como
 * webhook de `messages.upsert`). Único uso hoje: opt-out por palavra-chave —
 * quem responder "parar"/"sair"/"stop" à régua de conversão sai do funil na
 * hora, sem depender do usuário lembrar de ir em /settings.
 *
 * Autenticação simples via query param (o painel da Evolution permite
 * configurar a URL do webhook com querystring); não é assinatura HMAC porque
 * a Evolution self-hosted não gera uma.
 */
const OPT_OUT_WORDS = ["parar", "sair", "stop", "cancelar"];

function extractText(message: unknown): string {
  if (!message || typeof message !== "object") return "";
  const m = message as Record<string, unknown>;
  if (typeof m.conversation === "string") return m.conversation;
  const extended = m.extendedTextMessage as Record<string, unknown> | undefined;
  if (typeof extended?.text === "string") return extended.text;
  return "";
}

export async function POST(req: NextRequest) {
  const secret = process.env.EVOLUTION_WEBHOOK_SECRET;
  if (secret && req.nextUrl.searchParams.get("token") !== secret) {
    return NextResponse.json({ error: "Token inválido." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (body?.event !== "messages.upsert") return NextResponse.json({ ok: true });

  const data = Array.isArray(body.data) ? body.data : [body.data];
  for (const entry of data) {
    const key = entry?.key as { remoteJid?: string; fromMe?: boolean } | undefined;
    if (!key?.remoteJid || key.fromMe) continue;

    const text = extractText(entry?.message).trim().toLowerCase();
    if (!OPT_OUT_WORDS.includes(text)) continue;

    const phone = normalizeBrazilPhone(key.remoteJid.split("@")[0]);
    if (!phone) continue;

    await prisma.user.updateMany({
      where: { phone },
      data: { whatsappMarketingOptIn: false },
    });
  }

  return NextResponse.json({ ok: true });
}

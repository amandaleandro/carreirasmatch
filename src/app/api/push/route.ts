import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/require-auth";
import { prisma } from "@/lib/prisma";
import { getVapidPublicKey, pushEnabled } from "@/lib/push";

export const dynamic = "force-dynamic";

const subscribeSchema = z.object({
  endpoint: z.string().url().max(1000),
  keys: z.object({
    p256dh: z.string().min(1).max(500),
    auth: z.string().min(1).max(500),
  }),
});

// Devolve a chave pública VAPID (que o browser precisa para se inscrever) e se
// o usuário já tem alguma inscrição neste ambiente.
export async function GET() {
  const { session, response } = await requireAuth();
  if (!session) return response!;
  const count = pushEnabled
    ? await prisma.pushSubscription.count({ where: { userId: session.user.id } })
    : 0;
  return NextResponse.json({
    enabled: pushEnabled,
    publicKey: getVapidPublicKey(),
    subscribed: count > 0,
  });
}

export async function POST(request: Request) {
  const { session, response } = await requireAuth();
  if (!session) return response!;
  if (!pushEnabled) {
    return NextResponse.json({ error: "Push não está configurado." }, { status: 503 });
  }
  const parsed = subscribeSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Inscrição inválida." }, { status: 400 });
  }
  const { endpoint, keys } = parsed.data;
  const userAgent = request.headers.get("user-agent")?.slice(0, 255) ?? "";

  // Upsert por endpoint: reinscrever o mesmo dispositivo não duplica, e uma
  // inscrição que trocou de dono (mesmo browser, outro login) é reatribuída.
  await prisma.pushSubscription.upsert({
    where: { endpoint },
    update: { userId: session.user.id, p256dh: keys.p256dh, auth: keys.auth, userAgent },
    create: { userId: session.user.id, endpoint, p256dh: keys.p256dh, auth: keys.auth, userAgent },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}

export async function DELETE(request: Request) {
  const { session, response } = await requireAuth();
  if (!session) return response!;
  const parsed = z.object({ endpoint: z.string().url() }).safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "endpoint ausente." }, { status: 400 });
  }
  // deleteMany com userId evita que alguém apague a inscrição de outro usuário.
  await prisma.pushSubscription.deleteMany({
    where: { endpoint: parsed.data.endpoint, userId: session.user.id },
  });
  return NextResponse.json({ ok: true });
}

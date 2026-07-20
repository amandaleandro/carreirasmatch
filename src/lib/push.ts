import webpush from "web-push";
import { prisma } from "@/lib/prisma";

const APP_URL = (process.env.APP_URL ?? "https://carreirasmatch.com.br").replace(/\/$/, "");
const PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY ?? "";
const PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY ?? "";
const CONTACT = process.env.VAPID_SUBJECT ?? "mailto:contato@carreirasmatch.com.br";

// A feature inteira é opcional: sem chaves VAPID no ambiente, tudo vira no-op e
// nada quebra (mesmo padrão do RESEND_API_KEY em lib/resend.ts).
export const pushEnabled = Boolean(PUBLIC_KEY && PRIVATE_KEY);

if (pushEnabled) {
  webpush.setVapidDetails(CONTACT, PUBLIC_KEY, PRIVATE_KEY);
}

export function getVapidPublicKey(): string {
  return PUBLIC_KEY;
}

export type PushPayload = {
  title: string;
  body: string;
  url?: string;
  tag?: string;
};

/**
 * Envia um push para todas as inscrições de um usuário. Inscrições mortas
 * (404/410 — o browser desinscreveu ou expirou) são removidas do banco.
 * Retorna quantos envios tiveram sucesso.
 */
export async function sendPushToUser(userId: string, payload: PushPayload): Promise<number> {
  if (!pushEnabled) return 0;

  const subs = await prisma.pushSubscription.findMany({ where: { userId } });
  if (subs.length === 0) return 0;

  const body = JSON.stringify({ ...payload, url: payload.url ?? APP_URL });
  let sent = 0;

  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          body,
        );
        sent += 1;
      } catch (err: unknown) {
        const status = (err as { statusCode?: number })?.statusCode;
        if (status === 404 || status === 410) {
          await prisma.pushSubscription
            .delete({ where: { endpoint: sub.endpoint } })
            .catch(() => {});
        } else {
          console.error("push: envio falhou", status, err);
        }
      }
    }),
  );

  return sent;
}

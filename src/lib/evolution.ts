import { prisma } from "@/lib/prisma";

const SERVER_URL = (process.env.EVOLUTION_API_URL ?? "").replace(/\/$/, "");
const API_KEY = process.env.EVOLUTION_API_KEY ?? "";
const INSTANCE = process.env.EVOLUTION_INSTANCE ?? "";
const APP_URL = (process.env.APP_URL ?? "https://carreirasmatch.com.br").replace(/\/$/, "");

// Mesmo padrão do RESEND_API_KEY em lib/resend.ts: sem as três envs, tudo vira
// no-op (loga e sai) e nada quebra — a régua de WhatsApp é 100% opcional.
export const evolutionEnabled = Boolean(SERVER_URL && API_KEY && INSTANCE);

/** Evolution API (v2) espera o número como DDI+DDD+telefone, só dígitos, sem "+". */
function toWhatsappNumber(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return digits.startsWith("55") ? digits : `55${digits}`;
}

/**
 * Envia uma mensagem de texto via Evolution API (self-hosted).
 * Nunca lança para o chamador (fire-and-forget) — mesmo espírito do `send()`
 * de e-mail: um problema no canal de marketing não pode derrubar outra coisa.
 */
async function sendText(phone: string, text: string): Promise<void> {
  if (!evolutionEnabled) {
    console.error(`Evolution API não configurada, WhatsApp não enviado para ${phone}.`);
    return;
  }
  try {
    const res = await fetch(`${SERVER_URL}/message/sendText/${INSTANCE}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: API_KEY },
      body: JSON.stringify({ number: toWhatsappNumber(phone), text }),
    });
    if (!res.ok) {
      console.error(`Evolution API recusou a mensagem para ${phone}:`, res.status, await res.text());
    }
  } catch (err) {
    console.error(`Falha ao enviar WhatsApp para ${phone}:`, err);
  }
}

/**
 * Garante que uma mensagem de um dado `type`/`dedupeKey` seja enviada uma
 * única vez. Espelha `sendOnce` de lib/resend.ts, mas usa WhatsappLog (chave
 * de contato aqui é telefone, não e-mail).
 */
export async function sendWhatsappOnce(
  type: string,
  dedupeKey: string,
  phone: string,
  send: () => Promise<void>
): Promise<void> {
  try {
    await prisma.whatsappLog.create({ data: { type, dedupeKey, phone } });
  } catch {
    return; // já enviado (ou reservado) anteriormente
  }
  await send();
}

/** Primeiro toque: mesma condição do e-mail (analisou, não assinou), tom leve. */
export async function sendConvertToSubscriptionWhatsapp(
  phone: string,
  opts: { name?: string | null; segment?: string | null; score?: number | null }
): Promise<void> {
  const firstName = opts.name?.trim()?.split(" ")[0];
  const greeting = firstName ? `Oi, ${firstName}! 👋` : "Oi! 👋";
  const href = opts.segment?.trim()
    ? `${APP_URL}/assinar?segment=${encodeURIComponent(opts.segment.trim())}`
    : `${APP_URL}/assinar`;
  const scoreLine =
    opts.score != null
      ? `Vi aqui que seu currículo tirou *${opts.score}* de aderência. Nada mal, mas também nada que uma IA sem café não resolva 😅`
      : `Vi aqui que você já rodou uma análise de currículo com a gente. Diagnóstico feito, e agora?`;
  await sendText(
    phone,
    `${greeting}\n\n${scoreLine}\n\nO plano pega esse resultado e transforma em ação: currículo reescrito, simulação de entrevista e reanálise a cada vaga nova. Dá uma olhada:\n${href}\n\nSe preferir não receber mais mensagens por aqui, é só responder *PARAR*.`
  );
}

/** Segundo toque: ângulo diferente, alguns dias depois. */
export async function sendConvertSecondNudgeWhatsapp(
  phone: string,
  opts: { segment?: string | null }
): Promise<void> {
  const href = opts.segment?.trim()
    ? `${APP_URL}/assinar?segment=${encodeURIComponent(opts.segment.trim())}`
    : `${APP_URL}/assinar`;
  await sendText(
    phone,
    `Curiosidade nada assustadora 🕵️: recrutador gasta em média 7 segundos olhando um currículo antes de decidir se continua lendo.\n\nSeu currículo atual sobreviveria aos 7 segundos? O plano reorganiza pra garantir que sim:\n${href}\n\nResponda *PARAR* se quiser sair dessa lista.`
  );
}

/** Terceiro e último toque: cupom pessoal de uso único, mesma régua do e-mail. */
export async function sendUrgencyCouponWhatsapp(
  phone: string,
  opts: { code: string; expiresAt: Date; segment?: string | null }
): Promise<void> {
  const href = opts.segment?.trim()
    ? `${APP_URL}/assinar?segment=${encodeURIComponent(opts.segment.trim())}`
    : `${APP_URL}/assinar`;
  const hours = Math.round((opts.expiresAt.getTime() - Date.now()) / (60 * 60 * 1000));
  await sendText(
    phone,
    `Última mensagem sobre isso, prometo 🤝\n\nSepararei um cupom de 20% só seu, válido por ${hours}h: *${opts.code}*\n\n${href}\n\nDepois disso o cupom expira e eu paro de te encher o saco. Responda *PARAR* se quiser sair antes disso.`
  );
}

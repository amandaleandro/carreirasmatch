import { prisma } from "@/lib/prisma";
import { formatCentsToBRL } from "@/lib/pricing";

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
 * Destinatários das notificações internas por WhatsApp (novos cadastros e
 * vendas). Mesmo padrão do ADMIN_EMAILS em lib/resend.ts: sem a env, nada é
 * enviado (só loga).
 */
const ADMIN_RECIPIENTS = (process.env.ADMIN_WHATSAPP_NUMBERS ?? "")
  .split(",")
  .map((n) => n.trim())
  .filter(Boolean);

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
 * WhatsApp interno para o(s) admin(s): mesmo texto para cada número da lista.
 * Fire-and-forget, nunca lança para o chamador, igual ao `sendAdmin` de e-mail.
 */
async function sendAdmin(text: string): Promise<void> {
  if (!evolutionEnabled) {
    console.error(`Evolution API não configurada, notificação admin por WhatsApp não enviada: "${text}".`);
    return;
  }
  if (ADMIN_RECIPIENTS.length === 0) {
    console.warn(`ADMIN_WHATSAPP_NUMBERS não configurada, notificação admin por WhatsApp não enviada.`);
    return;
  }
  for (const number of ADMIN_RECIPIENTS) {
    await sendText(number, text);
  }
}

/** Avisa o admin de um novo cadastro por WhatsApp. Chame com fire-and-forget (void). */
export async function notifyAdminNewSignupWhatsapp(opts: {
  name?: string | null;
  email: string;
  phone?: string | null;
  segment?: string | null;
}): Promise<void> {
  const lines = [
    "🎉 Novo cadastro",
    `Nome: ${opts.name?.trim() || "Não informado"}`,
    `E-mail: ${opts.email}`,
  ];
  if (opts.phone?.trim()) lines.push(`Telefone: ${opts.phone.trim()}`);
  if (opts.segment?.trim()) lines.push(`Momento de carreira: ${opts.segment.trim()}`);
  await sendAdmin(lines.join("\n"));
}

/** Avisa o admin de uma venda confirmada por WhatsApp. Chame com fire-and-forget (void). */
export async function notifyAdminPurchaseWhatsapp(opts: {
  product: string;
  amountCents: number;
  email?: string | null;
}): Promise<void> {
  await sendAdmin(
    [
      "💰 Nova venda",
      `Produto: ${opts.product}`,
      `Valor: ${formatCentsToBRL(opts.amountCents)}`,
      `Cliente: ${opts.email?.trim() || "Não informado"}`,
    ].join("\n")
  );
}

/** Avisa a empresa (no WhatsApp cadastrado no perfil) de uma nova candidatura. */
export async function sendCompanyNewApplicationWhatsapp(
  phone: string,
  opts: { candidateName: string; vagaTitle: string; vagaId: string }
): Promise<void> {
  if (!phone.trim()) return;
  await sendText(
    phone,
    `🎯 Nova candidatura\n\n${opts.candidateName} se candidatou à sua vaga *${opts.vagaTitle}*.\n\nVeja os dados do candidato:\n${APP_URL}/empresa/vagas/${opts.vagaId}`
  );
}

/** Avisa a empresa (no WhatsApp cadastrado no perfil) que um candidato liberou o contato. */
export async function sendCompanyContactAcceptedWhatsapp(
  phone: string,
  opts: { candidateName: string; jobTitle?: string }
): Promise<void> {
  if (!phone.trim()) return;
  const forJob = opts.jobTitle?.trim() ? ` para a vaga de *${opts.jobTitle.trim()}*` : "";
  await sendText(
    phone,
    `🔓 Contato liberado\n\n${opts.candidateName} aceitou seu pedido de contato${forJob}. Veja os dados na sua central de contatos:\n${APP_URL}/empresa/contatos`
  );
}

/** Avisa o admin de um novo chamado de suporte por WhatsApp. Chame com fire-and-forget (void). */
export async function notifyAdminSupportTicketWhatsapp(opts: {
  ticketId: string;
  subject: string;
  email: string;
}): Promise<void> {
  await sendAdmin(
    [
      "💬 Novo chamado de suporte",
      `Assunto: ${opts.subject}`,
      `Usuário: ${opts.email}`,
      `Atendimento: ${APP_URL}/admin/suporte/${opts.ticketId}`,
    ].join("\n")
  );
}

/** Chamada autenticada genérica à Evolution API, usada pelo painel de admin. */
async function evolutionFetch(path: string, init?: RequestInit): Promise<Response> {
  if (!SERVER_URL || !API_KEY || !INSTANCE) {
    throw new Error(
      "Evolution API não configurada (defina EVOLUTION_API_URL, EVOLUTION_API_KEY e EVOLUTION_INSTANCE)."
    );
  }
  return fetch(`${SERVER_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", apikey: API_KEY, ...(init?.headers ?? {}) },
  });
}

export type EvolutionConnectionState = "open" | "connecting" | "close" | "unknown";

/** Estado da sessão pareada: "open" = conectado, "connecting" = aguardando QR, "close" = desconectado. */
export async function getEvolutionConnectionState(): Promise<EvolutionConnectionState> {
  const res = await evolutionFetch(`/instance/connectionState/${INSTANCE}`);
  if (!res.ok) return "unknown";
  const data = await res.json().catch(() => null);
  const state = data?.instance?.state;
  return state === "open" || state === "connecting" || state === "close" ? state : "unknown";
}

/**
 * Gera um QR code novo para parear o número dedicado. Tenta criar a instância
 * (primeira vez); se ela já existir, cai para `/instance/connect`, que também
 * devolve um QR fresco para repareamento.
 */
export async function requestEvolutionQrCode(): Promise<{ base64: string | null; pairingCode: string | null }> {
  const createRes = await evolutionFetch(`/instance/create`, {
    method: "POST",
    body: JSON.stringify({ instanceName: INSTANCE, qrcode: true, integration: "WHATSAPP-BAILEYS" }),
  });
  if (createRes.ok) {
    const data = await createRes.json();
    return { base64: data?.qrcode?.base64 ?? null, pairingCode: data?.qrcode?.pairingCode ?? null };
  }

  const connectRes = await evolutionFetch(`/instance/connect/${INSTANCE}`);
  if (!connectRes.ok) {
    throw new Error(`Evolution API recusou a conexão: ${connectRes.status} ${await connectRes.text()}`);
  }
  const data = await connectRes.json();
  return { base64: data?.base64 ?? null, pairingCode: data?.pairingCode ?? null };
}

/** Desconecta a sessão pareada (mantém a instância, permitindo reparear depois). */
export async function logoutEvolutionInstance(): Promise<void> {
  const res = await evolutionFetch(`/instance/logout/${INSTANCE}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`Evolution API recusou o logout: ${res.status} ${await res.text()}`);
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

/**
 * Banco de convites de marketing pro Desafio do Match (`/desafio`): gera um
 * Match % com card pra Stories, então o convite mira gente que quer testar E
 * compartilhar o resultado. Tom divertido e com emoji, gíria leve tá liberada,
 * mas sem perder o profissionalismo (nada de deboche ou informalidade
 * exagerada). Sempre com o nome. Cada função é um "toque" diferente;
 * `sendNextMarketingInviteWhatsapp` manda o próximo ainda não enviado pra
 * aquele telefone, então ninguém recebe o mesmo texto duas vezes.
 */
const MARKETING_INVITE_MESSAGES: Array<(firstName: string, href: string) => string> = [
  (name, href) =>
    `Oi, ${name}! 👋 Bora descobrir seu Match % com a vaga dos seus sonhos? Em 2 minutinhos a IA te dá o placar, os pontos fortes do currículo e um card show de bola pra postar no Story:\n${href}`,
  (name, href) =>
    `${name}, seu currículo já topou o Desafio do Match? 🎯 A gente calcula seu percentual de aderência com uma vaga real e ainda gera um card bonito pra você compartilhar:\n${href}`,
  (name, href) =>
    `Oi, ${name} 😊 Bateu aquela curiosidade: qual seria seu Match % com a próxima vaga que você quer? Descobre de graça e sai com o card na mão:\n${href}`,
  (name, href) =>
    `${name}, dica rápida pra você 💡 Compara seu currículo com uma vaga de verdade, recebe o diagnóstico com pontos fortes e o que ajustar, e ainda sobra um card pra Stories:\n${href}`,
  (name, href) =>
    `Oi, ${name}! ✨ Que tal transformar aquela ansiedade da busca de emprego em um número? O Desafio do Match calcula seu percentual e gera um card pra você mandar pra galera:\n${href}`,
  (name, href) =>
    `${name}, isso aqui vale menos que uma pausa pro café ☕ Testa seu Match % com uma vaga real, vê o que destaca seu perfil e compartilha o resultado com quem quiser:\n${href}`,
  (name, href) =>
    `Oi, ${name}! 🚀 Quer saber o quanto seu currículo conversa com a vaga certa? Faz o Desafio do Match, pega seu score e um card pronto pra postar:\n${href}`,
  (name, href) =>
    `${name}, sabe aquele número que ninguém te dá numa entrevista? 📊 O Desafio do Match calcula seu percentual de aderência com uma vaga real, na hora:\n${href}`,
  (name, href) =>
    `Oi, ${name}! 🔍 Antes de mandar currículo pra próxima vaga, descobre seu Match %. É rápido, é grátis e ainda sai com um card pra Stories:\n${href}`,
  (name, href) =>
    `${name}, dois minutos e um card show de bola 📸 O Desafio do Match mostra seu percentual de aderência e o que destacar no currículo:\n${href}`,
  (name, href) =>
    `Oi, ${name}! 🎲 Bora arriscar? Testa seu currículo contra uma vaga real, vê seu Match % e ainda ganha um card pra compartilhar:\n${href}`,
  (name, href) =>
    `${name}, currículo bom é currículo que converte 📈 Mede seu Match % com uma vaga de verdade e leva um diagnóstico + card pra Stories:\n${href}`,
  (name, href) =>
    `Oi, ${name}! 🧩 Falta uma peça pra saber se seu currículo encaixa na vaga certa: o Match %. Descobre o seu agora:\n${href}`,
  (name, href) =>
    `${name}, sem enrolação 🙌 Roda o Desafio do Match, recebe seu percentual de aderência e um card pronto pra postar em 2 minutos:\n${href}`,
];

/**
 * Manda o próximo convite de marketing (dentre `MARKETING_INVITE_MESSAGES`)
 * que aquele telefone ainda não recebeu. Usa o mesmo WhatsappLog como trava de
 * dedupe (`type: marketing_invite_<i>`), então cada envio some da lista assim
 * que sai — sem repetir e sem duplicar em reexecuções do scheduler.
 * Retorna `true` se mandou algo, `false` se o telefone já recebeu tudo.
 */
export async function sendNextMarketingInviteWhatsapp(
  phone: string,
  name?: string | null
): Promise<boolean> {
  const firstName = name?.trim()?.split(" ")[0] || "tudo bem";
  const href = `${APP_URL}/desafio`;
  for (let i = 0; i < MARKETING_INVITE_MESSAGES.length; i++) {
    try {
      await prisma.whatsappLog.create({ data: { type: `marketing_invite_${i}`, dedupeKey: phone, phone } });
    } catch {
      continue; // esse toque já foi enviado pra esse telefone, tenta o próximo
    }
    await sendText(phone, MARKETING_INVITE_MESSAGES[i](firstName, href));
    return true;
  }
  return false;
}

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

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Salvaguardas contra ban/restrição de número: a Evolution API roda em cima
 * do Baileys (protocolo não-oficial), não da Cloud API da Meta — sem os
 * limites e o selo de "conta business" oficiais, rajadas de mensagens
 * idênticas e em sequência são o padrão mais comum de detecção de spam.
 * Só se aplica a envio de MARKETING (régua de conversão, alerta de vaga,
 * convite); notificação transacional (admin, empresa) não passa por aqui —
 * é 1:1, esperada pelo destinatário, e não decide.
 */
const MARKETING_MIN_GAP_MS = 4000; // piso de 4s entre mensagens de marketing
const MARKETING_JITTER_MS = 5000; // + até 5s aleatório (evita cadência robótica)
const MARKETING_TICK_BUDGET = 150; // teto de segurança por execução do scheduler

let lastMarketingSendAt = 0;
let marketingSentThisTick = 0;

/** Chamar no início de cada `runWhatsappTick`, pra zerar o teto por execução. */
export function resetWhatsappMarketingBudget(): void {
  marketingSentThisTick = 0;
}

/**
 * Janela de horário humano (08h-20h em São Paulo). Mensagem de marketing
 * fora desse horário é outro sinal clássico de automação pro WhatsApp —
 * gente de verdade não manda oferta às 3h da manhã.
 */
export function isWithinWhatsappMarketingHours(now: Date = new Date()): boolean {
  const hour = Number(
    new Intl.DateTimeFormat("en-US", { hour: "numeric", hour12: false, timeZone: "America/Sao_Paulo" }).format(now)
  );
  return hour >= 8 && hour < 20;
}

/**
 * Envio de marketing com espaçamento aleatório e teto por execução. Todas as
 * funções de régua (conversão, come-back, alerta de vaga, convite) passam por
 * aqui em vez de chamar `sendText` direto.
 */
async function sendMarketingText(phone: string, text: string): Promise<void> {
  if (marketingSentThisTick >= MARKETING_TICK_BUDGET) {
    console.warn(`WhatsApp: teto de mensagens de marketing da execução atingido, envio para ${phone} adiado pro próximo tick.`);
    return;
  }
  const wait = lastMarketingSendAt + MARKETING_MIN_GAP_MS + Math.random() * MARKETING_JITTER_MS - Date.now();
  if (wait > 0) await sleep(wait);
  lastMarketingSendAt = Date.now();
  marketingSentThisTick++;
  await sendText(phone, text);
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

/** Escolhe uma variante aleatória — texto idêntico em massa é sinal de spam pro WhatsApp. */
function pickVariant<T>(variants: T[]): T {
  return variants[Math.floor(Math.random() * variants.length)];
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
  const closing = pickVariant([
    `Que tal voltar lá e ver o que rolou desde então? Tem vaga nova pra seu perfil e o plano pega esse resultado e transforma em ação: currículo reescrito, simulação de entrevista e reanálise a cada vaga nova.`,
    `Vale a pena voltar e conferir: tem vaga nova saindo toda semana e o plano pega esse diagnóstico e transforma em currículo reescrito, simulação de entrevista e reanálise a cada vaga.`,
    `Bora dar o próximo passo? O plano transforma esse diagnóstico em ação de verdade: currículo reescrito, simulação de entrevista e reanálise automática a cada vaga nova.`,
  ]);
  await sendMarketingText(
    phone,
    `${greeting}\n\n${scoreLine}\n\n${closing}\n${href}\n\nSe preferir não receber mais mensagens por aqui, é só responder *PARAR*.`
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
  const body = pickVariant([
    `Curiosidade nada assustadora 🕵️: recrutador gasta em média 7 segundos olhando um currículo antes de decidir se continua lendo.\n\nSeu currículo atual sobreviveria aos 7 segundos? Volta lá no Carreiras Match e reorganiza isso agora:`,
    `Dado real 📊: em média, 7 segundos é o tempo que um recrutador dedica antes de decidir se continua lendo seu currículo.\n\nQuer testar se o seu passa nesse teste? Dá uma olhada de novo no Carreiras Match:`,
    `Sabia que a maioria dos currículos é descartada em menos de 10 segundos? 👀\n\nVale voltar lá e ver o que dá pra ajustar no seu antes da próxima candidatura:`,
  ]);
  await sendMarketingText(phone, `${body}\n${href}\n\nResponda *PARAR* se quiser sair dessa lista.`);
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
  const opening = pickVariant([
    `Última mensagem sobre isso, prometo 🤝`,
    `Essa é a última vez que eu te chamo pra isso 🙏`,
    `Fechando esse assunto por aqui 🔒`,
  ]);
  await sendMarketingText(
    phone,
    `${opening}\n\nSepararei um cupom de 20% só seu, válido por ${hours}h, pra você voltar e terminar o que começou: *${opts.code}*\n\n${href}\n\nDepois disso o cupom expira e eu paro de te encher o saco. Responda *PARAR* se quiser sair antes disso.`
  );
}

/**
 * Alerta de vagas novas por WhatsApp, espelhando `sendJobAlertEmail`: mesma
 * janela de vagas (JobAlert do usuário), canal diferente. Termina com um
 * empurrão leve pro Pro (reanálise automática por vaga), já que quem está no
 * alerta é candidato ativo — bom momento pra converter.
 */
export async function sendJobAlertWhatsapp(
  phone: string,
  opts: { query?: string | null; location?: string; jobs: Array<{ title: string; url: string; source: string }> }
): Promise<void> {
  const count = opts.jobs.length;
  const heading =
    count === 1 ? "1 vaga nova pra você 🎯" : `${count} vagas novas pra você 🎯`;
  const filterLine = [opts.query, opts.location].filter((v) => v?.trim()).join(" • ");
  const list = opts.jobs
    .slice(0, 5)
    .map((job) => `• ${job.title} (${job.source})\n${job.url}`)
    .join("\n\n");
  const filterText = filterLine ? `\nFiltro: ${filterLine}\n` : "\n";
  await sendMarketingText(
    phone,
    `${heading}${filterText}\n${list}\n\nQuer chegar em cada uma dessas já com o currículo reanalisado pra vaga específica? É isso que o plano Pro faz automático:\n${APP_URL}/assinar\n\nResponda *PARAR* se não quiser mais alertas de vaga por aqui.`
  );
}

/** Quarto e último toque: pura volta ao produto, sem falar em preço/cupom, pra quem sumiu de vez. */
export async function sendComeBackWhatsapp(
  phone: string,
  opts: { name?: string | null }
): Promise<void> {
  const firstName = opts.name?.trim()?.split(" ")[0];
  const greeting = firstName ? `${firstName}, faz tempo! 👋` : "Faz tempo! 👋";
  const body = pickVariant([
    `Desde a última vez que você passou por aqui entraram vagas novas e o painel mudou bastante. Vale a pena dar uma espiada de novo:`,
    `Faz um tempinho que você não aparece por aqui. Tem coisa nova rolando, vale voltar e conferir:`,
    `Passando só pra lembrar que o Carreiras Match continua de portas abertas pra você. Que tal dar uma passada de novo:`,
  ]);
  await sendMarketingText(
    phone,
    `${greeting}\n\n${body}\n${APP_URL}\n\nResponda *PARAR* se não quiser mais esse tipo de mensagem.`
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
    await sendMarketingText(phone, MARKETING_INVITE_MESSAGES[i](firstName, href));
    return true;
  }
  return false;
}

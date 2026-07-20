import { Resend } from "resend";
import { formatCentsToBRL } from "@/lib/pricing";
import { prisma } from "@/lib/prisma";
import { formatBrazilDate } from "@/lib/brazil";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const FROM = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";
const APP_URL = (process.env.APP_URL ?? "https://carreirasmatch.com.br").replace(/\/$/, "");
const BRAND = "CarreirasMatch";

/**
 * Envelopa o conteúdo num layout de e-mail consistente. `bodyHtml` já vem com os
 * parágrafos/botões prontos.
 */
function layout(bodyHtml: string) {
  return `
    <div style="font-family: -apple-system, Segoe UI, sans-serif; max-width: 480px; margin: 0 auto; color: #0f172a;">
      <div style="padding: 8px 0 20px;">
        <a href="${APP_URL}" style="font-size: 18px; font-weight: 700; color: #2563eb; text-decoration: none;">${BRAND}</a>
      </div>
      ${bodyHtml}
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 28px 0 14px;" />
      <p style="font-size: 12px; color: #64748b;">
        Você recebeu este e-mail porque tem uma conta no ${BRAND}.
        <a href="${APP_URL}" style="color: #64748b;">${APP_URL.replace(/^https?:\/\//, "")}</a>
      </p>
    </div>
  `;
}

function button(href: string, label: string) {
  return `
    <p style="margin: 24px 0;">
      <a href="${href}" style="background:#2563eb;color:#fff;padding:12px 20px;border-radius:10px;text-decoration:none;font-weight:600;display:inline-block;">
        ${label}
      </a>
    </p>
  `;
}

/**
 * Dispara um e-mail sem nunca lançar erro para o chamador, se o Resend não
 * estiver configurado ou o envio falhar, apenas loga. Chame com fire-and-forget.
 */
async function send(to: string, subject: string, bodyHtml: string) {
  if (!resend) {
    console.error(`RESEND_API_KEY não configurada, e-mail "${subject}" não foi enviado para ${to}.`);
    return;
  }
  try {
    // O SDK NÃO lança em erro de API (chave inválida, domínio não verificado):
    // devolve { data, error }. Sem checar `error` aqui, a falha some em silêncio.
    const { error } = await resend.emails.send({ from: FROM, to, subject, html: layout(bodyHtml) });
    if (error) {
      console.error(`Resend recusou o e-mail "${subject}" para ${to}:`, error);
    }
  } catch (err) {
    // Só cai aqui em falha de rede/exceção inesperada.
    console.error(`Falha ao enviar e-mail "${subject}" para ${to}:`, err);
  }
}

/**
 * Garante que um e-mail de um dado `type`/`dedupeKey` seja enviado uma única vez.
 * Usa a tabela EmailLog como trava atômica: se a linha já existe, pula o envio.
 * Serve tanto para os transacionais que disparam em caminho síncrono + webhook
 * quanto para o scheduler de ciclo de vida, que roda várias vezes ao dia.
 * Nunca lança para o chamador (fire-and-forget).
 */
export async function sendOnce(
  type: string,
  dedupeKey: string,
  email: string,
  send: () => Promise<void>
): Promise<void> {
  try {
    // Reserva a chave antes de enviar: se outra execução já reservou, o unique
    // constraint falha e não duplicamos o e-mail.
    await prisma.emailLog.create({ data: { type, dedupeKey, email } });
  } catch {
    return; // já enviado (ou reservado) anteriormente
  }
  await send();
}

/**
 * Destinatários das notificações internas (novos cadastros e vendas).
 * Reaproveita ADMIN_EMAILS, a mesma lista que libera o /admin. Sem ela, nada é
 * enviado (só loga), então habilitar as notificações é só definir a env.
 */
const ADMIN_RECIPIENTS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim())
  .filter(Boolean);

/**
 * E-mail interno para o(s) admin(s): layout enxuto (sem o rodapé voltado ao
 * cliente) montado a partir de pares rótulo/valor. Fire-and-forget, nunca lança
 * para o chamador, igual aos transacionais.
 */
async function sendAdmin(subject: string, rows: Array<[string, string]>) {
  if (!resend) {
    console.error(`RESEND_API_KEY não configurada, notificação admin "${subject}" não enviada.`);
    return;
  }
  if (ADMIN_RECIPIENTS.length === 0) {
    console.warn(`ADMIN_EMAILS não configurada, notificação admin "${subject}" não enviada.`);
    return;
  }
  const body = `
    <div style="font-family: -apple-system, Segoe UI, sans-serif; max-width: 480px; margin: 0 auto; color: #0f172a;">
      <h2 style="font-size: 18px; margin: 0 0 12px;">${subject}</h2>
      <table style="border-collapse: collapse; font-size: 14px;">
        ${rows
          .map(
            ([k, v]) => `<tr>
              <td style="padding: 4px 12px 4px 0; color: #64748b; vertical-align: top;">${k}</td>
              <td style="padding: 4px 0;"><strong>${v}</strong></td>
            </tr>`
          )
          .join("")}
      </table>
    </div>
  `;
  try {
    const { error } = await resend.emails.send({ from: FROM, to: ADMIN_RECIPIENTS, subject, html: body });
    if (error) console.error(`Resend recusou a notificação admin "${subject}":`, error);
  } catch (err) {
    console.error(`Falha ao enviar notificação admin "${subject}":`, err);
  }
}

/** Avisa o admin de um novo cadastro. Chame com fire-and-forget (void). */
export async function notifyAdminNewSignup(opts: {
  name?: string | null;
  email: string;
  phone?: string | null;
  segment?: string | null;
}) {
  const rows: Array<[string, string]> = [
    ["Nome", opts.name?.trim() || "—"],
    ["E-mail", opts.email],
  ];
  if (opts.phone?.trim()) rows.push(["Telefone", opts.phone.trim()]);
  if (opts.segment?.trim()) rows.push(["Momento de carreira", opts.segment.trim()]);
  await sendAdmin("Novo cadastro 🎉", rows);
}

/** Avisa o admin de uma venda confirmada. Chame com fire-and-forget (void). */
export async function notifyAdminPurchase(opts: {
  product: string;
  amountCents: number;
  email?: string | null;
}) {
  await sendAdmin("Nova venda 💰", [
    ["Produto", opts.product],
    ["Valor", formatCentsToBRL(opts.amountCents)],
    ["Cliente", opts.email?.trim() || "—"],
  ]);
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  await send(
    to,
    "Redefinir sua senha",
    `
      <h2 style="font-size: 20px;">Redefinir sua senha</h2>
      <p>Recebemos um pedido para redefinir a senha da sua conta. Clique no botão abaixo para escolher uma nova senha:</p>
      ${button(resetUrl, "Redefinir senha")}
      <p>Se o botão não funcionar, copie e cole este link no navegador:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>Este link expira em 1 hora. Se você não pediu essa redefinição, pode ignorar este e-mail.</p>
    `
  );
}

export async function sendWelcomeEmail(to: string, name?: string | null) {
  const greeting = name?.trim() ? `Olá, ${name.trim().split(" ")[0]}!` : "Olá!";
  await send(
    to,
    `Bem-vindo(a) ao ${BRAND} 🎉`,
    `
      <h2 style="font-size: 20px;">${greeting}</h2>
      <p>Sua conta no ${BRAND} está pronta. A partir de agora você pode analisar seu currículo contra qualquer vaga e descobrir, com IA, o quanto você está aderente e como melhorar.</p>
      <p>Comece pela sua primeira análise:</p>
      ${button(`${APP_URL}/analise`, "Analisar meu currículo")}
      <p>Dica: quanto mais específica for a descrição da vaga, mais preciso fica o diagnóstico.</p>
    `
  );
}

export async function sendSupportReplyEmail(to: string, opts: { ticketId: string; subject: string }) {
  await send(
    to,
    `Nova resposta no suporte: ${opts.subject}`,
    `
      <h2 style="font-size: 20px;">Você recebeu uma resposta</h2>
      <p>Nossa equipe respondeu ao chamado <strong>${opts.subject}</strong>.</p>
      ${button(`${APP_URL}/suporte/${opts.ticketId}`, "Ver resposta")}
    `
  );
}

export async function notifyAdminSupportTicket(opts: {
  ticketId: string;
  subject: string;
  email: string;
}) {
  await sendAdmin("Novo chamado de suporte", [
    ["Assunto", opts.subject],
    ["Usuário", opts.email],
    ["Atendimento", `${APP_URL}/admin/suporte/${opts.ticketId}`],
  ]);
}

/** Avisa o candidato que uma empresa pediu contato pelo banco de talentos. */
export async function sendTalentContactRequestEmail(
  to: string,
  opts: { companyName: string; jobTitle?: string }
) {
  const forJob = opts.jobTitle?.trim() ? ` para a vaga de <strong>${opts.jobTitle.trim()}</strong>` : "";
  await send(
    to,
    `${opts.companyName} quer falar com você`,
    `
      <h2 style="font-size: 20px;">Uma empresa quer seu contato</h2>
      <p><strong>${opts.companyName}</strong> encontrou seu perfil no banco de talentos do ${BRAND} e pediu para entrar em contato${forJob}.</p>
      <p>Seu contato só é liberado se você aceitar. Veja o pedido e decida:</p>
      ${button(`${APP_URL}/settings`, "Ver pedido de contato")}
    `
  );
}

/** Avisa a empresa que o candidato liberou o contato. */
export async function sendCompanyContactAcceptedEmail(
  to: string,
  opts: { candidateName: string; jobTitle?: string }
) {
  const forJob = opts.jobTitle?.trim() ? ` para a vaga de <strong>${opts.jobTitle.trim()}</strong>` : "";
  await send(
    to,
    `${opts.candidateName} liberou o contato`,
    `
      <h2 style="font-size: 20px;">Contato liberado 🎉</h2>
      <p><strong>${opts.candidateName}</strong> aceitou seu pedido de contato${forJob}. Os dados já estão disponíveis na sua central de contatos.</p>
      ${button(`${APP_URL}/empresa/contatos`, "Ver contato")}
    `
  );
}

/** Avisa o candidato que a empresa agendou uma entrevista. */
export async function sendInterviewScheduledEmail(
  to: string,
  opts: { companyName: string; whenText: string; note?: string }
) {
  const noteHtml = opts.note?.trim()
    ? `<p style="background:#f1f5f9;border-radius:10px;padding:12px;">${opts.note.trim()}</p>`
    : "";
  await send(
    to,
    `${opts.companyName} agendou uma entrevista com você`,
    `
      <h2 style="font-size: 20px;">Entrevista agendada 📅</h2>
      <p><strong>${opts.companyName}</strong> agendou uma entrevista com você para <strong>${opts.whenText}</strong>.</p>
      ${noteHtml}
      <p>Fique atento(a) ao seu e-mail e telefone: a empresa pode entrar em contato com mais detalhes.</p>
    `
  );
}

export async function sendPaymentConfirmationEmail(
  to: string,
  opts: { kind: string; amountCents: number }
) {
  const isDiagnostic = opts.kind === "diagnostic";
  const what = isDiagnostic ? "o diagnóstico completo da sua análise" : "sua análise completa";
  const cta = isDiagnostic
    ? { href: `${APP_URL}/report`, label: "Ver meu diagnóstico" }
    : { href: `${APP_URL}/analise`, label: "Ir para minha análise" };

  await send(
    to,
    "Pagamento confirmado ✅",
    `
      <h2 style="font-size: 20px;">Pagamento confirmado</h2>
      <p>Recebemos seu pagamento de <strong>${formatCentsToBRL(opts.amountCents)}</strong> e liberamos ${what}.</p>
      ${button(cta.href, cta.label)}
      <p>Se tiver qualquer dúvida, é só responder este e-mail.</p>
    `
  );
}

export async function sendSubscriptionConfirmationEmail(
  to: string,
  opts: { currentPeriodEnd: Date }
) {
  const renew = formatBrazilDate(opts.currentPeriodEnd);
  await send(
    to,
    "Assinatura ativada 🚀",
    `
      <h2 style="font-size: 20px;">Sua assinatura está ativa</h2>
      <p>Tudo certo! Sua assinatura do ${BRAND} está ativa e você já tem acesso completo às análises, feed de vagas, preparação de entrevista e às ferramentas do plano.</p>
      <p>Próxima renovação em <strong>${renew}</strong>. Você pode gerenciar ou cancelar quando quiser em Configurações.</p>
      ${button(`${APP_URL}/dashboard`, "Acessar minha conta")}
    `
  );
}

export async function sendPaymentFailedEmail(
  to: string,
  opts: { kind: string; amountCents: number }
) {
  const isSubscription = opts.kind === "subscription";
  const what = isSubscription ? "sua assinatura" : "seu pagamento";
  const cta = isSubscription
    ? { href: `${APP_URL}/settings`, label: "Tentar novamente" }
    : { href: `${APP_URL}/analise`, label: "Tentar novamente" };

  await send(
    to,
    "Não conseguimos processar seu pagamento",
    `
      <h2 style="font-size: 20px;">Seu pagamento não foi aprovado</h2>
      <p>Tentamos processar ${what} no valor de <strong>${formatCentsToBRL(opts.amountCents)}</strong>, mas o pagamento não foi autorizado pela operadora do cartão.</p>
      <p>Isso costuma acontecer por limite, dados divergentes ou uma trava de segurança do banco. Você pode tentar de novo com outro cartão ou via Pix:</p>
      ${button(cta.href, cta.label)}
      <p>Se precisar de ajuda, é só responder este e-mail.</p>
    `
  );
}

export async function sendSubscriptionCancelledEmail(to: string) {
  await send(
    to,
    "Sua assinatura foi cancelada",
    `
      <h2 style="font-size: 20px;">Assinatura cancelada</h2>
      <p>Confirmamos o cancelamento da sua assinatura do ${BRAND}. Não faremos novas cobranças.</p>
      <p>Você continua com acesso até o fim do período já pago. Depois disso, sua conta volta ao plano gratuito, mas seus dados e análises ficam salvos.</p>
      <p>Mudou de ideia? Você pode reativar a qualquer momento:</p>
      ${button(`${APP_URL}/settings`, "Reativar assinatura")}
      <p>Se puder, responda contando o que faltou pra gente, seu feedback ajuda muito.</p>
    `
  );
}

export async function sendRenewalReminderEmail(
  to: string,
  opts: { currentPeriodEnd: Date; autoRenews: boolean }
) {
  const date = formatBrazilDate(opts.currentPeriodEnd);
  const body = opts.autoRenews
    ? `
      <h2 style="font-size: 20px;">Sua renovação está chegando</h2>
      <p>Passando para lembrar que sua assinatura do ${BRAND} renova automaticamente em <strong>${date}</strong>. Você não precisa fazer nada, o acesso continua sem interrupção.</p>
      <p>Se quiser revisar seu plano ou gerenciar a assinatura, é só acessar Configurações:</p>
      ${button(`${APP_URL}/settings`, "Gerenciar assinatura")}
    `
    : `
      <h2 style="font-size: 20px;">Seu acesso vai expirar em breve</h2>
      <p>Seu acesso ao ${BRAND} vai até <strong>${date}</strong>. Como seu plano é pago de forma avulsa (sem débito automático), o acesso não renova sozinho.</p>
      <p>Para continuar sem interrupção, renove seu plano em Configurações:</p>
      ${button(`${APP_URL}/settings`, "Renovar meu acesso")}
    `;
  await send(to, opts.autoRenews ? "Sua assinatura renova em breve" : "Seu acesso expira em breve", body);
}

export async function sendSubscriptionExpiredEmail(to: string) {
  await send(
    to,
    "Seu acesso expirou",
    `
      <h2 style="font-size: 20px;">Seu acesso ao ${BRAND} expirou</h2>
      <p>Seu período de assinatura chegou ao fim e sua conta voltou ao plano gratuito. Seus dados e análises continuam salvos, mas os recursos completos (feed de vagas, preparação de entrevista e ferramentas do plano) ficam bloqueados.</p>
      <p>Quer retomar de onde parou? Reative em poucos cliques:</p>
      ${button(`${APP_URL}/settings`, "Reativar meu acesso")}
    `
  );
}

export async function sendLeadFollowUpEmail(
  to: string,
  opts: { name?: string | null; checkoutUrl?: string }
) {
  const greeting = opts.name?.trim() ? `Olá, ${opts.name.trim().split(" ")[0]}!` : "Olá!";
  const checkoutUrl = opts.checkoutUrl?.startsWith("/") ? opts.checkoutUrl : "/analise";
  await send(
    to,
    "Seu diagnóstico de carreira está esperando",
    `
      <h2 style="font-size: 20px;">${greeting}</h2>
      <p>Você começou uma análise no ${BRAND} e ficou faltando pouco para ver o resultado completo: seu score de aderência, o que os recrutadores enxergam primeiro e os ajustes que mais aumentam suas chances.</p>
      <p>Leva menos de 2 minutos para desbloquear:</p>
      ${button(`${APP_URL}${checkoutUrl}`, "Ver minha análise completa")}
      <p>Dica: quanto mais específica a descrição da vaga, mais preciso fica o diagnóstico.</p>
    `
  );
}

export async function sendDiagnosticUpgradeEmail(
  to: string,
  opts: { segment: string; analysisId?: string | null }
) {
  const href = `${APP_URL}/assinar?segment=${encodeURIComponent(opts.segment)}`;
  await send(
    to,
    "Leve seu diagnóstico para as próximas vagas",
    `
      <h2 style="font-size: 20px;">Um diagnóstico é o começo</h2>
      <p>Agora que você já viu o que ajustar nesta oportunidade, o próximo passo é repetir o processo nas próximas vagas e acompanhar sua evolução.</p>
      <p>Com o plano mensal, você reúne novas análises, currículo otimizado, preparação de entrevista, plano de ação e acompanhamento das candidaturas.</p>
      ${button(href, "Conhecer o plano mensal")}
      <p>Você pode cancelar quando quiser.</p>
    `
  );
}

export async function sendCheckoutRecoveryEmail(
  to: string,
  opts: { segment: string }
) {
  const href = `${APP_URL}/assinar?segment=${encodeURIComponent(opts.segment)}`;
  await send(
    to,
    "Quer continuar sua assinatura?",
    `
      <h2 style="font-size: 20px;">Seu plano ainda não foi ativado</h2>
      <p>Você começou o pagamento, mas a assinatura ainda não foi confirmada. Se o Pix expirou ou o cartão não foi aprovado, pode retomar com outra forma de pagamento.</p>
      ${button(href, "Retomar assinatura")}
      <p>Se já pagou por Pix, aguarde alguns instantes: a confirmação é automática.</p>
    `
  );
}

export async function sendOnboardingNudgeEmail(
  to: string,
  opts: { name?: string | null }
) {
  const greeting = opts.name?.trim() ? `Olá, ${opts.name.trim().split(" ")[0]}!` : "Olá!";
  await send(
    to,
    "Vamos fazer sua primeira análise?",
    `
      <h2 style="font-size: 20px;">${greeting}</h2>
      <p>Você criou sua conta no ${BRAND} mas ainda não fez sua primeira análise. É o passo que mostra, com IA, o quanto seu currículo está aderente a uma vaga e exatamente o que melhorar.</p>
      <p>Comece agora, leva menos de 2 minutos:</p>
      ${button(`${APP_URL}/analise`, "Analisar meu currículo")}
      <p>Se tiver qualquer dúvida, é só responder este e-mail.</p>
    `
  );
}

export async function sendJobAlertEmail(
  to: string,
  opts: { query: string; location: string; jobs: Array<{ title: string; url: string; source: string }> }
) {
  const rows = opts.jobs.slice(0, 10).map((job) => `
    <div style="border:1px solid #e2e8f0;border-radius:10px;padding:12px;margin:10px 0;">
      <strong>${job.title}</strong>
      <p style="font-size:13px;color:#64748b;margin:5px 0;">${job.source}</p>
      <a href="${job.url}" style="color:#2563eb;">Ver oportunidade</a>
    </div>
  `).join("");
  await send(
    to,
    `Novas vagas${opts.location ? ` em ${opts.location}` : ""}`,
    `
      <h2 style="font-size:20px;">Encontramos novas oportunidades</h2>
      <p>${opts.query ? `Busca: <strong>${opts.query}</strong>. ` : ""}${opts.location ? `Local: <strong>${opts.location}</strong>.` : ""}</p>
      ${rows}
      ${button(`${APP_URL}/vagas-publicas`, "Ver todas as vagas")}
      <p>Você pode alterar seus alertas nas configurações da sua conta.</p>
    `,
  );
}

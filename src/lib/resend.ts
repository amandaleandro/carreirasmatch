import { Resend } from "resend";
import { formatCentsToBRL } from "@/lib/pricing";
import { prisma } from "@/lib/prisma";
import { formatBrazilDate } from "@/lib/brazil";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const APP_URL = (process.env.APP_URL ?? "https://carreirasmatch.com.br").replace(/\/$/, "");
const BRAND = "CarreirasMatch";
// Com nome de exibição: sem isso, o Gmail mostra o e-mail cru como remetente em vez de "CarreirasMatch".
const FROM = `${BRAND} <${process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev"}>`;
const LOGO_URL = `${APP_URL}/logos/wordmark-dark.png`; // texto branco, p/ fundo azul do cabeçalho

/**
 * Envelopa o conteúdo num layout de e-mail consistente. `bodyHtml` já vem com os
 * parágrafos/botões prontos. Usa tabelas (não só divs) porque clientes como o
 * Outlook desktop ignoram boa parte do CSS em divs soltas.
 */
function layout(bodyHtml: string) {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef2f9;padding:32px 16px;font-family:-apple-system,'Segoe UI',sans-serif;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 1px 3px rgba(15,23,42,.08);">
            <tr>
              <td style="background:linear-gradient(135deg,#2563eb,#1e40af);padding:24px 28px;">
                <a href="${APP_URL}" style="text-decoration:none;">
                  <img src="${LOGO_URL}" alt="${BRAND}" height="28" style="height:28px;width:auto;display:block;border:0;" />
                </a>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 28px 6px;color:#0f172a;font-size:15px;line-height:1.65;">
                ${bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:12px 28px 26px;">
                <hr style="border:none;border-top:1px solid #e2e8f0;margin:8px 0 16px;" />
                <p style="font-size:12px;color:#64748b;margin:0;line-height:1.5;">
                  Você recebeu este e-mail porque tem uma conta no ${BRAND} 💙<br/>
                  <a href="${APP_URL}" style="color:#64748b;">${APP_URL.replace(/^https?:\/\//, "")}</a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;
}

function button(href: string, label: string) {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:22px 0;">
      <tr>
        <td style="border-radius:12px;background:linear-gradient(135deg,#2563eb,#1e40af);">
          <a href="${href}" style="display:inline-block;padding:14px 26px;color:#ffffff;font-weight:700;font-size:15px;text-decoration:none;border-radius:12px;">
            ${label} →
          </a>
        </td>
      </tr>
    </table>
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
    <div style="font-family: -apple-system, Segoe UI, sans-serif; max-width: 480px; margin: 0 auto; color: #0f172a; background:#ffffff; border-radius:16px; padding:20px 24px; border:1px solid #e2e8f0;">
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
    ["Nome", opts.name?.trim() || "Não informado"],
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
    ["Cliente", opts.email?.trim() || "Não informado"],
  ]);
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  await send(
    to,
    "🔐 Redefinir sua senha",
    `
      <h2 style="font-size: 20px;">🔐 Redefinir sua senha</h2>
      <p>Recebemos um pedido para redefinir a senha da sua conta. Clique no botão abaixo para escolher uma nova senha:</p>
      ${button(resetUrl, "Redefinir senha")}
      <p>Se o botão não funcionar, copie e cole este link no navegador:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>Este link expira em 1 hora. Se você não pediu essa redefinição, pode ignorar este e-mail 🙂</p>
    `
  );
}

export async function sendWelcomeEmail(to: string, name?: string | null) {
  const greeting = name?.trim() ? `Olá, ${name.trim().split(" ")[0]}! 👋` : "Olá! 👋";
  await send(
    to,
    `Bem-vindo(a) ao ${BRAND} 🎉`,
    `
      <h2 style="font-size: 20px;">${greeting}</h2>
      <p>Sua conta no ${BRAND} está pronta. A partir de agora você pode analisar seu currículo contra qualquer vaga e descobrir, com IA, o quanto você está aderente e como melhorar.</p>
      <p>Comece pela sua primeira análise 🚀</p>
      ${button(`${APP_URL}/analise`, "Analisar meu currículo")}
      <p>💡 Dica: quanto mais específica for a descrição da vaga, mais preciso fica o diagnóstico.</p>
    `
  );
}

export async function sendSupportReplyEmail(to: string, opts: { ticketId: string; subject: string }) {
  await send(
    to,
    `💬 Nova resposta no suporte: ${opts.subject}`,
    `
      <h2 style="font-size: 20px;">💬 Você recebeu uma resposta</h2>
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
    `👀 ${opts.companyName} quer falar com você`,
    `
      <h2 style="font-size: 20px;">👀 Uma empresa quer seu contato</h2>
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
    `🔓 ${opts.candidateName} liberou o contato`,
    `
      <h2 style="font-size: 20px;">Contato liberado 🎉</h2>
      <p><strong>${opts.candidateName}</strong> aceitou seu pedido de contato${forJob}. Os dados já estão disponíveis na sua central de contatos.</p>
      ${button(`${APP_URL}/empresa/contatos`, "Ver contato")}
    `
  );
}

/** Avisa a empresa que um candidato se candidatou a uma vaga publicada no feed. */
export async function sendCompanyNewApplicationEmail(
  to: string[],
  opts: { candidateName: string; vagaTitle: string; vagaId: string }
) {
  if (to.length === 0) return;
  for (const recipient of to) {
    await send(
      recipient,
      `🎯 Nova candidatura: ${opts.vagaTitle}`,
      `
        <h2 style="font-size: 20px;">Nova candidatura 🎯</h2>
        <p><strong>${opts.candidateName}</strong> se candidatou à sua vaga <strong>${opts.vagaTitle}</strong>.</p>
        <p>Veja os dados de contato do candidato na sua vaga:</p>
        ${button(`${APP_URL}/empresa/vagas/${opts.vagaId}`, "Ver candidatura")}
      `
    );
  }
}

/** Convida um novo membro da equipe da empresa, com a senha temporária. */
export async function sendCompanyMemberInviteEmail(
  to: string,
  opts: { companyName: string; tempPassword: string }
) {
  await send(
    to,
    `🤝 Você foi adicionado(a) à equipe de ${opts.companyName} no ${BRAND}`,
    `
      <h2 style="font-size: 20px;">Bem-vindo(a) à equipe 🤝</h2>
      <p>Você foi adicionado(a) como membro da equipe de <strong>${opts.companyName}</strong> no ${BRAND}.</p>
      <p>Entre com este e-mail e a senha temporária abaixo, e troque a senha no seu perfil:</p>
      <p style="background:#f1f5f9;border-radius:10px;padding:12px;font-size:16px;">
        🔑 Senha temporária: <strong>${opts.tempPassword}</strong>
      </p>
      ${button(`${APP_URL}/empresa/login`, "Entrar na área da empresa")}
    `
  );
}

/** Confirma a ativação do plano recorrente da empresa (vagas + triagens ilimitadas). */
export async function sendCompanySubscriptionConfirmationEmail(to: string, opts: { currentPeriodEnd: Date }) {
  const renew = formatBrazilDate(opts.currentPeriodEnd);
  await send(
    to,
    "Plano Ilimitado ativado 🚀",
    `
      <h2 style="font-size: 20px;">Seu Plano Ilimitado está ativo 🚀</h2>
      <p>Tudo certo! Agora sua empresa publica vagas e roda triagens de currículo por IA sem limite de créditos.</p>
      <p>Próxima renovação em <strong>${renew}</strong>. Você pode gerenciar ou cancelar quando quiser em Faturamento.</p>
      ${button(`${APP_URL}/empresa/billing`, "Ver meu plano")}
    `
  );
}

/** Avisa a empresa que o plano recorrente foi cancelado. */
export async function sendCompanySubscriptionCancelledEmail(to: string) {
  await send(
    to,
    "👋 Seu Plano Ilimitado foi cancelado",
    `
      <h2 style="font-size: 20px;">👋 Plano cancelado</h2>
      <p>Confirmamos o cancelamento do Plano Ilimitado da sua empresa. Não faremos novas cobranças.</p>
      <p>Sua empresa continua com acesso até o fim do período já pago. Depois disso, a triagem volta a consumir os créditos avulsos do seu saldo.</p>
      ${button(`${APP_URL}/empresa/billing`, "Reativar plano")}
    `
  );
}

/** Convida uma empresa cadastrada a publicar sua primeira vaga (nunca postou nenhuma). */
export async function sendCompanyDormantNudgeEmail(to: string, opts: { companyName: string }) {
  await send(
    to,
    "Sua vaga ainda não saiu do papel 👀",
    `
      <h2 style="font-size: 20px;">Bora publicar sua primeira vaga? 👀</h2>
      <p>Oi, ${opts.companyName}! Notamos que sua empresa se cadastrou no ${BRAND} mas ainda não publicou nenhuma vaga.</p>
      <p>Cadastrar uma vaga leva menos de 2 minutos e você já recebe candidatos ranqueados por aderência com IA, sem custo pra começar.</p>
      ${button(`${APP_URL}/empresa/vagas/nova`, "Publicar minha primeira vaga")}
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
    `📅 ${opts.companyName} agendou uma entrevista com você`,
    `
      <h2 style="font-size: 20px;">Entrevista agendada 📅</h2>
      <p><strong>${opts.companyName}</strong> agendou uma entrevista com você para <strong>${opts.whenText}</strong>.</p>
      ${noteHtml}
      <p>Fique atento(a) ao seu e-mail e telefone, a empresa pode entrar em contato com mais detalhes. 📞</p>
    `
  );
}

export async function sendPaymentConfirmationEmail(
  to: string,
  opts: { kind: string; amountCents: number }
) {
  const isDiagnostic = opts.kind === "diagnostic";
  const what = isDiagnostic ? "o Kit Candidatura da sua análise" : "sua análise completa";
  const cta = isDiagnostic
    ? { href: `${APP_URL}/report`, label: "Ver meu Kit Candidatura" }
    : { href: `${APP_URL}/analise`, label: "Ir para minha análise" };

  await send(
    to,
    "Pagamento confirmado ✅",
    `
      <h2 style="font-size: 20px;">Pagamento confirmado ✅</h2>
      <p>Recebemos seu pagamento de <strong>${formatCentsToBRL(opts.amountCents)}</strong> e liberamos ${what} 🎉</p>
      ${button(cta.href, cta.label)}
      <p>Se tiver qualquer dúvida, é só responder este e-mail 💬</p>
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
      <h2 style="font-size: 20px;">Sua assinatura está ativa 🚀</h2>
      <p>Tudo certo! Sua assinatura do ${BRAND} está ativa e você já tem acesso completo às análises, feed de vagas, preparação de entrevista e às ferramentas do plano ✨</p>
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
    "⚠️ Não conseguimos processar seu pagamento",
    `
      <h2 style="font-size: 20px;">⚠️ Seu pagamento não foi aprovado</h2>
      <p>Tentamos processar ${what} no valor de <strong>${formatCentsToBRL(opts.amountCents)}</strong>, mas o pagamento não foi autorizado pela operadora do cartão.</p>
      <p>Isso costuma acontecer por limite, dados divergentes ou uma trava de segurança do banco. Você pode tentar de novo com outro cartão ou via Pix 💳</p>
      ${button(cta.href, cta.label)}
      <p>Se precisar de ajuda, é só responder este e-mail 💬</p>
    `
  );
}

export async function sendSubscriptionCancelledEmail(to: string) {
  await send(
    to,
    "👋 Sua assinatura foi cancelada",
    `
      <h2 style="font-size: 20px;">👋 Assinatura cancelada</h2>
      <p>Confirmamos o cancelamento da sua assinatura do ${BRAND}. Não faremos novas cobranças.</p>
      <p>Você continua com acesso até o fim do período já pago. Depois disso, sua conta volta ao plano gratuito, mas seus dados e análises ficam salvos 💾</p>
      <p>Mudou de ideia? Você pode reativar a qualquer momento 🔄</p>
      ${button(`${APP_URL}/settings`, "Reativar assinatura")}
      <p>Se puder, responda contando o que faltou pra gente, seu feedback ajuda muito 🙏</p>
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
      <h2 style="font-size: 20px;">🔔 Sua renovação está chegando</h2>
      <p>Passando para lembrar que sua assinatura do ${BRAND} renova automaticamente em <strong>${date}</strong>. Você não precisa fazer nada, o acesso continua sem interrupção ✅</p>
      <p>Se quiser revisar seu plano ou gerenciar a assinatura, é só acessar Configurações:</p>
      ${button(`${APP_URL}/settings`, "Gerenciar assinatura")}
    `
    : `
      <h2 style="font-size: 20px;">⏰ Seu acesso vai expirar em breve</h2>
      <p>Seu acesso ao ${BRAND} vai até <strong>${date}</strong>. Como seu plano é pago de forma avulsa (sem débito automático), o acesso não renova sozinho.</p>
      <p>Para continuar sem interrupção, renove seu plano em Configurações:</p>
      ${button(`${APP_URL}/settings`, "Renovar meu acesso")}
    `;
  await send(to, opts.autoRenews ? "🔔 Sua assinatura renova em breve" : "⏰ Seu acesso expira em breve", body);
}

export async function sendSubscriptionExpiredEmail(to: string) {
  await send(
    to,
    "⌛ Seu acesso expirou",
    `
      <h2 style="font-size: 20px;">⌛ Seu acesso ao ${BRAND} expirou</h2>
      <p>Seu período de assinatura chegou ao fim e sua conta voltou ao plano gratuito. Seus dados e análises continuam salvos, mas os recursos completos (feed de vagas, preparação de entrevista e ferramentas do plano) ficam bloqueados 🔒</p>
      <p>Quer retomar de onde parou? Reative em poucos cliques:</p>
      ${button(`${APP_URL}/settings`, "Reativar meu acesso")}
    `
  );
}

export async function sendLeadFollowUpEmail(
  to: string,
  opts: { name?: string | null; checkoutUrl?: string }
) {
  const greeting = opts.name?.trim() ? `Olá, ${opts.name.trim().split(" ")[0]}! 👋` : "Olá! 👋";
  const checkoutUrl = opts.checkoutUrl?.startsWith("/") ? opts.checkoutUrl : "/analise";
  await send(
    to,
    "📊 Seu diagnóstico de carreira está esperando",
    `
      <h2 style="font-size: 20px;">${greeting}</h2>
      <p>Você começou uma análise no ${BRAND} e ficou faltando pouco para ver o resultado completo: seu score de aderência, o que os recrutadores enxergam primeiro e os ajustes que mais aumentam suas chances.</p>
      <p>Leva menos de 2 minutos para desbloquear ⏱️</p>
      ${button(`${APP_URL}${checkoutUrl}`, "Ver minha análise completa")}
      <p>💡 Dica: quanto mais específica a descrição da vaga, mais preciso fica o diagnóstico.</p>
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
    "🚀 Leve seu diagnóstico para as próximas vagas",
    `
      <h2 style="font-size: 20px;">Um diagnóstico é só o começo 🌱</h2>
      <p>Agora que você já viu o que ajustar nesta oportunidade, o próximo passo é repetir o processo nas próximas vagas e acompanhar sua evolução.</p>
      <p>Com o plano mensal, você reúne novas análises, currículo otimizado, preparação de entrevista, plano de ação e acompanhamento das candidaturas ✨</p>
      ${button(href, "Conhecer o plano mensal")}
      <p>Você pode cancelar quando quiser 🙂</p>
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
    "💳 Quer continuar sua assinatura?",
    `
      <h2 style="font-size: 20px;">Seu plano ainda não foi ativado</h2>
      <p>Você começou o pagamento, mas a assinatura ainda não foi confirmada. Se o Pix expirou ou o cartão não foi aprovado, pode retomar com outra forma de pagamento.</p>
      ${button(href, "Retomar assinatura")}
      <p>Se já pagou por Pix, aguarde alguns instantes, a confirmação é automática ⏳</p>
    `
  );
}

export async function sendOnboardingNudgeEmail(
  to: string,
  opts: { name?: string | null }
) {
  const greeting = opts.name?.trim() ? `Olá, ${opts.name.trim().split(" ")[0]}! 👋` : "Olá! 👋";
  await send(
    to,
    "✍️ Vamos fazer sua primeira análise?",
    `
      <h2 style="font-size: 20px;">${greeting}</h2>
      <p>Você criou sua conta no ${BRAND} mas ainda não fez sua primeira análise. É o passo que mostra, com IA, o quanto seu currículo está aderente a uma vaga e exatamente o que melhorar 🔍</p>
      <p>Comece agora, leva menos de 2 minutos ⏱️</p>
      ${button(`${APP_URL}/analise`, "Analisar meu currículo")}
      <p>Se tiver qualquer dúvida, é só responder este e-mail 💬</p>
    `
  );
}

export async function sendConvertToSubscriptionEmail(
  to: string,
  opts: { name?: string | null; segment?: string | null; score?: number | null; jobTitle?: string | null }
) {
  const greeting = opts.name?.trim() ? `Olá, ${opts.name.trim().split(" ")[0]}!` : "Olá!";
  const href = opts.segment?.trim()
    ? `${APP_URL}/assinar?segment=${encodeURIComponent(opts.segment.trim())}`
    : `${APP_URL}/assinar`;
  const forJob = opts.jobTitle?.trim() ? ` pra vaga de <strong>${opts.jobTitle.trim()}</strong>` : "";
  const subject =
    opts.score != null ? `🏟️ Seu currículo fez ${opts.score}. Você já sabe o que fazer com isso?` : "🎯 Você já sabe seu score. Falta o plano de ação.";
  const scoreLine =
    opts.score != null
      ? `<p>Você analisou seu currículo no ${BRAND} e o placar fechou em <strong>${opts.score} de aderência</strong>${forJob}. Não foi vexame, foi quase, e "quase" é exatamente o que o plano resolve 💪</p>`
      : `<p>Você analisou seu currículo no ${BRAND} e viu onde está sua aderência. Esse é o diagnóstico, a parte que dói. A parte que resolve é o que vem depois ✨</p>`;
  await send(
    to,
    subject,
    `
      <h2 style="font-size: 20px;">${greeting} 👋</h2>
      ${scoreLine}
      <p>Com o plano você transforma aquele score em ação: currículo reescrito ponto a ponto, simulação de entrevista para aquela vaga, e uma nova análise a cada oportunidade que aparecer, porque cada vaga pede um ajuste diferente.</p>
      ${button(href, "Ver o que muda com o plano")}
      <p>Sem fidelidade, cancela quando quiser. E se faltou algo para você decidir, é só responder este e-mail 💬</p>
    `
  );
}

/**
 * Recuperação no mesmo dia: a pessoa acabou de rodar uma análise, viu o teaser
 * bloqueado e fechou a aba. Chega horas depois, enquanto a vaga ainda está
 * quente, apontando de volta para o relatório dela.
 */
export async function sendAnalysisRecoveryEmail(
  to: string,
  opts: { name?: string | null; score: number; jobTitle?: string | null; analysisId: string }
) {
  const greeting = opts.name?.trim() ? `Olá, ${opts.name.trim().split(" ")[0]}!` : "Olá!";
  const forJob = opts.jobTitle?.trim() ? ` para <strong>${opts.jobTitle.trim()}</strong>` : "";
  const gap = Math.max(70 - opts.score, 0);
  const gapLine =
    gap > 0
      ? `<p>Faltam <strong>${gap} pontos</strong> para o seu perfil entrar na faixa de "recomendado aplicar", e o caminho já está mapeado no seu relatório: currículo otimizado em PDF, palavras-chave do ATS e as perguntas prováveis da entrevista.</p>`
      : `<p>Seu perfil já está na faixa de "recomendado aplicar" 🎉 O relatório completo tem o currículo otimizado em PDF e a preparação de entrevista para você aplicar com tudo.</p>`;
  await send(
    to,
    `⏳ Sua análise de hoje ficou pronta (${opts.score}% de match). A vaga ainda está aberta?`,
    `
      <h2 style="font-size: 20px;">${greeting} 👋</h2>
      <p>Sua análise${forJob} fechou em <strong>${opts.score}% de aderência</strong> hoje. O material completo já foi gerado para essa vaga e está esperando você.</p>
      ${gapLine}
      ${button(`${APP_URL}/report/${opts.analysisId}`, "Abrir meu relatório")}
      <p>Vagas boas fecham rápido: quem ajusta o currículo antes de aplicar sai na frente de quem manda o genérico 🏃</p>
    `
  );
}

/** Segundo toque da régua de conversão, alguns dias após o primeiro, com um ângulo diferente. */
export async function sendConvertSecondNudgeEmail(
  to: string,
  opts: { segment?: string | null }
) {
  const href = opts.segment?.trim()
    ? `${APP_URL}/assinar?segment=${encodeURIComponent(opts.segment.trim())}`
    : `${APP_URL}/assinar`;
  await send(
    to,
    "🔎 Elementar: seu currículo tem 7 segundos pra convencer alguém",
    `
      <h2 style="font-size: 20px;">Modo detetive 🕵️</h2>
      <p>Investigamos o caso do seu currículo contra a vaga. Evidência 1: as primeiras linhas não mencionam a palavra que o recrutador vai procurar primeiro. Evidência 2: a experiência mais relevante costuma ficar no meio da página, não no topo.</p>
      <p>O plano reabre o caso 📂 reorganiza, reescreve e realça exatamente o que os 7 segundos de leitura de um recrutador precisam encontrar primeiro.</p>
      ${button(href, "Reabrir meu caso")}
    `
  );
}

/** Comemora a primeira análise concluída pelo usuário. */
export async function sendFirstAnalysisMilestoneEmail(
  to: string,
  opts: { name?: string | null }
) {
  const greeting = opts.name?.trim() ? `${opts.name.trim().split(" ")[0]}, ` : "";
  await send(
    to,
    "🏁 Conquista desbloqueada: sua primeira análise",
    `
      <h2 style="font-size: 20px;">Primeira análise: feita ✅🎉</h2>
      <p>${greeting}muita gente cria conta e nunca chega a rodar a primeira análise. Você já rodou, isso já te coloca na fração que realmente usa a ferramenta pra evoluir, não só pra olhar 🙌</p>
      <p>Próxima conquista: comparar seu score em duas vagas diferentes e ver o que muda 📈</p>
      ${button(`${APP_URL}/analise`, "Analisar outra vaga")}
    `
  );
}

/** Comemora quando um usuário melhora o score em relação à análise anterior. */
export async function sendScoreImprovedEmail(
  to: string,
  opts: { previousScore: number; newScore: number; jobTitle?: string | null }
) {
  const forJob = opts.jobTitle?.trim() ? ` pra <strong>${opts.jobTitle.trim()}</strong>` : "";
  await send(
    to,
    `📈 De ${opts.previousScore} pra ${opts.newScore}: seu currículo evoluiu de verdade`,
    `
      <h2 style="font-size: 20px;">📈 Seu score subiu, e a gente reparou</h2>
      <p>Sua última análise${forJob} fechou em <strong>${opts.newScore} de aderência</strong>, ${opts.newScore - opts.previousScore} pontos a mais que a anterior. O currículo é o mesmo currículo, mas ajustado 🎯 Prova de que o processo funciona quando repetido.</p>
      <p>Guarda essa versão como referência pra próxima vaga parecida 💾</p>
      ${button(`${APP_URL}/dashboard`, "Ver o que mudou")}
    `
  );
}

/** Terceiro e último toque da régua de conversão: cupom pessoal, uso único e com prazo real. */
export async function sendUrgencyCouponEmail(
  to: string,
  opts: { code: string; expiresAt: Date; segment?: string | null }
) {
  const segmentParam = opts.segment?.trim() ? `segment=${encodeURIComponent(opts.segment.trim())}&` : "";
  const href = `${APP_URL}/assinar?${segmentParam}coupon=${encodeURIComponent(opts.code)}`;
  const until = formatBrazilDate(opts.expiresAt);
  await send(
    to,
    "⏳ Esta oferta se autodestrói em 48h (não, sério)",
    `
      <h2 style="font-size: 20px;">Sua missão, caso decida aceitar 🎯</h2>
      <p>Assinar o plano com <strong>20% de desconto</strong> 🎁, válido até <strong>${until}</strong>. Depois disso o cupom expira sozinho (esta mensagem não se autodestrói, relaxa 😉).</p>
      <p style="background:#f1f5f9;border-radius:10px;padding:12px;font-size:16px;">
        🎟️ Cupom: <strong>${opts.code}</strong>
      </p>
      ${button(href, "Usar meu cupom agora")}
      <p>O código já vem preenchido se você clicar no botão. Vale só uma vez e só até o prazo acima ⏰</p>
    `
  );
}

/** Comemora marcos de volume: a cada 10 análises concluídas pelo usuário. */
export async function sendAnalysisCountMilestoneEmail(
  to: string,
  opts: { count: number }
) {
  await send(
    to,
    `🏅 ${opts.count} vagas analisadas. Isso já é maratona, não corrida de 100m`,
    `
      <h2 style="font-size: 20px;">🏅 ${opts.count} análises concluídas</h2>
      <p>Testar o currículo contra ${opts.count} vagas diferentes é o tipo de persistência que separa quem só espera resposta de quem constrói a própria sorte 💪</p>
      <p>Bônus: dá pra ver, no seu histórico, qual tipo de vaga seu currículo casa melhor 📊</p>
      ${button(`${APP_URL}/dashboard`, "Ver meu histórico de scores")}
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
    `📬 Novas vagas${opts.location ? ` em ${opts.location}` : ""}`,
    `
      <h2 style="font-size:20px;">📬 Encontramos novas oportunidades</h2>
      <p>${opts.query ? `Busca: <strong>${opts.query}</strong>. ` : ""}${opts.location ? `Local: <strong>${opts.location}</strong>.` : ""}</p>
      ${rows}
      ${button(`${APP_URL}/vagas-publicas`, "Ver todas as vagas")}
      <p>Você pode alterar seus alertas nas configurações da sua conta ⚙️</p>
    `,
  );
}

/** Digest semanal do candidato: resumo da semana + gancho de re-análise. */
export async function sendWeeklyDigestEmail(
  to: string,
  opts: {
    name: string | null;
    analysesCount: number;
    bestScore: number | null;
    scoreDelta: number | null;
    newMatchesCount: number;
    applicationsCount?: number;
  }
) {
  const greeting = opts.name ? `Olá, ${opts.name.split(" ")[0]}!` : "Olá!";
  const lines: string[] = [];
  if (opts.analysesCount > 0) {
    lines.push(
      `<li>Você fez <strong>${opts.analysesCount}</strong> análise${opts.analysesCount > 1 ? "s" : ""} de currículo esta semana${opts.bestScore !== null ? ` — melhor nota: <strong>${opts.bestScore}/100</strong>` : ""}.</li>`
    );
  }
  if (opts.scoreDelta !== null && opts.scoreDelta > 0) {
    lines.push(`<li>Sua nota subiu <strong>+${opts.scoreDelta} pontos</strong> em relação à semana anterior. 📈</li>`);
  }
  if (opts.newMatchesCount > 0) {
    lines.push(`<li><strong>${opts.newMatchesCount}</strong> vaga${opts.newMatchesCount > 1 ? "s" : ""} nova${opts.newMatchesCount > 1 ? "s" : ""} compatível${opts.newMatchesCount > 1 ? "eis" : ""} com seu currículo. 🎯</li>`);
  }
  if (opts.applicationsCount && opts.applicationsCount > 0) {
    lines.push(`<li><strong>${opts.applicationsCount}</strong> candidatura${opts.applicationsCount > 1 ? "s" : ""} no seu painel de acompanhamento. 📌</li>`);
  }
  await send(
    to,
    "📊 Sua semana no CarreirasMatch",
    `
      <h2 style="font-size:20px;">${greeting}</h2>
      <p>Resumo da sua semana de busca:</p>
      <ul style="font-size:14px;color:#334155;line-height:1.8;">${lines.join("")}</ul>
      <p>Ajustou o currículo? Re-analise e veja sua nota subir.</p>
      ${button(`${APP_URL}/analise`, "Analisar meu currículo")}
    `,
  );
}

/** Alerta B2B: novos candidatos no banco de talentos compatíveis com as vagas abertas da empresa. */
export async function sendCompanyNewTalentEmail(
  to: string,
  opts: { companyName: string; newTalentCount: number; areas: string[] }
) {
  const areasLabel = opts.areas.length > 0 ? ` nas áreas de ${opts.areas.join(", ")}` : "";
  await send(
    to,
    `👋 ${opts.newTalentCount} candidato${opts.newTalentCount > 1 ? "s" : ""} novo${opts.newTalentCount > 1 ? "s" : ""} no banco de talentos`,
    `
      <h2 style="font-size:20px;">Novos candidatos para ${opts.companyName}</h2>
      <p>Esta semana, <strong>${opts.newTalentCount}</strong> candidato${opts.newTalentCount > 1 ? "s" : ""} novo${opts.newTalentCount > 1 ? "s se cadastraram" : " se cadastrou"} no banco de talentos${areasLabel} — compatíveis com suas vagas abertas.</p>
      <p>Rode o matching para ver a aderência de cada um e pedir contato.</p>
      ${button(`${APP_URL}/empresa/talentos`, "Ver candidatos no banco de talentos")}
    `,
  );
}

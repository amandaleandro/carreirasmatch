import { Resend } from "resend";
import { formatCentsToBRL } from "@/lib/pricing";

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
    await resend.emails.send({ from: FROM, to, subject, html: layout(bodyHtml) });
  } catch (err) {
    console.error(`Falha ao enviar e-mail "${subject}" para ${to}:`, err);
  }
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
  const renew = opts.currentPeriodEnd.toLocaleDateString("pt-BR");
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

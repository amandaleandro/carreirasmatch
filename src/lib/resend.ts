import { Resend } from "resend";
import { formatCentsToBRL } from "@/lib/pricing";
import { prisma } from "@/lib/prisma";
import { formatBrazilDate } from "@/lib/brazil";
import { createNpsToken } from "@/lib/nps-token";
import { runJsonAcrossProviders } from "@/lib/ai-providers";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const APP_URL = (process.env.APP_URL ?? "https://carreirasmatch.com.br").replace(/\/$/, "");
const BRAND = "CarreirasMatch";
const BRAND_POSITIONING =
  "Você mostra onde quer chegar. O CarreirasMatch organiza a rota, transformando dúvida em direção e ajudando a entender, decidir, preparar, executar e acompanhar.";
// Com nome de exibição: sem isso, o Gmail mostra o e-mail cru como remetente em vez de "CarreirasMatch".
const FROM = `${BRAND} <${process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev"}>`;
const LOGO_URL = `${APP_URL}/logos/wordmark-dark.png`; // texto branco, p/ fundo azul do cabeçalho

/**
 * Envelopa o conteúdo num layout de e-mail consistente. `bodyHtml` já vem com os
 * parágrafos/botões prontos. Usa tabelas (não só divs) porque clientes como o
 * Outlook desktop ignoram boa parte do CSS em divs soltas.
 */
/**
 * Mapa de ilustração por nicho (mesmos PNGs usados nas landing pages /para/*),
 * reaproveitado nos e-mails cujo contexto já carrega `segment`, pra dar uma cara
 * visual em vez de só texto. `segment` vem solto (form, query param, DB) então o
 * lookup é tolerante e devolve null se não bater com nenhum nicho conhecido.
 */
const NICHE_HERO_IMAGES: Record<string, string> = {
  internship: "/niche-hero/estagio.png",
  first_job: "/niche-hero/primeiro-emprego.png",
  career_change: "/niche-hero/transicao.png",
  career_pro: "/niche-hero/recolocacao.png",
  apprentice: "/niche-hero/aprendiz.png",
  student: "/niche-hero/estudante.png",
  concurseiro: "/niche-hero/concurso.png",
  oab: "/niche-hero/oab.png",
};

function nicheHeroImageUrl(segment?: string | null): string | null {
  const path = segment ? NICHE_HERO_IMAGES[segment.trim()] : undefined;
  return path ? `${APP_URL}${path}` : null;
}

function layout(
  bodyHtml: string,
  opts?: { heroImageUrl?: string | null; heroImageAlt?: string; preheader?: string }
) {
  const heroImageHtml = opts?.heroImageUrl
    ? `
      <tr>
        <td style="background:#f8fafc;line-height:0;">
          <img src="${opts.heroImageUrl}" alt="${opts.heroImageAlt ?? BRAND}" width="640" style="width:100%;max-width:640px;height:auto;display:block;border:0;" />
        </td>
      </tr>
    `
    : "";
  return `
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${opts?.preheader ?? "Do objetivo ao próximo passo."}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;background:#ffffff;overflow:hidden;">
            <tr>
              <td style="background:#0b1730;padding:34px 40px 30px;border-bottom:4px solid #60a5fa;">
                <a href="${APP_URL}" style="text-decoration:none;">
                  <img src="${LOGO_URL}" alt="${BRAND}" width="190" style="width:190px;height:auto;display:block;border:0;" />
                </a>
                <p style="margin:22px 0 0;color:#bfdbfe;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;">Do objetivo ao próximo passo.</p>
              </td>
            </tr>
            ${heroImageHtml}
            <tr>
              <td style="height:0;font-size:0;line-height:0;">&nbsp;</td>
            </tr>
            <tr>
              <td style="padding:46px 40px 18px;color:#1e293b;font-size:15px;line-height:1.75;">
                ${bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:12px 40px 40px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:10px;">
                  <tr><td style="border-top:1px solid #eef2f7;font-size:0;line-height:0;">&nbsp;</td></tr>
                </table>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;">
                  <tr>
                    <td>
                      <p style="font-size:12.5px;color:#94a3b8;margin:0;line-height:1.7;">
                        Você recebeu este e-mail porque tem uma conta no <strong style="color:#64748b;">${BRAND}</strong> 💙<br/>
                        <a href="${APP_URL}" style="color:#2563eb;text-decoration:none;">${APP_URL.replace(/^https?:\/\//, "")}</a>
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
          <p style="font-size:11.5px;color:#94a3b8;margin:22px 0 0;">${BRAND} · menos dúvida, mais direção.</p>
        </td>
      </tr>
    </table>
  `;
}

function button(href: string, label: string) {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0;">
      <tr>
        <td style="border-radius:12px;background:#2563eb;">
          <a href="${href}" style="display:inline-block;padding:14px 24px;color:#ffffff;font-weight:700;font-size:14px;text-decoration:none;border-radius:12px;letter-spacing:.1px;">
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
async function send(
  to: string,
  subject: string,
  bodyHtml: string,
  heroImage?: { url: string | null; alt?: string }
) {
  if (!resend) {
    console.error(`RESEND_API_KEY não configurada, e-mail "${subject}" não foi enviado para ${to}.`);
    return;
  }
  try {
    // O SDK NÃO lança em erro de API (chave inválida, domínio não verificado):
    // devolve { data, error }. Sem checar `error` aqui, a falha some em silêncio.
    const html = layout(bodyHtml, {
      heroImageUrl: heroImage?.url,
      heroImageAlt: heroImage?.alt,
      preheader: subject,
    });
    const { error } = await resend.emails.send({ from: FROM, to, subject, html });
    if (error) {
      console.error(`Resend recusou o e-mail "${subject}" para ${to}:`, error);
    }
  } catch (err) {
    // Só cai aqui em falha de rede/exceção inesperada.
    console.error(`Falha ao enviar e-mail "${subject}" para ${to}:`, err);
  }
}

const EMAIL_COPY_SYSTEM_PROMPT = `
Você escreve e-mails de lifecycle para o ${BRAND}, uma marca brasileira que transforma dúvida
em direção para quem está escolhendo, preparando e acompanhando uma oportunidade.

Posicionamento da marca: ${BRAND_POSITIONING}

Tom de voz: claro, direto, seguro e próximo. Fale como aquela pessoa organizada que leu tudo,
encontrou o que importa e recomenda uma ação. O CarreirasMatch não fala como consultoria,
recrutador corporativo, coach ou robô futurista. Recomenda, não decreta.

Regras:
- Português do Brasil, natural e direto, sem formalidade corporativa.
- Pode usar no máximo 1 emoji e só quando ele ajudar a leitura.
- Nunca use travessão/meia-risca; troque por vírgula, ponto, dois-pontos ou parênteses.
- Use o vocabulário da marca: Match, Rota, Sinais, Lacunas, vaga-alvo, candidatura preparada
  e próximo passo. Quando fizer sentido, use os nomes oficiais: Meu Match, Match da Vaga,
  Sinais da Vaga, Plano de Candidatura, Minha Rota, Minhas Candidaturas e Minha Evolução.
- Estruture a mensagem, quando possível, em: situação, diagnóstico, consequência, direção
  e próximo passo.
- Prefira frases proprietárias como "Antes de se candidatar, dê Match", "Uma vaga. Uma rota",
  "Entenda antes de enviar" e "Seu próximo passo começa aqui". Não force mais de uma na mesma mensagem.
- Para CTAs, prefira ações concretas: "Ver meu Match", "Ver meu Plano", "Preparar esta vaga",
  "Melhorar meu currículo", "Treinar entrevista", "Continuar minha rota" ou "Começar minha rota".
- Evite "garantir emprego", "hackear o ATS", "enganar o algoritmo", "vaga perfeita", "score"
  como protagonista e qualquer promessa de resultado.
- Não diga que a IA decide pela pessoa. Ela mostra sinais, contexto e prioridades para a
  pessoa decidir com mais segurança.
- O corpo do e-mail é HTML simples: um <h2> de abertura e alguns <p>. Sem <html>/<body>/<head>.
  Estilo já herda de um template, então não adicione cor/fonte/CSS, só as tags puras.
- NÃO inclua botão/link de call-to-action no HTML, ele é adicionado separadamente depois do seu texto.
- Responda em JSON: {"subject": "...", "html": "..."}.
- O "subject" deve ter no máximo ~70 caracteres, pode ter 1 emoji.
- Se o contexto tiver dados (nome, score, contadores etc.), use-os pra deixar o e-mail pessoal.
`.trim();

type CampaignFallback = { subject: string; bodyHtml: string };

/**
 * Gera a copy (assunto + corpo) de um e-mail de campanha via IA, reaproveitando o
 * roteador multi-provedor já usado pelas outras features. Cada envio produz um
 * texto levemente diferente, então o e-mail não soa como o mesmo template raspado
 * toda vez. Se a IA falhar (sem provedor configurado, erro, JSON inválido), cai
 * silenciosamente pro texto estático em `fallback`, então o envio nunca quebra.
 */
async function generateCampaignCopy(
  operation: string,
  contextPrompt: string,
  fallback: CampaignFallback
): Promise<CampaignFallback> {
  try {
    const raw = await runJsonAcrossProviders(
      EMAIL_COPY_SYSTEM_PROMPT,
      contextPrompt,
      0.9,
      600,
      "llama-3.3-70b-versatile",
      (value) => {
        if (
          !value ||
          typeof value !== "object" ||
          typeof (value as { subject?: unknown }).subject !== "string" ||
          typeof (value as { html?: unknown }).html !== "string"
        ) {
          throw new Error("formato inesperado da copy gerada");
        }
      },
      `email_copy_${operation}`
    );
    const parsed = JSON.parse(raw) as { subject: string; html: string };
    if (!parsed.subject.trim() || !parsed.html.trim()) return fallback;
    return { subject: parsed.subject.trim(), bodyHtml: parsed.html };
  } catch (err) {
    console.warn(`[email] geração de copy via IA falhou para "${operation}", usando fallback:`, err);
    return fallback;
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
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:560px;margin:0 auto;color:#0f172a;background:#f1f5fb;padding:32px 16px;">
      <div style="background:#172554;border-radius:18px 18px 0 0;padding:24px 28px;">
        <img src="${LOGO_URL}" alt="${BRAND}" height="22" style="height:22px;width:auto;display:block;border:0;" />
      </div>
      <div style="background:#ffffff;border-radius:0 0 18px 18px;padding:28px;border:1px solid #e2e8f0;border-top:0;">
      <p style="margin:0 0 8px;color:#2563eb;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;">Notificação interna</p>
      <h2 style="font-size:22px;line-height:1.25;margin:0 0 20px;color:#0f172a;">${subject}</h2>
      <table width="100%" style="border-collapse:collapse;font-size:14px;">
        ${rows
          .map(
            ([k, v]) => `<tr>
              <td style="padding:12px 12px 12px 0;color:#64748b;vertical-align:top;border-top:1px solid #eef2f7;">${k}</td>
              <td style="padding:12px 0;border-top:1px solid #eef2f7;"><strong>${v}</strong></td>
            </tr>`
          )
          .join("")}
      </table>
      </div>
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
  const greeting = name?.trim() ? `E aí, ${name.trim().split(" ")[0]}! 👋` : "E aí! 👋";
  const fallback: CampaignFallback = {
    subject: `🔓 Bem-vindo(a)! Prepare sua próxima candidatura`,
    bodyHtml: `
      <h2 style="font-size:21px;font-weight:700;letter-spacing:-.2px;margin:0 0 4px;color:#0f172a;">${greeting}</h2>
      <p style="color:#64748b;margin:0 0 16px;">Sua conta no ${BRAND} está pronta. Agora você pode preparar cada candidatura com mais clareza.</p>
      <p>Comece com uma vaga real: compare seu currículo com os requisitos, entenda seu Match e veja quais lacunas merecem atenção.</p>
      <p>Depois, ajuste seus materiais, treine para a conversa e acompanhe o próximo passo. A ideia é transformar a busca em um processo mais específico e mensurável.</p>
      <p>Leva menos de 2 minutos para fazer sua primeira análise.</p>
    `,
  };
  const copy = await generateCampaignCopy(
    "welcome",
    `Situação: primeiro e-mail depois que a pessoa acaba de criar a conta.
Nome: ${name?.trim() || "não informado"}.
Objetivo: dar boas-vindas e apresentar o ${BRAND} como um espaço para preparar cada candidatura com uma vaga real, entender o Match, identificar lacunas e escolher o próximo passo. Incentive a primeira análise, que leva menos de 2 minutos.
CTA (não incluir no html, só escrever até ele): "Analisar uma vaga".`,
    fallback
  );
  await send(
    to,
    copy.subject,
    `${copy.bodyHtml}
      ${button(`${APP_URL}/analise`, "Analisar uma vaga")}
      <p>💡 Dica: quanto mais específica a descrição da vaga que você colar, mais cirúrgico fica o diagnóstico.</p>
    `
  );
}

/**
 * Convite pra ativar as "Dicas por WhatsApp" (whatsappMarketingOptIn), pra
 * quem já tem conta mas nunca ligou o toggle. Disparo único (dedupe via
 * EmailLog), aponta pra /settings onde fica o WhatsappOptInToggle.
 */
export async function sendWhatsappOptinInviteEmail(to: string, name?: string | null) {
  const greeting = name?.trim() ? `Olá, ${name.trim().split(" ")[0]}! 👋` : "Olá! 👋";
  const fallback: CampaignFallback = {
    subject: `📲 Vaga boa não espera e-mail abrir`,
    bodyHtml: `
      <h2 style="font-size:21px;font-weight:700;letter-spacing:-.2px;margin:0 0 4px;color:#0f172a;">${greeting}</h2>
      <p style="color:#64748b;margin:0 0 16px;">Algumas oportunidades pedem atenção no momento certo. Com as dicas por WhatsApp, você acompanha novas vagas sem depender de lembrar de abrir o e-mail.</p>
      <p>Ative o alerta para receber oportunidades e decidir com calma quais fazem sentido para o seu próximo passo.</p>
    `,
  };
  const copy = await generateCampaignCopy(
    "whatsapp_optin_invite",
    `Situação: convite pra pessoa ativar alertas de vaga por WhatsApp no ${BRAND} (hoje só recebe por e-mail).
Nome: ${name?.trim() || "não informado"}.
Objetivo: brincar com a ideia de que e-mail se perde no meio de spam/promoção e WhatsApp é lido na hora, sem soar como pressão pra dar o número.
CTA (não incluir no html): "Ativar dicas por WhatsApp".`,
    fallback
  );
  await send(
    to,
    copy.subject,
    `${copy.bodyHtml}
      <p>Leva 10 segundos e dá pra desligar quando quiser, respondendo <strong>PARAR</strong>. Sem drama, sem culpa 😌</p>
      ${button(`${APP_URL}/settings`, "Ativar dicas por WhatsApp")}
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
      <h2 style="font-size:21px;font-weight:700;letter-spacing:-.2px;margin:0 0 4px;color:#0f172a;">Bem-vindo(a) à equipe 🤝</h2>
      <p style="color:#64748b;margin:0 0 16px;">Você foi adicionado(a) como membro da equipe de <strong>${opts.companyName}</strong> no ${BRAND}.</p>
      <p>Entre com este e-mail e a senha temporária abaixo, e troque a senha no seu perfil:</p>
      <p style="background:#f1f5f9;border-radius:10px;padding:12px;font-size:16px;">
        🔑 Senha temporária: <strong>${opts.tempPassword}</strong>
      </p>
      ${button(`${APP_URL}/empresa/login`, "Entrar na área da empresa")}
    `
  );
}

/** Confirma a ativação do plano recorrente da empresa (vagas ilimitadas + cota mensal de triagens). */
export async function sendCompanySubscriptionConfirmationEmail(
  to: string,
  opts: { currentPeriodEnd: Date; planLabel: string; screeningsIncluded: number }
) {
  const renew = formatBrazilDate(opts.currentPeriodEnd);
  await send(
    to,
    `${opts.planLabel} ativado 🚀`,
    `
      <h2 style="font-size: 20px;">Seu ${opts.planLabel} está ativo 🚀</h2>
      <p>Tudo certo! Agora sua empresa publica vagas sem limite e tem ${opts.screeningsIncluded} triagens de currículo por IA neste ciclo.</p>
      <p>Próxima renovação em <strong>${renew}</strong>. Você pode gerenciar ou cancelar quando quiser em Faturamento.</p>
      ${button(`${APP_URL}/empresa/billing`, "Ver meu plano")}
    `
  );
}

/** Avisa a empresa que o plano recorrente foi cancelado. */
export async function sendCompanySubscriptionCancelledEmail(to: string, opts: { planLabel: string }) {
  await send(
    to,
    `👋 Seu ${opts.planLabel} foi cancelado`,
    `
      <h2 style="font-size: 20px;">👋 Plano cancelado</h2>
      <p>Confirmamos o cancelamento do ${opts.planLabel} da sua empresa. Não faremos novas cobranças.</p>
      <p>Sua empresa continua com acesso até o fim do período já pago. Depois disso, a triagem volta a consumir os créditos avulsos do seu saldo.</p>
      ${button(`${APP_URL}/empresa/billing`, "Reativar plano")}
    `
  );
}

/** Convida uma empresa cadastrada a publicar sua primeira vaga (nunca postou nenhuma). */
export async function sendCompanyDormantNudgeEmail(to: string, opts: { companyName: string }) {
  await send(
    to,
    "👀 Enquanto isso, seus concorrentes já estão contratando",
    `
      <h2 style="font-size:21px;font-weight:700;letter-spacing:-.2px;margin:0 0 4px;color:#0f172a;">Bora publicar sua primeira vaga? 👀</h2>
      <p style="color:#64748b;margin:0 0 16px;">Oi, ${opts.companyName}! Notamos que sua empresa se cadastrou no ${BRAND} mas ainda não publicou nenhuma vaga.</p>
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
  const what = isDiagnostic ? "o Plano de Candidatura da sua análise" : "sua análise completa";
  const cta = isDiagnostic
    ? { href: `${APP_URL}/report`, label: "Ver meu Plano de Candidatura" }
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
  const fallback: CampaignFallback = {
    subject: "📊 Seu Match está pronto. Falta ver a rota",
    bodyHtml: `
      <h2 style="font-size:21px;font-weight:700;letter-spacing:-.2px;margin:0 0 4px;color:#0f172a;">${greeting}</h2>
      <p style="color:#64748b;margin:0 0 16px;">Você já começou a sua Rota no ${BRAND}. Agora falta abrir o diagnóstico e entender qual é o próximo passo para essa vaga.</p>
      <p>Seu Match já está pronto. Agora você pode ver os sinais da vaga, entender as lacunas e escolher o próximo passo antes de enviar.</p>
      <p>Leva menos de 2 minutos para desbloquear ⏱️</p>
    `,
  };
  const copy = await generateCampaignCopy(
    "lead_follow_up",
    `Situação: a pessoa começou uma análise de currículo x vaga no ${BRAND} mas não finalizou o desbloqueio do resultado completo.
Nome: ${opts.name?.trim() || "não informado"}.
Objetivo: brincar com a sensação de "quase lá" (tipo download travado em 99%, ou barra de progresso que nunca termina), lembrar que o score já foi calculado e falta só ver o que os recrutadores enxergam primeiro e os ajustes que mais aumentam as chances.
CTA (não incluir no html): "Ver minha análise completa".`,
    fallback
  );
  await send(
    to,
    copy.subject,
    `${copy.bodyHtml}
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
  const fallback: CampaignFallback = {
    subject: "🌱 O diagnóstico foi só o começo. O que vem agora?",
    bodyHtml: `
      <h2 style="font-size:21px;font-weight:700;letter-spacing:-.2px;margin:0 0 4px;color:#0f172a;">Um diagnóstico é só o começo 🌱</h2>
      <p style="color:#64748b;margin:0 0 16px;">Agora que você já viu o que ajustar nesta oportunidade, o próximo passo é repetir o processo nas próximas vagas e acompanhar sua evolução.</p>
      <p>Com o plano mensal, você reúne novas análises, currículo otimizado, preparação de entrevista, plano de ação e acompanhamento das candidaturas ✨</p>
    `,
  };
  const copy = await generateCampaignCopy(
    "diagnostic_upgrade",
    `Situação: a pessoa comprou o diagnóstico avulso (Plano de Candidatura) no ${BRAND} e agora recebe um convite pra assinar o plano mensal.
Objetivo: mostrar que o diagnóstico avulso resolveu uma vaga, mas o plano resolve a busca inteira (novas análises, currículo otimizado, preparação de entrevista, plano de ação, acompanhamento de candidaturas). Sem pressão, tom de próximo passo natural.
CTA (não incluir no html): "Conhecer o plano mensal".`,
    fallback
  );
  await send(
    to,
    copy.subject,
    `${copy.bodyHtml}
      ${button(href, "Conhecer o plano mensal")}
      <p>Você pode cancelar quando quiser 🙂</p>
    `,
    { url: nicheHeroImageUrl(opts.segment) }
  );
}

export async function sendCheckoutRecoveryEmail(
  to: string,
  opts: { segment: string }
) {
  const href = `${APP_URL}/assinar?segment=${encodeURIComponent(opts.segment)}`;
  const fallback: CampaignFallback = {
    subject: "💳 Faltou um clique pra sua assinatura ativar",
    bodyHtml: `
      <h2 style="font-size:21px;font-weight:700;letter-spacing:-.2px;margin:0 0 4px;color:#0f172a;">Seu plano ainda não foi ativado</h2>
      <p style="color:#64748b;margin:0 0 16px;">Você começou o pagamento, mas a assinatura ainda não foi confirmada. Se o Pix expirou ou o cartão não foi aprovado, pode retomar com outra forma de pagamento.</p>
    `,
  };
  const copy = await generateCampaignCopy(
    "checkout_recovery",
    `Situação: a pessoa começou o checkout da assinatura do ${BRAND} mas não finalizou o pagamento (Pix pode ter expirado, ou cartão não aprovado).
Objetivo: avisar sem parecer cobrança agressiva, deixar claro que é só retomar com outra forma de pagamento.
CTA (não incluir no html): "Retomar assinatura".`,
    fallback
  );
  await send(
    to,
    copy.subject,
    `${copy.bodyHtml}
      ${button(href, "Retomar assinatura")}
      <p>Se já pagou por Pix, aguarde alguns instantes, a confirmação é automática ⏳</p>
    `,
    { url: nicheHeroImageUrl(opts.segment) }
  );
}

export async function sendOnboardingNudgeEmail(
  to: string,
  opts: { name?: string | null }
) {
  const greeting = opts.name?.trim() ? `Olá, ${opts.name.trim().split(" ")[0]}! 👋` : "Olá! 👋";
  const fallback: CampaignFallback = {
    subject: "🔍 Seu currículo está aderente ou não? Você ainda não sabe",
    bodyHtml: `
      <h2 style="font-size:21px;font-weight:700;letter-spacing:-.2px;margin:0 0 4px;color:#0f172a;">${greeting}</h2>
      <p style="color:#64748b;margin:0 0 16px;">Você criou conta no ${BRAND} e depois sumiu igual história de perfil no Tinder 👀 Tudo bem, a gente entende.</p>
      <p>Só que tem um passo que você tá deixando na mesa: a análise que mostra, com IA, o quanto seu currículo está aderente a uma vaga real e exatamente o que melhorar antes de aplicar 🔍</p>
      <p>Leva menos de 2 minutos ⏱️</p>
    `,
  };
  const copy = await generateCampaignCopy(
    "onboarding_nudge",
    `Situação: a pessoa criou conta no ${BRAND} mas nunca fez a primeira análise de currículo.
Nome: ${opts.name?.trim() || "não informado"}.
Objetivo: puxar de volta com leveza (pode brincar com "sumiu"/"ghosting" sem ser insistente), lembrar que a análise mostra o quanto o currículo é aderente a uma vaga real e o que melhorar antes de aplicar, reforçar que leva menos de 2 minutos.
CTA (não incluir no html): "Analisar meu currículo".`,
    fallback
  );
  await send(
    to,
    copy.subject,
    `${copy.bodyHtml}
      ${button(`${APP_URL}/analise`, "Analisar meu currículo")}
      <p>Se tiver qualquer dúvida, é só responder este e-mail 💬</p>
    `
  );
}

export async function sendObjectiveFirstStepNudgeEmail(
  to: string,
  opts: { name?: string | null; objectiveLabel: string; ctaLabel: string; ctaHref: string }
) {
  const greeting = opts.name?.trim() ? `Olá, ${opts.name.trim().split(" ")[0]}! 👋` : "Olá! 👋";
  await send(
    to,
    `🎯 Seu objetivo: ${opts.objectiveLabel}`,
    `
      <h2 style="font-size:21px;font-weight:700;letter-spacing:-.2px;margin:0 0 4px;color:#0f172a;">${greeting}</h2>
      <p style="color:#64748b;margin:0 0 16px;">
        Quando você entrou no ${BRAND}, contou que seu objetivo agora é
        <strong>${opts.objectiveLabel.toLowerCase()}</strong>.
      </p>
      <p>Vimos que você ainda não deu o primeiro passo recomendado para chegar lá. Não precisa ser perfeito, só precisa começar 🎯</p>
      ${button(`${APP_URL}${opts.ctaHref}`, opts.ctaLabel)}
      <p>Se o seu objetivo mudou, é só ajustar em "Minha Jornada" no seu painel.</p>
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
  const fallback: CampaignFallback = {
    subject,
    bodyHtml: `
      <h2 style="font-size: 20px;">${greeting} 👋</h2>
      ${scoreLine}
      <p>Com o plano você transforma aquele score em ação: currículo reescrito ponto a ponto, simulação de entrevista para aquela vaga, e uma nova análise a cada oportunidade que aparecer, porque cada vaga pede um ajuste diferente.</p>
    `,
  };
  const copy = await generateCampaignCopy(
    "convert_to_subscription",
    `Situação: a pessoa analisou o currículo no ${BRAND} (grátis) e viu o score, mas ainda não assinou o plano.
Nome: ${opts.name?.trim() || "não informado"}. Score: ${opts.score ?? "não informado"}. Vaga: ${opts.jobTitle?.trim() || "não informada"}.
Objetivo: transformar o score visto em urgência de ação sem ser genérico, o plano reescreve o currículo ponto a ponto, simula entrevista pra aquela vaga e libera novas análises pra cada oportunidade.
CTA (não incluir no html): "Ver o que muda com o plano".`,
    fallback
  );
  await send(
    to,
    copy.subject,
    `${copy.bodyHtml}
      ${button(href, "Ver o que muda com o plano")}
      <p>Sem fidelidade, cancela quando quiser. E se faltou algo para você decidir, é só responder este e-mail 💬</p>
    `,
    { url: nicheHeroImageUrl(opts.segment) }
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
  const fallback: CampaignFallback = {
    subject: `⏳ Sua análise de hoje ficou pronta (${opts.score}% de match). A vaga ainda está aberta?`,
    bodyHtml: `
      <h2 style="font-size: 20px;">${greeting} 👋</h2>
      <p>Sua análise${forJob} fechou em <strong>${opts.score}% de aderência</strong> hoje. O material completo já foi gerado para essa vaga e está esperando você.</p>
      ${gapLine}
    `,
  };
  const copy = await generateCampaignCopy(
    "analysis_recovery",
    `Situação: a pessoa rodou uma análise de currículo hoje mesmo no ${BRAND}, viu o teaser bloqueado e não voltou. E-mail de recuperação no mesmo dia, enquanto a vaga ainda está quente.
Nome: ${opts.name?.trim() || "não informado"}. Score: ${opts.score}%. Vaga: ${opts.jobTitle?.trim() || "não informada"}.
Objetivo: criar senso de urgência real (vaga pode fechar, currículo já está pronto esperando), sem ser alarmista.
CTA (não incluir no html): "Abrir meu relatório".`,
    fallback
  );
  await send(
    to,
    copy.subject,
    `${copy.bodyHtml}
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
  const fallback: CampaignFallback = {
    subject: "🔎 Elementar: seu currículo tem 7 segundos pra convencer alguém",
    bodyHtml: `
      <h2 style="font-size: 20px;">Modo detetive 🕵️</h2>
      <p>Investigamos o caso do seu currículo contra a vaga. Evidência 1: as primeiras linhas não mencionam a palavra que o recrutador vai procurar primeiro. Evidência 2: a experiência mais relevante costuma ficar no meio da página, não no topo.</p>
      <p>O plano reabre o caso 📂 reorganiza, reescreve e realça exatamente o que os 7 segundos de leitura de um recrutador precisam encontrar primeiro.</p>
    `,
  };
  const copy = await generateCampaignCopy(
    "convert_second_nudge",
    `Situação: segundo e-mail da régua de conversão, alguns dias depois do primeiro, pra quem analisou o currículo no ${BRAND} mas não assinou.
Objetivo: ângulo diferente do primeiro toque (esse pode usar uma metáfora divertida, tipo investigação/detetive, ou outra analogia leve de cultura pop), reforçando que o plano reorganiza e reescreve o currículo pros 7 segundos de leitura de um recrutador.
CTA (não incluir no html, o botão já tem esse texto fixo): "Reabrir meu caso". Escreva o texto de forma que ele encaixe naturalmente antes desse botão.`,
    fallback
  );
  await send(
    to,
    copy.subject,
    `${copy.bodyHtml}
      ${button(href, "Reabrir meu caso")}
    `,
    { url: nicheHeroImageUrl(opts.segment) }
  );
}

/** Comemora a primeira análise concluída pelo usuário. */
export async function sendFirstAnalysisMilestoneEmail(
  to: string,
  opts: { name?: string | null }
) {
  const greeting = opts.name?.trim() ? `${opts.name.trim().split(" ")[0]}, ` : "";
  const fallback: CampaignFallback = {
    subject: "🏁 Conquista desbloqueada: sua primeira análise",
    bodyHtml: `
      <h2 style="font-size: 20px;">Primeira análise: feita ✅🎉</h2>
      <p>${greeting}muita gente cria conta e nunca chega a rodar a primeira análise. Você já rodou, isso já te coloca na fração que realmente usa a ferramenta pra evoluir, não só pra olhar 🙌</p>
      <p>Próxima conquista: comparar seu score em duas vagas diferentes e ver o que muda 📈</p>
    `,
  };
  const copy = await generateCampaignCopy(
    "first_analysis_milestone",
    `Situação: a pessoa acabou de concluir a primeira análise de currículo x vaga no ${BRAND}.
Nome: ${opts.name?.trim() || "não informado"}.
Objetivo: comemorar de verdade, pode usar linguagem de conquista/achievement de videogame ("troféu desbloqueado" etc.), reforçar que é minoria que chega até aqui, e convidar pra próxima ação (analisar outra vaga e comparar scores).
CTA (não incluir no html): "Analisar outra vaga".`,
    fallback
  );
  await send(
    to,
    copy.subject,
    `${copy.bodyHtml}
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
  const fallback: CampaignFallback = {
    subject: `📈 De ${opts.previousScore} pra ${opts.newScore}: seu currículo evoluiu de verdade`,
    bodyHtml: `
      <h2 style="font-size: 20px;">📈 Seu score subiu, e a gente reparou</h2>
      <p>Sua última análise${forJob} fechou em <strong>${opts.newScore} de aderência</strong>, ${opts.newScore - opts.previousScore} pontos a mais que a anterior. O currículo é o mesmo currículo, mas ajustado 🎯 Prova de que o processo funciona quando repetido.</p>
      <p>Guarda essa versão como referência pra próxima vaga parecida 💾</p>
    `,
  };
  const copy = await generateCampaignCopy(
    "score_improved",
    `Situação: a pessoa melhorou o score de aderência do currículo em relação à análise anterior no ${BRAND}.
Score anterior: ${opts.previousScore}. Novo score: ${opts.newScore}. Diferença: +${opts.newScore - opts.previousScore} pontos. Vaga: ${opts.jobTitle?.trim() || "não informada"}.
Objetivo: comemorar a evolução real (é prova de que os ajustes funcionam), tom animado e específico pros números, não genérico.
CTA (não incluir no html): "Ver o que mudou".`,
    fallback
  );
  await send(
    to,
    copy.subject,
    `${copy.bodyHtml}
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
  const fallback: CampaignFallback = {
    subject: "⏳ Esta oferta se autodestrói em 48h (não, sério)",
    bodyHtml: `
      <h2 style="font-size: 20px;">Sua missão, caso decida aceitar 🎯</h2>
      <p>Assinar o plano com <strong>20% de desconto</strong> 🎁, válido até <strong>${until}</strong>. Depois disso o cupom expira sozinho (esta mensagem não se autodestrói, relaxa 😉).</p>
    `,
  };
  // Cupom, prazo e link ficam fora da geração por IA: são dados sensíveis (código real,
  // data real) que não podem ser parafraseados ou inventados.
  const copy = await generateCampaignCopy(
    "urgency_coupon",
    `Situação: terceiro e último e-mail da régua de conversão, oferecendo um cupom pessoal de 20% de desconto no plano do ${BRAND}, válido até ${until}, uso único.
Objetivo: criar urgência de forma bem-humorada (pode brincar com referência de filme/jogo de "missão"/prazo, estilo Missão Impossível ou algo parecido), deixando claro que é a última chance dessa régua. NÃO invente nem repita o código do cupom nem a data no texto, isso será exibido separadamente logo abaixo do seu texto.
CTA (não incluir no html): "Usar meu cupom agora".`,
    fallback
  );
  await send(
    to,
    copy.subject,
    `${copy.bodyHtml}
      <p style="background:#f1f5f9;border-radius:10px;padding:12px;font-size:16px;">
        🎟️ Cupom: <strong>${opts.code}</strong> · válido até <strong>${until}</strong>
      </p>
      ${button(href, "Usar meu cupom agora")}
      <p>O código já vem preenchido se você clicar no botão. Vale só uma vez e só até o prazo acima ⏰</p>
    `,
    { url: nicheHeroImageUrl(opts.segment) }
  );
}

/** Comemora marcos de volume: a cada 10 análises concluídas pelo usuário. */
export async function sendAnalysisCountMilestoneEmail(
  to: string,
  opts: { count: number }
) {
  const fallback: CampaignFallback = {
    subject: `🏅 ${opts.count} vagas analisadas. Isso já é maratona, não corrida de 100m`,
    bodyHtml: `
      <h2 style="font-size: 20px;">🏅 ${opts.count} análises concluídas</h2>
      <p>Testar o currículo contra ${opts.count} vagas diferentes é o tipo de persistência que separa quem só espera resposta de quem constrói a própria sorte 💪</p>
      <p>Bônus: dá pra ver, no seu histórico, qual tipo de vaga seu currículo casa melhor 📊</p>
    `,
  };
  const copy = await generateCampaignCopy(
    "analysis_count_milestone",
    `Situação: marco de volume no ${BRAND}, a pessoa completou ${opts.count} análises de currículo x vaga.
Objetivo: comemorar a persistência/consistência (não o resultado de uma vaga só), pode usar analogia esportiva ou de jogo de RPG "grindar" com humor leve, sem exagerar.
CTA (não incluir no html): "Ver meu histórico de scores".`,
    fallback
  );
  await send(
    to,
    copy.subject,
    `${copy.bodyHtml}
      ${button(`${APP_URL}/dashboard`, "Ver meu histórico de scores")}
    `
  );
}

export async function sendJobAlertEmail(
  to: string,
  opts: { query: string; location: string; jobs: Array<{ title: string; url: string; source: string }> }
) {
  const rows = opts.jobs.slice(0, 10).map((job) => `
    <div style="background:#f8fafc;border:1px solid #eef2f7;border-radius:12px;padding:14px 16px;margin:10px 0;">
      <strong style="font-size:15px;color:#0f172a;">${job.title}</strong>
      <p style="font-size:13px;color:#94a3b8;margin:4px 0 8px;">${job.source}</p>
      <a href="${job.url}" style="color:#2563eb;font-weight:600;font-size:13.5px;text-decoration:none;">Ver oportunidade →</a>
    </div>
  `).join("");
  const count = opts.jobs.length;
  const fallback: CampaignFallback = {
    subject: `📬 ${count} vaga${count > 1 ? "s" : ""} nova${count > 1 ? "s" : ""}${opts.location ? ` em ${opts.location}` : ""} pra você`,
    bodyHtml: `
      <h2 style="font-size:21px;font-weight:700;letter-spacing:-.2px;margin:0 0 4px;color:#0f172a;">📬 Encontramos novas oportunidades pra você</h2>
      <p style="color:#64748b;margin:0 0 16px;">${opts.query ? `Busca: <strong>${opts.query}</strong>. ` : ""}${opts.location ? `Local: <strong>${opts.location}</strong>.` : ""}</p>
    `,
  };
  // Só a abertura (h2 + parágrafo) passa pela IA; a lista de vagas em si é dado real
  // e vem sempre fixa logo depois, pra nunca inventar ou distorcer uma vaga.
  const copy = await generateCampaignCopy(
    "job_alert",
    `Situação: alerta automático de ${count} vaga${count > 1 ? "s" : ""} nova${count > 1 ? "s" : ""} compatível${count > 1 ? "eis" : ""} encontrada${count > 1 ? "s" : ""} pro perfil da pessoa no ${BRAND}.
Busca: ${opts.query || "não informada"}. Local: ${opts.location || "não informado"}.
Objetivo: abertura curta e animada avisando que chegaram vagas novas, a lista real vem logo abaixo do seu texto (não invente nomes de vaga nem empresa).
CTA (não incluir no html): "Ver todas as vagas".`,
    fallback
  );
  await send(
    to,
    copy.subject,
    `${copy.bodyHtml}
      ${rows}
      ${button(`${APP_URL}/vagas-publicas`, "Ver todas as vagas")}
      <p>Você pode alterar seus alertas nas configurações da sua conta ⚙️</p>
    `,
  );
}

/**
 * Avisa o candidato que o Piloto Automático encontrou vagas que não conseguiu concluir sozinho
 * (CAPTCHA, formulário que exige login, ou campo obrigatório sem resposta configurada) e que
 * precisam de candidatura manual. Disparo em lote (uma execução do robô pode gerar vários itens),
 * dedupe por dia via sendOnce — não manda um e-mail por vaga bloqueada.
 */
export async function sendAutoApplyManualActionEmail(
  to: string,
  opts: {
    name?: string | null;
    items: Array<{ jobTitle: string; company: string; jobUrl: string; reason: string | null }>;
  }
) {
  const greeting = opts.name?.trim() ? opts.name.trim().split(" ")[0] : null;
  const rows = opts.items.slice(0, 10).map((item) => `
    <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:14px 16px;margin:10px 0;">
      <strong style="font-size:15px;color:#0f172a;">${item.jobTitle}</strong>
      <p style="font-size:13px;color:#94a3b8;margin:4px 0 4px;">${item.company}</p>
      <p style="font-size:12.5px;color:#b45309;margin:0 0 8px;">${item.reason || "O robô não conseguiu concluir sozinho."}</p>
      <a href="${item.jobUrl}" style="color:#2563eb;font-weight:600;font-size:13.5px;text-decoration:none;">Candidatar-se manualmente →</a>
    </div>
  `).join("");
  const count = opts.items.length;
  await send(
    to,
    `⚠️ ${count} candidatura${count > 1 ? "s" : ""} precisa${count > 1 ? "m" : ""} de você`,
    `
      <h2 style="font-size:21px;font-weight:700;letter-spacing:-.2px;margin:0 0 4px;color:#0f172a;">⚠️ ${greeting ? `${greeting}, o` : "O"} Piloto Automático precisa da sua ajuda</h2>
      <p style="color:#64748b;margin:0 0 16px;">Encontramos ${count} vaga${count > 1 ? "s" : ""} compatível${count > 1 ? "eis" : ""} com você, mas o formulário externo tinha CAPTCHA, exigia login na plataforma da vaga, ou uma pergunta que não sabíamos responder — nada disso o robô pode contornar, então a candidatura ficou pendente.</p>
      ${rows}
      ${button(`${APP_URL}/#piloto-automatico`, "Ver no Piloto Automático")}
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
  const stat = (icon: string, label: string, highlight?: string) => `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:10px;">
      <tr>
        <td style="background:#f8fafc;border:1px solid #eef2f7;border-radius:12px;padding:14px 16px;">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td width="36" style="font-size:20px;vertical-align:top;">${icon}</td>
              <td style="font-size:14px;color:#334155;line-height:1.6;">
                ${label}${highlight ? `<br/><strong style="font-size:17px;color:#0f172a;">${highlight}</strong>` : ""}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;
  const cards: string[] = [];
  if (opts.analysesCount > 0) {
    cards.push(
      stat(
        "📝",
        `${opts.analysesCount} análise${opts.analysesCount > 1 ? "s" : ""} de currículo esta semana`,
        opts.bestScore !== null ? `Melhor nota: ${opts.bestScore}/100` : undefined
      )
    );
  }
  if (opts.scoreDelta !== null && opts.scoreDelta > 0) {
    cards.push(stat("📈", "Sua nota subiu em relação à semana anterior", `+${opts.scoreDelta} pontos`));
  }
  if (opts.newMatchesCount > 0) {
    cards.push(
      stat(
        "🎯",
        `Vaga${opts.newMatchesCount > 1 ? "s" : ""} nova${opts.newMatchesCount > 1 ? "s" : ""} compatível${opts.newMatchesCount > 1 ? "eis" : ""} com seu currículo`,
        `${opts.newMatchesCount}`
      )
    );
  }
  if (opts.applicationsCount && opts.applicationsCount > 0) {
    cards.push(
      stat("📌", `Candidatura${opts.applicationsCount > 1 ? "s" : ""} no seu painel de acompanhamento`, `${opts.applicationsCount}`)
    );
  }
  const subject =
    opts.scoreDelta !== null && opts.scoreDelta > 0
      ? `📈 Sua nota subiu +${opts.scoreDelta} pontos esta semana`
      : opts.bestScore !== null
        ? `📊 Sua melhor nota da semana: ${opts.bestScore}/100`
        : "📊 Sua semana no CarreirasMatch";
  const fallback: CampaignFallback = {
    subject,
    bodyHtml: `
      <h2 style="font-size:21px;font-weight:700;letter-spacing:-.2px;margin:0 0 4px;color:#0f172a;">${greeting}</h2>
      <p style="color:#64748b;margin:0 0 20px;">Resumo da sua semana de busca:</p>
    `,
  };
  const copy = await generateCampaignCopy(
    "weekly_digest",
    `Situação: digest semanal do ${BRAND} resumindo a semana da pessoa na busca de emprego.
Nome: ${opts.name || "não informado"}. Análises na semana: ${opts.analysesCount}. Melhor score: ${opts.bestScore ?? "n/d"}. Variação de score: ${opts.scoreDelta ?? "n/d"}. Novas vagas compatíveis: ${opts.newMatchesCount}.
Objetivo: abertura curta tipo "aqui está seu resumo da semana", os números/cards reais vêm logo abaixo do seu texto (não repita os números aqui, só puxe o clima).
CTA (não incluir no html): "Analisar meu currículo".`,
    fallback
  );
  await send(
    to,
    copy.subject,
    `${copy.bodyHtml}
      ${cards.join("")}
      <p style="margin-top:22px;">Ajustou o currículo? Re-analise e veja sua nota subir.</p>
      ${button(`${APP_URL}/analise`, "Analisar meu currículo")}
    `,
  );
}

/** Avisa o contratante que recebeu uma nova proposta num projeto freelance. */
export async function sendFreelanceProposalReceivedEmail(
  to: string,
  opts: { clientName?: string | null; projectTitle: string; freelancerName: string; bidCents: number; projectId: string }
) {
  const greeting = opts.clientName?.trim() ? `Olá, ${opts.clientName.trim().split(" ")[0]}!` : "Olá!";
  await send(
    to,
    `💼 Nova proposta em "${opts.projectTitle}"`,
    `
      <h2 style="font-size:21px;font-weight:700;letter-spacing:-.2px;margin:0 0 4px;color:#0f172a;">${greeting}</h2>
      <p style="color:#64748b;margin:0 0 16px;"><strong>${opts.freelancerName}</strong> enviou uma proposta para o seu projeto <strong>${opts.projectTitle}</strong>.</p>
      <p>Valor proposto: <strong>${formatCentsToBRL(opts.bidCents)}</strong>.</p>
      ${button(`${APP_URL}/projetos/${opts.projectId}`, "Ver a proposta")}
    `
  );
}

/** Avisa o freelancer que sua proposta foi aceita e o contrato foi criado. */
export async function sendFreelanceProposalAcceptedEmail(
  to: string,
  opts: { freelancerName?: string | null; projectTitle: string; contractId: string }
) {
  const greeting = opts.freelancerName?.trim() ? `${opts.freelancerName.trim().split(" ")[0]}, ` : "";
  await send(
    to,
    `🎉 Proposta aceita: ${opts.projectTitle}`,
    `
      <h2 style="font-size:21px;font-weight:700;letter-spacing:-.2px;margin:0 0 4px;color:#0f172a;">Proposta aceita 🎉</h2>
      <p style="color:#64748b;margin:0 0 16px;">${greeting}o contratante aceitou sua proposta para <strong>${opts.projectTitle}</strong>. O contrato já está ativo.</p>
      <p>Combine os detalhes finais pelo chat do projeto e comece quando estiver alinhado 🚀</p>
      ${button(`${APP_URL}/freelancer/meus-projetos`, "Ver meu contrato")}
    `
  );
}

/** Avisa o freelancer que sua proposta não foi selecionada desta vez. */
export async function sendFreelanceProposalRejectedEmail(
  to: string,
  opts: { freelancerName?: string | null; projectTitle: string }
) {
  const greeting = opts.freelancerName?.trim() ? `${opts.freelancerName.trim().split(" ")[0]}, ` : "";
  await send(
    to,
    `Sobre sua proposta para "${opts.projectTitle}"`,
    `
      <h2 style="font-size:21px;font-weight:700;letter-spacing:-.2px;margin:0 0 4px;color:#0f172a;">Desta vez não foi 🙂</h2>
      <p style="color:#64748b;margin:0 0 16px;">${greeting}o contratante escolheu outra proposta para <strong>${opts.projectTitle}</strong>. Ainda tem outros projetos abertos esperando alguém com o seu perfil.</p>
      ${button(`${APP_URL}/projetos`, "Ver outros projetos")}
    `
  );
}

/** Avisa o contratante que o freelancer marcou a entrega e aguarda confirmação. */
export async function sendFreelanceDeliverySubmittedEmail(
  to: string,
  opts: { clientName?: string | null; projectTitle: string; contractId: string }
) {
  const greeting = opts.clientName?.trim() ? `${opts.clientName.trim().split(" ")[0]}, ` : "";
  await send(
    to,
    `📦 Entrega pronta: ${opts.projectTitle}`,
    `
      <h2 style="font-size:21px;font-weight:700;letter-spacing:-.2px;margin:0 0 4px;color:#0f172a;">Sua entrega chegou 📦</h2>
      <p style="color:#64748b;margin:0 0 16px;">${greeting}o freelancer marcou <strong>${opts.projectTitle}</strong> como entregue. Confira o trabalho e confirme a conclusão para liberar o pagamento.</p>
      ${button(`${APP_URL}/projetos/${opts.contractId}`, "Revisar entrega")}
    `
  );
}

/** Avisa o freelancer que o contrato foi concluído e o repasse está a caminho. */
export async function sendFreelanceContractCompletedEmail(
  to: string,
  opts: { freelancerName?: string | null; projectTitle: string; payoutCents: number }
) {
  const greeting = opts.freelancerName?.trim() ? `${opts.freelancerName.trim().split(" ")[0]}, ` : "";
  await send(
    to,
    `✅ Contrato concluído: ${opts.projectTitle}`,
    `
      <h2 style="font-size:21px;font-weight:700;letter-spacing:-.2px;margin:0 0 4px;color:#0f172a;">Trabalho concluído ✅</h2>
      <p style="color:#64748b;margin:0 0 16px;">${greeting}o contratante confirmou a entrega de <strong>${opts.projectTitle}</strong>. Seu repasse de <strong>${formatCentsToBRL(opts.payoutCents)}</strong> já está na fila de pagamento.</p>
      <p>Aproveite pra avaliar o contratante, isso ajuda outros freelancers a escolherem melhor os projetos ⭐</p>
      ${button(`${APP_URL}/freelancer/meus-projetos`, "Avaliar e ver meus contratos")}
    `
  );
}

/**
 * Pesquisa de NPS: 0 a 10 clicáveis direto no e-mail, sem precisar logar.
 * Cada número já é um link para /api/nps que registra o voto e redireciona
 * pra página de agradecimento.
 */
export async function sendNpsSurveyEmail(
  to: string,
  opts: { userId: string; name?: string | null; source?: string }
) {
  const greeting = opts.name?.trim() ? `${opts.name.trim().split(" ")[0]}, ` : "";
  const token = createNpsToken(opts.userId);
  const source = opts.source ?? "post_first_analysis";
  const scoreLink = (n: number) =>
    `${APP_URL}/api/nps?t=${encodeURIComponent(token)}&score=${n}&source=${encodeURIComponent(source)}`;

  const scale = Array.from({ length: 11 }, (_, n) => n);
  const cells = scale
    .map(
      (n) => `
        <td style="padding:2px;">
          <a href="${scoreLink(n)}" style="display:block;width:30px;height:30px;line-height:30px;text-align:center;border-radius:8px;background:#f1f5f9;color:#0f172a;font-weight:700;font-size:13px;text-decoration:none;border:1px solid #e2e8f0;">${n}</a>
        </td>
      `
    )
    .join("");

  await send(
    to,
    "🙋 Uma pergunta rápida sobre o CarreirasMatch",
    `
      <h2 style="font-size:21px;font-weight:700;letter-spacing:-.2px;margin:0 0 4px;color:#0f172a;">${greeting}posso te fazer uma pergunta? 🙋</h2>
      <p style="color:#64748b;margin:0 0 20px;">Em uma escala de 0 a 10, o quanto você recomendaria o ${BRAND} para um amigo ou colega que está buscando emprego?</p>
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 14px;">
        <tr>${cells}</tr>
      </table>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="font-size:11px;color:#94a3b8;">Pouco provável</td>
          <td style="font-size:11px;color:#94a3b8;text-align:right;">Super provável</td>
        </tr>
      </table>
      <p style="margin-top:22px;">É só um clique, sem formulário. Sua resposta é o que mais nos ajuda a decidir o que construir a seguir 💬</p>
    `
  );
}

/** Check-in semanal da meta de busca (Kanban de candidaturas): metas definidas vs. o que de fato aconteceu. */
export async function sendWeeklyGoalCheckinEmail(
  to: string,
  opts: {
    name: string | null;
    targetApplications: number;
    actualApplications: number;
    targetInterviews: number;
    actualInterviews: number;
    targetResumeTweaks: number;
    actualResumeTweaks: number;
  }
) {
  const greeting = opts.name ? `Olá, ${opts.name.split(" ")[0]}!` : "Olá!";
  const hit = (actual: number, target: number) => actual >= target;
  const row = (icon: string, label: string, actual: number, target: number) => {
    const ok = hit(actual, target);
    return `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:10px;">
        <tr>
          <td style="background:#f8fafc;border:1px solid #eef2f7;border-radius:12px;padding:14px 16px;">
            <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td width="36" style="font-size:20px;vertical-align:top;">${icon}</td>
                <td style="font-size:14px;color:#334155;line-height:1.6;">
                  ${label}<br/>
                  <strong style="font-size:17px;color:#0f172a;">${actual} de ${target}</strong>
                  ${ok ? ` <span style="color:#16a34a;font-weight:700;">✓ bateu a meta</span>` : ""}
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    `;
  };
  const allHit =
    hit(opts.actualApplications, opts.targetApplications) &&
    hit(opts.actualInterviews, opts.targetInterviews) &&
    hit(opts.actualResumeTweaks, opts.targetResumeTweaks);
  const subject = allHit
    ? "🏆 Você bateu todas as metas da semana"
    : `📋 Como foi sua semana de busca? ${opts.actualApplications}/${opts.targetApplications} candidaturas`;
  await send(
    to,
    subject,
    `
      <h2 style="font-size:21px;font-weight:700;letter-spacing:-.2px;margin:0 0 4px;color:#0f172a;">${greeting}</h2>
      <p style="color:#64748b;margin:0 0 20px;">Fecha a semana passada, veja como foi contra as metas que você definiu:</p>
      ${row("🎯", "Candidaturas enviadas", opts.actualApplications, opts.targetApplications)}
      ${row("🗣️", "Entrevistas marcadas", opts.actualInterviews, opts.targetInterviews)}
      ${row("📝", "Ajustes de currículo", opts.actualResumeTweaks, opts.targetResumeTweaks)}
      <p style="margin-top:22px;">${allHit ? "Semana redonda! Bora manter o ritmo 🚀" : "Toda semana é uma chance nova de bater a meta. Ajuste o plano e siga em frente 💪"}</p>
      ${button(`${APP_URL}/applications`, "Ver meu painel de candidaturas")}
    `
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
    `👋 ${opts.newTalentCount} candidato${opts.newTalentCount > 1 ? "s" : ""} compatíve${opts.newTalentCount > 1 ? "is" : "l"} com suas vagas`,
    `
      <h2 style="font-size:21px;font-weight:700;letter-spacing:-.2px;margin:0 0 4px;color:#0f172a;">Novos candidatos para ${opts.companyName}</h2>
      <p style="color:#64748b;margin:0 0 16px;">Esta semana, <strong>${opts.newTalentCount}</strong> candidato${opts.newTalentCount > 1 ? "s" : ""} novo${opts.newTalentCount > 1 ? "s se cadastraram" : " se cadastrou"} no banco de talentos${areasLabel} — compatíveis com suas vagas abertas.</p>
      <p>Rode o matching para ver a aderência de cada um e pedir contato antes que outra empresa chegue primeiro.</p>
      ${button(`${APP_URL}/empresa/talentos`, "Ver candidatos no banco de talentos")}
    `,
  );
}

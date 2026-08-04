import { access, mkdtemp, readdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { chromium } from "playwright-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import type { AutoApplyProfile } from "@/lib/auto-apply-profile";
import { assertPublicHttpUrl } from "@/lib/url-safety";

chromium.use(StealthPlugin());

const NAVIGATION_TIMEOUT_MS = 25_000;
const MAX_CONTROLS = 100;

async function resolveChromiumExecutable(): Promise<string | undefined> {
  const configured = process.env.CHROMIUM_EXECUTABLE_PATH?.trim();
  if (configured) return configured;

  try {
    const browserDirectories = await readdir("/ms-playwright", { withFileTypes: true });
    for (const directory of browserDirectories) {
      if (!directory.isDirectory()) continue;
      const binaryCandidates = directory.name.startsWith("chromium_headless_shell-")
        ? [["chrome-headless-shell-linux64", "chrome-headless-shell"], ["chrome-headless-shell-linux", "chrome-headless-shell"]]
        : directory.name.startsWith("chromium-")
          ? [["chrome-linux64", "chrome"], ["chrome-linux", "chrome"]]
          : [];
      for (const [binaryDirectory, binaryName] of binaryCandidates) {
        const candidate = join("/ms-playwright", directory.name, binaryDirectory, binaryName);
        try {
          await access(candidate);
          return candidate;
        } catch {
          // Tenta o layout da próxima versão da imagem Playwright.
        }
      }
    }
  } catch {
    // Se a imagem não expuser /ms-playwright, o Playwright tenta seu caminho padrão.
  }

  return undefined;
}

type FieldKind =
  | "fullName"
  | "email"
  | "phone"
  | "cpf"
  | "city"
  | "state"
  | "country"
  | "linkedinUrl"
  | "salaryExpectation"
  | "availability"
  | "workAuthorization"
  | "willingToRelocate"
  | "coverLetter";

export type ExternalApplyResult =
  | { status: "applied"; detail: string }
  | { status: "blocked"; detail: string }
  | { status: "failed"; detail: string };

type ExternalApplyInput = {
  jobUrl: string;
  profile: AutoApplyProfile;
  resumeFileName: string;
  resumePdf: Uint8Array | null;
};

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

export function classifyExternalField(hint: string, inputType?: string): FieldKind | null {
  const text = normalize(hint);
  if (inputType === "email") return "email";
  if (/\b(e-?mail|correio eletronico)\b/.test(text)) return "email";
  if (/\bcpf\b/.test(text)) return "cpf";
  if (/\b(telefone|celular|phone|whatsapp)\b/.test(text)) return "phone";
  if (/\b(linkedin|perfil profissional)\b/.test(text)) return "linkedinUrl";
  if (/\b(pretensao|expectativa salarial|salario esperado|salary expectation)\b/.test(text)) {
    return "salaryExpectation";
  }
  if (/\b(disponibilidade|inicio imediato|data de inicio|availability)\b/.test(text)) return "availability";
  if (/\b(autorizad[oa] a trabalhar|autorizacao (para|de) trabalhar|autorizacao de trabalho|work authorization)\b/.test(text)) {
    return "workAuthorization";
  }
  if (/\b(mudar de cidade|mudanca|relocation|relocar)\b/.test(text)) return "willingToRelocate";
  if (/\b(carta de apresentacao|cover letter|mensagem ao recrutador)\b/.test(text)) return "coverLetter";
  if (/\b(estado|uf|state)\b/.test(text)) return "state";
  if (/\b(cidade|municipio|city)\b/.test(text)) return "city";
  if (/\b(pais( de origem)?|nacionalidade|country)\b/.test(text)) return "country";
  if (/\b(nome completo|full name|seu nome|nome)\b/.test(text)) return "fullName";
  return null;
}

// A plataforma foca candidatos no Brasil; a maioria dos formulários com "País" trata isso como
// um campo obrigatório de preenchimento óbvio, não uma pergunta real ao candidato — não vale
// deixar de enviar a candidatura por um select de país sem valor configurável no perfil.
const DEFAULT_COUNTRY = "Brasil";

function profileValue(profile: AutoApplyProfile, kind: FieldKind): string {
  if (kind === "country") return DEFAULT_COUNTRY;
  const value = profile[kind];
  if (value === "yes") return "Sim";
  if (value === "no") return "Não";
  return typeof value === "string" ? value : "";
}

/** Combobox com busca (React-select, MUI Autocomplete, select2 etc.): um <input> de texto que abre uma lista filtrável ao digitar, em vez de um <select> nativo — muito comum em campos de país/cidade/estado. */
async function isComboboxLikeInput(control: ReturnType<import("playwright").Page["locator"]>): Promise<boolean> {
  return control.evaluate((element) => {
    const el = element as HTMLElement;
    return (
      el.getAttribute("role") === "combobox" ||
      el.hasAttribute("aria-autocomplete") ||
      el.hasAttribute("aria-expanded") ||
      el.hasAttribute("aria-controls")
    );
  }).catch(() => false);
}

/**
 * Digita no combobox (via keystrokes reais, já que muitas libs só filtram no keyup/keydown, não
 * num `input` sintético) e clica na opção da lista que melhor bate. A lista quase sempre é
 * renderizada num portal fora do <form> (react-select, MUI etc.), então a busca por opções é na
 * página inteira, não dentro do form. Sem match exato, cai pra ArrowDown+Enter (aceita a primeira
 * sugestão) em vez de deixar o campo vazio.
 */
async function fillCombobox(
  page: import("playwright").Page,
  control: ReturnType<import("playwright").Page["locator"]>,
  value: string,
): Promise<void> {
  await control.click({ timeout: 3_000 }).catch(() => {});
  await control.pressSequentially(value, { delay: 30, timeout: 5_000 }).catch(() => {});
  await page.waitForTimeout(500);

  const options = page.locator(
    '[role="option"], [role="listbox"] li, ul[role="listbox"] li, .select__option, [class*="-option"]',
  );
  const optionCount = Math.min(await options.count().catch(() => 0), 30);
  const wanted = normalize(value);
  for (let index = 0; index < optionCount; index++) {
    const option = options.nth(index);
    if (!(await option.isVisible().catch(() => false))) continue;
    const text = normalize(await option.innerText().catch(() => ""));
    if (!text) continue;
    if (text === wanted || text.includes(wanted) || wanted.includes(text)) {
      await option.click({ timeout: 3_000 }).catch(() => {});
      return;
    }
  }

  await control.press("ArrowDown").catch(() => {});
  await control.press("Enter").catch(() => {});
}

function customAnswer(profile: AutoApplyProfile, hint: string): string {
  const normalizedHint = normalize(hint);
  for (const [question, answer] of Object.entries(profile.customAnswers)) {
    const normalizedQuestion = normalize(question);
    if (
      normalizedQuestion &&
      (normalizedHint.includes(normalizedQuestion) || normalizedQuestion.includes(normalizedHint))
    ) {
      return answer;
    }
  }
  return "";
}

async function controlHint(locator: ReturnType<import("playwright").Page["locator"]>): Promise<string> {
  return locator.evaluate((element) => {
    const control = element as HTMLInputElement;
    const id = control.id;
    const explicit = id ? document.querySelector(`label[for="${CSS.escape(id)}"]`)?.textContent : "";
    const wrapping = control.closest("label")?.textContent;
    const group = control.closest("fieldset, [role='group'], .form-group, .field")?.textContent;
    return [
      explicit,
      wrapping,
      control.getAttribute("aria-label"),
      control.getAttribute("placeholder"),
      control.getAttribute("name"),
      group,
    ]
      .filter(Boolean)
      .join(" ")
      .slice(0, 1000);
  });
}

// Formulários sem label/name reconhecível (só ícone + placeholder) fazem `controlHint` cair no
// placeholder cru — que costuma ser um exemplo genérico ("you@example.com", "John Doe"), não uma
// pergunta real. Mostrar isso como "campo faltando" confunde o usuário; troca por uma descrição
// baseada no `type` do input quando o hint bate com esse padrão de exemplo.
const EXAMPLE_PLACEHOLDER = /^[\w.+-]+@example\.(com|org|net)$/i;

function describeUnresolvedField(hint: string, inputType: string): string {
  if (hint && !EXAMPLE_PLACEHOLDER.test(hint.trim())) return hint;
  if (inputType === "email") return "e-mail";
  if (inputType === "tel") return "telefone";
  if (inputType === "url") return "link (URL)";
  return hint || "campo obrigatório desconhecido";
}

// O reCAPTCHA v3 (e o v2 "invisible") rodam em background e nunca exigem interação — eles só
// injetam um iframe/badge com "recaptcha" no DOM. A prática recomendada pelo próprio Google pra
// quem usa v3 é esconder o badge via CSS (`visibility: hidden`), então checar visibilidade já
// filtra a maior parte desses falsos positivos. Só bloqueia quando existe um elemento visível
// (desafio de verdade: checkbox do v2, hCaptcha, Turnstile) pro usuário resolver.
async function hasCaptchaOrLogin(page: import("playwright").Page): Promise<string | null> {
  const captcha = page.locator(
    'iframe[src*="captcha"], iframe[title*="captcha" i], iframe[src*="turnstile" i], iframe[title*="turnstile" i], iframe[src*="hcaptcha" i], .g-recaptcha, .h-captcha, [data-sitekey], [data-hcaptcha-widget-id], input[name*="captcha" i]',
  );
  const captchaCount = await captcha.count();
  for (let i = 0; i < captchaCount; i++) {
    const element = captcha.nth(i);
    if (await element.isVisible().catch(() => false)) return "A página exige CAPTCHA.";
  }

  const text = normalize((await page.locator("body").innerText().catch(() => "")).slice(0, 15_000));
  if (
    /(faca login|entre na sua conta|sign in to apply|login para se candidatar|entrar para se candidatar|junte-se (agora )?para se candidatar|join to apply|you must be signed in|faca login para continuar|crie uma conta para se candidatar)/.test(
      text,
    )
  ) {
    return "A plataforma exige login.";
  }
  return null;
}

/**
 * Muitos ATS (LinkedIn, Gupy, sites em React/Vue) renderizam o formulário via JS bem depois do
 * "domcontentloaded" — sem dar tempo pra isso, a busca por <form> roda cedo demais e não acha
 * nada. Espera a rede acalmar (com timeout curto, pra não travar em páginas com polling infinito)
 * e rola a página, já que alguns formulários só montam quando entram no viewport (lazy render).
 */
async function settlePage(page: import("playwright").Page): Promise<void> {
  await page.waitForLoadState("networkidle", { timeout: 6_000 }).catch(() => {});
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2)).catch(() => {});
  await page.waitForTimeout(500);
}

async function selectApplicationForm(
  page: import("playwright").Page,
): Promise<ReturnType<import("playwright").Page["locator"]> | null> {
  const forms = page.locator("form");
  const count = Math.min(await forms.count(), 20);
  let best: { score: number; index: number } | null = null;

  for (let index = 0; index < count; index++) {
    const form = forms.nth(index);
    if (!(await form.isVisible().catch(() => false))) continue;
    const hint = normalize([
      await form.innerText().catch(() => ""),
      await form.getAttribute("action"),
      await form.getAttribute("aria-label"),
      await form.getAttribute("name"),
    ].filter(Boolean).join(" ").slice(0, 8_000));
    const hasFile = (await form.locator('input[type="file"]').count()) > 0;
    const hasEmail = (await form.locator('input[type="email"], input[name*="email" i]').count()) > 0;
    const hasName = (await form.locator('input[name*="name" i], input[autocomplete="name"]').count()) > 0;
    let score = 0;
    if (hasFile) score += 5;
    if (hasEmail) score += 1;
    if (hasName) score += 1;
    if (/\b(candidatura|candidate-se|apply|application|curriculo|resume|cv)\b/.test(hint)) score += 4;
    if (/\b(newsletter|buscar|pesquisar|search|login|sign in)\b/.test(hint)) score -= 5;
    if (score >= 4 && (!best || score > best.score)) best = { score, index };
  }

  return best ? forms.nth(best.index) : null;
}

/** Many ATS embed the actual application form in an iframe (Greenhouse, SmartRecruiters, Workday etc.) instead of the top document. */
async function selectApplicationFormInFrames(
  page: import("playwright").Page,
): Promise<{ frame: import("playwright").Frame; form: ReturnType<import("playwright").Page["locator"]> } | null> {
  for (const frame of page.frames()) {
    if (frame === page.mainFrame()) continue;
    try {
      const forms = frame.locator("form");
      const count = Math.min(await forms.count(), 10);
      for (let index = 0; index < count; index++) {
        const form = forms.nth(index);
        if (!(await form.isVisible().catch(() => false))) continue;
        const hasFile = (await form.locator('input[type="file"]').count()) > 0;
        if (hasFile) return { frame, form };
      }
    } catch {
      continue;
    }
  }
  return null;
}

/**
 * Clica no botão/link de "candidatar-se" e retorna a página onde o formulário acabou aparecendo.
 * Muitos agregadores (LinkedIn, Indeed, Adzuna) abrem o site real da vaga (ATS) numa NOVA aba em
 * vez de navegar na mesma página — sem tratar isso, a busca por formulário nunca encontra nada.
 */
async function clickApplyAndFollow(
  page: import("playwright").Page,
): Promise<import("playwright").Page | null> {
  const APPLY_TEXT =
    /candidatar|candidate-se|aplicar|inscrever|inscreva-se|postular|quero me candidatar|enviar candidatura|apply now|apply for this job|apply|easy apply|submit application|send application/i;
  const applyAction = page
    .getByRole("button", { name: APPLY_TEXT })
    .or(page.getByRole("link", { name: APPLY_TEXT }))
    .first();
  if (!(await applyAction.count())) return null;

  const popupPromise = page.context().waitForEvent("page", { timeout: 8_000 }).catch(() => null);
  await Promise.allSettled([
    page.waitForLoadState("domcontentloaded", { timeout: NAVIGATION_TIMEOUT_MS }),
    applyAction.click({ timeout: 8_000 }),
  ]);

  const popup = await popupPromise;
  if (popup) {
    await popup.waitForLoadState("domcontentloaded", { timeout: NAVIGATION_TIMEOUT_MS }).catch(() => {});
    await settlePage(popup);
    return popup;
  }

  await settlePage(page);
  return page;
}

async function findApplicationForm(
  page: import("playwright").Page,
): Promise<{ page: import("playwright").Page; form: ReturnType<import("playwright").Page["locator"]> } | null> {
  const existing = await selectApplicationForm(page);
  if (existing) return { page, form: existing };

  const inFrame = await selectApplicationFormInFrames(page);
  if (inFrame) return { page, form: inFrame.form };

  const target = await clickApplyAndFollow(page);
  if (!target) return null;

  await assertPublicHttpUrl(target.url());
  const found = await selectApplicationForm(target);
  if (found) return { page: target, form: found };

  const foundInFrame = await selectApplicationFormInFrames(target);
  if (foundInFrame) return { page: target, form: foundInFrame.form };

  return null;
}

async function fillControls(
  form: ReturnType<import("playwright").Page["locator"]>,
  profile: AutoApplyProfile,
  resumePath: string | null,
): Promise<string[]> {
  const unresolved: string[] = [];
  const page = form.page();

  // Inputs de arquivo tratados à parte, ANTES do filtro de visibilidade: praticamente todo
  // upload de currículo estilizado (botão "Anexar currículo" etc.) esconde o <input type="file">
  // real (opacity/position) por trás de um botão custom — se ele passasse pelo isVisible() do
  // loop principal, o currículo nunca seria anexado e o form seguiria "preenchido" sem currículo.
  // setInputFiles funciona em inputs ocultos, não precisa clicar em nada visível.
  const fileControls = form.locator('input[type="file"]');
  const fileCount = Math.min(await fileControls.count(), MAX_CONTROLS);
  for (let index = 0; index < fileCount; index++) {
    const control = fileControls.nth(index);
    if (resumePath) await control.setInputFiles(resumePath).catch(() => unresolved.push("currículo em PDF"));
    else unresolved.push("currículo em PDF");
  }

  const controls = form.locator("input:not([type='file']), textarea, select");
  const count = Math.min(await controls.count(), MAX_CONTROLS);

  for (let index = 0; index < count; index++) {
    const control = controls.nth(index);
    if (!(await control.isVisible().catch(() => false))) continue;

    const tag = await control.evaluate((element) => element.tagName.toLowerCase());
    const type = normalize((await control.getAttribute("type")) ?? "");
    if (["hidden", "submit", "button", "reset", "image"].includes(type)) continue;
    const hint = await controlHint(control);
    const normalizedHint = normalize(hint);

    if (type === "checkbox") {
      const required = (await control.getAttribute("required")) !== null ||
        (await control.getAttribute("aria-required")) === "true";
      if (required && /\b(termos|privacidade|consent|terms|privacy)\b/.test(normalizedHint)) {
        await control.check();
      } else if (required && !(await control.isChecked())) {
        unresolved.push(hint && !EXAMPLE_PLACEHOLDER.test(hint.trim()) ? hint : "confirmação obrigatória");
      }
      continue;
    }

    if (type === "radio") {
      const kind = classifyExternalField(hint);
      const desired = kind ? normalize(profileValue(profile, kind)) : normalize(customAnswer(profile, hint));
      if (!desired) continue;
      const optionValue = normalize(
        `${(await control.getAttribute("value")) ?? ""} ${await controlHint(control)}`,
      );
      const wantsYes = desired === "sim";
      const matches = wantsYes
        ? /\b(sim|yes|true)\b/.test(optionValue)
        : /\b(nao|no|false)\b/.test(optionValue);
      if (matches) await control.check();
      continue;
    }

    const current = tag === "select"
      ? await control.inputValue().catch(() => "")
      : await control.inputValue().catch(() => "");
    if (current.trim()) continue;

    const kind = classifyExternalField(hint, type);
    const value = (kind ? profileValue(profile, kind) : "") || customAnswer(profile, hint);
    const isCombobox = value && tag !== "select" ? await isComboboxLikeInput(control) : false;
    if (value) {
      if (tag === "select") {
        const options = await control.locator("option").allTextContents();
        const wanted = normalize(value);
        const best = options.find((option) => {
          const normalizedOption = normalize(option);
          return normalizedOption === wanted ||
            (wanted === "sim" && /\b(sim|yes)\b/.test(normalizedOption)) ||
            (wanted === "nao" && /\b(nao|no)\b/.test(normalizedOption));
        });
        if (best) await control.selectOption({ label: best });
      } else if (isCombobox) {
        await fillCombobox(page, control, value);
      } else {
        await control.fill(value);
      }
    }

    // Comboboxes com busca (react-select, MUI etc.) muitas vezes limpam o próprio <input> depois
    // de escolher uma opção — o valor selecionado vive num elemento visual à parte, não no input.
    // Checar `inputValue()` vazio aqui daria falso "campo obrigatório sem resposta" mesmo tendo
    // clicado certo na opção, então esse campo confia no que foi tentado acima.
    if (isCombobox) continue;

    const required = (await control.getAttribute("required")) !== null ||
      (await control.getAttribute("aria-required")) === "true";
    if (required && !(await control.inputValue().catch(() => "")).trim()) {
      unresolved.push(describeUnresolvedField(hint, type));
    }
  }

  return Array.from(new Set(unresolved)).slice(0, 10);
}

export async function applyToExternalJob(input: ExternalApplyInput): Promise<ExternalApplyResult> {
  await assertPublicHttpUrl(input.jobUrl);

  let tempDirectory: string | null = null;
  let resumePath: string | null = null;
  if (input.resumePdf?.byteLength) {
    tempDirectory = await mkdtemp(`${tmpdir()}/carreiras-auto-apply-`);
    const originalName = input.resumeFileName.split(/[\\/]/).pop() || "curriculo.pdf";
    const safeName = originalName.replace(/[^\w.-]/g, "_");
    resumePath = `${tempDirectory}/${safeName.toLowerCase().endsWith(".pdf") ? safeName : `${safeName}.pdf`}`;
    await writeFile(resumePath, input.resumePdf);
  }

  let browser: Awaited<ReturnType<typeof chromium.launch>> | null = null;
  try {
    const executablePath = await resolveChromiumExecutable();
    browser = await chromium.launch({
      ...(executablePath ? { executablePath } : {}),
      headless: true,
      args: ["--no-sandbox", "--disable-blink-features=AutomationControlled"],
    });
    const context = await browser.newContext({
      locale: "pt-BR",
      viewport: { width: 1366, height: 900 },
    });
    const page = await context.newPage();
    await page.route("**/*", async (route) => {
      if (route.request().resourceType() !== "document") {
        await route.continue();
        return;
      }
      try {
        await assertPublicHttpUrl(route.request().url());
        await route.continue();
      } catch {
        await route.abort("blockedbyclient");
      }
    });
    const response = await page.goto(input.jobUrl, {
      waitUntil: "domcontentloaded",
      timeout: NAVIGATION_TIMEOUT_MS,
    });
    if (!response?.ok()) {
      const httpStatus = response?.status();
      // 401/403 quase sempre é bloqueio anti-bot (Cloudflare/WAF) contra o navegador automatizado,
      // não uma falha transitória — repetir a tentativa não muda o resultado, então trata como
      // "blocked" (mostra link de candidatura manual pro usuário) em vez de "failed" sem saída.
      const isAccessDenied = httpStatus === 401 || httpStatus === 403;
      return isAccessDenied
        ? { status: "blocked", detail: "A vaga bloqueou o acesso automatizado (proteção anti-bot)." }
        : { status: "failed", detail: `A página retornou HTTP ${httpStatus ?? "desconhecido"}.` };
    }
    await assertPublicHttpUrl(page.url());
    await settlePage(page);

    const initialBlock = await hasCaptchaOrLogin(page);
    if (initialBlock) return { status: "blocked", detail: initialBlock };
    const found = await findApplicationForm(page);
    if (!found) {
      const hostname = new URL(page.url()).hostname;
      if (/(^|\.)linkedin\.com$/.test(hostname)) {
        return {
          status: "blocked",
          detail: "Vaga do LinkedIn com Candidatura Simplificada — exige login no LinkedIn, não suportado pela automação.",
        };
      }
      return { status: "blocked", detail: "Não foi possível localizar um formulário público de candidatura." };
    }
    const { page: activePage, form } = found;

    const blockAfterOpen = await hasCaptchaOrLogin(activePage);
    if (blockAfterOpen) return { status: "blocked", detail: blockAfterOpen };

    const unresolved = await fillControls(form, input.profile, resumePath);
    if (unresolved.length) {
      return {
        status: "blocked",
        detail: `Faltam respostas para: ${unresolved.join("; ")}`.slice(0, 500),
      };
    }

    const submit = form
      .getByRole("button", { name: /enviar candidatura|finalizar candidatura|submit application|candidatar|enviar|submit/i })
      .or(form.locator('button[type="submit"], input[type="submit"]'))
      .first();
    if (!(await submit.count()) || !(await submit.isEnabled())) {
      return { status: "blocked", detail: "O botão de envio não está disponível." };
    }

    const beforeUrl = activePage.url();
    await submit.click({ timeout: 10_000 });
    await activePage.waitForTimeout(1_500);

    const finalBlock = await hasCaptchaOrLogin(activePage);
    if (finalBlock) return { status: "blocked", detail: finalBlock };

    const pageText = normalize((await activePage.locator("body").innerText().catch(() => "")).slice(0, 20_000));
    const successText =
      /(candidatura enviada|inscricao realizada|application submitted|application received|obrigad[oa] por se candidatar|thank you for applying)/;
    if (
      successText.test(pageText) ||
      (activePage.url() !== beforeUrl && /success|confirmation|obrigado|thank-you/i.test(activePage.url()))
    ) {
      return { status: "applied", detail: "Candidatura confirmada pela página externa." };
    }

    return {
      status: "failed",
      detail: "O formulário foi enviado, mas a página não apresentou uma confirmação verificável.",
    };
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Falha inesperada no navegador.";
    return { status: "failed", detail: detail.slice(0, 500) };
  } finally {
    if (browser) await browser.close();
    if (tempDirectory) await rm(tempDirectory, { recursive: true, force: true });
  }
}

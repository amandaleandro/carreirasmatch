import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { chromium } from "playwright-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import type { AutoApplyProfile } from "@/lib/auto-apply-profile";
import { assertPublicHttpUrl } from "@/lib/url-safety";

chromium.use(StealthPlugin());

const NAVIGATION_TIMEOUT_MS = 25_000;
const MAX_CONTROLS = 100;

type FieldKind =
  | "fullName"
  | "email"
  | "phone"
  | "city"
  | "state"
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

export function classifyExternalField(hint: string): FieldKind | null {
  const text = normalize(hint);
  if (/\b(e-?mail|correio eletronico)\b/.test(text)) return "email";
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
  if (/\b(nome completo|full name|seu nome|nome)\b/.test(text)) return "fullName";
  return null;
}

function profileValue(profile: AutoApplyProfile, kind: FieldKind): string {
  const value = profile[kind];
  if (value === "yes") return "Sim";
  if (value === "no") return "Não";
  return typeof value === "string" ? value : "";
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

async function hasCaptchaOrLogin(page: import("playwright").Page): Promise<string | null> {
  const captcha = page.locator(
    'iframe[src*="captcha"], iframe[title*="captcha" i], .g-recaptcha, [data-sitekey], input[name*="captcha" i]',
  );
  if (await captcha.count()) return "A página exige CAPTCHA.";

  const text = normalize((await page.locator("body").innerText().catch(() => "")).slice(0, 15_000));
  if (/(faca login|entre na sua conta|sign in to apply|login para se candidatar)/.test(text)) {
    return "A plataforma exige login.";
  }
  return null;
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

async function findApplicationForm(
  page: import("playwright").Page,
): Promise<ReturnType<import("playwright").Page["locator"]> | null> {
  const existing = await selectApplicationForm(page);
  if (existing) return existing;

  const applyAction = page
    .getByRole("button", { name: /candidatar|candidate-se|aplicar|apply now|apply/i })
    .or(page.getByRole("link", { name: /candidatar|candidate-se|aplicar|apply now|apply/i }))
    .first();
  if (!(await applyAction.count())) return null;

  await Promise.allSettled([
    page.waitForLoadState("domcontentloaded", { timeout: NAVIGATION_TIMEOUT_MS }),
    applyAction.click({ timeout: 8_000 }),
  ]);
  await page.waitForTimeout(750);
  await assertPublicHttpUrl(page.url());
  return selectApplicationForm(page);
}

async function fillControls(
  form: ReturnType<import("playwright").Page["locator"]>,
  profile: AutoApplyProfile,
  resumePath: string | null,
): Promise<string[]> {
  const unresolved: string[] = [];
  const controls = form.locator("input, textarea, select");
  const count = Math.min(await controls.count(), MAX_CONTROLS);

  for (let index = 0; index < count; index++) {
    const control = controls.nth(index);
    if (!(await control.isVisible().catch(() => false))) continue;

    const tag = await control.evaluate((element) => element.tagName.toLowerCase());
    const type = normalize((await control.getAttribute("type")) ?? "");
    if (["hidden", "submit", "button", "reset", "image"].includes(type)) continue;
    const hint = await controlHint(control);
    const normalizedHint = normalize(hint);

    if (type === "file") {
      if (resumePath) await control.setInputFiles(resumePath);
      else unresolved.push("currículo em PDF");
      continue;
    }

    if (type === "checkbox") {
      const required = (await control.getAttribute("required")) !== null ||
        (await control.getAttribute("aria-required")) === "true";
      if (required && /\b(termos|privacidade|consent|terms|privacy)\b/.test(normalizedHint)) {
        await control.check();
      } else if (required && !(await control.isChecked())) {
        unresolved.push(hint || "confirmação obrigatória");
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

    const kind = classifyExternalField(hint);
    const value = (kind ? profileValue(profile, kind) : "") || customAnswer(profile, hint);
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
      } else {
        await control.fill(value);
      }
    }

    const required = (await control.getAttribute("required")) !== null ||
      (await control.getAttribute("aria-required")) === "true";
    if (required && !(await control.inputValue().catch(() => "")).trim()) {
      unresolved.push(hint || "campo obrigatório desconhecido");
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
    browser = await chromium.launch({
      executablePath: process.env.CHROMIUM_EXECUTABLE_PATH,
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
      return { status: "failed", detail: `A página retornou HTTP ${response?.status() ?? "desconhecido"}.` };
    }
    await assertPublicHttpUrl(page.url());

    const initialBlock = await hasCaptchaOrLogin(page);
    if (initialBlock) return { status: "blocked", detail: initialBlock };
    const form = await findApplicationForm(page);
    if (!form) {
      return { status: "blocked", detail: "Não foi possível localizar um formulário público de candidatura." };
    }

    const blockAfterOpen = await hasCaptchaOrLogin(page);
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

    const beforeUrl = page.url();
    await submit.click({ timeout: 10_000 });
    await page.waitForTimeout(1_500);

    const finalBlock = await hasCaptchaOrLogin(page);
    if (finalBlock) return { status: "blocked", detail: finalBlock };

    const pageText = normalize((await page.locator("body").innerText().catch(() => "")).slice(0, 20_000));
    const successText =
      /(candidatura enviada|inscricao realizada|application submitted|application received|obrigad[oa] por se candidatar|thank you for applying)/;
    if (successText.test(pageText) || (page.url() !== beforeUrl && /success|confirmation|obrigado|thank-you/i.test(page.url()))) {
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

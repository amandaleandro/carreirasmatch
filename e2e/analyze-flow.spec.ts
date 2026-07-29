import { test, expect } from "@playwright/test";

test.describe("Formulário de análise (/analise)", () => {
  test("etapa 2 fica travada até escolher o momento profissional", async ({ page }) => {
    await page.goto("/analise");

    const step2 = page.locator('section[aria-disabled]');
    await expect(step2).toHaveAttribute("aria-disabled", "true");
    await expect(page.getByText("Escolha seu momento profissional acima para continuar")).toBeVisible();

    await page.getByTestId("career-track-reemployment").click();

    await expect(step2).toHaveAttribute("aria-disabled", "false");
    await expect(page.getByText("Escolha seu momento profissional acima para continuar")).toBeHidden();
  });

  test("labels dos campos estão associados via for/id", async ({ page }) => {
    await page.goto("/analise");
    await page.getByTestId("career-track-reemployment").click();

    // getByLabel só encontra o elemento se o <label for> apontar pro id certo.
    await expect(page.getByLabel("Cargo desejado (opcional)")).toBeVisible();
    await expect(page.getByLabel("Requisitos / Descrição da vaga")).toBeVisible();
    await expect(page.getByLabel(/Inserir link da vaga/i)).toBeVisible();
    await expect(page.getByLabel("Feedbacks recebidos (opcional)")).toBeVisible();
  });

  test("botão de calcular match tem alvo de toque adequado (>= 44px)", async ({ page }) => {
    await page.goto("/analise");
    const button = page.locator("#analisar-button");
    const box = await button.boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(44);
  });
});

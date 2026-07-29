import { test, expect } from "@playwright/test";

test.describe("Demo do hero na home (sem cadastro)", () => {
  test("simula uma vaga e mostra score animado + gaps", async ({ page }) => {
    await page.goto("/");

    const input = page.getByTestId("hero-scanner-input");
    await expect(input).toBeVisible();
    await input.fill("Desenvolvedor Front-end");
    await page.getByTestId("hero-scanner-submit").click();

    const result = page.getByTestId("hero-scanner-result");
    await expect(result).toBeVisible({ timeout: 5000 });

    // O score sobe animado; espera estabilizar em vez de checar o valor no meio da animação.
    await expect(page.getByTestId("hero-scanner-score")).toHaveText("84%", { timeout: 3000 });

    await expect(result.getByText("O que pode estar faltando:")).toBeVisible();
    await expect(result.getByText("Testes Unitários (Jest)")).toBeVisible();

    await expect(page.getByRole("link", { name: /Ver análise detalhada do meu currículo/i })).toHaveAttribute(
      "href",
      /\/analise\?role=/
    );
  });
});

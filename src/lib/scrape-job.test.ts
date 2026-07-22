import * as cheerio from "cheerio";
import { describe, expect, it } from "vitest";
import { extractLocationFromJsonLd } from "./scrape-job";

function htmlWithJsonLd(json: unknown): cheerio.CheerioAPI {
  const html = `<html><head><script type="application/ld+json">${JSON.stringify(json)}</script></head><body></body></html>`;
  return cheerio.load(html);
}

describe("extractLocationFromJsonLd", () => {
  it("extrai cidade e estado de um JobPosting padrão", () => {
    const $ = htmlWithJsonLd({
      "@context": "https://schema.org",
      "@type": "JobPosting",
      title: "Analista de Dados",
      jobLocation: {
        "@type": "Place",
        address: { addressLocality: "São Paulo", addressRegion: "SP" },
      },
    });
    expect(extractLocationFromJsonLd($)).toBe("São Paulo, SP");
  });

  it("lida com jobLocation como array", () => {
    const $ = htmlWithJsonLd({
      "@type": "JobPosting",
      jobLocation: [{ address: { addressLocality: "Curitiba", addressRegion: "PR" } }],
    });
    expect(extractLocationFromJsonLd($)).toBe("Curitiba, PR");
  });

  it("lida com @graph contendo o JobPosting", () => {
    const $ = htmlWithJsonLd({
      "@context": "https://schema.org",
      "@graph": [
        { "@type": "WebPage" },
        { "@type": "JobPosting", jobLocation: { address: { addressLocality: "Recife", addressRegion: "PE" } } },
      ],
    });
    expect(extractLocationFromJsonLd($)).toBe("Recife, PE");
  });

  it("usa só a região quando a cidade não está presente", () => {
    const $ = htmlWithJsonLd({
      "@type": "JobPosting",
      jobLocation: { address: { addressRegion: "RS" } },
    });
    expect(extractLocationFromJsonLd($)).toBe("RS");
  });

  it("retorna undefined sem JSON-LD ou sem JobPosting", () => {
    const $empty = cheerio.load("<html><body></body></html>");
    expect(extractLocationFromJsonLd($empty)).toBeUndefined();

    const $other = htmlWithJsonLd({ "@type": "Organization", name: "Empresa" });
    expect(extractLocationFromJsonLd($other)).toBeUndefined();
  });

  it("ignora JSON-LD inválido sem quebrar", () => {
    const html = `<html><head><script type="application/ld+json">{ invalid json </script></head><body></body></html>`;
    const $ = cheerio.load(html);
    expect(extractLocationFromJsonLd($)).toBeUndefined();
  });
});

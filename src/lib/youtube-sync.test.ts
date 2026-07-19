import { describe, expect, it } from "vitest";
import { classifyVideoArea, NICHE_QUERIES, mapSearchItem, parseIsoDuration } from "./youtube-sync";

describe("parseIsoDuration", () => {
  it("converte horas, minutos e segundos", () => {
    expect(parseIsoDuration("PT1H2M10S")).toBe(3730);
  });

  it("converte só minutos e segundos", () => {
    expect(parseIsoDuration("PT12M")).toBe(720);
    expect(parseIsoDuration("PT45S")).toBe(45);
  });

  it("retorna 0 para valor inválido", () => {
    expect(parseIsoDuration("")).toBe(0);
    expect(parseIsoDuration("xyz")).toBe(0);
  });
});

describe("classifyVideoArea", () => {
  it("classifica pelo conteúdo, mesmo quando veio de outra busca", () => {
    expect(classifyVideoArea("Carreira", "Curso de Excel para iniciantes", "Aprenda planilhas")).toBe(
      "Excel e produtividade",
    );
    expect(classifyVideoArea("Carreira", "Como organizar seu dinheiro", "Educação financeira prática")).toBe(
      "Educação financeira",
    );
  });

  it("mantém o tema da busca quando não encontra sinal mais específico", () => {
    expect(classifyVideoArea("Carreira", "Como crescer profissionalmente", "Dicas práticas")).toBe("Carreira");
  });
});

const baseItem = {
  id: { videoId: "abc123" },
  snippet: {
    title: "Como fazer um currículo",
    description: "Passo a passo",
    channelTitle: "Canal Carreira",
    publishedAt: "2024-05-01T10:00:00Z",
    thumbnails: { high: { url: "https://i.ytimg.com/high.jpg" } },
  },
};

describe("mapSearchItem", () => {
  it("mapeia um item válido", () => {
    const record = mapSearchItem("Currículo", baseItem, 600);
    expect(record).not.toBeNull();
    expect(record).toMatchObject({
      videoId: "abc123",
      title: "Como fazer um currículo",
      channel: "Canal Carreira",
      thumbnail: "https://i.ytimg.com/high.jpg",
      area: "Currículo",
      durationSec: 600,
    });
    expect(record?.publishedAt).toBeInstanceOf(Date);
  });

  it("descarta vídeos < 60s (Shorts)", () => {
    expect(mapSearchItem("Currículo", baseItem, 45)).toBeNull();
  });

  it("mantém vídeo com duração desconhecida (0)", () => {
    expect(mapSearchItem("Currículo", baseItem, 0)).not.toBeNull();
  });

  it("descarta item sem videoId", () => {
    expect(mapSearchItem("Currículo", { snippet: baseItem.snippet }, 600)).toBeNull();
  });

  it("usa thumbnail de menor qualidade como fallback", () => {
    const item = { id: { videoId: "x" }, snippet: { thumbnails: { default: { url: "def.jpg" } } } };
    expect(mapSearchItem("Carreira", item, 120)?.thumbnail).toBe("def.jpg");
  });

  it("trunca título e descrição muito longos", () => {
    const item = { id: { videoId: "x" }, snippet: { title: "a".repeat(300), description: "b".repeat(800) } };
    const record = mapSearchItem("Carreira", item, 120);
    expect(record?.title.length).toBe(240);
    expect(record?.description.length).toBe(500);
  });

  it("lida com snippet ausente sem quebrar", () => {
    const record = mapSearchItem("Carreira", { id: { videoId: "x" } }, 120);
    expect(record).toMatchObject({ videoId: "x", title: "", channel: "", publishedAt: null });
  });
});

describe("NICHE_QUERIES", () => {
  it("tem nichos com rótulos únicos e termos não vazios", () => {
    const areas = NICHE_QUERIES.map((n) => n.area);
    expect(new Set(areas).size).toBe(areas.length);
    expect(NICHE_QUERIES.every((n) => n.query.trim().length > 0)).toBe(true);
  });
});

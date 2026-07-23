import { describe, expect, it } from "vitest";
import { deriveJobTags } from "./feed-tags";

describe("deriveJobTags", () => {
  it("deriva subárea de TI a partir do texto da vaga", () => {
    const tags = deriveJobTags({
      jobTitle: "Desenvolvedor(a) Back-end Java Pleno",
      jobText: "Buscamos desenvolvedor back-end com experiência em Java e Spring Boot.",
      url: "https://empresa.com/vaga/123",
    });
    expect(tags.area).toBe("Tecnologia");
    expect(tags.subarea).toBe("Desenvolvimento Back-end");
  });

  it("deriva subárea fora de TI reaproveitando VOCATION_AREAS", () => {
    const tags = deriveJobTags({
      jobTitle: "Advogado Trabalhista",
      jobText: "Vaga para advogado atuar na área de direito trabalhista, contencioso.",
      url: "https://empresa.com/vaga/456",
    });
    expect(tags.area).toBe("Juridico");
    expect(tags.subarea).toBe("Direito Trabalhista");
  });

  it("sem sinal de subárea (texto sem overlap com nenhuma área), deixa undefined", () => {
    // Qualquer frase em português real tem chance de colidir com alguma
    // palavra solta de alguma das ~30 áreas (ex. "texto", "geral"), já que o
    // casamento genérico é por sobreposição de token — por isso o teste usa
    // termos inventados em vez de tentar escrever um anúncio "neutro".
    const tags = deriveJobTags({
      jobTitle: "Zorblex Fluvenix",
      jobText: "Wexbo klarnix trufendo blipsar.",
      url: "https://empresa.com/vaga/789",
    });
    expect(tags.subarea).toBeUndefined();
  });
});

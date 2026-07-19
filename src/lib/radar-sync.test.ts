import { describe, expect, it } from "vitest";
import { RADAR_FEEDS, isRelevant, parseFeedItems } from "./radar-sync";

const RSS = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>Feed de teste</title>
    <item>
      <title>Concurso TRE SP: edital publicado com 100 vagas</title>
      <link>https://exemplo.com/concurso-tre-sp/</link>
      <pubDate>Sun, 19 Jul 2026 13:10:05 +0000</pubDate>
      <description><![CDATA[<p>O <b>edital</b> foi publicado&#8230;</p>]]></description>
    </item>
    <item>
      <title><![CDATA[Receita de bolo de cenoura]]></title>
      <link>https://exemplo.com/bolo/</link>
      <description>Nada a ver com o tema</description>
    </item>
  </channel>
</rss>`;

const ATOM = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <entry>
    <title>Vestibular Fuvest 2027: inscrições abertas</title>
    <link href="https://exemplo.com/fuvest/" />
    <published>2026-07-18T10:00:00Z</published>
    <summary>Detalhes do vestibular</summary>
  </entry>
</feed>`;

describe("parseFeedItems", () => {
  it("extrai itens de RSS com CDATA, limpando HTML e entidades", () => {
    const items = parseFeedItems(RSS);
    expect(items).toHaveLength(2);
    expect(items[0]).toMatchObject({
      title: "Concurso TRE SP: edital publicado com 100 vagas",
      url: "https://exemplo.com/concurso-tre-sp/",
      summary: "O edital foi publicado…",
    });
    expect(items[0].publishedAt).toBeInstanceOf(Date);
  });

  it("extrai itens de Atom usando link href e published", () => {
    const items = parseFeedItems(ATOM);
    expect(items).toHaveLength(1);
    expect(items[0].url).toBe("https://exemplo.com/fuvest/");
    expect(items[0].publishedAt).toBeInstanceOf(Date);
  });

  it("ignora itens sem título ou link", () => {
    expect(parseFeedItems("<rss><channel><item><title>Só título</title></item></channel></rss>")).toHaveLength(0);
  });
});

describe("isRelevant", () => {
  it("aceita concursos relevantes e rejeita ruído", () => {
    expect(isRelevant("concurso", "Edital do concurso publicado")).toBe(true);
    expect(isRelevant("concurso", "Receita de bolo de cenoura")).toBe(false);
  });

  it("aceita vestibulares relevantes e rejeita ruído", () => {
    expect(isRelevant("vestibular", "Inscrições do ENEM abertas")).toBe(true);
    expect(isRelevant("vestibular", "Fuvest divulga vestibular")).toBe(true);
    expect(isRelevant("vestibular", "Dia do amigo na escola")).toBe(false);
  });
});

describe("RADAR_FEEDS", () => {
  it("tem feeds para os dois tipos e URLs https únicas", () => {
    const kinds = new Set(RADAR_FEEDS.map((f) => f.kind));
    expect(kinds.has("concurso")).toBe(true);
    expect(kinds.has("vestibular")).toBe(true);
    const urls = RADAR_FEEDS.map((f) => f.url);
    expect(new Set(urls).size).toBe(urls.length);
    expect(RADAR_FEEDS.every((f) => f.url.startsWith("https://"))).toBe(true);
  });
});

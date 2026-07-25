import * as cheerio from "cheerio";

async function inspectPostStructure() {
  const url = "https://www.uberlandia.mg.gov.br/2026/07/23/confira-as-vagas-cadastradas-no-sine-uberlandia-nesta-quinta-feira-23-11/";
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      "Accept": "text/html"
    }
  });
  const html = await res.text();
  const $ = cheerio.load(html);
  
  console.log("H1 text:", $('h1').text().trim());
  console.log("Paragraphs count:", $('p').length);
  $('p').slice(0, 10).each((i, el) => {
    const text = $(el).text().trim();
    if (text) console.log(`P[${i}]: ${text}`);
  });
}
inspectPostStructure();

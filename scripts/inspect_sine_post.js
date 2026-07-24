const cheerio = require('cheerio');

async function inspectArticle() {
  const url = "https://www.uberlandia.mg.gov.br/2026/07/23/confira-as-vagas-cadastradas-no-sine-uberlandia-nesta-quinta-feira-23-11/";
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      "Accept": "text/html"
    }
  });
  const html = await res.text();
  const $ = cheerio.load(html);
  
  console.log("Title:", $('h1').text().trim());
  console.log("Content:");
  $('.entry-content p, .entry-content ul, .entry-content div').slice(0, 15).each((i, el) => {
    console.log(`[${i}] ${$(el).text().trim()}`);
  });
  
  console.log("\nLinks in content:");
  $('.entry-content a').each((i, el) => {
    console.log(`Href: ${$(el).attr('href')} | Text: ${$(el).text().trim()}`);
  });
}
inspectArticle();

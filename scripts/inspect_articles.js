import * as cheerio from "cheerio";

async function inspectSearch() {
  const url = "https://www.uberlandia.mg.gov.br/?s=vagas";
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      "Accept": "text/html"
    }
  });
  const html = await res.text();
  const $ = cheerio.load(html);
  
  console.log("Post count:", $('article').length);
  $('article').each((i, el) => {
    const title = $(el).find('h2, h3, h4, .title, a').text().trim();
    const link = $(el).find('a').attr('href');
    console.log(`[${i}] Title: ${title}`);
    console.log(`     Link: ${link}`);
  });
  
  if ($('article').length === 0) {
    console.log("Checking all h2, h3, h4 elements:");
    $('h2, h3, h4').each((i, el) => {
      console.log(`Tag ${el.tagName}:`, $(el).text().trim(), "Link:", $(el).find('a').attr('href') || $(el).parent().attr('href'));
    });
  }
}
inspectSearch();

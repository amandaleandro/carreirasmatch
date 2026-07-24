const cheerio = require('cheerio');

async function inspectCDL() {
  const url = "https://cdludi.org.br/";
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Accept": "text/html"
      }
    });
    console.log("Status:", res.status);
    const html = await res.text();
    const $ = cheerio.load(html);

    console.log("Title:", $('title').text().trim());
    
    console.log("\nNav Links:");
    $('nav a, header a, a[href*="vaga"], a[href*="curso"], a[href*="evento"]').each((i, el) => {
      const text = $(el).text().trim();
      const href = $(el).attr('href');
      if (text && href && (text.length > 2 || href.includes('vaga') || href.includes('curso') || href.includes('evento'))) {
        console.log(`- Text: ${text} | Href: ${href}`);
      }
    });
  } catch (err) {
    console.error("Error:", err);
  }
}
inspectCDL();

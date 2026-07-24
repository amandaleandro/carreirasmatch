async function checkHtml() {
  const url = "https://www.uberlandia.mg.gov.br/?s=vagas";
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
    }
  });
  const html = await res.text();
  console.log("HTML Sample around article/post:");
  const matches = [...html.matchAll(/<a [^>]*href="([^"]+)"[^>]*>(.*?)<\/a>/g)];
  const newsLinks = matches.filter(m => m[1].includes('202') || m[1].includes('/noticias/') || m[1].includes('vaga') || m[1].includes('curso'));
  console.log("Links encontrados:", newsLinks.length);
  newsLinks.slice(0, 10).forEach(m => {
    console.log("URL:", m[1]);
    console.log("TEXT:", m[2].replace(/<[^>]+>/g, '').trim());
  });
}
checkHtml();

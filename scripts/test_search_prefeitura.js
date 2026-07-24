async function searchPrefeitura(query) {
  const url = `https://www.uberlandia.mg.gov.br/?s=${encodeURIComponent(query)}`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "pt-BR,pt;q=0.9"
    }
  });
  const html = await res.text();
  console.log(`Query "${query}": status ${res.status}, html length ${html.length}`);
  
  // Extrair títulos e links dos artigos de notícia
  const matches = [...html.matchAll(/<h\d class="entry-title"><a href="([^"]+)">(.*?)<\/a>/g)];
  console.log(`Resultados para "${query}": ${matches.length}`);
  matches.slice(0, 5).forEach(m => {
    console.log(` - Title: ${m[2].replace(/<[^>]+>/g, '')}`);
    console.log(`   Link: ${m[1]}`);
  });
}

async function run() {
  await searchPrefeitura("vagas");
  await searchPrefeitura("cursos");
  await searchPrefeitura("Sine");
  await searchPrefeitura("Desenvolvimento Social");
}
run();

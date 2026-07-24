const cheerio = require('cheerio');

async function inspectCDLEndpoints() {
  // 1. Cursos
  try {
    const resCursos = await fetch("https://loja.cdludi.org.br/compras/cursos");
    const htmlCursos = await resCursos.text();
    const $c = cheerio.load(htmlCursos);
    console.log("=== CURSOS CDL ===");
    console.log("Cursos found:", $c('.card, .product, .item, a[href*="Produto"]').length);
    $c('a[href*="Produto"]').each((i, el) => {
      console.log(`- ${$c(el).text().replace(/\s+/g, ' ').trim()} -> ${$c(el).attr('href')}`);
    });
  } catch (e) {
    console.error("Erro Cursos:", e);
  }

  // 2. Eventos
  try {
    const resEventos = await fetch("https://loja.cdludi.org.br/compras/eventos");
    const htmlEventos = await resEventos.text();
    const $e = cheerio.load(htmlEventos);
    console.log("\n=== EVENTOS CDL ===");
    $e('a[href*="Produto"], a[href*="evento"]').each((i, el) => {
      console.log(`- ${$e(el).text().replace(/\s+/g, ' ').trim()} -> ${$e(el).attr('href')}`);
    });
  } catch (e) {
    console.error("Erro Eventos:", e);
  }

  // 3. Vagas (Quickin API / HTML)
  try {
    const resVagas = await fetch("https://jobs.quickin.io/cdludi/jobs?page=1");
    const htmlVagas = await resVagas.text();
    const $v = cheerio.load(htmlVagas);
    console.log("\n=== VAGAS CDL (Quickin) ===");
    console.log("Vagas found:", $v('a, .job-item, .card').length);
    $v('a[href*="/jobs/"]').slice(0, 10).each((i, el) => {
      console.log(`- ${$v(el).text().replace(/\s+/g, ' ').trim()} -> ${$v(el).attr('href')}`);
    });
  } catch (e) {
    console.error("Erro Vagas:", e);
  }
}
inspectCDLEndpoints();

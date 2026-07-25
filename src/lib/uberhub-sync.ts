import * as cheerio from "cheerio";
import { prisma } from "@/lib/prisma";
import { recordSync } from "@/lib/external-source-sync";
import { classifyArea } from "@/lib/area-taxonomy";

const UBERHUB_VAGAS = "https://app.uberhub.com.br/vagas/";
const UBERHUB_EVENTOS = "https://app.uberhub.com.br/eventos/";
const USER_AGENT = "CarreirasMatch/1.0 (+https://carreirasmatch.com.br)";

async function fetchHtml(url: string) {
  const response = await fetch(url, {
    headers: { "user-agent": USER_AGENT, accept: "text/html,application/xhtml+xml" },
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  return response.text();
}

export async function syncUberHubData() {
  return recordSync("uberhub-sync", "UberHub Uberlândia", "job", async () => {
    let insertedCount = 0;
    const seenAt = new Date();

    // 1. Garantir fonte registrada no banco
    const source = await prisma.opportunitySource.upsert({
      where: { url: UBERHUB_VAGAS },
      create: {
        name: "UberHub Uberlândia",
        url: UBERHUB_VAGAS,
        city: "Uberlândia",
        state: "MG",
        kind: "job_board",
        official: true,
        active: true,
      },
      update: {
        name: "UberHub Uberlândia",
        city: "Uberlândia",
        state: "MG",
        active: true,
      },
    });

    // 2. Scrape de Vagas e Cursos em /vagas/
    try {
      const htmlVagas = await fetchHtml(UBERHUB_VAGAS);
      const $vagas = cheerio.load(htmlVagas);

      const keywordsCurso = ["curso", "bootcamp", "oficina", "bolsas", "treinamento", "formação"];

      const promises: Promise<unknown>[] = [];

      $vagas("p").each((_, elem) => {
        const text = $vagas(elem).text().trim();
        const link = $vagas(elem).find("a").attr("href");

        if (!link || text.includes("VAGAS DE TECNOLOGIA") || text.includes("Programação - QA")) {
          return;
        }

        const lines = text
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean);
        if (!lines.length) return;

        const rawTitle = lines[0].replace(/^[🦜🎓📊⚡📱🔥]\s*/, "");
        const rawCompany = lines[1] ? lines[1].replace(/^[🏦📍]\s*/, "") : "UberHub / Empresa parceira";

        const isCurso = keywordsCurso.some(
          (kw) => rawTitle.toLowerCase().includes(kw) || rawCompany.toLowerCase().includes(kw)
        );

        if (isCurso) {
          promises.push(
            prisma.externalCourse.upsert({
              where: { url: link },
              create: {
                title: rawTitle.slice(0, 240),
                provider: rawCompany.slice(0, 100) || "UberHub",
                url: link,
                area: classifyArea(rawTitle).area,
                subarea: classifyArea(rawTitle).subarea,
                city: "Uberlândia",
                state: "MG",
                modality: "presencial",
                free: true,
                source: "uberhub",
                lastSeenAt: seenAt,
              },
              update: {
                title: rawTitle.slice(0, 240),
                active: true,
                lastSeenAt: seenAt,
              },
            }).catch(() => null)
          );
        } else {
          const classified = classifyArea(rawTitle);
          promises.push(
            prisma.publicOpportunity.upsert({
              where: { sourceId_externalKey: { sourceId: source.id, externalKey: link } },
              create: {
                sourceId: source.id,
                externalKey: link,
                title: rawTitle.slice(0, 240),
                company: rawCompany.slice(0, 100),
                description: text,
                url: link,
                city: "Uberlândia",
                state: "MG",
                area: classified.area,
                subarea: classified.subarea,
                official: true,
                active: true,
                lastSeenAt: seenAt,
              },
              update: {
                title: rawTitle.slice(0, 240),
                company: rawCompany.slice(0, 100),
                active: true,
                lastSeenAt: seenAt,
              },
            }).catch(() => null)
          );
        }
        insertedCount++;
      });

      await Promise.all(promises);
    } catch (err) {
      console.error("[UberHub] Erro no scrape de vagas:", err);
    }

    // 3. Scrape de Eventos em /eventos/
    try {
      const htmlEventos = await fetchHtml(UBERHUB_EVENTOS);
      const $eventos = cheerio.load(htmlEventos);

      const promises: Promise<unknown>[] = [];

      $eventos("p").each((_, elem) => {
        const text = $eventos(elem).text().trim();
        const link = $eventos(elem).find("a").attr("href");

        if (!link || text.includes("eventos em destaques") || text.includes("agenda completa")) {
          return;
        }

        const lines = text
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean);
        if (!lines.length) return;

        const rawTitle = lines[0].replace(/^[🔥🗓️]\s*/, "");
        const dataHora = lines[1] || "";
        const local = lines[2] ? lines[2].replace(/^[🚩]\s*/, "") : "Uberlândia";

        const classified = classifyArea(rawTitle);
        promises.push(
          prisma.publicOpportunity.upsert({
            where: { sourceId_externalKey: { sourceId: source.id, externalKey: link } },
            create: {
              sourceId: source.id,
              externalKey: link,
              title: `[Evento] ${rawTitle.slice(0, 220)}`,
              company: local.slice(0, 100),
              description: `Data/Horário: ${dataHora} | Local: ${local}\n${text}`,
              url: link,
              city: "Uberlândia",
              state: "MG",
              area: classified.area,
              subarea: classified.subarea,
              official: true,
              active: true,
              lastSeenAt: seenAt,
            },
            update: {
              title: `[Evento] ${rawTitle.slice(0, 220)}`,
              company: local.slice(0, 100),
              active: true,
              lastSeenAt: seenAt,
            },
          }).catch(() => null)
        );

        insertedCount++;
      });

      await Promise.all(promises);
    } catch (err) {
      console.error("[UberHub] Erro no scrape de eventos:", err);
    }

    return insertedCount;
  });
}

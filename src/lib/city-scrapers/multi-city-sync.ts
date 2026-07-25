import { prisma } from "@/lib/prisma";
import { recordSync } from "@/lib/external-source-sync";
import { classifyArea } from "@/lib/area-taxonomy";
import { UberlandiaPrefeituraScraper } from "./uberlandia";
import { GenericWordPressCityScraper } from "./generic-wordpress";
import { CityScraper } from "./types";

// Registrador de cidades suportadas
export const REGISTERED_CITY_SCRAPERS: CityScraper[] = [
  new UberlandiaPrefeituraScraper(),
  new GenericWordPressCityScraper("uberaba-pref", "Uberaba", "MG", "https://www.uberaba.mg.gov.br"),
  new GenericWordPressCityScraper("araguari-pref", "Araguari", "MG", "https://araguari.mg.gov.br"),
];

export async function syncAllCitiesData() {
  return recordSync("multi-city-sync", "Prefeituras Municipais", "job", async () => {
    let totalItems = 0;
    const seenAt = new Date();

    for (const scraper of REGISTERED_CITY_SCRAPERS) {
      try {
        console.log(`[MultiCitySync] Iniciando scraping de ${scraper.cityName} (${scraper.state})...`);
        const items = await scraper.scrape();

        const sourceUrl = `https://${scraper.cityId}.gov.br`;
        const source = await prisma.opportunitySource.upsert({
          where: { url: sourceUrl },
          create: {
            name: `Prefeitura de ${scraper.cityName}`,
            url: sourceUrl,
            city: scraper.cityName,
            state: scraper.state,
            kind: "job_board",
            official: true,
            active: true,
          },
          update: {
            name: `Prefeitura de ${scraper.cityName}`,
            city: scraper.cityName,
            state: scraper.state,
            active: true,
          },
        });

        const promises: Promise<unknown>[] = [];

        for (const item of items) {
          if (item.type === "curso") {
            promises.push(
              prisma.externalCourse
                .upsert({
                  where: { url: item.url },
                  create: {
                    title: item.title.slice(0, 240),
                    provider: item.company || `Prefeitura de ${scraper.cityName}`,
                    url: item.url,
                    area: classifyArea(item.title).area,
                    subarea: classifyArea(item.title).subarea,
                    city: scraper.cityName,
                    state: scraper.state,
                    modality: "presencial",
                    free: true,
                    source: `prefeitura-${scraper.cityId}`,
                    lastSeenAt: seenAt,
                  },
                  update: {
                    title: item.title.slice(0, 240),
                    active: true,
                    lastSeenAt: seenAt,
                  },
                })
                .catch(() => null)
            );
          } else {
            const classified = classifyArea(item.title);
            promises.push(
              prisma.publicOpportunity
                .upsert({
                  where: { sourceId_externalKey: { sourceId: source.id, externalKey: item.externalKey } },
                  create: {
                    sourceId: source.id,
                    externalKey: item.externalKey,
                    title: item.title.slice(0, 240),
                    company: item.company || `Prefeitura de ${scraper.cityName}`,
                    description: item.description,
                    url: item.url,
                    salary: item.salary || "",
                    city: scraper.cityName,
                    state: scraper.state,
                    area: classified.area,
                    subarea: classified.subarea,
                    official: true,
                    active: true,
                    lastSeenAt: seenAt,
                  },
                  update: {
                    title: item.title.slice(0, 240),
                    company: item.company || `Prefeitura de ${scraper.cityName}`,
                    description: item.description,
                    active: true,
                    lastSeenAt: seenAt,
                  },
                })
                .catch(() => null)
            );
          }
          totalItems++;
        }

        await Promise.all(promises);
      } catch (err) {
        console.error(`[MultiCitySync] Erro ao sincronizar ${scraper.cityName}:`, err);
      }
    }

    return totalItems;
  });
}

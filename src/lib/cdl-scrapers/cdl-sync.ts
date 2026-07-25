import { prisma } from "@/lib/prisma";
import { recordSync } from "@/lib/external-source-sync";
import { classifyArea } from "@/lib/area-taxonomy";
import { scrapeCDLUberlandia, CDLOpportunity } from "./cdl-uberlandia";
import { scrapeGenericCDL, CDLConfig } from "./generic-cdl";

export const OTHER_CDLS: CDLConfig[] = [
  { id: "cdl-uberaba", cityName: "Uberaba", state: "MG", domain: "https://cdluberaba.com.br", quickinSlug: "cdluberaba" },
  { id: "cdl-araguari", cityName: "Araguari", state: "MG", domain: "https://cdlaraguari.com.br" },
  { id: "cdl-bh", cityName: "Belo Horizonte", state: "MG", domain: "https://cdlbh.com.br", quickinSlug: "cdlbh" },
];

export async function syncAllCDLData() {
  return recordSync("cdl-multi-sync", "CDL (Câmara de Dirigentes Lojistas)", "job", async () => {
    let totalCount = 0;
    const seenAt = new Date();

    // 1. CDL Uberlândia
    const udiItems = await scrapeCDLUberlandia();
    totalCount += await saveCDLItems("cdl-uberlandia", "CDL Uberlândia", "Uberlândia", "MG", "https://cdludi.org.br", udiItems, seenAt);

    // 2. Outras CDLs
    for (const cdl of OTHER_CDLS) {
      try {
        const items = await scrapeGenericCDL(cdl);
        totalCount += await saveCDLItems(cdl.id, `CDL ${cdl.cityName}`, cdl.cityName, cdl.state, cdl.domain, items, seenAt);
      } catch (err) {
        console.error(`[CDLSync] Erro em ${cdl.cityName}:`, err);
      }
    }

    return totalCount;
  });
}

async function saveCDLItems(
  key: string,
  name: string,
  city: string,
  state: string,
  url: string,
  items: CDLOpportunity[],
  seenAt: Date
) {
  const source = await prisma.opportunitySource.upsert({
    where: { url },
    create: {
      name,
      url,
      city,
      state,
      kind: "job_board",
      official: true,
      active: true,
    },
    update: {
      name,
      city,
      state,
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
              provider: item.company || name,
              url: item.url,
              area: classifyArea(item.title).area,
              subarea: classifyArea(item.title).subarea,
              city,
              state,
              modality: "presencial",
              free: false,
              source: key,
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
              company: item.company || name,
              description: item.description,
              url: item.url,
              city,
              state,
              area: classified.area,
              subarea: classified.subarea,
              official: true,
              active: true,
              lastSeenAt: seenAt,
            },
            update: {
              title: item.title.slice(0, 240),
              company: item.company || name,
              description: item.description,
              active: true,
              lastSeenAt: seenAt,
            },
          })
          .catch(() => null)
      );
    }
  }

  await Promise.all(promises);
  return items.length;
}

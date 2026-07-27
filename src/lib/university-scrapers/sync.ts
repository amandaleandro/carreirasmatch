import { prisma } from "@/lib/prisma";
import { recordSync } from "@/lib/external-source-sync";
import { slugify } from "@/lib/blog-generator";
import { REGISTERED_UNIVERSITY_SCRAPERS } from "./registry";
import { closeSharedBrowser } from "./sigaa-browser";

const STALE_AFTER_MS = 45 * 24 * 60 * 60 * 1000;

export async function syncUniversityCurricula() {
  return recordSync("university-curricula", "Universidades e Currículos", "curriculum", async () => {
    let courseCount = 0;
    const now = new Date();

    try {
      for (const scraper of REGISTERED_UNIVERSITY_SCRAPERS) {
        const source = `sigaa:${slugify(scraper.universityName)}`;
        try {
          const universitySlug = slugify(scraper.universityName);
          const university = await prisma.university.upsert({
            where: { slug: universitySlug },
            create: {
              name: scraper.universityName,
              slug: universitySlug,
              city: scraper.city,
              state: scraper.state,
              website: scraper.website,
              source,
              lastSeenAt: now,
            },
            update: { active: true, lastSeenAt: now },
          });

          const courses = await scraper.scrape();
          for (const course of courses) {
            const courseSlug = slugify(`${scraper.universityName}-${course.title}`);
            const universityCourse = await prisma.universityCourse.upsert({
              where: { url: course.url },
              create: {
                universityId: university.id,
                title: course.title,
                slug: courseSlug,
                area: course.area,
                subarea: course.subarea ?? "",
                url: course.url,
                modality: course.modality ?? "presencial",
                source,
                lastSeenAt: now,
              },
              update: {
                title: course.title,
                area: course.area,
                subarea: course.subarea ?? "",
                modality: course.modality ?? "presencial",
                active: true,
                lastSeenAt: now,
              },
            });

            await prisma.curriculumSubject.deleteMany({ where: { universityCourseId: universityCourse.id } });
            if (course.subjects.length > 0) {
              await prisma.curriculumSubject.createMany({
                data: course.subjects.map((subject, index) => ({
                  universityCourseId: universityCourse.id,
                  name: subject.name,
                  semester: subject.semester ?? null,
                  order: index,
                })),
              });
            }
            courseCount += 1;
          }
        } catch (error) {
          console.error(`[university-scrapers] Erro ao raspar ${scraper.universityName}:`, error);
        }
      }
    } finally {
      await closeSharedBrowser();
    }

    const staleThreshold = new Date(now.getTime() - STALE_AFTER_MS);
    await prisma.universityCourse.updateMany({
      where: { lastSeenAt: { lt: staleThreshold } },
      data: { active: false },
    });
    await prisma.university.updateMany({
      where: { lastSeenAt: { lt: staleThreshold } },
      data: { active: false },
    });

    return courseCount;
  });
}

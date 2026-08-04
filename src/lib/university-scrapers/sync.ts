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
        const source = scraper.source ?? `sigaa:${slugify(scraper.universityName)}`;
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
            // Algumas instituições oferecem o mesmo título de curso mais de uma vez
            // (ex: "Ciências Biológicas" em Bacharelado e Licenciatura, ou em campi
            // diferentes) — slugify(universidade+título) sozinho colide nesses casos.
            // O sufixo numérico extraído da URL (sempre único, é o id do curso no
            // sistema de origem) garante slug único sem afetar o dedupe por `url`.
            const urlIdMatch = course.url.match(/(\d+)(?:$|[^\d]*$)/);
            const courseSlug = slugify(
              urlIdMatch ? `${scraper.universityName}-${course.title}-${urlIdMatch[1]}` : `${scraper.universityName}-${course.title}`
            );
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

            // Reconcilia em vez de apagar tudo e recriar: CurriculumSubjectInsight tem
            // onDelete: Cascade, então recriar a disciplina (mesmo com o mesmo nome)
            // apagaria o insight de IA já gerado e cacheado — forçando gasto de IA de
            // novo a cada sync. Disciplinas que já existem (mesmo nome+semestre) só têm
            // a ordem atualizada; só entram/saem as que realmente mudaram na grade.
            const existingSubjects = await prisma.curriculumSubject.findMany({
              where: { universityCourseId: universityCourse.id },
              select: { id: true, name: true, semester: true },
            });
            const existingByKey = new Map(existingSubjects.map((s) => [`${s.name}::${s.semester ?? ""}`, s.id]));
            const incomingKeys = new Set(course.subjects.map((s) => `${s.name}::${s.semester ?? ""}`));

            const toDelete = existingSubjects.filter((s) => !incomingKeys.has(`${s.name}::${s.semester ?? ""}`));
            if (toDelete.length > 0) {
              await prisma.curriculumSubject.deleteMany({ where: { id: { in: toDelete.map((s) => s.id) } } });
            }

            for (const [index, subject] of course.subjects.entries()) {
              const key = `${subject.name}::${subject.semester ?? ""}`;
              const existingId = existingByKey.get(key);
              if (existingId) {
                await prisma.curriculumSubject.update({ where: { id: existingId }, data: { order: index } });
              } else {
                await prisma.curriculumSubject.create({
                  data: {
                    universityCourseId: universityCourse.id,
                    name: subject.name,
                    semester: subject.semester ?? null,
                    order: index,
                  },
                });
              }
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

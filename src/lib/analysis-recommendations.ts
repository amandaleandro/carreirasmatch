import { prisma } from "@/lib/prisma";

export interface RecommendedCourse {
  id: string;
  title: string;
  provider: string;
  url: string;
  area: string;
  modality: string;
  free: boolean;
  featured: boolean;
  couponCode?: string;
  couponDiscount?: string;
  matchingKeywords: string[];
}

/**
 * Busca cursos externos/parceiros relevantes com base nas palavras-chave faltantes e área da vaga.
 */
export async function getRecommendedPartnerCourses(
  missingKeywords: string[],
  jobTitle: string,
  limit = 4
): Promise<RecommendedCourse[]> {
  try {
    const activeCourses = await prisma.externalCourse.findMany({
      where: { active: true },
      take: 50,
      orderBy: [{ featured: "desc" }, { updatedAt: "desc" }],
    });

    if (activeCourses.length === 0) return [];

    const keywordsLower = missingKeywords.map((k) => k.toLowerCase().trim());
    const jobTitleLower = jobTitle.toLowerCase();

    const scored = activeCourses.map((course) => {
      const courseTitleLower = course.title.toLowerCase();
      const courseAreaLower = course.area.toLowerCase();
      const matched: string[] = [];

      for (const kw of keywordsLower) {
        if (courseTitleLower.includes(kw) || courseAreaLower.includes(kw)) {
          matched.push(kw);
        }
      }

      let score = matched.length * 3;
      if (course.featured) score += 5;
      if (jobTitleLower.split(" ").some((w) => w.length > 3 && courseTitleLower.includes(w))) {
        score += 2;
      }

      return {
        course: {
          id: course.id,
          title: course.title,
          provider: course.provider,
          url: course.url,
          area: course.area,
          modality: course.modality,
          free: course.free,
          featured: course.featured,
          couponCode: course.couponCode || undefined,
          couponDiscount: course.couponDiscount || undefined,
          matchingKeywords: matched,
        },
        score,
      };
    });

    return scored
      .filter((item) => item.score > 0 || item.course.featured)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((item) => item.course);
  } catch (error) {
    console.error("Erro ao buscar cursos recomendados:", error);
    return [];
  }
}

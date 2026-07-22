import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const CLICK_LIMIT = { limit: 60, windowMs: 60 * 60 * 1000 };

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const rateLimit = checkRateLimit(`course-click:${getClientIp(req)}`, CLICK_LIMIT);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Muitas solicitações. Tente novamente mais tarde." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } },
    );
  }

  try {
    const course = await prisma.externalCourse.findUnique({
      where: { id },
      select: { partnerId: true },
    });

    if (course?.partnerId) {
      await prisma.partnerCourseClick.create({
        data: {
          courseId: id,
          partnerId: course.partnerId,
        },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Erro ao registrar clique:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

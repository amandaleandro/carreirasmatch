import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { hasToolAccess } from "@/lib/tool-access";
import { hasActiveSubscriptionAccess } from "@/lib/entitlements";
import { hasFullAccessEmail } from "@/lib/full-access-users";
import { isInfluencerUser } from "@/lib/influencer";
import { checkRateLimit } from "@/lib/rate-limit";
import { normalizeCareerSegment, type CareerSegment } from "@/lib/career-segments";

const AUTH_ACTION_LIMIT = { limit: 60, windowMs: 5 * 60 * 1000 };

export async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      session: null,
      response: NextResponse.json(
        { error: "Faça login para continuar." },
        { status: 401 }
      ),
    };
  }

  const rateLimit = checkRateLimit(`auth-action:${session.user.id}`, AUTH_ACTION_LIMIT);
  if (!rateLimit.allowed) {
    return {
      session: null,
      response: NextResponse.json(
        { error: "Muitas requisições. Aguarde um momento e tente novamente." },
        { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
      ),
    };
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) {
    return {
      session: null,
      response: NextResponse.json(
        { error: "Sua sessão expirou. Saia e faça login novamente." },
        { status: 401 }
      ),
    };
  }

  return { session, response: null };
}

/**
 * Segment/allowlist check only — no binary subscription gate. Use this in routes that reserve
 * their own quota via reserveFeatureForRoute/reserveFeatureForSession (catalog-based), where the
 * monthly-limit enforcement already comes from the catalog and a separate binary "has active
 * subscription" check would incorrectly block free-tier users still within their catalog quota.
 */
export async function requireToolSegmentAccess(toolHref: string, requiredSegment?: CareerSegment) {
  const { session, response } = await requireAuth();
  if (!session) return { session: null, response };

  const user = await prisma.user.findUnique({
    where: { id: session.user!.id },
    select: { careerSegment: true, email: true },
  });

  // Full-access (admin) e influenciadores enxergam todas as ferramentas,
  // independentemente do segmento de carreira.
  if (hasFullAccessEmail(user?.email ?? session.user!.email) || (await isInfluencerUser(session.user!.id))) {
    return { session, response: null };
  }

  if (requiredSegment) {
    if (normalizeCareerSegment(user?.careerSegment) !== requiredSegment) {
      return {
        session: null,
        response: NextResponse.json(
          { error: "Esta ferramenta não está disponível para o seu perfil." },
          { status: 403 }
        ),
      };
    }
    return { session, response: null };
  }

  if (!hasToolAccess(user?.careerSegment, toolHref)) {
    return {
      session: null,
      response: NextResponse.json(
        { error: "Esta ferramenta não está disponível para o seu perfil." },
        { status: 403 }
      ),
    };
  }

  return { session, response: null };
}

export async function requireToolAccess(toolHref: string, requiredSegment?: CareerSegment) {
  const { session, response } = await requireAuth();
  if (!session) return { session: null, response };

  if (!(await hasActiveSubscriptionAccess(session.user!.id!))) {
    return {
      session: null,
      response: NextResponse.json(
        { error: "Assine o plano mensal para usar esta ferramenta." },
        { status: 402 }
      ),
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user!.id },
    select: { careerSegment: true, email: true },
  });

  // Full-access (admin) e influenciadores enxergam todas as ferramentas,
  // independentemente do segmento de carreira.
  if (hasFullAccessEmail(user?.email ?? session.user!.email) || (await isInfluencerUser(session.user!.id))) {
    return { session, response: null };
  }

  if (requiredSegment) {
    if (normalizeCareerSegment(user?.careerSegment) !== requiredSegment) {
      return {
        session: null,
        response: NextResponse.json(
          { error: "Esta ferramenta não está disponível para o seu perfil." },
          { status: 403 }
        ),
      };
    }
    return { session, response: null };
  }

  if (!hasToolAccess(user?.careerSegment, toolHref)) {
    return {
      session: null,
      response: NextResponse.json(
        { error: "Esta ferramenta não está disponível para o seu perfil." },
        { status: 403 }
      ),
    };
  }

  return { session, response: null };
}

export async function requireActiveSubscription() {
  const { session, response } = await requireAuth();
  if (!session) return { session: null, response };

  if (!(await hasActiveSubscriptionAccess(session.user!.id!))) {
    return {
      session: null,
      response: NextResponse.json(
        { error: "Assine o plano mensal para usar esta ferramenta." },
        { status: 402 }
      ),
    };
  }

  return { session, response: null };
}

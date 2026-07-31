import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createStripeCheckoutSession } from "@/lib/stripe";
import { normalizeCareerSegment } from "@/lib/career-segments";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const body = await req.json();
    const { email, analysisId, kind, productCode, segment, couponCode } = body;

    const targetEmail = email || session?.user?.email;
    if (!targetEmail) {
      return NextResponse.json(
        { error: "E-mail obrigatório para o checkout do Stripe." },
        { status: 400 }
      );
    }

    const normalizedSegment = normalizeCareerSegment(segment) ?? "career_pro";

    // Pega a URL de origem da requisição
    const originUrl = req.headers.get("origin") || req.nextUrl.origin;

    const checkoutSession = await createStripeCheckoutSession({
      userId: session?.user?.id,
      email: targetEmail,
      analysisId,
      kind: kind || "diagnostic",
      productCode: typeof productCode === "string" ? productCode : undefined,
      segment: normalizedSegment,
      couponCode,
      originUrl,
    });

    return NextResponse.json({
      url: checkoutSession.url,
      sessionId: checkoutSession.id,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Não foi possível criar o checkout no Stripe.";
    console.error("Erro ao criar sessão de Checkout no Stripe:", error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { generateStudyDiagnostic } from "@/lib/tools";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

// Entrada gratuita e anônima da jornada Estudos (arquitetura de ofertas de
// 06/08/2026): a pessoa escolhe o objetivo e recebe um diagnóstico inicial,
// sem precisar de cadastro. Mesmo padrão de limite por IP do Diagnóstico da Vaga.
const STUDY_DIAGNOSTIC_LIMIT = { limit: 5, windowMs: 60 * 60 * 1000 };
const VALID_OBJECTIVES = ["enem", "vestibular", "concurso", "oab", "ensino_medio"];
const MAX_LENGTH = 2000;

export async function POST(req: Request) {
  const rateLimit = checkRateLimit(`study-diagnostic:${getClientIp(req)}`, STUDY_DIAGNOSTIC_LIMIT);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Muitos diagnósticos em sequência. Tente novamente mais tarde." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
    );
  }

  let body: { objective?: string; context?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }

  const objective = (body.objective ?? "").trim();
  if (!VALID_OBJECTIVES.includes(objective)) {
    return NextResponse.json({ error: "Escolha um objetivo válido." }, { status: 400 });
  }

  const context = (body.context ?? "").trim().slice(0, MAX_LENGTH);

  try {
    const result = await generateStudyDiagnostic(objective, context);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Não foi possível gerar o diagnóstico agora. Tente de novo." }, { status: 502 });
  }
}

import { NextResponse } from "next/server";
import { generateJobDiagnostic } from "@/lib/tools";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

// Entrada gratuita e anônima da jornada Empresas (arquitetura de ofertas de
// 06/08/2026): a empresa cola a vaga e recebe um diagnóstico de clareza, sem
// precisar de cadastro. Limite por IP, igual à análise anônima de candidato.
const JOB_DIAGNOSTIC_LIMIT = { limit: 5, windowMs: 60 * 60 * 1000 };
const MAX_LENGTH = 6000;

export async function POST(req: Request) {
  const rateLimit = checkRateLimit(`job-diagnostic:${getClientIp(req)}`, JOB_DIAGNOSTIC_LIMIT);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Muitos diagnósticos em sequência. Tente novamente mais tarde ou cadastre sua empresa para uso ilimitado." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
    );
  }

  let body: { jobDescription?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }

  const jobDescription = (body.jobDescription ?? "").trim();
  if (jobDescription.length < 40) {
    return NextResponse.json({ error: "Cole o texto completo da vaga (mínimo 40 caracteres)." }, { status: 400 });
  }
  if (jobDescription.length > MAX_LENGTH) {
    return NextResponse.json({ error: "Texto da vaga muito longo." }, { status: 400 });
  }

  try {
    const result = await generateJobDiagnostic(jobDescription);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Não foi possível gerar o diagnóstico agora. Tente de novo." }, { status: 502 });
  }
}

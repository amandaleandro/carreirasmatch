import { NextResponse } from "next/server";
import { requireCompanyApi } from "@/lib/company-auth";
import { generateJobDescription } from "@/lib/tools";
import { checkRateLimit } from "@/lib/rate-limit";

const DESCRIPTION_LIMIT = { limit: 20, windowMs: 10 * 60 * 1000 };

// Gera uma descrição de vaga com IA a partir do cargo (e observações opcionais).
export async function POST(req: Request) {
  const { company, response } = await requireCompanyApi();
  if (!company) return response;

  const rateLimit = checkRateLimit(`company-job-description:${company.id}`, DESCRIPTION_LIMIT);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Muitas gerações em sequência. Aguarde um momento." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
    );
  }

  let body: { title?: string; notes?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }

  const title = (body.title ?? "").trim();
  if (!title) {
    return NextResponse.json({ error: "Informe o cargo da vaga primeiro." }, { status: 400 });
  }

  try {
    const { description } = await generateJobDescription(title, (body.notes ?? "").trim());
    return NextResponse.json({ description });
  } catch {
    return NextResponse.json({ error: "Não foi possível gerar a descrição agora. Tente de novo." }, { status: 502 });
  }
}

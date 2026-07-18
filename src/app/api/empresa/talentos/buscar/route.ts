import { NextRequest, NextResponse } from "next/server";
import { requireCompanyApi } from "@/lib/company-auth";
import { searchTalent } from "@/lib/talent-search";
import { checkRateLimit } from "@/lib/rate-limit";

const SEARCH_LIMIT = { limit: 10, windowMs: 10 * 60 * 1000 };

export async function POST(req: NextRequest) {
  const { company, response } = await requireCompanyApi();
  if (!company) return response;

  const rateLimit = checkRateLimit(`talent-search:${company.id}`, SEARCH_LIMIT);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Muitas buscas em sequência. Aguarde um momento e tente novamente." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
    );
  }

  const body = await req.json();
  const jobTitle = typeof body.jobTitle === "string" ? body.jobTitle.trim() : "";
  const jobText = typeof body.jobText === "string" ? body.jobText.trim() : "";
  const area = typeof body.area === "string" ? body.area.trim() : "";
  const state = typeof body.state === "string" ? body.state.trim() : "";

  if (!jobTitle || !jobText) {
    return NextResponse.json({ error: "Informe o cargo e a descrição da vaga." }, { status: 400 });
  }

  try {
    const matches = await searchTalent(company.id, jobTitle, jobText, { area, state });
    return NextResponse.json({ matches });
  } catch (error) {
    console.error("Falha na busca de talentos:", error);
    return NextResponse.json(
      { error: "No momento a busca por IA está com muita demanda. Tente novamente em instantes." },
      { status: 429 }
    );
  }
}

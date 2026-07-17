import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/require-auth";

type IbgeCity = { id: number; nome: string };
const STATE_PATTERN = /^[A-Z]{2}$/;

export async function GET(request: NextRequest) {
  const { session, response } = await requireAuth();
  if (!session) return response!;
  const state = request.nextUrl.searchParams.get("state")?.toUpperCase() ?? "";
  if (!STATE_PATTERN.test(state)) {
    return NextResponse.json({ error: "UF inválida." }, { status: 400 });
  }
  const result = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${state}/municipios`, {
    headers: { accept: "application/json" },
    next: { revalidate: 86400 },
  });
  if (!result.ok) return NextResponse.json({ error: "Não foi possível carregar as cidades." }, { status: 502 });
  const cities = (await result.json()) as IbgeCity[];
  return NextResponse.json({ cities: cities.map((city) => ({ id: city.id, name: city.nome })) });
}

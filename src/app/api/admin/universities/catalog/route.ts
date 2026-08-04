import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin";
import { importNationalInstitutions, parseNationalCatalogCsv } from "@/lib/university-scrapers/national-catalog";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

/** Recebe o CSV oficial de instituições/cursos do MEC/e-MEC no corpo da
 * requisição. A camada nacional é importada antes dos scrapers de grades para
 * que uma falha de portal nunca apague ou substitua o cadastro oficial. */
export async function POST(request: Request) {
  const { session, response } = await requireAdminApi();
  if (!session) return response!;

  const csv = await request.text();
  if (!csv.trim()) {
    return NextResponse.json({ error: "Envie o conteúdo CSV do catálogo do MEC." }, { status: 400 });
  }
  if (csv.length > 50 * 1024 * 1024) {
    return NextResponse.json({ error: "O arquivo CSV excede o limite de 50 MB." }, { status: 413 });
  }

  const rows = parseNationalCatalogCsv(csv);
  if (rows.length === 0) {
    return NextResponse.json({ error: "Nenhuma linha reconhecida no CSV. Verifique se é o arquivo de instituições/cursos do MEC." }, { status: 422 });
  }

  const imported = await importNationalInstitutions(rows);
  return NextResponse.json({ imported, rows: rows.length });
}

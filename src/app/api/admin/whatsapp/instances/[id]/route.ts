import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin";
import { deleteWhatsappInstance } from "@/lib/evolution";

/** Remove um número: desconecta e apaga a instância na Evolution API, depois o registro local. */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { session, response } = await requireAdminApi();
  if (!session) return response!;

  const { id } = await params;
  await deleteWhatsappInstance(id);
  return NextResponse.json({ ok: true });
}

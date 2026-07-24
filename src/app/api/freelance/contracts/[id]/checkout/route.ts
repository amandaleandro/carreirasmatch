import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const { id } = await params;
    const contract = await prisma.freelanceContract.findUnique({
      where: { id },
      include: { project: true, freelancer: { select: { name: true, email: true } } },
    });

    if (!contract || contract.clientUserId !== session.user.id) {
      return NextResponse.json({ error: "Contrato não encontrado." }, { status: 404 });
    }

    // Retorna a intenção de checkout com retenção/escrow para o projeto
    return NextResponse.json({
      success: true,
      contractId: contract.id,
      projectTitle: contract.project.title,
      agreedAmountCents: contract.agreedCents,
      escrowMessage: "O valor será retido em custódia pela plataforma e liberado ao freelancer após a aprovação da entrega.",
    });
  } catch (error) {
    console.error("Erro no checkout de escrow do contrato:", error);
    return NextResponse.json({ error: "Erro ao processar intenção de pagamento." }, { status: 500 });
  }
}

import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ResumeIndexPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const latest = await prisma.analysis.findFirst({
    where: { resume: { userId: session.user.id } },
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });

  if (latest) redirect(`/resume/${latest.id}`);

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 w-full text-center">
      <h1 className="text-2xl font-bold tracking-tight">Otimize seu currículo</h1>
      <p className="text-neutral-600 dark:text-neutral-400 mt-2">
        Faça sua primeira análise de vaga para receber sugestões de otimização
        do currículo específicas para a vaga.
      </p>
      <Link
        href="/"
        className="inline-block mt-6 rounded-md bg-blue-600 text-white font-medium px-5 py-2.5 hover:bg-blue-700 transition-colors"
      >
        Fazer minha primeira análise
      </Link>
    </div>
  );
}

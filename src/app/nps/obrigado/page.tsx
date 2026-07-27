import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export default async function NpsObrigadoPage({
  searchParams,
}: {
  searchParams: Promise<{ score?: string }>;
}) {
  const { score } = await searchParams;
  const n = Number(score);
  const isDetractor = Number.isFinite(n) && n <= 6;

  return (
    <main className="min-h-screen bg-[#F8FAFC] dark:bg-[#071827] text-foreground font-sans flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-4 py-16">
        <CheckCircle2 className="w-12 h-12 text-[#2563EB] mx-auto" />
        <h1 className="text-2xl font-bold">Valeu pela nota! 🙏</h1>
        <p className="text-muted-foreground">
          {isDetractor
            ? "Sentimos muito que a experiência não tenha sido a ideal. Se quiser contar o que faltou, é só responder o e-mail da pesquisa, a gente lê tudo."
            : "Seu feedback ajuda a gente a construir um produto melhor pra sua busca de vaga."}
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center rounded-xl bg-[#2563EB] text-white font-semibold px-5 py-3 mt-2"
        >
          Voltar para o meu painel
        </Link>
      </div>
    </main>
  );
}

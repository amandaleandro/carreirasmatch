import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Obrigado pelo seu feedback | CarreirasMatch",
  description: "Seu feedback ajuda o CarreirasMatch a transformar dúvida em direção.",
};

export default async function NpsObrigadoPage({
  searchParams,
}: {
  searchParams: Promise<{ score?: string; invalid?: string }>;
}) {
  const { score, invalid } = await searchParams;
  const n = Number(score);
  const hasValidScore = invalid !== "1" && Number.isFinite(n) && n >= 0 && n <= 10;
  const isDetractor = hasValidScore && n <= 6;

  return (
    <main className="min-h-screen bg-[#f8fafc] px-4 py-8 font-sans text-slate-950 sm:py-12">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-2xl items-center justify-center">
        <div className="w-full overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.10)]">
          <div className="bg-[#0b1730] px-7 py-8 sm:px-10">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-500 text-lg font-black text-white">✓</span>
              <div>
                <p className="text-sm font-bold tracking-tight text-white">CarreirasMatch</p>
                <p className="mt-0.5 text-xs text-blue-200">Do objetivo ao próximo passo.</p>
              </div>
            </div>
          </div>
          <div className="px-7 py-10 sm:px-10 sm:py-14">
            <CheckCircle2 className="h-12 w-12 text-blue-600" />
            <p className="mt-7 text-xs font-bold uppercase tracking-[0.18em] text-blue-600">Feedback recebido</p>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
              {hasValidScore ? "Obrigado por dar Match com a gente." : "Este link de avaliação expirou."}
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-600">
              {!hasValidScore
                ? "Você pode voltar ao CarreirasMatch e continuar sua Rota."
                : isDetractor
                  ? "Queremos entender melhor o que faltou. É só responder o e-mail da pesquisa, a gente lê tudo."
                  : "Seu feedback ajuda a transformar dúvida em direção e a construir um produto mais útil para sua busca."
              }
            </p>
            {hasValidScore && (
              <div className="mt-8 rounded-2xl border border-blue-100 bg-blue-50/70 p-5">
                <p className="text-sm font-bold text-blue-950">Sua resposta foi registrada.</p>
                <p className="mt-1 text-sm leading-relaxed text-blue-900/75">O Match é só o começo. Sua Rota continua com o próximo passo.</p>
              </div>
            )}
            <Link href="/dashboard" className="mt-8 inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700">
              Continuar minha rota →
            </Link>
          </div>
          <div className="border-t border-slate-100 px-7 py-5 text-xs text-slate-400 sm:px-10">Menos dúvida. Mais direção.</div>
        </div>
      </div>
    </main>
  );
}

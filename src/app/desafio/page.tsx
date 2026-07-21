import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { DesafioForm } from "./DesafioForm";
import { Sparkles, Trophy, Users, ShieldCheck, ArrowRight } from "lucide-react";
import { getUserReferralStats, registerUserReferral } from "@/lib/referrals";

export const dynamic = "force-dynamic";

export default async function DesafioPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const session = await auth();
  const { ref } = await searchParams;

  // Se o usuário estiver logado e chegou por um link de indicação, registra a indicação
  if (session?.user?.id && ref && ref !== session.user.id) {
    try {
      await registerUserReferral(session.user.id, ref);
    } catch {
      // Ignora silenciosamente se já registrado
    }
  }

  const referralStats = session?.user?.id
    ? await getUserReferralStats(session.user.id)
    : null;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Background Decorativo */}
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-blue-900/30 via-sky-950/20 to-transparent pointer-events-none" />
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-4 py-12 sm:py-16 space-y-12">
        {/* Header Hero */}
        <header className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-400 text-xs font-bold uppercase tracking-wider shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Desafio do Match de Carreira</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Descubra seu <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-sky-300">Match %</span> real com a vaga dos seus sonhos
          </h1>

          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            Envie seu currículo e a vaga desejada. Nossa IA analisa instantaneamente seu perfil, aponta pontos fortes, lacunas e gera seu <strong>Card para Story</strong> para você convidar amigos!
          </p>
        </header>

        {/* Recursos em Destaque */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Match de Aderência", desc: "Calculado em % real" },
            { label: "Pontos Fortes", desc: "O que destaca você" },
            { label: "Palavras-chave", desc: "Termos que faltam no CV" },
            { label: "Perguntas da Entrevista", desc: "Orientações completas" },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-center space-y-1 backdrop-blur-sm"
            >
              <p className="text-xs sm:text-sm font-bold text-sky-400">{item.label}</p>
              <p className="text-[11px] text-slate-400">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Formulário do Desafio */}
        <DesafioForm
          isLoggedIn={Boolean(session?.user?.id)}
          referralStats={referralStats}
          userId={session?.user?.id}
        />

        {/* Seção explicativa da Recompensa por Indicação */}
        <section className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-sky-500/10 text-sky-400 rounded-2xl border border-sky-500/20">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Como funciona o Desafio & Recompensas</h3>
              <p className="text-xs text-slate-400">Ajude seus amigos a saberem o Match deles e ganhe benefícios</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 pt-2">
            <div className="space-y-2">
              <div className="w-7 h-7 rounded-full bg-blue-500/20 text-blue-400 font-bold text-xs flex items-center justify-center border border-blue-500/30">
                1
              </div>
              <h4 className="text-sm font-bold text-white">Faça seu Match</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Envie o currículo e receba a pontuação de alinhamento com a vaga desejada.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-7 h-7 rounded-full bg-blue-500/20 text-blue-400 font-bold text-xs flex items-center justify-center border border-blue-500/30">
                2
              </div>
              <h4 className="text-sm font-bold text-white">Compartilhe o Card</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Poste seu resultado nos Stories com o card exclusivo e convide seus amigos.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-7 h-7 rounded-full bg-blue-500/20 text-blue-400 font-bold text-xs flex items-center justify-center border border-blue-500/30">
                3
              </div>
              <h4 className="text-sm font-bold text-white">Indique 3 Amigos</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                A cada 3 amigos que entrarem pelo seu link, você ganha 1 Diagnóstico Completo grátis!
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

import { auth } from "@/auth";
import { DesafioForm } from "./DesafioForm";
import { Sparkles, Trophy } from "lucide-react";
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
    <main className="min-h-screen bg-[#F8FAFC] dark:bg-[#071827] text-foreground font-sans relative overflow-hidden">
      {/* Background Decorativo */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-full max-w-7xl h-80 bg-[#2563EB]/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative max-w-4xl mx-auto px-4 py-10 sm:py-12 space-y-10 animate-in fade-in duration-300">
        
        {/* Header Hero */}
        <header className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2563EB]/10 border border-[#2563EB]/20 text-[#2563EB] text-[10px] font-bold uppercase tracking-wider shadow-sm">
            <Sparkles className="w-3 h-3" />
            <span>Desafio do Match de Carreira</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-title font-bold tracking-tight text-[#071827] dark:text-white leading-tight">
            Descubra seu <span className="text-[#2563EB] dark:text-blue-400">Match %</span> real com a vaga dos seus sonhos
          </h1>

          <p className="text-[#64748B] dark:text-slate-400 text-xs sm:text-sm leading-relaxed">
            Envie seu currículo e a vaga desejada. Nossa IA analisa instantaneamente seu perfil, aponta pontos fortes, lacunas e gera seu card de compartilhamento!
          </p>
        </header>

        {/* Recursos em Destaque (Compacto) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Match de Aderência", desc: "Calculado em % real" },
            { label: "Pontos Fortes", desc: "O que destaca você" },
            { label: "Palavras-chave", desc: "Termos que faltam no CV" },
            { label: "Perguntas de Entrevista", desc: "Orientações completas" },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-[#FFFFFF] dark:bg-neutral-900 border border-[#E2E8F0] dark:border-neutral-800 rounded-2xl p-3.5 text-center space-y-1 shadow-[0_4px_20px_rgba(0,0,0,0.01)]"
            >
              <p className="text-xs font-bold text-[#2563EB]">{item.label}</p>
              <p className="text-[10px] text-[#64748B]">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Formulário do Desafio */}
        <DesafioForm
          isLoggedIn={Boolean(session?.user?.id)}
          referralStats={referralStats}
          userId={session?.user?.id}
          referralCode={ref}
        />

        {/* Seção explicativa da Recompensa por Indicação */}
        <section className="bg-[#FFFFFF] dark:bg-[#0e2032] border border-[#E2E8F0] dark:border-neutral-800 rounded-3xl p-5 sm:p-6 space-y-5">
          <div className="flex items-center gap-3 border-b border-[#E2E8F0] dark:border-neutral-800 pb-3">
            <div className="p-2.5 bg-[#2563EB]/10 text-[#2563EB] rounded-2xl border border-[#2563EB]/25">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-title font-bold text-[#071827] dark:text-white">Como funciona o Desafio & Recompensas</h3>
              <p className="text-[11px] text-[#64748B]">Ajude seus amigos a saberem o Match deles e ganhe benefícios</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-5 pt-1">
            <div className="space-y-1.5">
              <div className="w-6 h-6 rounded-full bg-[#2563EB]/15 text-[#2563EB] font-bold text-xs flex items-center justify-center border border-[#2563EB]/25">
                1
              </div>
              <h4 className="text-xs font-bold text-[#071827] dark:text-white">Faça seu Match</h4>
              <p className="text-[11px] text-[#64748B] leading-relaxed">
                Envie o currículo e receba a pontuação de alinhamento com a vaga desejada.
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="w-6 h-6 rounded-full bg-[#2563EB]/15 text-[#2563EB] font-bold text-xs flex items-center justify-center border border-[#2563EB]/25">
                2
              </div>
              <h4 className="text-xs font-bold text-[#071827] dark:text-white">Compartilhe o Card</h4>
              <p className="text-[11px] text-[#64748B] leading-relaxed">
                Poste seu resultado nos Stories com o card exclusivo e convide seus amigos.
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="w-6 h-6 rounded-full bg-[#2563EB]/15 text-[#2563EB] font-bold text-xs flex items-center justify-center border border-[#2563EB]/25">
                3
              </div>
              <h4 className="text-xs font-bold text-[#071827] dark:text-white">Indique & Ganhe Desconto</h4>
              <p className="text-[11px] text-[#64748B] leading-relaxed">
                A cada 3 amigos que entrarem pelo seu link, você ganha 1 Diagnóstico Completo grátis + Desconto Exclusivo na Assinatura Mensal! (Assinantes ativos possuem 100% de desconto e análises ilimitadas).
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

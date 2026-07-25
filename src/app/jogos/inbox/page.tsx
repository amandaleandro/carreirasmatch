"use client";

import { useState, useEffect } from "react";
import { PublicSiteHeader } from "@/components/public-site-header";
import { SiteFooter } from "@/components/site-footer";
import {
  Inbox,
  Clock,
  CheckCircle2,
  AlertOctagon,
  RotateCcw,
  ArrowLeft,
  Flame,
  Sparkles,
  Trophy,
  Zap,
  Mail,
  Send,
  Trash2,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import { ShareGameCard } from "@/components/share-game-card";
import { addXp } from "@/lib/gamification";

type TaskCategory = "urgente" | "agendar" | "delegar" | "descartar";

type EmailItem = {
  id: string;
  sender: string;
  subject: string;
  preview: string;
  correctCategory: TaskCategory;
};

const SAMPLE_EMAILS: EmailItem[] = [
  {
    id: "e1",
    sender: "Diretoria Executiva",
    subject: "🚨 URGENTE: Cliente principal ameaça cancelar contrato em 1 hora!",
    preview: "Necessitamos de uma reunião de emergência com o gestor de conta imediatamente.",
    correctCategory: "urgente",
  },
  {
    id: "e2",
    sender: "Marketing Newsletter",
    subject: "Ganhe 50% de desconto em curso de datilografia presencial!",
    preview: "Promoção exclusiva por tempo limitado apenas hoje para seu e-mail corporativo.",
    correctCategory: "descartar",
  },
  {
    id: "e3",
    sender: "Recursos Humanos",
    subject: "Alinhamento de Avaliação de Desempenho do 2º Semestre",
    preview: "Favor agendar seu horário na planilha para a próxima semana entre terça e quinta.",
    correctCategory: "agendar",
  },
  {
    id: "e4",
    sender: "Suporte TI",
    subject: "Solicitação de troca de pilha do mouse do 3º andar",
    preview: "Chamado simples aberto por usuário da recepção.",
    correctCategory: "delegar",
  },
  {
    id: "e5",
    sender: "Financeiro & Contas",
    subject: "🚨 ALERTA: Folha de pagamento com inconsistência no banco!",
    preview: "Transferência retida por falta de assinatura do responsável legal.",
    correctCategory: "urgente",
  },
  {
    id: "e6",
    sender: "Comitê de Festas",
    subject: "Escolha do sabor do bolo do aniversariante do mês de Outubro",
    preview: "Votação rápida aberta para todos os funcionários.",
    correctCategory: "descartar",
  },
  {
    id: "e7",
    sender: "Design & UX",
    subject: "Revisão dos Mockups do Aplicativo Mobile",
    preview: "Envio dos protótipos em alta fidelidade para alinhamento na reunião de sexta-feira.",
    correctCategory: "agendar",
  },
  {
    id: "e8",
    sender: "Gerente de Logística",
    subject: "Organização do estoque de folhas A4 na sala de impressão",
    preview: "Reposição dos pacotes de papel nas gavetas inferiores.",
    correctCategory: "delegar",
  },
];

export default function InboxZeroGamePage() {
  const [timeLeft, setTimeLeft] = useState<number>(40);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [finished, setFinished] = useState<boolean>(false);

  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [errors, setErrors] = useState<number>(0);

  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const currentEmail = SAMPLE_EMAILS[currentIdx % SAMPLE_EMAILS.length];

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isPlaying && timeLeft <= 0) {
      endGame();
    }
    return () => clearInterval(timer);
  }, [isPlaying, timeLeft]);

  function startGame() {
    setTimeLeft(40);
    setScore(0);
    setStreak(0);
    setErrors(0);
    setCurrentIdx(0);
    setIsPlaying(true);
    setFinished(false);
  }

  function endGame() {
    setIsPlaying(false);
    setFinished(true);
    const xpEarned = Math.max(50, Math.round(score * 1.5));
    addXp(xpEarned);
  }

  function handleClassify(category: TaskCategory) {
    if (!isPlaying) return;

    if (category === currentEmail.correctCategory) {
      const newStreak = streak + 1;
      const points = 100 * (1 + Math.floor(newStreak / 3) * 0.5);
      setScore((s) => s + Math.round(points));
      setStreak(newStreak);
    } else {
      setStreak(0);
      setErrors((e) => {
        const nextErr = e + 1;
        if (nextErr >= 3) {
          endGame();
        }
        return nextErr;
      });
    }

    setCurrentIdx((i) => i + 1);
  }

  return (
    <div className="min-h-screen flex flex-col bg-neutral-950 text-white font-sans">
      <PublicSiteHeader />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <header className="flex items-center justify-between">
          <Link
            href="/jogos"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar aos Jogos
          </Link>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-3 py-1 text-xs font-bold uppercase tracking-wider">
            <Zap className="h-3.5 w-3.5" />
            Inbox Zero Challenge
          </div>
        </header>

        {/* Dashboard em Tempo Real */}
        <section className="bg-neutral-900 border border-neutral-800 rounded-3xl p-4 sm:p-5 flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-amber-400">
              <Clock className="h-5 w-5 animate-pulse" />
              <div>
                <div className="text-[10px] uppercase font-bold text-neutral-400">Tempo</div>
                <div className="text-base font-black">{timeLeft}s</div>
              </div>
            </div>

            <div className="h-8 w-px bg-neutral-800" />

            <div className="flex items-center gap-2 text-blue-400">
              <Trophy className="h-5 w-5" />
              <div>
                <div className="text-[10px] uppercase font-bold text-neutral-400">Pontuação</div>
                <div className="text-base font-black">{score} pts</div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-orange-400 font-extrabold text-xs bg-orange-500/10 px-3 py-1.5 rounded-2xl border border-orange-500/20">
              <Flame className="h-4 w-4 fill-orange-400" />
              Combo: {streak}x
            </div>
            <div className="flex items-center gap-1 text-rose-400 font-extrabold text-xs bg-rose-500/10 px-3 py-1.5 rounded-2xl border border-rose-500/20">
              Erros: {errors}/3
            </div>
          </div>
        </section>

        {/* Card do E-mail Atual */}
        {isPlaying && !finished ? (
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-neutral-400 block">De:</span>
                  <span className="text-xs font-bold text-white">{currentEmail.sender}</span>
                </div>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20">
                Nova Mensagem
              </span>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg sm:text-xl font-black text-white leading-snug">
                {currentEmail.subject}
              </h3>
              <p className="text-neutral-300 text-xs sm:text-sm leading-relaxed bg-neutral-950 p-4 rounded-2xl border border-neutral-800/80">
                {currentEmail.preview}
              </p>
            </div>

            {/* Ações de Classificação (4 Botões de Ação) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-4">
              <button
                onClick={() => handleClassify("urgente")}
                className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 font-bold text-xs transition-all active:scale-95 cursor-pointer"
              >
                <AlertOctagon className="h-5 w-5 mb-1.5" />
                🚨 Urgente
              </button>

              <button
                onClick={() => handleClassify("agendar")}
                className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 font-bold text-xs transition-all active:scale-95 cursor-pointer"
              >
                <Calendar className="h-5 w-5 mb-1.5" />
                📋 Agendar
              </button>

              <button
                onClick={() => handleClassify("delegar")}
                className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 font-bold text-xs transition-all active:scale-95 cursor-pointer"
              >
                <Send className="h-5 w-5 mb-1.5" />
                🤝 Delegar
              </button>

              <button
                onClick={() => handleClassify("descartar")}
                className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-300 font-bold text-xs transition-all active:scale-95 cursor-pointer"
              >
                <Trash2 className="h-5 w-5 mb-1.5" />
                🗑️ Descartar
              </button>
            </div>
          </div>
        ) : !isPlaying && !finished ? (
          /* Tela de Inicio */
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl max-w-md mx-auto">
            <div className="h-16 w-16 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center mx-auto text-3xl font-bold border border-cyan-500/20">
              <Inbox className="h-8 w-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-white">Inbox Zero Challenge</h2>
              <p className="text-neutral-400 text-xs leading-relaxed">
                Classifique e-mails e demandas de trabalho em tempo recorde! Separe o que é **Urgente**, **Agendar**, **Delegar** ou **Descartar** antes que a caixa de entrada vença você.
              </p>
            </div>

            <button
              onClick={startGame}
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white px-5 py-3.5 text-sm font-bold shadow-lg transition-all active:scale-95 cursor-pointer"
            >
              <Zap className="h-4 w-4 fill-white" />
              Iniciar Desafio (40 Segundos)
            </button>
          </div>
        ) : (
          /* Game Over Screen */
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl max-w-md mx-auto">
            <div className="h-16 w-16 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center mx-auto text-3xl font-bold border border-cyan-500/20">
              <Trophy className="h-8 w-8 text-amber-400" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-white">Caixa Limpa!</h2>
              <p className="text-neutral-400 text-xs">
                Sua pontuação final foi de <span className="font-extrabold text-cyan-400 text-sm">{score} pontos</span> com combo máximo de <span className="font-bold text-amber-400">{streak}x</span>!
              </p>
            </div>

            <button
              onClick={startGame}
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white px-5 py-3.5 text-sm font-bold shadow-lg transition-all active:scale-95 cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" />
              Jogar Novamente
            </button>

            <ShareGameCard
              gameLabel="Inbox Zero Challenge"
              score={score}
              scoreSuffix="pts"
              accentColor="#06B6D4"
            />
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}

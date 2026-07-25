"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { PublicSiteHeader } from "@/components/public-site-header";
import { SiteFooter } from "@/components/site-footer";
import { Sparkles, Trophy, RotateCcw, ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { ShareGameCard } from "@/components/share-game-card";
import { gameAreaFromSlug } from "@/lib/game-area";

type Question = {
  q: string;
  options: string[];
  correct: number;
  explanation: string;
};

const QUIZZES: Record<string, Question[]> = {
  tecnologia: [
    {
      q: "Qual dos seguintes métodos HTTP é idempotente por padrão e usado para atualizar recursos?",
      options: ["POST", "PUT", "PATCH", "DELETE"],
      correct: 1,
      explanation: "O método PUT é idempotente, significando que múltiplas requisições idênticas produzirão o mesmo resultado.",
    },
    {
      q: "O que significa a sigla ACID em bancos de dados relacionais?",
      options: [
        "Atomicity, Consistency, Isolation, Durability",
        "Access, Control, Index, Data",
        "Algorithm, Connection, Interface, Deployment",
        "Active, Cache, Instance, Distribution",
      ],
      correct: 0,
      explanation: "ACID garante que as transações do banco de dados sejam processadas de forma confiável.",
    },
    {
      q: "Qual protocolo é usado para transferir e-mails entre servidores de e-mail?",
      options: ["HTTP", "SMTP", "IMAP", "FTP"],
      correct: 1,
      explanation: "SMTP (Simple Mail Transfer Protocol) é o protocolo padrão para envio de e-mails.",
    },
  ],
  negocios: [
    {
      q: "O que a sigla OKR representa na gestão moderna de empresas?",
      options: [
        "Objectives and Key Results",
        "Operation and Knowledge Relations",
        "Office and Key Resources",
        "Organization and Kernel Reports",
      ],
      correct: 0,
      explanation: "OKRs são usados por empresas como Google para definir e rastrear objetivos e seus resultados mensuráveis.",
    },
    {
      q: "Qual metodologia ágil utiliza quadros visuais para gerenciar o fluxo de trabalho limitando o WIP (Work In Progress)?",
      options: ["Scrum", "Kanban", "XP", "Waterfall"],
      correct: 1,
      explanation: "Kanban foca na entrega contínua e visualização do fluxo, limitando o trabalho em progresso.",
    },
  ],
  design: [
    {
      q: "Qual é o principal foco da disciplina de UX (User Experience) Design?",
      options: [
        "Escolher as cores mais chamativas para o logotipo",
        "Garantir facilidade, usabilidade e prazer na interação com o produto",
        "Escrever códigos limpos de CSS",
        "Configurar servidores de hospedagem de imagens",
      ],
      correct: 1,
      explanation: "UX Design se preocupa com toda a jornada e experiência do usuário ao interagir com o produto.",
    },
    {
      q: "O que define um layout responsivo?",
      options: [
        "Um site que carrega em menos de um segundo",
        "Uma página que se adapta automaticamente ao tamanho da tela do dispositivo",
        "Um design com muitas animações em JavaScript",
        "Um layout feito exclusivamente para computadores de mesa",
      ],
      correct: 1,
      explanation: "Layouts responsivos usam grades fluidas e media queries para se adaptar a smartphones, tablets e desktops.",
    },
  ],
  marketing: [
    {
      q: "O que significa SEO no marketing digital?",
      options: [
        "Search Engine Optimization",
        "Social Engagement Operations",
        "Sales Email Organizer",
        "Site Evaluation Online",
      ],
      correct: 0,
      explanation: "SEO é o conjunto de técnicas para otimizar páginas web a fim de ranqueá-las melhor em buscadores como o Google.",
    },
    {
      q: "O que é taxa de conversão?",
      options: [
        "A velocidade com que um site é traduzido para outro idioma",
        "A porcentagem de visitantes que realizam a ação desejada no site",
        "A quantidade de seguidores que curtem um post no Instagram",
        "A taxa de cliques em banners de publicidade",
      ],
      correct: 1,
      explanation: "A taxa de conversão mede a eficiência de uma página em transformar visitantes em compradores, leads ou inscritos.",
    },
  ],
  saude: [
    {
      q: "Na triagem de pacientes em hospitais (Protocolo de Manchester), a cor vermelha indica:",
      options: ["Pouco urgente", "Urgente", "Emergência (risco imediato de morte)", "Não urgente"],
      correct: 2,
      explanation: "A cor vermelha representa prioridade zero, onde o paciente necessita de atendimento médico imediato.",
    },
  ],
};

export default function QuizPage() {
  const searchParams = useSearchParams();
  const [area, setArea] = useState<string>(() => gameAreaFromSlug(searchParams.get("area")));
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [answered, setAnswered] = useState<boolean>(false);
  const [finished, setFinished] = useState<boolean>(false);

  const questions = QUIZZES[area] ?? [];
  const currentQuestion = questions[currentIdx];

  async function saveScore(calculatedScore: number) {
    try {
      await fetch("/api/jogos/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ game: "quiz", area, score: calculatedScore }),
      });
    } catch (err) {
      console.error(err);
    }
  }

  function startQuiz(newArea: string) {
    setArea(newArea);
    setCurrentIdx(0);
    setScore(0);
    setSelectedOpt(null);
    setAnswered(false);
    setFinished(false);
  }

  function handleOptionClick(optIndex: number) {
    if (answered) return;
    setSelectedOpt(optIndex);
    setAnswered(true);

    if (optIndex === currentQuestion.correct) {
      setScore((prev) => prev + 1);
    }
  }

  function handleNextClick() {
    setSelectedOpt(null);
    setAnswered(false);

    if (currentIdx + 1 < questions.length) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      setFinished(true);
      const finalScore = Math.round((score / questions.length) * 1000);
      void saveScore(finalScore);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950 text-neutral-950 dark:text-neutral-50">
      <PublicSiteHeader />
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8 space-y-6">
        <header className="flex items-center justify-between">
          <Link
            href="/jogos"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao Hub
          </Link>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-300 px-3 py-1 text-xs font-bold border border-amber-200 dark:border-amber-900/50">
            <Sparkles className="h-3.5 w-3.5" />
            Show do Match
          </div>
        </header>

        {/* Escolha da área */}
        {!answered && currentIdx === 0 && !finished && (
          <section className="flex flex-wrap gap-2 justify-center bg-neutral-200/40 dark:bg-neutral-900/40 p-1.5 rounded-2xl w-fit mx-auto border border-neutral-200 dark:border-neutral-800">
            {Object.keys(QUIZZES).map((k) => (
              <button
                key={k}
                onClick={() => startQuiz(k)}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition-all uppercase tracking-wider ${
                  area === k
                    ? "bg-amber-500 text-white shadow-sm"
                    : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                }`}
              >
                {k}
              </button>
            ))}
          </section>
        )}

        {/* Layout do Jogo de Quiz */}
        {!finished && currentQuestion ? (
          <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 md:p-8 space-y-6 shadow-sm text-left">
            <header className="flex items-center justify-between text-xs text-neutral-400 border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <span>Área: <span className="font-bold text-neutral-600 dark:text-neutral-200 uppercase">{area}</span></span>
              <span>Pergunta {currentIdx + 1} de {questions.length}</span>
            </header>

            {/* Pergunta */}
            <h3 className="text-lg md:text-xl font-bold text-neutral-900 dark:text-white leading-snug">
              {currentQuestion.q}
            </h3>

            {/* Opções */}
            <div className="grid gap-3 pt-2">
              {currentQuestion.options.map((opt, i) => {
                let borderClass = "border-neutral-200 dark:border-neutral-800 hover:border-amber-300";
                let bgClass = "bg-white dark:bg-neutral-900";
                let icon = null;

                if (answered) {
                  if (i === currentQuestion.correct) {
                    borderClass = "border-emerald-500 dark:border-emerald-500";
                    bgClass = "bg-emerald-50/50 dark:bg-emerald-950/20";
                    icon = <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />;
                  } else if (i === selectedOpt) {
                    borderClass = "border-red-500 dark:border-red-500";
                    bgClass = "bg-red-50/50 dark:bg-red-950/20";
                    icon = <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />;
                  } else {
                    borderClass = "border-neutral-200 dark:border-neutral-800 opacity-60";
                  }
                }

                return (
                  <button
                    key={i}
                    disabled={answered}
                    onClick={() => handleOptionClick(i)}
                    className={`rounded-2xl border p-4 text-left font-medium text-sm transition-all flex items-center justify-between gap-3 cursor-pointer ${borderClass} ${bgClass}`}
                  >
                    <span>{opt}</span>
                    {icon}
                  </button>
                );
              })}
            </div>

            {/* Explicação da Resposta */}
            {answered && (
              <div className="rounded-2xl bg-blue-50/60 dark:bg-blue-950/10 p-4 border border-blue-100 dark:border-blue-900/30 text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                <span className="font-bold text-blue-600 dark:text-blue-400">Por que essa resposta?</span>
                <p className="mt-1">{currentQuestion.explanation}</p>
              </div>
            )}

            {/* Próxima Pergunta */}
            {answered && (
              <button
                onClick={handleNextClick}
                className="w-full rounded-2xl bg-blue-600 hover:bg-blue-700 text-white py-3 text-sm font-bold shadow-sm transition-colors cursor-pointer text-center"
              >
                {currentIdx + 1 === questions.length ? "Ver Resultado" : "Avançar Pergunta"}
              </button>
            )}
          </div>
        ) : (
          // Tela de Fim de Jogo
          <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-8 text-center space-y-6 shadow-sm max-w-md mx-auto">
            <div className="h-16 w-16 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-500 flex items-center justify-center mx-auto text-3xl font-bold">
              <Trophy className="h-8 w-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-neutral-900 dark:text-white">Fim do Show!</h2>
              <p className="text-neutral-500 text-sm">
                Você acertou <span className="font-bold text-blue-600 dark:text-blue-400">{score}</span> de {questions.length} perguntas na categoria <span className="font-bold text-neutral-900 dark:text-white uppercase">{area}</span>.
              </p>
            </div>

            <button
              onClick={() => startQuiz(area)}
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 text-sm font-bold shadow-sm transition-all text-center cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" />
              Jogar Novamente
            </button>

            <ShareGameCard
              gameLabel="Show do Match"
              score={Math.round((score / questions.length) * 1000)}
              scoreSuffix="pts"
              accentColor="#F59E0B"
            />
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

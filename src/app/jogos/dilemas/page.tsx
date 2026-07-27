"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PublicSiteHeader } from "@/components/public-site-header";
import { CareerGameContext } from "@/components/career-game-context";
import { SiteFooter } from "@/components/site-footer";
import {
  Sparkles,
  RotateCcw,
  ArrowLeft,
  Flame,
  Star,
  Users,
  DollarSign,
  HeartPulse,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { ShareGameCard } from "@/components/share-game-card";
import { normalizeGamePhase } from "@/lib/game-progression";

type Effect = {
  reputation?: number;
  team?: number;
  budget?: number;
  health?: number;
};

type Scenario = {
  id: string;
  title: string;
  situation: string;
  optionA: {
    text: string;
    effect: Effect;
  };
  optionB: {
    text: string;
    effect: Effect;
  };
};

const DILEMMAS_BY_AREA: Record<string, Scenario[]> = {
  "ensino-medio": [
    {
      id: "em1",
      title: "Semana de Provas vs Festa de Fim de Semana",
      situation: "Suas provas finais do ENEM/Vestibular são na próxima semana, mas seus amigos organizaram uma viagem inadiável de fim de semana.",
      optionA: {
        text: "Ir para a viagem e estudar de madrugada no hotel.",
        effect: { reputation: -5, team: +15, budget: -10, health: -20 },
      },
      optionB: {
        text: "Recusar o convite e manter o cronograma de estudos rigoroso.",
        effect: { reputation: +15, team: -10, budget: +5, health: +10 },
      },
    },
    {
      id: "em2",
      title: "Simulado com Resultado Abaixo do Esperado",
      situation: "Sua nota no simulado oficial veio 20% abaixo da nota de corte do curso dos seus sonhos.",
      optionA: {
        text: "Contratar um tutor particular intensivo nas matérias fracas.",
        effect: { reputation: +10, team: 0, budget: -25, health: +15 },
      },
      optionB: {
        text: "Estudar sozinho virando noites no final de semana.",
        effect: { reputation: +5, team: -5, budget: 0, health: -30 },
      },
    },
    {
      id: "em3",
      title: "Escolha entre Faculdade Pública Distante ou Particular com Bolsa",
      situation: "Você passou na USP/Unicamp em outra cidade longe da família, mas ganhou bolsa 100% na faculdade particular da sua cidade.",
      optionA: {
        text: "Mudar de cidade e encarar o desafio da pública.",
        effect: { reputation: +25, team: +5, budget: -30, health: -10 },
      },
      optionB: {
        text: "Ficar na sua cidade estudando na particular com bolsa.",
        effect: { reputation: +10, team: +15, budget: +15, health: +20 },
      },
    },
  ],
  "primeiro-emprego": [
    {
      id: "pe1",
      title: "Erro Crítico no Primeiro Relatório",
      situation: "Você enviou um relatório com dados desatualizados para o diretor regional da empresa.",
      optionA: {
        text: "Assumir a falha imediatamente, pedir desculpas e enviar a versão corrigida.",
        effect: { reputation: +20, team: +10, budget: 0, health: +5 },
      },
      optionB: {
        text: "Tentar corrigir discretamente sem avisar ninguém.",
        effect: { reputation: -25, team: -10, budget: 0, health: -15 },
      },
    },
    {
      id: "pe2",
      title: "Hora Extra não Planejada em Sexta-Feira",
      situation: "Faltando 15 minutos para acabar seu expediente na sexta-feira, seu chefe pede ajuda com uma apresentação urgente.",
      optionA: {
        text: "Ficar até mais tarde e entregar com excelência.",
        effect: { reputation: +20, team: +15, budget: +10, health: -15 },
      },
      optionB: {
        text: "Explicar educadamente seus compromissos e se oferecer para chegar cedo na segunda.",
        effect: { reputation: -5, team: 0, budget: 0, health: +15 },
      },
    },
  ],
  ti: [
    {
      id: "ti1",
      title: "Bug Crítico em Produção durante Sexta à Tarde",
      situation: "Um deploy recente quebrou a página de pagamento para 15% dos usuários.",
      optionA: {
        text: "Fazer rollback imediato e investigar na segunda-feira com calma.",
        effect: { reputation: +10, team: +15, budget: -10, health: +15 },
      },
      optionB: {
        text: "Aplicar um hotfix rápido direto em produção sem passar pelo QA.",
        effect: { reputation: -15, team: -10, budget: +15, health: -25 },
      },
    },
    {
      id: "ti2",
      title: "Refatorar Código Legado vs Lançar Nova Feature",
      situation: "O código base está confuso e gerando débitos técnicos, mas o time de produto exige novas funcionalidades urgentes.",
      optionA: {
        text: "Pausar novas features por 1 sprint para refatoração geral.",
        effect: { reputation: +15, team: +20, budget: -15, health: +20 },
      },
      optionB: {
        text: "Entregar a feature nova correndo e acumular o débito técnico.",
        effect: { reputation: -10, team: -15, budget: +20, health: -20 },
      },
    },
  ],
  medicina: [
    {
      id: "med1",
      title: "Plantão Lotado e Casos de Alta Complexidade",
      situation: "A emergência está com o dobro de pacientes permitidos e faltam leitos de UTI.",
      optionA: {
        text: "Aplicar protocolo estrito de triagem de Manchester para priorização.",
        effect: { reputation: +20, team: +10, budget: +5, health: -15 },
      },
      optionB: {
        text: "Tentar atender todos por ordem de chegada para evitar reclamações.",
        effect: { reputation: -20, team: -20, budget: -10, health: -30 },
      },
    },
  ],
  direito: [
    {
      id: "dir1",
      title: "Prazo de Recurso Decisivo no Fim de Semana",
      situation: "Sua equipe precisa protocolar uma contestação volumosa com mais de 200 páginas na segunda-feira às 8h.",
      optionA: {
        text: "Convocar a equipe para um mutirão no escritório no sábado e domingo.",
        effect: { reputation: +25, team: -15, budget: +15, health: -25 },
      },
      optionB: {
        text: "Dividir as teses entre os advogados para trabalharem de forma assíncrona remota.",
        effect: { reputation: +10, team: +15, budget: +5, health: +10 },
      },
    },
  ],
};

const GENERIC_SCENARIOS: Scenario[] = [
  {
    id: "gen1",
    title: "Conflito de Opiniões na Reunião de Planejamento",
    situation: "Dois colegas seniores discordam fortemente sobre a estratégia do projeto diante de toda a diretoria.",
    optionA: {
      text: "Mediar o conflito propondo um teste A/B para validar ambas as ideias com dados reais.",
      effect: { reputation: +20, team: +20, budget: -5, health: +10 },
    },
    optionB: {
      text: "Ficar em silêncio e votar na proposta que o chefe direto apoia.",
      effect: { reputation: -10, team: -15, budget: +10, health: -5 },
    },
  },
  {
    id: "gen2",
    title: "Proposta de Emprego com Salário Maior vs Empresa Atual",
    situation: "Uma empresa concorrente ofereceu 30% a mais de salário, mas com ambiente corporativo conhecido por ser bastante estressante.",
    optionA: {
      text: "Aceitar a proposta e arriscar no novo desafio profissional.",
      effect: { reputation: +15, team: -10, budget: +30, health: -25 },
    },
    optionB: {
      text: "Usar a proposta para negociar contraproposta na empresa atual.",
      effect: { reputation: +10, team: +10, budget: +15, health: +15 },
    },
  },
  {
    id: "gen3",
    title: "Corte de Orçamento Inesperado",
    situation: "A diretoria cortou 25% da verba do seu setor para o próximo trimestre.",
    optionA: {
      text: "Reduzir ferramentas pagas e otimizar processos internos existentes.",
      effect: { reputation: +15, team: +5, budget: +25, health: -10 },
    },
    optionB: {
      text: "Adiar projetos de inovação e focar apenas na operação básica.",
      effect: { reputation: -10, team: -10, budget: +15, health: +15 },
    },
  },
];

export default function DilemasGamePage() {
  const searchParams = useSearchParams();
  const [area, setArea] = useState<string>(() => searchParams.get("area") ?? "ti");
  const [phase] = useState(() => normalizeGamePhase(searchParams.get("fase")));
  const [weeks, setWeeks] = useState<number>(1);

  // Indicators (0 - 100)
  const [reputation, setReputation] = useState<number>(50);
  const [team, setTeam] = useState<number>(50);
  const [budget, setBudget] = useState<number>(50);
  const [health, setHealth] = useState<number>(50);

  const [currentScenarioIdx, setCurrentScenarioIdx] = useState<number>(0);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [gameOverReason, setGameOverReason] = useState<string>("");
  const [selectedOption, setSelectedOption] = useState<"A" | "B" | null>(null);
  const [selectedEffect, setSelectedEffect] = useState<Effect | null>(null);

  // Get active deck
  const fullDeck = DILEMMAS_BY_AREA[area]
    ?? (area === "tecnologia" ? DILEMMAS_BY_AREA.ti : area === "saude" ? DILEMMAS_BY_AREA.medicina : GENERIC_SCENARIOS);
  const activeDeck = fullDeck.slice(0, phase === 1 ? 1 : phase === 2 ? 2 : fullDeck.length);
  const currentScenario = activeDeck[currentScenarioIdx % activeDeck.length];

  function restartGame(newArea?: string) {
    if (newArea) setArea(newArea);
    setWeeks(1);
    setReputation(50);
    setTeam(50);
    setBudget(50);
    setHealth(50);
    setCurrentScenarioIdx(0);
    setGameOver(false);
    setGameOverReason("");
    setSelectedOption(null);
    setSelectedEffect(null);
  }

  async function saveScore(score: number) {
    try {
      await fetch("/api/jogos/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ game: "dilemas", area, score: Math.max(0, Math.round(score)) }),
      });
    } catch {
      // O jogo continua mesmo quando o usuário está deslogado.
    }
  }

  useEffect(() => {
    if (!selectedOption) return;

    const timeoutId = window.setTimeout(() => {
      setWeeks((w) => w + 1);
      setCurrentScenarioIdx((i) => i + 1);
      setSelectedOption(null);
      setSelectedEffect(null);
    }, 900);

    return () => window.clearTimeout(timeoutId);
  }, [selectedOption]);

  function applyChoice(option: "A" | "B", effect: Effect) {
    if (selectedOption) return;

    setSelectedOption(option);
    setSelectedEffect(effect);

    const nextRep = Math.min(100, Math.max(0, reputation + (effect.reputation ?? 0)));
    const nextTeam = Math.min(100, Math.max(0, team + (effect.team ?? 0)));
    const nextBudget = Math.min(100, Math.max(0, budget + (effect.budget ?? 0)));
    const nextHealth = Math.min(100, Math.max(0, health + (effect.health ?? 0)));

    setReputation(nextRep);
    setTeam(nextTeam);
    setBudget(nextBudget);
    setHealth(nextHealth);

    // Check Game Over Conditions
    if (nextHealth <= 0) {
      setGameOver(true);
      void saveScore(weeks * 150 + nextRep * 10 + nextHealth * 5);
      setGameOverReason("Burnout! Sua Saúde Mental chegou a zero por estresse extremo.");
      return;
    }
    if (nextRep <= 0) {
      setGameOver(true);
      void saveScore(weeks * 150 + nextRep * 10 + nextHealth * 5);
      setGameOverReason("Reputação Arruinada! Sua credibilidade no mercado caiu a zero.");
      return;
    }
    if (nextTeam <= 0) {
      setGameOver(true);
      void saveScore(weeks * 150 + nextRep * 10 + nextHealth * 5);
      setGameOverReason("Debandada Geral! O time/clientes perderam a confiança e abandonaram o projeto.");
      return;
    }
    if (nextBudget <= 0) {
      setGameOver(true);
      void saveScore(weeks * 150 + nextRep * 10 + nextHealth * 5);
      setGameOverReason("Falência do Projeto! Os recursos e orçamento esgotaram.");
      return;
    }

  }

  const scorePoints = weeks * 150 + reputation * 10 + health * 5;

  return (
    <div className="min-h-screen flex flex-col bg-neutral-950 text-white font-sans">
      <PublicSiteHeader />
      <div className="mx-auto w-full max-w-lg px-4 pt-4">
        <CareerGameContext game="dilemas" />
      </div>

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8 space-y-6">
        {/* Header Superior */}
        <header className="flex items-center justify-between">
          <Link
            href="/jogos"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar aos Jogos
          </Link>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" />
            Simulador de Dilemas
          </div>
        </header>

        {/* Indicadores dos 4 Pilares (Dashboard em Tempo Real) */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-neutral-900/80 border border-neutral-800 rounded-3xl p-4 shadow-xl">
          {/* Reputação */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-amber-400 uppercase">
              <span className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5" /> Reputação
              </span>
              <span>{reputation}%</span>
            </div>
            <div className="h-2 rounded-full bg-neutral-800 overflow-hidden">
              <div
                className="h-full bg-amber-500 transition-all duration-300"
                style={{ width: `${reputation}%` }}
              />
            </div>
          </div>

          {/* Equipe / Clientes */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-blue-400 uppercase">
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" /> Pessoas
              </span>
              <span>{team}%</span>
            </div>
            <div className="h-2 rounded-full bg-neutral-800 overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${team}%` }}
              />
            </div>
          </div>

          {/* Orçamento */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-emerald-400 uppercase">
              <span className="flex items-center gap-1">
                <DollarSign className="h-3.5 w-3.5" /> Recursos
              </span>
              <span>{budget}%</span>
            </div>
            <div className="h-2 rounded-full bg-neutral-800 overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${budget}%` }}
              />
            </div>
          </div>

          {/* Saúde Mental */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-rose-400 uppercase">
              <span className="flex items-center gap-1">
                <HeartPulse className="h-3.5 w-3.5" /> Saúde
              </span>
              <span>{health}%</span>
            </div>
            <div className="h-2 rounded-full bg-neutral-800 overflow-hidden">
              <div
                className="h-full bg-rose-500 transition-all duration-300"
                style={{ width: `${health}%` }}
              />
            </div>
          </div>
        </section>

        {/* Seleção de Trilha / Área */}
        {!gameOver && (
          <div className="flex items-center justify-between text-xs text-neutral-400 bg-neutral-900/40 px-4 py-2 rounded-2xl border border-neutral-800/60">
            <span className="flex items-center gap-1.5 font-semibold text-neutral-300">
              <ShieldCheck className="h-4 w-4 text-blue-400" />
              Trilha: <span className="text-white font-bold uppercase">{area}</span>
            </span>
            <span className="font-extrabold text-amber-400 flex items-center gap-1">
              <Flame className="h-4 w-4" /> Semana {weeks}
            </span>
          </div>
        )}

        {/* Card do Dilema Principal */}
        {!gameOver ? (
          <div
            key={`${currentScenario.id}-${weeks}`}
            className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden animate-in fade-in slide-in-from-right-4 duration-500"
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-bold uppercase tracking-wider">
              {selectedOption ? `Decisão ${selectedOption} registrada` : `Dilema Semanal #${weeks}`}
            </div>

            {selectedOption && selectedEffect && (
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <p className="text-xs font-bold text-emerald-300">Impacto da sua escolha</p>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-semibold text-neutral-200">
                  {Object.entries({
                    Reputação: selectedEffect.reputation,
                    Pessoas: selectedEffect.team,
                    Recursos: selectedEffect.budget,
                    Saúde: selectedEffect.health,
                  }).map(([label, value]) => value !== undefined && (
                    <span key={label} className={value >= 0 ? "text-emerald-300" : "text-rose-300"}>
                      {label} {value >= 0 ? "+" : ""}{value}%
                    </span>
                  ))}
                </div>
                <p className="mt-2 text-[11px] text-neutral-400">Preparando o próximo dilema...</p>
              </div>
            )}

            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                {currentScenario.title}
              </h2>
              <p className="text-neutral-300 text-sm leading-relaxed">
                {currentScenario.situation}
              </p>
            </div>

            {/* Opções A e B */}
            <div className="grid gap-3 pt-4">
              <button
                onClick={() => applyChoice("A", currentScenario.optionA.effect)}
                disabled={Boolean(selectedOption)}
                className={`group relative text-left p-5 rounded-2xl border transition-all active:scale-[0.99] ${selectedOption === "A" ? "border-blue-400 bg-blue-900/40 ring-1 ring-blue-400/50" : "bg-neutral-800/80 border-neutral-700 hover:bg-blue-900/30 hover:border-blue-500"} ${selectedOption ? "cursor-default opacity-70" : "cursor-pointer"}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 mb-1 block">
                      Opção A
                    </span>
                    <p className="text-sm font-semibold text-white group-hover:text-blue-200 transition-colors">
                      {currentScenario.optionA.text}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-neutral-500 group-hover:text-blue-400 shrink-0 mt-1 transition-colors" />
                </div>
              </button>

              <button
                onClick={() => applyChoice("B", currentScenario.optionB.effect)}
                disabled={Boolean(selectedOption)}
                className={`group relative text-left p-5 rounded-2xl border transition-all active:scale-[0.99] ${selectedOption === "B" ? "border-purple-400 bg-purple-900/40 ring-1 ring-purple-400/50" : "bg-neutral-800/80 border-neutral-700 hover:bg-purple-900/30 hover:border-purple-500"} ${selectedOption ? "cursor-default opacity-70" : "cursor-pointer"}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 mb-1 block">
                      Opção B
                    </span>
                    <p className="text-sm font-semibold text-white group-hover:text-purple-200 transition-colors">
                      {currentScenario.optionB.text}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-neutral-500 group-hover:text-purple-400 shrink-0 mt-1 transition-colors" />
                </div>
              </button>
            </div>
          </div>
        ) : (
          /* Game Over Screen */
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl max-w-md mx-auto">
            <div className="h-16 w-16 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto text-3xl font-bold border border-rose-500/20">
              <AlertTriangle className="h-8 w-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-white">Fim da Jornada!</h2>
              <p className="text-rose-400 text-xs font-semibold bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">
                {gameOverReason}
              </p>
              <p className="text-neutral-400 text-xs pt-2">
                Você sobreviveu por <span className="font-extrabold text-amber-400">{weeks} Semanas</span> na trilha de <span className="font-bold text-white uppercase">{area}</span>.
              </p>
            </div>

            <button
              onClick={() => restartGame()}
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white px-5 py-3.5 text-sm font-bold shadow-lg transition-all active:scale-95 cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" />
              Tentar Novamente
            </button>

            <ShareGameCard
              gameLabel="Simulador de Dilemas"
              score={scorePoints}
              scoreSuffix="pts"
              accentColor="#2563EB"
            />
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}

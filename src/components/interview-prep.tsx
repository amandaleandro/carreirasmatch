"use client";

import { useEffect, useState } from "react";
import { useFeedback } from "@/components/feedback-provider";

function repairMojibake(value: string): string {
  if (!/[ÃÂâð�]/.test(value)) return value;
  try {
    return decodeURIComponent(escape(value));
  } catch {
    return value;
  }
}

function repairInterviewDom(root: HTMLElement) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node: Node | null;
  while ((node = walker.nextNode())) {
    if (node.nodeValue) node.nodeValue = repairMojibake(node.nodeValue);
  }
  root.querySelectorAll<HTMLElement>("*").forEach((element) => {
    ["placeholder", "title", "aria-label"].forEach((attribute) => {
      const value = element.getAttribute(attribute);
      if (value) element.setAttribute(attribute, repairMojibake(value));
    });
  });
}

export function InterviewEncodingFix() {
  useEffect(() => {
    repairInterviewDom(document.body);
  }, []);
  return null;
}

type QuestionProgress = {
  answer: string;
  verdict?: "excelente" | "bom" | "precisa_melhorar";
  verdictTitle?: string;
  feedback: string;
  actionStep?: string;
  keywordsToUse?: string[];
  strongPoints: string[];
  improvementTips: string[];
  suggestedAnswer?: string;
  starBreakdown?: {
    situation: string;
    action: string;
    result: string;
  };
  clarity: number;
  technicalDepth: number;
  confidence: number;
};

function ChevronIcon({ className, open }: { className?: string; open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={`${className} transition-transform duration-200 ${open ? "rotate-90" : ""}`}
    >
      <path d="m9 6 6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function InfoIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 11v5.5M12 8v.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
function ChatIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M4 5h16v11H8l-4 4V5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}
function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 3.5 19 6v6c0 4.5-3 7-7 8.5-4-1.5-7-4-7-8.5V6l7-2.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}
function BulbIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.5.4.8 1 .8 1.6h5.4c0-.6.3-1.2.8-1.6A6 6 0 0 0 12 3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}
function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="m12 3 2.5 5.5L20 11l-5.5 2.5L12 19l-2.5-5.5L4 11l5.5-2.5L12 3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M5 3 6 5l2 1-2 1-1 2-1-2-2-1 2-1 1-2Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}
function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path d="m8.5 12 2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function RefreshIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M18 3v4h-4M6 21v-4h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function UserIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" />
      <path d="M5 20c0-3.5 3.1-6 7-6s7 2.5 7 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
function RocketIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M4.5 16.5c-1.5 1.5-1.5 3.5-1.5 3.5s2 0 3.5-1.5l3-3-3.5-3.5-1.5 4.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M14.5 4.5c2.5-2.5 6-2.5 6-2.5s0 3.5-2.5 6l-6.5 6.5-3.5-3.5 6.5-6.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M15 9l-3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
function PrinterIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M6 9V4h12v5M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 14h12v6H6v-6Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}
function CopyIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="9" y="9" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function classifyQuestion(
  question: string,
  jobTitle = "",
  jobText = "",
): "tecnica" | "caso_pratico" | "comportamental" | "geral" {
  const text = `${question} ${jobTitle} ${jobText}`.toLowerCase();
  const isTechRole = [
    "desenvolvedor",
    "developer",
    "engenheiro de software",
    "software engineer",
    "dados",
    "data",
    "analista de dados",
    "programador",
    "devops",
    "backend",
    "frontend",
    "full stack",
    "infra",
    "sistemas",
    "tecnologia",
    "ti",
    "qa",
    "produto",
  ].some((token) => text.includes(token));
  const isSalesRole = [
    "vendas",
    "vendedor",
    "consultor comercial",
    "comercial",
    "negócios",
    "negocios",
    "account",
    "closer",
    "inside sales",
    "pré-vendas",
    "pre-vendas",
    "sucesso do cliente",
    "customer success",
    "atendimento",
  ].some((token) => text.includes(token));
  const isAdminRole = [
    "administrativo",
    "administração",
    "administracao",
    "assistente",
    "secretaria",
    "rotina",
    "operacional",
    "financeiro",
    "fiscal",
    "rh",
    "recursos humanos",
    "backoffice",
    "suprimentos",
    "compras",
    "estoque",
  ].some((token) => text.includes(token));
  const isHealthRole = [
    "saúde",
    "saude",
    "enfermagem",
    "enfermeiro",
    "médico",
    "medico",
    "clínica",
    "clinica",
    "hospital",
    "paciente",
    "fisioterapia",
    "farmácia",
    "farmacia",
  ].some((token) => text.includes(token));
  const isEducationRole = [
    "educação",
    "educacao",
    "professor",
    "docente",
    "pedag",
    "escola",
    "aluno",
    "sala de aula",
    "coordenação",
    "coordenacao",
    "ensino",
  ].some((token) => text.includes(token));
  const isLegalRole = [
    "juríd",
    "jurid",
    "direito",
    "advoc",
    "processo",
    "petição",
    "peticao",
    "audiência",
    "audiencia",
    "tribunal",
    "compliance",
    "contrato",
  ].some((token) => text.includes(token));

  if (
    [
      "técnic",
      "tecnic",
      "api",
      "sql",
      "dados",
      "código",
      "codigo",
      "stack",
      "arquitet",
      "sistema",
      "integraç",
      "integrac",
      "deploy",
      "bug",
      "erro",
      "performance",
      "otimiza",
      "ferrament",
      "framework",
      "bibliotec",
    ].some((token) => text.includes(token))
  ) {
    return "tecnica";
  }

  if (isTechRole) {
    return "tecnica";
  }

  if (
    [
      "caso",
      "cenário",
      "cenario",
      "estudo de caso",
      "como você resolveria",
      "como resolveria",
      "como lidaria",
      "o que você faria",
      "o que faria",
      "trade-off",
      "trade off",
    ].some((token) => text.includes(token))
  ) {
    return "caso_pratico";
  }

  if (isSalesRole || isAdminRole || isHealthRole || isEducationRole || isLegalRole) {
    return "comportamental";
  }

  if (
    [
      "conflito",
      "equipe",
      "feedback",
      "liderança",
      "lideranca",
      "pressão",
      "pressao",
      "frustração",
      "frustracao",
      "comport",
      "relacionamento",
      "comunicação",
      "comunicacao",
      "colaboração",
      "colaboracao",
      "exemplo de",
      "me conte",
      "conte sobre",
    ].some((token) => text.includes(token))
  ) {
    return "comportamental";
  }

  return "geral";
}

function defaultDraftModeForQuestion(question: string, jobTitle?: string, jobText?: string): "curta" | "star" | "tecnica" {
  const category = classifyQuestion(question, jobTitle, jobText);
  if (category === "tecnica") return "tecnica";
  if (category === "caso_pratico") return "star";
  if (category === "comportamental") return "star";
  return "curta";
}

function ScoreGauge({
  icon: Icon,
  label,
  value,
  gradient,
}: {
  icon: (p: { className?: string }) => React.JSX.Element;
  label: string;
  value: number;
  gradient: string;
}) {
  return (
    <div className="flex items-center gap-3 group">
      <span className="h-8 w-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0 text-neutral-600 dark:text-neutral-300">
        <Icon className="h-4 w-4" />
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center text-xs mb-1">
          <span className="font-medium text-neutral-700 dark:text-neutral-200">{label}</span>
          <span className="font-semibold px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
            {value}/100
          </span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
          <div
            className={`h-full rounded-full ${gradient} transition-all duration-700 ease-out`}
            style={{ width: `${value}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export function InterviewPrep({
  analysisId,
  jobTitle,
  jobText,
  questions: initialQuestions,
  initialProgress,
}: {
  analysisId: string;
  jobTitle: string;
  jobText?: string;
  questions: string[];
  initialProgress: Record<string, QuestionProgress>;
}) {
  const { notify } = useFeedback();
  const [questions, setQuestions] = useState<string[]>(initialQuestions);
  const [progress, setProgress] = useState<Record<string, QuestionProgress>>(initialProgress);
  const [expanded, setExpanded] = useState<number | null>(0);
  const [drafts, setDrafts] = useState<Record<number, string>>({});
  const [answerDrafts, setAnswerDrafts] = useState<Record<number, string>>({});
  const [draftMode, setDraftMode] = useState<"curta" | "star" | "tecnica">("curta");
  const [finalizing, setFinalizing] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [draftingIndex, setDraftingIndex] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const root = document.querySelector<HTMLElement>("[data-interview-prep]");
    if (root) repairInterviewDom(root);
  });

  const finalized = Object.keys(progress).length > 0;

  const draftAnsweredCount = questions.filter((_, i) => (drafts[i] ?? progress[i]?.answer ?? "").trim()).length;
  const allAnswered = draftAnsweredCount === questions.length;

  async function finalizeSimulation() {
    if (!allAnswered) {
      setError("Responda todas as perguntas antes de finalizar a simulação.");
      return;
    }
    setError(null);
    setFinalizing(true);
    try {
      const qas = questions.map((q, i) => ({
        question: q,
        answer: (drafts[i] ?? progress[i]?.answer ?? "").trim(),
      }));

      const res = await fetch("/api/tools/interview-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qas, jobTitle }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao processar.");

      const nextProgress: Record<string, QuestionProgress> = {};
      qas.forEach((qa, i) => {
        nextProgress[i] = { answer: qa.answer, ...data.results[i] };
      });

      setProgress(nextProgress);

      await fetch(`/api/interviews/${analysisId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ progress: nextProgress }),
      });
      notify("success", "Simulação concluída. Seu feedback está pronto.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro inesperado.";
      setError(message);
      notify("error", message);
    } finally {
      setFinalizing(false);
    }
  }

  async function resetSimulation() {
    setError(null);
    setRegenerating(true);
    try {
      const res = await fetch(`/api/interviews/${analysisId}/regenerate`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao gerar novas perguntas.");

      setQuestions(data.questions);
      setProgress({});
      setDrafts({});
      setAnswerDrafts({});
      setExpanded(0);
      notify("success", "Novas perguntas geradas para esta entrevista.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro inesperado.";
      setError(message);
      notify("error", message);
    } finally {
      setRegenerating(false);
    }
  }

  async function generateDraft(index: number) {
    setError(null);
    setDraftingIndex(index);
    try {
      const res = await fetch("/api/tools/interview-answer-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetRole: jobTitle,
          area: "",
          seniority: "",
          question: questions[index],
          mode: draftMode,
          history: questions
            .slice(0, index)
            .map((question, previousIndex) => ({
              question,
              answer: (drafts[previousIndex] ?? progress[previousIndex]?.answer ?? "").trim(),
            }))
            .filter((turn) => turn.answer),
          jobText: jobText ?? "",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao gerar rascunho.");

      setAnswerDrafts((current) => ({ ...current, [index]: data.answerDraft ?? "" }));
      notify("success", "Rascunho de resposta gerado.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro inesperado.";
      setError(message);
      notify("error", message);
    } finally {
      setDraftingIndex(null);
    }
  }

  // Copiar relatório completo para a área de transferência
  function copyReportToClipboard() {
    let reportText = `RELATÓRIO DE SIMULAÇÃO DE ENTREVISTA - ${jobTitle.toUpperCase()}\n`;
    reportText += `Data: ${new Date().toLocaleDateString("pt-BR")}\n`;
    reportText += `Nota Geral: ${overallScore}/100\n`;
    reportText += `===========================================\n\n`;

    questions.forEach((q, i) => {
      const item = progress[i];
      if (!item) return;
      reportText += `PERGUNTA #${i + 1}: ${q}\n`;
      reportText += `SUA RESPOSTA: ${item.answer || "(não respondida)"}\n\n`;
      reportText += `ANÁLISE DO RECRUTADOR: ${item.feedback}\n`;
      if (item.actionStep) {
        reportText += `PLANO DE AÇÃO: ${item.actionStep}\n`;
      }
      if (item.suggestedAnswer) {
        reportText += `RESPOSTA MODELO (NOTA 10): ${item.suggestedAnswer}\n`;
      }
      reportText += `-------------------------------------------\n\n`;
    });

    navigator.clipboard.writeText(repairMojibake(reportText));
    setCopied(true);
    notify("success", "Relatório copiado para a área de transferência.");
    setTimeout(() => setCopied(false), 3000);
  }

  // Imprimir / Salvar PDF
  function handlePrintPDF() {
    window.print();
  }

  // Métricas gerais da entrevista
  const feedbackList = Object.values(progress);
  const avgClarity = feedbackList.length
    ? Math.round(feedbackList.reduce((acc, curr) => acc + (curr.clarity || 0), 0) / feedbackList.length)
    : 0;
  const avgTech = feedbackList.length
    ? Math.round(feedbackList.reduce((acc, curr) => acc + (curr.technicalDepth || 0), 0) / feedbackList.length)
    : 0;
  const avgConfidence = feedbackList.length
    ? Math.round(feedbackList.reduce((acc, curr) => acc + (curr.confidence || 0), 0) / feedbackList.length)
    : 0;
  const overallScore = Math.round((avgClarity + avgTech + avgConfidence) / 3);

  if (questions.length === 0) {
    return (
      <div data-interview-prep className="max-w-3xl mx-auto px-4 py-16 w-full text-center">
        <h1 className="text-2xl font-bold tracking-tight">Prepare-se para a entrevista</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-2">
          Sua última análise não gerou perguntas de entrevista. Faça uma nova análise para treinar aqui.
        </p>
      </div>
    );
  }

  return (
    <div data-interview-prep className="px-4 md:px-8 py-8 max-w-7xl mx-auto w-full space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-neutral-900 via-indigo-950 to-slate-900 p-6 md:p-8 text-white shadow-xl shadow-indigo-950/10 border border-white/10">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-3">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider rounded-full px-3 py-1 bg-white/10 text-blue-200 border border-white/15 backdrop-blur-md">
            <SparklesIcon className="h-3.5 w-3.5 text-blue-300" /> Acelerador de Carreira & Entrevistas
          </span>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight">
            Prepare-se para a entrevista
          </h1>
          <p className="text-neutral-300 max-w-2xl text-sm md:text-base leading-relaxed">
            Treine para a vaga de **{jobTitle}**. Veja a sua resposta e o feedback da IA **lado a lado**, salve seu resultado no histórico e exporte seu relatório em PDF.
          </p>
        </div>
      </div>

      {/* Cargo Card + Barra de Salvamento */}
      <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md p-5 shadow-sm flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-lg border border-blue-100 dark:border-blue-900/50">
            💼
          </div>
          <div>
            <p className="text-xs uppercase font-semibold text-neutral-400">Vaga selecionada</p>
            <p className="font-bold text-neutral-900 dark:text-white text-base md:text-lg">{jobTitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {finalized ? (
            <>
              <span className="flex items-center gap-2 text-xs font-semibold rounded-full px-3.5 py-1.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900/50">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                Salvo no seu Histórico
              </span>

              {/* Botões de Ação para Salvar/Exportar */}
              <button
                type="button"
                onClick={copyReportToClipboard}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-300/80 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-bold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-all shadow-sm"
              >
                <CopyIcon className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                <span>{copied ? "✓ Copiado!" : "Copiar Relatório"}</span>
              </button>

              <button
                type="button"
                onClick={handlePrintPDF}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-md shadow-blue-600/20 hover:bg-blue-700 transition-all"
              >
                <PrinterIcon className="h-3.5 w-3.5" />
                <span>Salvar em PDF / Imprimir</span>
              </button>
            </>
          ) : (
            <span className="flex items-center gap-2 text-xs font-semibold rounded-full px-3.5 py-1.5 bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/50">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
              </span>
              {draftAnsweredCount} de {questions.length} respondidas
            </span>
          )}
        </div>
      </div>

      {/* FORMULÁRIO DE PREENCHIMENTO DAS RESPOSTAS */}
      {!finalized && (
        <div className="rounded-3xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 md:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-4">
            <div>
              <h2 className="font-bold text-xl text-neutral-900 dark:text-white flex items-center gap-2">
                Perguntas da Entrevista <InfoIcon className="h-4 w-4 text-neutral-400" />
              </h2>
              <p className="text-xs md:text-sm text-neutral-500 mt-1">
                Responda com o máximo de detalhes possível (ferramentas, tarefas executadas e resultados).
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400 border border-blue-200/60 dark:border-blue-900/50">
              {draftAnsweredCount}/{questions.length} Respondidas
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/50 p-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              Modo da resposta assistida
            </span>
            <button
              type="button"
              onClick={() => setDraftMode("tecnica")}
              className="rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm shadow-emerald-600/20 hover:bg-emerald-700"
            >
              Modo teste técnico
            </button>
            {([
              ["curta", "Curta"],
              ["star", "STAR"],
              ["tecnica", "Técnica"],
            ] as const).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setDraftMode(value)}
                className={`rounded-full px-3 py-1.5 text-xs font-bold transition-all ${
                  draftMode === value
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-100 dark:bg-neutral-900 dark:text-neutral-300 dark:border-neutral-700"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="space-y-4">
            {questions.map((q, i) => {
              const draftText = (drafts[i] ?? "").trim();
              const isOpen = expanded === i;
              const next = questions.findIndex((_, j) => j > i && !(drafts[j] ?? "").trim());

              return (
                <div
                  key={i}
                  className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                    isOpen
                      ? "border-blue-400 dark:border-blue-800 bg-blue-50/40 dark:bg-blue-950/20 shadow-md shadow-blue-500/5 ring-1 ring-blue-400/20"
                      : draftText
                      ? "border-emerald-300 dark:border-emerald-900/60 bg-emerald-50/20 dark:bg-emerald-950/10"
                      : "border-neutral-200/90 dark:border-neutral-800/90 hover:border-neutral-300 dark:hover:border-neutral-700 bg-white dark:bg-neutral-900/50"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      if (!isOpen) {
                        setDraftMode(defaultDraftModeForQuestion(q, jobTitle, jobText));
                      }
                      setExpanded(isOpen ? null : i);
                    }}
                    className="w-full flex items-center gap-3.5 p-4 text-left group"
                  >
                    <span
                      className={`h-7 w-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 transition-all ${
                        draftText
                          ? "bg-emerald-500 text-white shadow-sm shadow-emerald-500/30"
                          : isOpen
                          ? "bg-indigo-600 text-white"
                          : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500 group-hover:bg-neutral-200 dark:group-hover:bg-neutral-700"
                      }`}
                    >
                      {draftText ? "✓" : i + 1}
                    </span>
                    <span className="flex-1 text-sm md:text-base font-semibold text-neutral-800 dark:text-neutral-200 leading-snug">
                      {q}
                    </span>
                    <ChevronIcon className="h-4 w-4 text-neutral-400 shrink-0" open={isOpen} />
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 space-y-2.5">
                      <textarea
                        value={drafts[i] ?? ""}
                        onChange={(e) => setDrafts((prev) => ({ ...prev, [i]: e.target.value }))}
                        rows={5}
                        maxLength={1500}
                        placeholder="Escreva sua resposta detalhada (situação, ação e resultados alcançados)..."
                        className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700/80 bg-white dark:bg-neutral-900 px-4 py-3 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all leading-relaxed"
                      />
                      <button
                        type="button"
                        onClick={() => void generateDraft(i)}
                        disabled={draftingIndex !== null}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-300 bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100 disabled:opacity-50 dark:border-indigo-900 dark:bg-indigo-950/30 dark:text-indigo-300"
                      >
                        {draftingIndex === i ? "Gerando rascunho..." : "Gerar resposta assistida"}
                      </button>
                      {answerDrafts[i] && (
                        <div className="rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/70 dark:bg-indigo-950/20 p-3">
                          <p className="text-[11px] font-bold uppercase tracking-wide text-indigo-700 dark:text-indigo-300">
                            Rascunho sugerido pela IA
                          </p>
                          <p className="mt-2 whitespace-pre-wrap text-sm text-indigo-950 dark:text-indigo-100">
                            {answerDrafts[i]}
                          </p>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-neutral-400">
                          {(drafts[i] ?? "").length}/1500 caracteres
                        </span>
                        {next !== -1 && (
                          <button
                            type="button"
                            onClick={() => setExpanded(next)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-100 transition-all"
                          >
                            <span>Próxima pergunta</span>
                            <span>→</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* FEEDBACK COMPLETO CLARO E DE ALTO CRESCIMENTO */}
      {finalized && (
        <div className="space-y-8 animate-fadeIn">
          {/* Painel de Pontuação Geral */}
          <div className="rounded-3xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 md:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-4 flex-wrap gap-3">
              <div>
                <h2 className="font-bold text-xl text-neutral-900 dark:text-white flex items-center gap-2">
                  Desempenho Geral da Simulação <SparklesIcon className="h-5 w-5 text-blue-500" />
                </h2>
                <p className="text-xs md:text-sm text-neutral-500 mt-0.5">
                  Diagnóstico consolidado das suas competências para o cargo
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm font-bold px-4 py-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20">
                  Nota Geral: {overallScore}/100
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ScoreGauge
                icon={ChatIcon}
                label="Clareza da Comunicação"
                value={avgClarity}
                gradient="bg-gradient-to-r from-blue-500 to-indigo-600"
              />
              <ScoreGauge
                icon={BulbIcon}
                label="Domínio Técnico"
                value={avgTech}
                gradient="bg-gradient-to-r from-emerald-500 to-teal-600"
              />
              <ScoreGauge
                icon={ShieldIcon}
                label="Confiança e Postura"
                value={avgConfidence}
                gradient="bg-gradient-to-r from-violet-500 to-purple-600"
              />
            </div>
          </div>

          {/* LISTA DE PERGUNTAS: SUA RESPOSTA LADO A LADO COM O FEEDBACK E PLANO DE AÇÃO DE CRESCIMENTO */}
          <div className="space-y-8">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              Análise Detalhada & Plano de Crescimento por Pergunta
            </h2>

            {questions.map((questionText, i) => {
              const item = progress[i];
              if (!item) return null;

              const isExcellent = item.verdict === "excelente" || item.clarity >= 85;
              const isGood = !isExcellent && (item.verdict === "bom" || item.clarity >= 65);

              return (
                <div
                  key={i}
                  className="rounded-3xl border border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-neutral-950 overflow-hidden shadow-sm hover:shadow-md transition-shadow space-y-0"
                >
                  {/* Cabeçalho da Pergunta com Veredito */}
                  <div className="p-5 md:p-6 bg-gradient-to-r from-neutral-50 via-blue-50/20 to-neutral-50 dark:from-neutral-900 dark:via-blue-950/20 dark:to-neutral-900 border-b border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-start gap-3.5">
                      <span className="h-8 w-8 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-sm shrink-0 shadow-sm shadow-blue-500/20">
                        {i + 1}
                      </span>
                      <div className="space-y-0.5">
                        <p className="text-xs uppercase font-bold tracking-wider text-blue-600 dark:text-blue-400">
                          Pergunta #{i + 1}
                        </p>
                        <h3 className="text-base md:text-lg font-bold text-neutral-900 dark:text-white leading-snug">
                          {questionText}
                        </h3>
                      </div>
                    </div>

                    {/* Veredito Visual */}
                    <div>
                      {isExcellent ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900/50">
                          🟢 Resposta Excelente
                        </span>
                      ) : isGood ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/50">
                          🟡 Boa Resposta (Ajustes Recomendados)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 border border-red-200/60 dark:border-red-900/50">
                          🔴 Precisa de Reforço Técnico
                        </span>
                      )}
                    </div>
                  </div>

                  {/* GRID LADO A LADO: SUA RESPOSTA (ESQUERDA) VS. AVALIAÇÃO DA IA (DIREITA) */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-neutral-200/80 dark:divide-neutral-800">
                    {/* COLUNA ESQUERDA: SUA RESPOSTA DIGITADA */}
                    <div className="lg:col-span-5 p-5 md:p-6 space-y-4 bg-neutral-50/50 dark:bg-neutral-900/30">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                        <UserIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <span>Sua Resposta:</span>
                      </div>

                      <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 text-xs md:text-sm leading-relaxed text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap shadow-inner font-sans">
                        {item.answer ? `"${item.answer}"` : "(Nenhuma resposta fornecida)"}
                      </div>

                      {/* Mini Indicadores de Nota da Pergunta */}
                      <div className="p-3.5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 space-y-2.5">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                          Notas desta Resposta:
                        </p>
                        <ScoreGauge
                          icon={ChatIcon}
                          label="Clareza"
                          value={item.clarity}
                          gradient="bg-gradient-to-r from-blue-500 to-indigo-600"
                        />
                        <ScoreGauge
                          icon={BulbIcon}
                          label="Domínio Técnico"
                          value={item.technicalDepth}
                          gradient="bg-gradient-to-r from-emerald-500 to-teal-600"
                        />
                        <ScoreGauge
                          icon={ShieldIcon}
                          label="Confiança"
                          value={item.confidence}
                          gradient="bg-gradient-to-r from-violet-500 to-purple-600"
                        />
                      </div>
                    </div>

                    {/* COLUNA DIREITA: FEEDBACK DE CRESCIMENTO DA IA */}
                    <div className="lg:col-span-7 p-5 md:p-6 space-y-5">
                      {/* Título do Veredito & Diagnóstico do Recrutador */}
                      <div className="p-4.5 rounded-2xl bg-gradient-to-br from-blue-50/80 via-indigo-50/40 to-white dark:from-blue-950/40 dark:via-indigo-950/20 dark:to-neutral-900 border border-blue-100 dark:border-blue-900/50 space-y-2">
                        {item.verdictTitle && (
                          <h4 className="font-bold text-sm text-blue-950 dark:text-blue-200">
                            {item.verdictTitle}
                          </h4>
                        )}
                        <p className="leading-relaxed text-neutral-700 dark:text-neutral-300 text-xs md:text-sm">
                          {item.feedback}
                        </p>
                      </div>

                      {/* AÇÃO PRÁTICA DE CRESCIMENTO (DICA DE OURO PARA O CLIENTE) */}
                      {item.actionStep && (
                        <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-900 to-slate-900 text-white shadow-sm space-y-2 border border-indigo-500/20">
                          <p className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-2">
                            <RocketIcon className="h-4 w-4 text-indigo-400 shrink-0" />
                            Ação Prática de Crescimento (Dica de Ouro)
                          </p>
                          <p className="text-xs md:text-sm leading-relaxed text-indigo-100 font-medium">
                            {item.actionStep}
                          </p>
                        </div>
                      )}

                      {/* PALAVRAS-CHAVE E TERMOS TÉCNICOS RECOMENDADOS */}
                      {item.keywordsToUse && item.keywordsToUse.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                            <BulbIcon className="h-3.5 w-3.5 text-blue-500" /> Termos Técnicos que valorizam esta resposta:
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {item.keywordsToUse.map((kw, idx) => (
                              <span
                                key={idx}
                                className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/50 dark:border-blue-900/50 text-xs font-semibold"
                              >
                                #{kw}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Pontos Fortes e O que Faltou */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Pontos Fortes */}
                        <div className="rounded-2xl border border-emerald-200/80 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 space-y-2">
                          <p className="text-xs font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                            <CheckCircleIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            Pontos Fortes
                          </p>
                          <ul className="space-y-1.5 text-xs text-emerald-950 dark:text-emerald-200">
                            {item.strongPoints?.map((pt, idx) => (
                              <li key={idx} className="flex items-start gap-2 leading-snug">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0 mt-1" />
                                <span>{pt}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* O que faltou / Dicas */}
                        <div className="rounded-2xl border border-amber-200/80 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20 p-4 space-y-2">
                          <p className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                            <BulbIcon className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                            O que faltou & Como melhorar
                          </p>
                          <ul className="space-y-1.5 text-xs text-amber-950 dark:text-amber-200">
                            {item.improvementTips?.map((tip, idx) => (
                              <li key={idx} className="flex items-start gap-2 leading-snug">
                                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0 mt-1" />
                                <span>{tip}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Resposta Modelo Nota 10 */}
                      {item.suggestedAnswer && (
                        <div className="rounded-2xl border border-purple-200/80 dark:border-purple-900/60 bg-gradient-to-br from-purple-50/80 via-indigo-50/30 to-white dark:from-purple-950/30 dark:via-indigo-950/20 dark:to-neutral-950 p-4.5 space-y-2.5">
                          <p className="text-xs font-bold text-purple-950 dark:text-purple-300 flex items-center gap-2">
                            <SparklesIcon className="h-4 w-4 text-purple-600 dark:text-purple-400 shrink-0" />
                            Exemplo de Resposta Modelo (Nota 10)
                          </p>
                          <div className="p-3.5 rounded-xl bg-white/90 dark:bg-neutral-900/90 border border-purple-100 dark:border-purple-900/40 text-xs italic leading-relaxed text-neutral-800 dark:text-neutral-200 shadow-inner">
                            &quot;{item.suggestedAnswer}&quot;
                          </div>
                        </div>
                      )}

                      {/* Roteiro STAR Recomendado */}
                      {item.starBreakdown && (
                        <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 space-y-3">
                          <p className="font-bold text-xs uppercase tracking-wider text-neutral-700 dark:text-neutral-300 flex items-center gap-2">
                            Roteiro Sugerido (Método STAR)
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                            <div className="p-2.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border-l-3 border-blue-600 space-y-0.5">
                              <p className="font-bold text-[10px] text-blue-700 dark:text-blue-300 uppercase">1. Situação</p>
                              <p className="text-neutral-600 dark:text-neutral-300 text-[11px]">{item.starBreakdown.situation}</p>
                            </div>
                            <div className="p-2.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border-l-3 border-emerald-600 space-y-0.5">
                              <p className="font-bold text-[10px] text-emerald-700 dark:text-emerald-300 uppercase">2. Ação</p>
                              <p className="text-neutral-600 dark:text-neutral-300 text-[11px]">{item.starBreakdown.action}</p>
                            </div>
                            <div className="p-2.5 rounded-xl bg-purple-50/60 dark:bg-purple-950/20 border-l-3 border-purple-600 space-y-0.5">
                              <p className="font-bold text-[10px] text-purple-700 dark:text-purple-300 uppercase">3. Resultado</p>
                              <p className="text-neutral-600 dark:text-neutral-300 text-[11px]">{item.starBreakdown.result}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {error && <p className="text-sm font-semibold text-red-500 text-right">{error}</p>}

      {/* Floating Bottom Action Bar */}
      <div className="sticky bottom-6 z-20 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white/90 dark:bg-neutral-950/90 backdrop-blur-md p-4 shadow-xl shadow-slate-900/10 flex items-center justify-between flex-wrap gap-4">
        <p className="text-xs font-semibold text-neutral-500 flex items-center gap-1.5">
          {finalized ? (
            <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-bold">
              ✓ Resultado salvo no seu perfil!
            </span>
          ) : (
            <span>Preencha todas as perguntas acima para gerar o diagnóstico completo.</span>
          )}
        </p>

        <div className="flex items-center gap-3.5 flex-wrap">
          {finalized && (
            <>
              <button
                type="button"
                onClick={copyReportToClipboard}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-neutral-300/80 dark:border-neutral-700 bg-white dark:bg-neutral-900 font-bold text-xs md:text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all shadow-sm"
              >
                <CopyIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span>{copied ? "✓ Relatório Copiado!" : "Copiar Relatório"}</span>
              </button>

              <button
                type="button"
                onClick={handlePrintPDF}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold text-xs md:text-sm shadow-md hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-all"
              >
                <PrinterIcon className="h-4 w-4" />
                <span>Salvar PDF / Imprimir</span>
              </button>
            </>
          )}

          <button
            type="button"
            onClick={resetSimulation}
            disabled={regenerating || finalizing}
            className="group relative flex items-center gap-2 rounded-xl border border-neutral-300/80 dark:border-neutral-700 bg-white/80 dark:bg-neutral-900/80 font-bold text-xs md:text-sm px-4 py-2.5 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all disabled:opacity-50"
          >
            <RefreshIcon className="h-4 w-4 text-neutral-500 group-hover:rotate-180 transition-transform duration-500" />
            <span>{regenerating ? "Gerando..." : "Novas perguntas"}</span>
          </button>

          {!finalized && (
            <button
              type="button"
              onClick={finalizeSimulation}
              disabled={finalizing || regenerating || !allAnswered}
              className="relative overflow-hidden group rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-bold text-xs md:text-sm px-6 py-2.5 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100 disabled:shadow-none flex items-center gap-2"
            >
              <SparklesIcon className="h-4 w-4" />
              <span>{finalizing ? "Avaliando..." : "Finalizar simulação e ver feedback"}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

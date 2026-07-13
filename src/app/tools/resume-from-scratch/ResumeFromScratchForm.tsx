"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const EXAMPLES = [
  {
    label: "Estágio",
    targetRole: "Estágio em Suporte Técnico",
    education: "Cursando Análise e Desenvolvimento de Sistemas, previsão de conclusão 2027",
    projects:
      "Montei e configurei uma rede doméstica com roteador e switch para estudo próprio.\nCurso online de fundamentos de redes (Cisco Networking Academy), concluído em 2025.\nVoluntário no suporte de informática de uma ONG local, ajudando a configurar computadores e resolver problemas de conexão.",
    skills: "Windows, Linux básico, redes (TCP/IP), Excel, atendimento ao público, inglês intermediário",
  },
  {
    label: "Primeiro emprego",
    targetRole: "Assistente Administrativo",
    education: "Ensino médio completo",
    projects:
      "Organizei a tesouraria de um grupo de jovens da igreja por 1 ano, controlando entradas e saídas em planilha.\nCurso de Excel avançado, concluído em 2025.\nAjudante em loja de bairro nos fins de semana, cuidando de caixa e atendimento.",
    skills: "Excel, Word, organização, atendimento ao cliente, comunicação",
  },
  {
    label: "Mudança de carreira",
    targetRole: "Analista de Dados Júnior",
    education: "Graduado em Administração; bootcamp de Análise de Dados concluído em 2025",
    projects:
      "Projeto final do bootcamp: análise de vendas de um e-commerce fictício usando SQL e Power BI, com dashboard de indicadores.\n5 anos como analista financeiro em empresa de médio porte, usando Excel avançado para relatórios gerenciais.\nCurso de Python para análise de dados, concluído em 2025.",
    skills: "SQL, Power BI, Excel avançado, Python básico, análise financeira",
  },
];

export function ResumeFromScratchForm({
  initialTargetRole = "",
  initialProjects = "",
}: {
  initialTargetRole?: string;
  initialProjects?: string;
}) {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [targetRole, setTargetRole] = useState(initialTargetRole);
  const [education, setEducation] = useState("");
  const [projects, setProjects] = useState(initialProjects);
  const [skills, setSkills] = useState("");
  const [showJobFields, setShowJobFields] = useState(false);
  const [jobTitle, setJobTitle] = useState("");
  const [jobText, setJobText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function applyExample(example: (typeof EXAMPLES)[number]) {
    setTargetRole(example.targetRole);
    setEducation(example.education);
    setProjects(example.projects);
    setSkills(example.skills);
    setError(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!education.trim() || !projects.trim() || !skills.trim()) {
      setError("Preencha formação, projetos/atividades e habilidades.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/tools/resume-from-scratch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          targetRole,
          education,
          projects,
          skills,
          jobTitle,
          jobText,
        }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error ?? "Erro ao processar.");

      router.push(`/resume/${data.analysisId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
      setLoading(false);
    }
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-12 w-full">
      <Link href="/tools" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
        ← Voltar para ferramentas
      </Link>
      <header className="mt-4 mb-8">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider rounded-full px-3 py-1 mb-3 bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900">
          Currículo
        </span>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Currículo do zero</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-2">
          Ainda não tem currículo? Preencha as informações abaixo e a IA monta um
          currículo completo pra você, já pronto para editar e baixar em PDF.
        </p>
      </header>

      <div className="mb-8">
        <p className="text-sm font-medium mb-2">Não sabe por onde começar? Use um exemplo:</p>
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map((example) => (
            <button
              key={example.label}
              type="button"
              onClick={() => applyExample(example)}
              className="text-sm rounded-full border border-blue-600 text-blue-600 dark:text-blue-400 px-4 py-1.5 font-semibold hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
            >
              {example.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-neutral-500 mt-2">
          Isso preenche o formulário com um exemplo pronto, edite os campos com suas
          informações reais antes de gerar.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1">Nome (opcional)</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-white/[0.03] px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Cargo-alvo</label>
          <input
            type="text"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            placeholder="Ex: Estágio em Suporte Técnico"
            className="w-full rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-white/[0.03] px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Formação</label>
          <textarea
            value={education}
            onChange={(e) => setEducation(e.target.value)}
            rows={2}
            placeholder="Ex: Cursando Análise e Desenvolvimento de Sistemas, previsão de conclusão 2027"
            className="w-full rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-white/[0.03] px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Projetos, cursos, voluntariado, trabalhos informais
          </label>
          <textarea
            value={projects}
            onChange={(e) => setProjects(e.target.value)}
            rows={6}
            placeholder="Descreva cada atividade relevante, mesmo que informal"
            className="w-full rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-white/[0.03] px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Habilidades e tecnologias que você conhece
          </label>
          <textarea
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            rows={3}
            placeholder="Ex: Linux, Git, Excel, Python básico, inglês intermediário"
            className="w-full rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-white/[0.03] px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-colors"
          />
        </div>

        <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 shadow-sm shadow-slate-900/5">
          {!showJobFields ? (
            <button
              type="button"
              onClick={() => setShowJobFields(true)}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              + Já tem uma vaga em mente? Cole aqui para a IA priorizar o que ela pede
            </button>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Vaga-alvo (opcional)</p>
                <button
                  type="button"
                  onClick={() => {
                    setShowJobFields(false);
                    setJobTitle("");
                    setJobText("");
                  }}
                  className="text-xs text-neutral-500 hover:underline"
                >
                  Remover
                </button>
              </div>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="Cargo da vaga, ex: Estágio em Suporte Técnico na empresa X"
                className="w-full rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-white/[0.03] px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-colors"
              />
              <textarea
                value={jobText}
                onChange={(e) => setJobText(e.target.value)}
                rows={5}
                placeholder="Cole aqui a descrição da vaga"
                className="w-full rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-white/[0.03] px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-colors"
              />
            </div>
          )}
        </div>

        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-blue-600 text-white font-semibold px-5 py-2.5 shadow-sm shadow-blue-600/20 hover:bg-blue-700 transition-all disabled:opacity-50"
        >
          {loading ? "Gerando..." : "Gerar currículo"}
        </button>
      </form>

      {loading && (
        <p className="mt-6 text-sm text-neutral-500">
          Gerando seu currículo e preparando o editor...
        </p>
      )}
    </main>
  );
}

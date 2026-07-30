"use client";

import { useState } from "react";
import Link from "next/link";
import { GraduationCap, Plus, Trash2, Sparkles, Briefcase } from "lucide-react";

type Insight = { competencies: string[]; relatedProfessions: string[]; suggestedProject: string };
type CatalogSubject = { id: string; name: string; semester: number | null; insight: Insight | null };
type ManualSubject = { id: string; name: string; insight: Insight | null };
type CourseResult = { id: string; title: string; area: string; universityName: string; city: string; state: string };

type Enrollment = {
  institution: string;
  courseName: string;
  period: string;
  currentSemester: number | null;
  universityCourseId: string | null;
  universityCourseTitle: string | null;
  universityName: string | null;
} | null;

const INPUT_CLASS =
  "w-full rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-white/[0.03] px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-colors";

function SubjectCard({
  name,
  insight,
  onGenerate,
  onDelete,
  generating,
}: {
  name: string;
  insight: Insight | null;
  onGenerate: () => void;
  onDelete?: () => void;
  generating: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">{name}</h3>
        {onDelete && (
          <button type="button" onClick={onDelete} className="text-slate-400 hover:text-red-600 transition-colors shrink-0">
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      {insight ? (
        <div className="space-y-3 text-xs">
          <div>
            <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px] mb-1">Competências desenvolvidas</p>
            <div className="flex flex-wrap gap-1.5">
              {insight.competencies.map((c) => (
                <span key={c} className="rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 px-2.5 py-1 font-semibold">
                  {c}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px] mb-1">Relacionada a</p>
            <p className="text-slate-700 dark:text-slate-300">{insight.relatedProfessions.join(", ")}</p>
          </div>
          <div className="rounded-xl bg-slate-50 dark:bg-slate-950 p-3 space-y-1.5">
            <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Projeto recomendado</p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{insight.suggestedProject}</p>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            <Link
              href={`/feed?q=${encodeURIComponent(insight.relatedProfessions[0] ?? "")}`}
              className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 font-semibold hover:underline"
            >
              <Briefcase className="h-3.5 w-3.5" /> Ver vagas relacionadas
            </Link>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={onGenerate}
          disabled={generating}
          className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 transition-all disabled:opacity-50"
        >
          <Sparkles className="h-3.5 w-3.5" />
          {generating ? "Gerando..." : "Ver conexão com carreira"}
        </button>
      )}
    </div>
  );
}

export function UniversityHub({
  enrollment,
  availableSemesters,
  catalogSubjects,
  manualSubjects,
}: {
  enrollment: Enrollment;
  availableSemesters: number[];
  catalogSubjects: CatalogSubject[];
  manualSubjects: ManualSubject[];
}) {
  const [editing, setEditing] = useState(!enrollment);
  const [institution, setInstitution] = useState(enrollment?.institution ?? "");
  const [courseName, setCourseName] = useState(enrollment?.courseName ?? "");
  const [period, setPeriod] = useState(enrollment?.period ?? "");
  const [courseQuery, setCourseQuery] = useState("");
  const [courseResults, setCourseResults] = useState<CourseResult[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<CourseResult | null>(null);
  const [semesters, setSemesters] = useState<number[]>(availableSemesters);
  const [currentSemester, setCurrentSemester] = useState<number | null>(enrollment?.currentSemester ?? null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [localCatalogSubjects, setLocalCatalogSubjects] = useState(catalogSubjects);
  const [localManualSubjects, setLocalManualSubjects] = useState(manualSubjects);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  async function searchCourses(q: string) {
    setCourseQuery(q);
    if (q.trim().length < 2) {
      setCourseResults([]);
      return;
    }
    const res = await fetch(`/api/universidade/courses/search?q=${encodeURIComponent(q)}`);
    const data = await res.json();
    setCourseResults(data.courses ?? []);
  }

  async function selectCourse(course: CourseResult) {
    setSelectedCourse(course);
    setCourseName(course.title);
    setCourseResults([]);
    setCourseQuery(course.title);
    const res = await fetch(`/api/universidade/courses/${course.id}/semesters`);
    const data = await res.json();
    setSemesters(data.semesters ?? []);
  }

  async function saveEnrollment(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!courseName.trim()) {
      setError("Informe o nome do seu curso.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/universidade/enrollment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          institution: selectedCourse ? `${selectedCourse.universityName}` : institution,
          courseName,
          period,
          universityCourseId: selectedCourse?.id ?? enrollment?.universityCourseId ?? null,
          currentSemester,
        }),
      });
      if (!res.ok) throw new Error("Não foi possível salvar. Tente novamente.");
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
      setSaving(false);
    }
  }

  async function addManualSubject(e: React.FormEvent) {
    e.preventDefault();
    if (!newSubjectName.trim()) return;
    const res = await fetch("/api/universidade/subjects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newSubjectName.trim() }),
    });
    const data = await res.json();
    if (res.ok) {
      setLocalManualSubjects((prev) => [...prev, { id: data.subject.id, name: data.subject.name, insight: null }]);
      setNewSubjectName("");
    }
  }

  async function deleteManualSubject(id: string) {
    setLocalManualSubjects((prev) => prev.filter((s) => s.id !== id));
    await fetch("/api/universidade/subjects", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
  }

  async function generateManualInsight(id: string) {
    setGeneratingId(id);
    try {
      const res = await fetch(`/api/universidade/subjects/${id}/insight`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setLocalManualSubjects((prev) =>
          prev.map((s) =>
            s.id === id
              ? {
                  ...s,
                  insight: {
                    competencies: JSON.parse(data.subject.competencies),
                    relatedProfessions: JSON.parse(data.subject.relatedProfessions),
                    suggestedProject: data.subject.suggestedProject,
                  },
                }
              : s
          )
        );
      }
    } finally {
      setGeneratingId(null);
    }
  }

  async function generateCatalogInsight(id: string) {
    setGeneratingId(id);
    try {
      const res = await fetch(`/api/universidade/curriculum-subjects/${id}/insight`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setLocalCatalogSubjects((prev) =>
          prev.map((s) =>
            s.id === id
              ? {
                  ...s,
                  insight: {
                    competencies: JSON.parse(data.insight.competencies),
                    relatedProfessions: JSON.parse(data.insight.relatedProfessions),
                    suggestedProject: data.insight.suggestedProject,
                  },
                }
              : s
          )
        );
      }
    } finally {
      setGeneratingId(null);
    }
  }

  return (
    <main className="max-w-4xl mx-auto px-4 md:px-8 py-6 space-y-6 font-sans">
      <div className="flex items-center gap-2">
        <GraduationCap className="h-5 w-5 text-blue-600" />
        <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">Universidade</h1>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 -mt-4">
        Seu curso, seu período e como cada disciplina se conecta com sua carreira.
      </p>

      {!editing && enrollment ? (
        <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">{enrollment.courseName}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {enrollment.universityName ?? (enrollment.institution || "Instituição não informada")}
              {enrollment.period && ` · ${enrollment.period}`}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-xs font-semibold text-blue-600 hover:underline shrink-0"
          >
            Editar curso
          </button>
        </div>
      ) : (
        <form onSubmit={saveEnrollment} className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
          <div className="relative">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Seu curso</label>
            <input
              type="text"
              value={courseQuery || courseName}
              onChange={(e) => {
                setCourseName(e.target.value);
                setSelectedCourse(null);
                searchCourses(e.target.value);
              }}
              placeholder="Busque seu curso (ex: Sistemas de Informação)"
              className={INPUT_CLASS}
            />
            {courseResults.length > 0 && (
              <div className="absolute z-10 mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg max-h-64 overflow-y-auto">
                {courseResults.map((c) => (
                  <button
                    type="button"
                    key={c.id}
                    onClick={() => selectCourse(c)}
                    className="block w-full text-left px-4 py-2.5 text-xs hover:bg-slate-50 dark:hover:bg-slate-800 border-b border-slate-100 dark:border-slate-800 last:border-0"
                  >
                    <span className="font-semibold text-slate-900 dark:text-white">{c.title}</span>
                    <span className="block text-slate-500">{c.universityName} · {c.city}/{c.state}</span>
                  </button>
                ))}
              </div>
            )}
            {!selectedCourse && (
              <p className="text-[11px] text-slate-400 mt-1">
                Não achou seu curso? Digite o nome mesmo assim — as disciplinas você cadastra manualmente.
              </p>
            )}
          </div>

          {!selectedCourse && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Instituição (opcional)</label>
              <input type="text" value={institution} onChange={(e) => setInstitution(e.target.value)} className={INPUT_CLASS} />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Período (texto livre)</label>
              <input type="text" value={period} onChange={(e) => setPeriod(e.target.value)} placeholder="Ex: 5º período" className={INPUT_CLASS} />
            </div>
            {semesters.length > 0 && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Semestre da grade</label>
                <select
                  value={currentSemester ?? ""}
                  onChange={(e) => setCurrentSemester(e.target.value ? Number(e.target.value) : null)}
                  className={INPUT_CLASS}
                >
                  <option value="">Todos</option>
                  {semesters.map((s) => (
                    <option key={s} value={s}>{s}º semestre</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {error && <p className="text-xs font-bold text-red-600">{error}</p>}

          <div className="flex gap-2">
            {enrollment && (
              <button type="button" onClick={() => setEditing(false)} className="rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold px-4 py-2.5 text-slate-600 dark:text-slate-300">
                Cancelar
              </button>
            )}
            <button type="submit" disabled={saving} className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 disabled:opacity-50">
              {saving ? "Salvando..." : "Salvar curso"}
            </button>
          </div>
        </form>
      )}

      {enrollment && !editing && (
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Minhas disciplinas</h2>

          {enrollment.universityCourseId ? (
            localCatalogSubjects.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {localCatalogSubjects.map((s) => (
                  <SubjectCard
                    key={s.id}
                    name={s.name}
                    insight={s.insight}
                    onGenerate={() => generateCatalogInsight(s.id)}
                    generating={generatingId === s.id}
                  />
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Não encontramos disciplinas cadastradas para este semestre no catálogo.
              </p>
            )
          ) : (
            <>
              <form onSubmit={addManualSubject} className="flex gap-2">
                <input
                  type="text"
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  placeholder="Nome da disciplina (ex: Banco de Dados)"
                  className={INPUT_CLASS}
                />
                <button type="submit" className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold px-4 py-2.5">
                  <Plus className="h-3.5 w-3.5" /> Adicionar
                </button>
              </form>

              {localManualSubjects.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {localManualSubjects.map((s) => (
                    <SubjectCard
                      key={s.id}
                      name={s.name}
                      insight={s.insight}
                      onGenerate={() => generateManualInsight(s.id)}
                      onDelete={() => deleteManualSubject(s.id)}
                      generating={generatingId === s.id}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400">Adicione as disciplinas do seu período atual.</p>
              )}
            </>
          )}
        </div>
      )}
    </main>
  );
}

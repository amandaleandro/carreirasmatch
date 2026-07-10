"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";

type FormState = {
  name: string;
  objective: string;
  education: string;
  courses: string;
  experiences: string;
  skills: string;
  opportunity: string;
};

const INITIAL_FORM: FormState = {
  name: "",
  objective: "",
  education: "",
  courses: "",
  experiences: "",
  skills: "",
  opportunity: "Primeiro emprego",
};

const OPPORTUNITIES = [
  "Jovem aprendiz",
  "Primeiro emprego",
  "Estágio",
  "Faculdade ou técnico",
  "Transição de carreira",
  "Recolocação",
];

function splitLines(value: string) {
  return value
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildSummary(form: FormState) {
  const target = form.objective.trim() || form.opportunity.toLowerCase();
  const skills = splitLines(form.skills).slice(0, 3).join(", ");
  const base =
    form.opportunity === "Transição de carreira"
      ? `Profissional em transição de carreira com interesse em ${target}`
      : `Candidato em busca de ${target}`;

  return `${base}, com formação em ${form.education.trim() || "desenvolvimento profissional"}${
    skills ? ` e conhecimentos em ${skills}` : ""
  }. Perfil organizado, com disposição para aprender e contribuir em ambientes colaborativos.`;
}

export function FreeResumeBuilder() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [generated, setGenerated] = useState(false);

  const skills = useMemo(() => splitLines(form.skills), [form.skills]);
  const courses = useMemo(() => splitLines(form.courses), [form.courses]);
  const experiences = useMemo(() => splitLines(form.experiences), [form.experiences]);

  function updateField(field: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setGenerated(true);
  }

  return (
    <div className="min-h-screen">
      <header className="max-w-6xl mx-auto px-4 md:px-8 py-6 flex items-center justify-between">
        <Link href="/comece">
          <BrandLogo />
        </Link>
        <Link
          href="/login"
          className="text-sm font-semibold text-neutral-600 dark:text-neutral-300 hover:text-blue-600 transition-colors"
        >
          Entrar
        </Link>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-8 pb-14">
        <section className="py-8 md:py-12 grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr] gap-8 items-start">
          <div className="space-y-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                Currículo Inicial Grátis
              </p>
              <h1 className="mt-3 text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
                Crie seu currículo grátis em poucos minutos.
              </h1>
              <p className="mt-4 text-neutral-600 dark:text-neutral-400 max-w-xl">
                Responda algumas perguntas e receba uma versão inicial organizada para primeiro emprego, estágio,
                jovem aprendiz, transição ou recolocação.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              {[
                "Resumo profissional",
                "Cursos e formação",
                "Experiências e projetos",
                "Download visual com marca discreta",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-950/70 p-4 text-sm font-semibold"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-950/90 p-5 md:p-6 shadow-sm space-y-4"
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Nome" value={form.name} onChange={(value) => updateField("name", value)} />
              <label className="space-y-1.5">
                <span className="block text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                  Momento
                </span>
                <select
                  value={form.opportunity}
                  onChange={(event) => updateField("opportunity", event.target.value)}
                  className="w-full rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                >
                  {OPPORTUNITIES.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
            </div>
            <Field label="Objetivo" value={form.objective} onChange={(value) => updateField("objective", value)} placeholder="Ex: Estágio em suporte técnico" />
            <Area label="Escolaridade" value={form.education} onChange={(value) => updateField("education", value)} rows={2} />
            <Area label="Cursos" value={form.courses} onChange={(value) => updateField("courses", value)} rows={3} placeholder="Separe por vírgula ou linha" />
            <Area label="Experiências, projetos ou atividades" value={form.experiences} onChange={(value) => updateField("experiences", value)} rows={4} />
            <Area label="Habilidades" value={form.skills} onChange={(value) => updateField("skills", value)} rows={3} placeholder="Ex: Excel, atendimento, comunicação" />
            <button
              type="submit"
              className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-3 text-sm transition-colors"
            >
              Gerar meu currículo grátis
            </button>
          </form>
        </section>

        {generated && (
          <section className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
            <article className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 md:p-8 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Currículo inicial</p>
              <h2 className="mt-2 text-2xl font-extrabold">{form.name.trim() || "Seu nome"}</h2>
              <p className="mt-1 text-sm text-blue-600 dark:text-blue-400 font-semibold">
                {form.objective.trim() || form.opportunity}
              </p>

              <ResumeSection title="Resumo profissional">
                <p>{buildSummary(form)}</p>
              </ResumeSection>
              <ResumeSection title="Formação">
                <p>{form.education.trim() || "Informe sua escolaridade principal."}</p>
              </ResumeSection>
              <ResumeSection title="Cursos">
                <BulletList items={courses.length ? courses : ["Adicione cursos livres, oficinas ou certificações."]} />
              </ResumeSection>
              <ResumeSection title="Experiências e projetos">
                <BulletList items={experiences.length ? experiences : ["Inclua trabalhos, voluntariado, projetos escolares ou atividades informais."]} />
              </ResumeSection>
              <ResumeSection title="Habilidades">
                <div className="flex flex-wrap gap-2">
                  {(skills.length ? skills : ["Comunicação", "Organização", "Aprendizado rápido"]).map((skill) => (
                    <span key={skill} className="rounded-full bg-neutral-100 dark:bg-neutral-900 px-3 py-1 text-xs">
                      {skill}
                    </span>
                  ))}
                </div>
              </ResumeSection>
              <p className="mt-8 border-t border-neutral-100 dark:border-neutral-900 pt-4 text-[11px] text-neutral-400">
                Criado com CarreirasMatch
              </p>
            </article>

            <aside className="rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/70 dark:bg-blue-950/20 p-6 sticky top-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                Próximo passo
              </p>
              <h3 className="mt-2 text-2xl font-extrabold">Seu currículo está pronto para uma vaga real?</h3>
              <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-300">
                Faça a primeira análise por apenas R$4,90 e veja score de aderência, palavras-chave faltantes e o que ajustar antes de aplicar.
              </p>
              <Link
                href="/?track=internship"
                className="mt-5 inline-flex w-full items-center justify-center rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-3 text-sm transition-colors"
              >
                Fazer minha primeira análise
              </Link>
              <p className="mt-3 text-[11px] text-neutral-500 dark:text-neutral-400">
                Leva menos de 2 minutos. Seus dados não são compartilhados com empresas.
              </p>
            </aside>
          </section>
        )}
      </main>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="space-y-1.5">
      <span className="block text-xs font-semibold text-neutral-500 uppercase tracking-wide">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-neutral-200 dark:border-neutral-800 bg-transparent px-3 py-2.5 text-sm outline-none focus:border-blue-500"
      />
    </label>
  );
}

function Area({
  label,
  value,
  onChange,
  rows,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows: number;
  placeholder?: string;
}) {
  return (
    <label className="space-y-1.5 block">
      <span className="block text-xs font-semibold text-neutral-500 uppercase tracking-wide">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="w-full rounded-lg border border-neutral-200 dark:border-neutral-800 bg-transparent px-3 py-2.5 text-sm outline-none focus:border-blue-500"
      />
    </label>
  );
}

function ResumeSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <h3 className="text-sm font-bold uppercase tracking-wide text-neutral-500">{title}</h3>
      <div className="mt-2 text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">{children}</div>
    </section>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="list-disc pl-5 space-y-1">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

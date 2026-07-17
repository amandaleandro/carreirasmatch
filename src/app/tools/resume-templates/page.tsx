import type { Metadata } from "next";
import Link from "next/link";
import { toolMetadata } from "@/lib/tool-metadata";

export const metadata: Metadata = toolMetadata("/tools/resume-templates");

const TEMPLATES = [
  { title: "Primeiro emprego", sections: ["Contato", "Objetivo profissional", "Formação", "Cursos e projetos", "Habilidades"], tip: "Use projetos escolares, cursos e atividades práticas para demonstrar responsabilidade." },
  { title: "Estágio", sections: ["Contato e LinkedIn", "Objetivo de estágio", "Formação e previsão de conclusão", "Projetos acadêmicos", "Ferramentas e idiomas"], tip: "Deixe curso, semestre e disponibilidade fáceis de encontrar." },
  { title: "Profissional com experiência", sections: ["Contato", "Resumo profissional", "Experiências com resultados", "Formação", "Competências"], tip: "Priorize resultados recentes e retire experiências que não ajudam no cargo desejado." },
  { title: "Transição de carreira", sections: ["Contato", "Resumo de transição", "Competências transferíveis", "Projetos na nova área", "Experiência anterior", "Cursos"], tip: "Traduza sua experiência anterior para problemas que também existem na nova área." },
];

export default function ResumeTemplatesPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-12">
      <Link href="/gratuito" className="text-sm text-blue-600 hover:underline dark:text-blue-400">Voltar para recursos gratuitos</Link>
      <header className="mb-8 mt-4">
        <span className="text-xs font-bold uppercase tracking-wider text-violet-600">Cadastro grátis</span>
        <h1 className="mt-2 text-3xl font-bold">Modelos de currículo por perfil</h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">Escolha uma estrutura simples para o seu momento profissional e monte o documento sem excesso de elementos visuais.</p>
      </header>
      <div className="grid gap-5 md:grid-cols-2">
        {TEMPLATES.map((template) => <article key={template.title} className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-950"><h2 className="text-lg font-bold">{template.title}</h2><ol className="mt-4 space-y-2">{template.sections.map((section, index) => <li key={section} className="flex gap-3 text-sm"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-700 dark:bg-violet-950 dark:text-violet-300">{index + 1}</span><span>{section}</span></li>)}</ol><p className="mt-5 rounded-xl bg-neutral-50 p-3 text-sm text-neutral-600 dark:bg-neutral-900 dark:text-neutral-400"><strong>Dica: </strong>{template.tip}</p></article>)}
      </div>
      <div className="mt-8 flex flex-wrap gap-3"><Link href="/curriculo-gratis" className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700">Criar currículo grátis</Link><Link href="/tools/ats-checklist" className="rounded-xl border border-neutral-200 px-5 py-3 text-sm font-bold hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900">Abrir checklist ATS</Link></div>
    </main>
  );
}

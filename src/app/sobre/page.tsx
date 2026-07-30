import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Eye, ShieldCheck, Sparkles, Target, UsersRound } from "lucide-react";
import { ContentPage } from "@/components/content-page";

export const metadata: Metadata = {
  title: "Sobre o CarreirasMatch",
  description: "Conheça a missão, os princípios e a forma de trabalho do CarreirasMatch.",
  alternates: { canonical: "/sobre" },
};

const PRINCIPLES = [
  {
    Icon: Eye,
    title: "Clareza antes de complexidade",
    description: "Cada resultado deve explicar o que foi identificado, por que isso importa e qual é o próximo passo.",
  },
  {
    Icon: ShieldCheck,
    title: "Sem inventar experiências",
    description: "A tecnologia ajuda a apresentar melhor fatos verdadeiros. A decisão e a revisão final continuam sendo suas.",
  },
  {
    Icon: UsersRound,
    title: "Contexto importa",
    description: "Estágio, primeiro emprego, recolocação e transição exigem orientações diferentes, não uma resposta genérica.",
  },
] as const;

export default function SobrePage() {
  return (
    <ContentPage
      eyebrow="Sobre o CarreirasMatch"
      title="Mais clareza entre a vaga que você encontrou e a candidatura que vai enviar."
      description="Transformamos uma comparação difícil em ajustes práticos para você decidir e agir com mais confiança."
      wide
    >
      <div className="grid gap-8 lg:grid-cols-[1.1fr_.9fr] lg:items-start">
        <div className="space-y-4 text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-300">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Por que existimos</h2>
          <p>Muita gente tem capacidade para uma oportunidade, mas não consegue tornar essa capacidade visível no currículo ou na entrevista. Uma descrição genérica, a ausência das palavras certas e a falta de preparação podem esconder experiências relevantes.</p>
          <p>O CarreirasMatch compara o currículo com uma vaga real e transforma o diagnóstico em ações: requisitos encontrados, lacunas que ainda precisam ser comprovadas, palavras-chave, sugestões de texto e preparação para entrevista.</p>
          <p>Não prometemos contratação. Entregamos contexto para você melhorar sua apresentação sem distorcer sua história.</p>
        </div>
        <aside className="rounded-2xl bg-slate-900 p-6 text-white shadow-sm border border-slate-800 space-y-4">
          <span className="inline-flex rounded-xl bg-white/10 p-3 text-slate-200 border border-white/15"><Target className="h-6 w-6" /></span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Nossa missão</p>
            <p className="mt-2 text-lg sm:text-xl font-bold leading-snug text-white">Ajudar cada pessoa a apresentar melhor o que realmente sabe fazer.</p>
          </div>
          <p className="text-xs sm:text-sm leading-relaxed text-slate-300">Da primeira oportunidade a uma mudança de carreira, com orientação específica para o momento vivido.</p>
        </aside>
      </div>

      <section className="mt-10 border-t border-slate-200/80 pt-10 dark:border-slate-800 space-y-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Como trabalhamos</span>
          <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">Princípios que aparecem no produto</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {PRINCIPLES.map(({ Icon, title, description }) => (
            <article key={title} className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-950/50 space-y-3">
              <Icon className="h-5 w-5 text-slate-700 dark:text-slate-300" />
              <h3 className="font-bold text-slate-900 dark:text-white text-base">{title}</h3>
              <p className="text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-400">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-6 dark:border-slate-800 dark:bg-slate-950/50">
        <div className="space-y-1">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400"><Sparkles className="h-4 w-4" /> Produto em evolução</span>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Sua experiência ajuda a melhorar o CarreirasMatch.</h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Conte o que funcionou, o que ficou confuso ou o que ainda está faltando.</p>
        </div>
        <Link href="/contato" className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-5 py-2.5 text-sm font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-sm shrink-0">Falar com a gente <ArrowRight className="h-4 w-4" /></Link>
      </section>
    </ContentPage>
  );
}

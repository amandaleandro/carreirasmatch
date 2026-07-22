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
        <div className="space-y-4 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
          <h2 className="text-xl font-bold text-neutral-950 dark:text-white">Por que existimos</h2>
          <p>Muita gente tem capacidade para uma oportunidade, mas não consegue tornar essa capacidade visível no currículo ou na entrevista. Uma descrição genérica, a ausência das palavras certas e a falta de preparação podem esconder experiências relevantes.</p>
          <p>O CarreirasMatch compara o currículo com uma vaga real e transforma o diagnóstico em ações: requisitos encontrados, lacunas que ainda precisam ser comprovadas, palavras-chave, sugestões de texto e preparação para entrevista.</p>
          <p>Não prometemos contratação. Entregamos contexto para você melhorar sua apresentação sem distorcer sua história.</p>
        </div>
        <aside className="rounded-2xl bg-slate-950 p-6 text-white shadow-lg">
          <span className="inline-flex rounded-xl bg-blue-500/15 p-3 text-blue-300"><Target className="h-6 w-6" /></span>
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-blue-300">Nossa missão</p>
          <p className="mt-3 text-xl font-bold leading-snug">Ajudar cada pessoa a apresentar melhor o que realmente sabe fazer.</p>
          <p className="mt-3 text-sm leading-relaxed text-white/60">Da primeira oportunidade a uma mudança de carreira, com orientação específica para o momento vivido.</p>
        </aside>
      </div>

      <section className="mt-10 border-t border-neutral-100 pt-10 dark:border-neutral-900">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">Como trabalhamos</p>
        <h2 className="mt-2 text-xl font-bold">Princípios que aparecem no produto</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {PRINCIPLES.map(({ Icon, title, description }) => (
            <article key={title} className="rounded-2xl border border-neutral-200 bg-neutral-50/60 p-5 dark:border-neutral-800 dark:bg-neutral-900/40">
              <Icon className="h-5 w-5 text-blue-600" />
              <h3 className="mt-4 font-bold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-500">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-10 grid gap-5 rounded-2xl border border-blue-200 bg-blue-50 p-6 dark:border-blue-900 dark:bg-blue-950/20 sm:grid-cols-[1fr_auto] sm:items-center">
        <div>
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-blue-700 dark:text-blue-300"><Sparkles className="h-4 w-4" /> Produto em evolução</span>
          <h2 className="mt-2 text-lg font-bold">Sua experiência ajuda a melhorar o CarreirasMatch.</h2>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">Conte o que funcionou, o que ficou confuso ou o que ainda está faltando.</p>
        </div>
        <Link href="/contato" className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700">Falar com a gente <ArrowRight className="h-4 w-4" /></Link>
      </section>
    </ContentPage>
  );
}

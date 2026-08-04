import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Compass,
  FileText,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react";
import { PublicSiteHeader } from "@/components/public-site-header";

export const metadata: Metadata = {
  title: "Agosto da Candidatura | Membros Fundadores",
  description:
    "Prepare cada candidatura com mais clareza e entre para os 1.000 Membros Fundadores do CarreirasMatch.",
  alternates: { canonical: "/agosto" },
};

const checkoutHref =
  "/assinar?plan=pro&utm_source=agosto&utm_medium=landing&utm_campaign=membros_fundadores";

const benefits = [
  "Análises de currículo e vaga para cada candidatura",
  "Kit da primeira candidatura e documentos prontos",
  "Treinos de entrevista baseados na vaga real",
  "Central para salvar vagas e acompanhar candidaturas",
  "Checklist de recolocação e aula coletiva semanal",
  "Preço protegido enquanto a assinatura permanecer ativa",
];

const challenge = [
  ["01", "Organize seu objetivo", "Escolha o tipo de oportunidade que você quer perseguir."],
  ["02", "Revise seu currículo", "Deixe sua experiência clara e alinhada ao próximo passo."],
  ["03", "Analise uma vaga", "Descubra o Match, as lacunas e o que merece atenção."],
  ["04", "Ajuste seu posicionamento", "Atualize LinkedIn e mensagem para conversar com recrutadores."],
  ["05", "Treine a entrevista", "Pratique respostas com contexto, não perguntas genéricas."],
  ["06", "Prepare a candidatura", "Use o diagnóstico para montar uma versão específica."],
  ["07", "Envie com clareza", "Registre a candidatura e saiba qual é o próximo passo."],
] as const;

const steps = [
  [Target, "Escolha uma vaga", "Comece com uma oportunidade real, não com um currículo genérico."],
  [BarChart3, "Veja seu Match", "Entenda seus pontos fortes, lacunas e prioridades antes de clicar em candidatar."],
  [ClipboardCheck, "Prepare e acompanhe", "Ajuste seus materiais, treine e mantenha sua busca organizada."],
] as const;

export default function AugustCampaignPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-950 dark:bg-slate-950 dark:text-white">
      <PublicSiteHeader />

      <main>
        <section className="relative overflow-hidden bg-[#071827] text-white">
          <div className="absolute -right-24 -top-32 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="absolute -bottom-40 left-1/3 h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-16 md:px-8 md:py-24 lg:grid-cols-[1.1fr_.9fr] lg:items-center">
            <div className="space-y-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-300/25 bg-blue-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-blue-200">
                <Sparkles className="h-4 w-4" /> Agosto da Candidatura
              </div>
              <h1 className="max-w-3xl text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
                Pare de enviar o mesmo currículo para todas as vagas.
              </h1>
              <p className="max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
                Durante agosto, prepare cada candidatura com mais clareza: compare seu perfil com a vaga, ajuste seus materiais e treine para a conversa que pode vir depois.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href={checkoutHref} className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-500 px-7 py-4 text-sm font-bold text-white shadow-lg shadow-blue-950/30 transition hover:bg-blue-400">
                  Entrar como membro fundador <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="#desafio" className="inline-flex items-center justify-center rounded-full border border-white/20 px-7 py-4 text-sm font-semibold text-slate-200 transition hover:bg-white/10">
                  Ver o desafio de 7 dias
                </Link>
              </div>
              <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-slate-300">
                <span className="inline-flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" /> Análise inicial gratuita</span>
                <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-400" /> Sem inventar experiência</span>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/[0.07] p-6 shadow-2xl shadow-black/20 backdrop-blur-sm sm:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-200">1.000 Membros Fundadores</p>
              <div className="mt-5 flex items-end gap-2">
                <span className="text-5xl font-extrabold tracking-tight">R$ 24,90</span>
                <span className="pb-2 text-sm text-slate-400">/ mês</span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">Preço protegido enquanto sua assinatura permanecer ativa.</p>
              <div className="my-6 h-px bg-white/10" />
              <ul className="space-y-3">
                {benefits.slice(0, 4).map((benefit) => (
                  <li key={benefit} className="flex items-start gap-3 text-sm text-slate-200"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />{benefit}</li>
                ))}
              </ul>
              <Link href={checkoutHref} className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-bold text-[#071827] transition hover:bg-blue-50">
                Quero preparar minha busca <ArrowRight className="h-4 w-4" />
              </Link>
              <p className="mt-3 text-center text-[11px] text-slate-400">Bônus disponíveis até 31 de agosto ou até completar 1.000 membros.</p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">Uma jornada, não mais uma ferramenta</p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">Da vaga encontrada à candidatura preparada.</h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-400">O produto já existe. O plano é organizar cada etapa para você saber o que fazer depois do primeiro resultado.</p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {steps.map(([Icon, title, description]) => (
              <div key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400"><Icon className="h-5 w-5" /></span>
                <h3 className="mt-5 text-base font-bold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{description}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="desafio" className="border-y border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/50">
          <div className="mx-auto max-w-7xl px-4 py-16 md:px-8">
            <div className="grid gap-10 lg:grid-cols-[.75fr_1.25fr] lg:items-start">
              <div className="space-y-4 lg:sticky lg:top-24">
                <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400"><Compass className="h-4 w-4" /> Ativação</span>
                <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">7 dias para preparar sua busca.</h2>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">Cada dia termina com uma ação concreta. A assinatura entra como o espaço para executar, registrar e acompanhar o plano.</p>
                <Link href={checkoutHref} className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400">Começar agora <ArrowRight className="h-4 w-4" /></Link>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {challenge.map(([number, title, description]) => (
                  <div key={number} className="flex gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950">
                    <span className="text-sm font-extrabold text-blue-600 dark:text-blue-400">{number}</span>
                    <div><h3 className="text-sm font-bold">{title}</h3><p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{description}</p></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-16 text-center md:px-8">
          <MessageSquareText className="mx-auto h-8 w-8 text-blue-600 dark:text-blue-400" />
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight">A próxima candidatura começa antes do botão “enviar”.</h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-400">Entre como membro fundador e transforme seu próximo movimento profissional em um processo acompanhado, específico e mensurável.</p>
          <Link href={checkoutHref} className="mt-7 inline-flex items-center gap-2 rounded-full bg-blue-600 px-7 py-4 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700">Entrar para os Membros Fundadores <ArrowRight className="h-4 w-4" /></Link>
          <div className="mt-8 flex flex-wrap justify-center gap-5 text-xs text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-2"><FileText className="h-4 w-4" /> Currículo por vaga</span>
            <span className="inline-flex items-center gap-2"><Target className="h-4 w-4" /> Match explicado</span>
            <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Decisão mais segura</span>
          </div>
        </section>
      </main>
    </div>
  );
}

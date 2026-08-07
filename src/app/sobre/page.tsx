import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Eye, ShieldCheck, Sparkles, Target, UsersRound } from "lucide-react";
import { ContentPage } from "@/components/content-page";

export const metadata: Metadata = {
  title: "Sobre o CarreirasMatch",
  description: "O CarreirasMatch acompanha toda a sua carreira: escolha de profissão, estudos, primeiro emprego, recolocação e trabalho freelancer, em um só lugar.",
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
      title="Sua carreira inteira, do primeiro passo à próxima conquista, em um só lugar."
      description="Escolher profissão, estudar para concurso ou vestibular, conseguir estágio, entrar no mercado, mudar de área ou trabalhar por conta: cada momento tem uma resposta diferente, e é isso que oferecemos."
      wide
    >
      <div className="grid gap-8 lg:grid-cols-[1.1fr_.9fr] lg:items-start">
        <div className="space-y-4 text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-300">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Por que existimos</h2>
          <p>Carreira não é um único problema, é uma sequência deles: qual profissão seguir, como passar num concurso ou vestibular, como conseguir o primeiro estágio, como se candidatar sem perder o que já foi construído, como mudar de área sem começar do zero. A maioria das ferramentas resolve só um pedaço disso.</p>
          <p>O CarreirasMatch reúne teste vocacional, radar de concurso e vestibular, comparação de currículo com vaga real, candidatura automática, marketplace freelancer e acompanhamento de evolução, para que a pessoa não precise trocar de plataforma a cada fase da carreira.</p>
          <p>O diagnóstico entre currículo e vaga segue sendo o ponto de entrada mais usado: requisitos encontrados, lacunas que ainda precisam ser comprovadas, palavras-chave e preparação para entrevista. Mas é uma ferramenta dentro de um acompanhamento maior, não o produto inteiro.</p>
        </div>
        <aside className="rounded-2xl bg-slate-900 p-6 text-white shadow-sm border border-slate-800 space-y-4">
          <span className="inline-flex rounded-xl bg-white/10 p-3 text-slate-200 border border-white/15"><Target className="h-6 w-6" /></span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Nossa missão</p>
            <p className="mt-2 text-lg sm:text-xl font-bold leading-snug text-white">Ser o lugar em que carreira é pensada, do primeiro passo à próxima conquista.</p>
          </div>
          <p className="text-xs sm:text-sm leading-relaxed text-slate-300">Escolha, estudo, candidatura, entrevista e evolução, com orientação específica para o momento vivido.</p>
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

      <section className="mt-10 border-t border-slate-200/80 pt-10 dark:border-slate-800 space-y-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Metodologia editorial</span>
          <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">Como produzimos o conteúdo do blog</h2>
        </div>
        <div className="space-y-3 text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-300">
          <p>Os artigos do blog são redigidos com apoio de IA a partir de diretrizes editoriais definidas pela equipe do CarreirasMatch: cada texto precisa trazer um ângulo específico sobre a carreira tratada, evitar generalidades e citar situações concretas da rotina profissional em vez de repetir um roteiro genérico.</p>
          <p>Não atribuímos os textos a autores individuais fictícios nem inventamos credenciais: a responsabilidade editorial é da equipe do CarreirasMatch como um todo, identificada em cada artigo. Erros, imprecisões ou desatualizações podem ser reportados por qualquer leitor através da <Link href="/contato" className="font-medium underline">página de contato</Link>, e o conteúdo é corrigido a partir desse retorno.</p>
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

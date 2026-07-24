import { Metadata } from "next";
import Link from "next/link";
import { PublicSiteHeader } from "@/components/public-site-header";
import { SiteFooter } from "@/components/site-footer";
import { HIGH_SCHOOL_SUBJECTS } from "@/lib/ensino-medio";
import { EnsinoMedioToolsNav } from "@/components/ensino-medio-tools-nav";
import {
  BookOpen,
  GraduationCap,
  Sparkles,
  Trophy,
  Calculator,
  Dna,
  Zap,
  FlaskConical,
  Landmark,
  Globe,
  Brain,
  ArrowRight,
  FileEdit,
  Calendar,
  Scale,
  Bot,
  HelpCircle,
  Award,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Ensino Médio, Matérias, Redação ENEM & Faculdade vs Técnico | CarreirasMatch",
  description:
    "Estude para o Ensino Médio e ENEM com IA Gemini: resumos, corretor de redação 0-1000, cronograma de estudos, tutor virtual 24h e comparador de Faculdade vs Técnico.",
  alternates: { canonical: "/ensino-medio" },
};

const ICON_MAP: Record<string, React.ReactNode> = {
  Calculator: <Calculator className="h-6 w-6 text-blue-600 dark:text-blue-400" />,
  BookOpen: <BookOpen className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />,
  Dna: <Dna className="h-6 w-6 text-rose-600 dark:text-rose-400" />,
  Zap: <Zap className="h-6 w-6 text-amber-600 dark:text-amber-400" />,
  FlaskConical: <FlaskConical className="h-6 w-6 text-purple-600 dark:text-purple-400" />,
  Landmark: <Landmark className="h-6 w-6 text-amber-700 dark:text-amber-300" />,
  Globe: <Globe className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />,
  Brain: <Brain className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />,
};

export default function EnsinoMedioHubPage() {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50 font-sans">
      <PublicSiteHeader />
      <EnsinoMedioToolsNav />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 md:px-8 py-10 space-y-12">
        {/* Hero Header */}
        <header className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-indigo-500/10 border border-blue-500/20 px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            <Sparkles className="h-3.5 w-3.5" />
            Suíte Completa para o Ensino Médio & ENEM
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-neutral-900 dark:text-white leading-tight">
            Estude, Treine e Escolha Seu Futuro
          </h1>
          <p className="text-neutral-600 dark:text-neutral-300 text-sm md:text-base leading-relaxed max-w-2xl mx-auto">
            Corrija sua redação do ENEM, gere cronogramas de estudo, tire dúvidas no Tutor AI 24h e compare opções entre **Faculdade (Graduação)** ou **Curso Técnico**.
          </p>
        </header>

        {/* Grid das 5 Ferramentas Especiais de IA */}
        <section className="space-y-4">
          <h2 className="text-xl font-extrabold text-neutral-900 dark:text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            Ferramentas Inteligentes de Estudo (Gemini AI)
          </h2>

          <div className="grid gap-4 md:grid-cols-3">
            {/* Tool 1: Redação */}
            <Link
              href="/ensino-medio/redacao"
              className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-blue-500 transition-all space-y-3 shadow-2xs hover:shadow-md group"
            >
              <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-600 w-fit group-hover:scale-110 transition-transform">
                <FileEdit className="h-6 w-6" />
              </div>
              <h3 className="font-extrabold text-base text-neutral-900 dark:text-white group-hover:text-blue-600">
                Corretor de Redação ENEM
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Avaliação oficial de 0 a 1000 pontos nas 5 competências do ENEM com análise gramatical e sugestões de repertório.
              </p>
            </Link>

            {/* Tool 2: Calculadora ENEM */}
            <Link
              href="/ensino-medio/calculadora-enem"
              className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-emerald-500 transition-all space-y-3 shadow-2xs hover:shadow-md group"
            >
              <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 w-fit group-hover:scale-110 transition-transform">
                <Calculator className="h-6 w-6" />
              </div>
              <h3 className="font-extrabold text-base text-neutral-900 dark:text-white group-hover:text-emerald-600">
                Calculadora Média ENEM
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Simule suas notas no ENEM e calcule a média ponderada com os pesos das universidades para o curso dos seus sonhos.
              </p>
            </Link>

            {/* Tool 3: Cronograma */}
            <Link
              href="/ensino-medio/cronograma"
              className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-purple-500 transition-all space-y-3 shadow-2xs hover:shadow-md group"
            >
              <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-600 w-fit group-hover:scale-110 transition-transform">
                <Calendar className="h-6 w-6" />
              </div>
              <h3 className="font-extrabold text-base text-neutral-900 dark:text-white group-hover:text-purple-600">
                Cronograma de Estudos
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Planejador semanal personalizado conforme seu tempo livre e matérias onde você mais precisa melhorar.
              </p>
            </Link>

            {/* Tool 3: Comparador */}
            <Link
              href="/ensino-medio/comparador"
              className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-indigo-500 transition-all space-y-3 shadow-2xs hover:shadow-md group"
            >
              <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-600 w-fit group-hover:scale-110 transition-transform">
                <Scale className="h-6 w-6" />
              </div>
              <h3 className="font-extrabold text-base text-neutral-900 dark:text-white group-hover:text-indigo-600">
                Faculdade vs Curso Técnico
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Compare estimativas de nota de corte no SISU, mensalidade, tempo de curso e velocidade de entrada no mercado.
              </p>
            </Link>

            {/* Tool 4: Tutor AI 24h */}
            <Link
              href="/ensino-medio/tutor"
              className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-emerald-500 transition-all space-y-3 shadow-2xs hover:shadow-md group"
            >
              <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 w-fit group-hover:scale-110 transition-transform">
                <Bot className="h-6 w-6" />
              </div>
              <h3 className="font-extrabold text-base text-neutral-900 dark:text-white group-hover:text-emerald-600">
                Tutor Virtual AI 24h
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Chat de monitoria para tirar qualquer dúvida de dever de casa e entender resoluções passo a passo.
              </p>
            </Link>

            {/* Tool 5: Redações Nota 1000 */}
            <Link
              href="/ensino-medio/redacao-nota-1000"
              className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-rose-500 transition-all space-y-3 shadow-2xs hover:shadow-md group"
            >
              <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-600 w-fit group-hover:scale-110 transition-transform">
                <Award className="h-6 w-6" />
              </div>
              <h3 className="font-extrabold text-base text-neutral-900 dark:text-white group-hover:text-rose-600">
                Redações Nota 1000
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Analise redações modelo parágrafo por parágrafo com explicações detalhadas por competência e repertório.
              </p>
            </Link>

            {/* Tool 6: Questão do Dia */}
            <Link
              href="/ensino-medio/questao-do-dia"
              className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-amber-500 transition-all space-y-3 shadow-2xs hover:shadow-md group"
            >
              <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-600 w-fit group-hover:scale-110 transition-transform">
                <HelpCircle className="h-6 w-6" />
              </div>
              <h3 className="font-extrabold text-base text-neutral-900 dark:text-white group-hover:text-amber-600">
                Questão do Dia & Desafios
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Mantenha a rotina com uma questão inédita do ENEM/Vestibulares diariamente com dicas e resolução comentada.
              </p>
            </Link>
          </div>
        </section>

        {/* Grid de Disciplinas do Ensino Médio */}
        <section className="space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-4">
            <div>
              <h2 className="text-2xl font-extrabold text-neutral-900 dark:text-white">
                Matérias do Ensino Médio
              </h2>
              <p className="text-xs md:text-sm text-neutral-500">
                Resumos didáticos, quizzes gamificados, flashcards 3D e perguntas V/F.
              </p>
            </div>
            <Link
              href="/jogos"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
            >
              <Trophy className="h-4 w-4" />
              Ver Todos os Jogos Gamificados
            </Link>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {HIGH_SCHOOL_SUBJECTS.map((subject) => (
              <Link
                key={subject.slug}
                href={`/ensino-medio/${subject.slug}`}
                className="group rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 flex flex-col justify-between hover:border-blue-500 dark:hover:border-blue-500 shadow-2xs hover:shadow-md transition-all relative overflow-hidden"
              >
                <div className="space-y-4">
                  <div className="rounded-2xl bg-neutral-100 dark:bg-neutral-800 p-3.5 w-fit group-hover:scale-110 transition-transform">
                    {ICON_MAP[subject.iconName] || <BookOpen className="h-6 w-6 text-blue-600" />}
                  </div>

                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400">
                      {subject.category}
                    </span>
                    <h3 className="text-lg font-extrabold text-neutral-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {subject.name}
                    </h3>
                  </div>

                  <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed line-clamp-2">
                    {subject.description}
                  </p>
                </div>

                <div className="pt-6 border-t border-neutral-100 dark:border-neutral-800/60 mt-4 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-neutral-500 font-medium">
                    <span>{subject.topics.length} tópicos práticos</span>
                    <span className="flex items-center gap-1 font-bold text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform">
                      Estudar <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

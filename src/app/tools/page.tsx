import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { CAREER_SEGMENT_LABELS, normalizeCareerSegment, type CareerSegment } from "@/lib/career-segments";
import { toolsForSegment, type ToolCatalogEntry, type ToolIcon, type ToolColor } from "@/lib/tools-catalog";
import { matchAreaSlug } from "@/lib/vocation-areas";
import {
  Sparkles,
  Lock,
  ArrowRight,
  CheckCircle2,
  Zap,
  Wrench,
  Star,
  Award,
  Compass,
  Mic,
  FilePlus,
  Scale,
  PenTool,
  Code2,
  Share2,
} from "lucide-react";

export const metadata = {
  title: "Ferramentas & Recursos de Carreira | CarreirasMatch",
  description: "Ferramentas práticas e simuladores para impulsionar seu desempenho profissional.",
};

import { hasActiveSubscriptionAccess } from "@/lib/entitlements";

export default async function ToolsPage() {
  const session = await auth();
  const user = session?.user?.id
    ? await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { careerSegment: true, professionalArea: true },
      })
    : null;

  const isPaidUser = session?.user?.id
    ? await hasActiveSubscriptionAccess(session.user.id)
    : false;

  const segment = normalizeCareerSegment(user?.careerSegment);
  const userAreaSlug = matchAreaSlug(user?.professionalArea);
  const { recommended, others } = toolsForSegment(segment, userAreaSlug);

  // Se o usuário já definiu o momento de carreira, exibimos exclusivamente as ferramentas do momento dele.
  const displayTools = [...recommended, ...others];

  return (
    <main className="max-w-6xl mx-auto px-4 md:px-8 py-8 w-full space-y-10">
      {/* Top Header / Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard"
          className="text-xs font-semibold text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors inline-flex items-center gap-1.5"
        >
          <span>← Voltar ao Painel</span>
        </Link>

        <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider rounded-full px-3 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
          <Award className="w-3.5 h-3.5" />
          <span>Recursos Profissionais</span>
        </span>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 text-white p-6 sm:p-10 shadow-2xl border border-blue-900/40">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider rounded-full px-3.5 py-1 bg-blue-500/15 text-blue-300 border border-blue-400/30 backdrop-blur-md">
            <Wrench className="w-3.5 h-3.5 text-blue-400" />
            <span>Hub de Ferramentas Personalizadas</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-blue-200">
            Ferramentas Selecionadas para o seu Momento
          </h1>

          <p className="text-slate-300 max-w-2xl text-sm sm:text-base md:text-lg leading-relaxed font-normal">
            Simuladores, orientações e assistentes ajustados ao seu objetivo profissional para impulsionar seu progresso.
          </p>

          {segment ? (
            <div className="pt-2 inline-flex items-center gap-2 text-xs sm:text-sm bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/15">
              <span className="text-slate-300">Exibindo ferramentas para:</span>
              <strong className="text-amber-300 font-bold">{CAREER_SEGMENT_LABELS[segment]}</strong>
              <span className="text-slate-400">•</span>
              <Link href="/settings" className="text-blue-300 hover:underline font-semibold">
                Alterar momento
              </Link>
            </div>
          ) : (
            <div className="pt-2 inline-flex items-center gap-2 text-xs sm:text-sm bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/15">
              <span className="text-slate-300">Defina seu momento para filtrar as ferramentas certas:</span>
              <Link href="/settings" className="text-amber-300 hover:underline font-bold">
                Escolher momento →
              </Link>
            </div>
          )}
        </div>

        {/* Feature Pill Highlights */}
        <div className="relative z-10 mt-8 pt-6 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Simulações com IA</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
            <span>Análises em Tempo Real</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Resultado Instantâneo</span>
          </div>
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-purple-400 shrink-0" />
            <span>{session?.user?.id ? "Acesso Liberado" : "Ferramentas Gratuitas"}</span>
          </div>
        </div>
      </section>

      {/* Humorous Banner for Free Account Users */}
      {session?.user?.id && !isPaidUser && (
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-blue-500/10 border border-amber-500/30 p-6 sm:p-7 shadow-sm transition-all hover:border-amber-500/50">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 bg-amber-500/15 border border-amber-500/30 px-3 py-0.5 rounded-full">
                <span>☕ Alerta de Carreira no Modo Econômico</span>
              </div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white leading-tight">
                Seu currículo não merece trabalhar a meio-vapor! 🚀
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Você está no cadastro gratuito. Que tal sair da fila e destravar análises ilimitadas por IA, simulações de entrevista prioritárias e relatórios completos? O café é por sua conta, o emprego é por nossa! 😉
              </p>
            </div>
            <Link
              href="/assinar"
              className="shrink-0 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-xs sm:text-sm px-5 py-3.5 shadow-md transition-all hover:scale-[1.02]"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Quero o Plano Pro ✨</span>
            </Link>
          </div>
        </section>
      )}

      {/* Recommended Tools Grid - Only tools for user's career moment */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            {segment
              ? `Ferramentas para seu momento (${displayTools.length})`
              : `Todas as ferramentas disponíveis (${displayTools.length})`}
          </h2>
        </div>
        <ToolGrid
          tools={displayTools}
          highlight
          segment={segment}
          isPaidUser={isPaidUser}
          isLoggedIn={Boolean(session?.user?.id)}
        />
      </section>
    </main>
  );
}

function ToolGrid({
  tools,
  highlight,
  locked,
  segment,
  isPaidUser = false,
  isLoggedIn = false,
}: {
  tools: ToolCatalogEntry[];
  highlight?: boolean;
  locked?: boolean;
  segment?: CareerSegment | null;
  isPaidUser?: boolean;
  isLoggedIn?: boolean;
}) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {tools.map((tool) => {
        const belongsToSegment = !segment || tool.segments.includes(segment);
        const isLocked = Boolean(locked) || (!tool.free && (!belongsToSegment || (!tool.accountFree && !isPaidUser)));
        const lockLabel = !belongsToSegment ? "Disponível para outro perfil" : "Disponível no plano";

        const badge = isLoggedIn ? (
          isLocked ? (
            <span className="rounded-md bg-slate-200 dark:bg-slate-800 text-slate-500 px-2.5 py-0.5 text-xs font-semibold inline-flex items-center gap-1">
              <Lock className="h-3 w-3" />
              {lockLabel}
            </span>
          ) : highlight ? (
            <span className="rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 px-2.5 py-0.5 text-xs font-semibold flex items-center gap-1">
              <Star className="w-3 h-3 fill-amber-500" />
              Recomendada
            </span>
          ) : isLocked ? (
            <span className="rounded-md bg-slate-200 dark:bg-slate-800 text-slate-500 px-2.5 py-0.5 text-xs font-semibold inline-flex items-center gap-1">
              <Lock className="h-3 w-3" />
              Bloqueada
            </span>
          ) : (
            <span className="rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold">
              Disponível
            </span>
          )
        ) : tool.free ? (
          <span className="rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold">
            100% Grátis
          </span>
        ) : tool.accountFree ? (
          <span className="rounded-md bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20 px-2.5 py-0.5 text-xs font-semibold">
            Com Cadastro
          </span>
        ) : highlight ? (
          <span className="rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 px-2.5 py-0.5 text-xs font-semibold flex items-center gap-1">
            <Star className="w-3 h-3 fill-amber-500" />
            Recomendada
          </span>
        ) : isLocked ? (
          <span className="rounded-md bg-slate-200 dark:bg-slate-800 text-slate-500 px-2.5 py-0.5 text-xs font-semibold inline-flex items-center gap-1">
            <Lock className="h-3 w-3" />
            Bloqueada
          </span>
        ) : null;

        if (isLocked) {
          return (
            <div
              key={tool.href}
              className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 p-6 opacity-60 cursor-not-allowed"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <ToolIconBadge icon={tool.icon} color={tool.color} locked />
                  {badge}
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base leading-snug">{tool.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{tool.description}</p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-200/60 dark:border-slate-800/60 text-xs text-slate-400">
                {lockLabel}. Assine para desbloquear os recursos completos.
              </div>
            </div>
          );
        }

        return (
          <Link
            key={tool.href}
            href={tool.href}
            className={`group relative flex flex-col justify-between rounded-2xl border p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl ${
              highlight
                ? "border-blue-200 dark:border-blue-900/60 bg-white dark:bg-slate-900 hover:border-blue-500 dark:hover:border-blue-600 shadow-sm"
                : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-400 dark:hover:border-slate-600 shadow-sm"
            }`}
          >
            <div className="space-y-3.5">
              <div className="flex items-start justify-between gap-2">
                <ToolIconBadge icon={tool.icon} color={tool.color} />
                {badge}
              </div>

              <h3 className="font-bold text-slate-900 dark:text-white text-base leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {tool.title}
              </h3>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {tool.description}
              </p>
            </div>

            <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-blue-600 dark:text-blue-400">
              <span>Acessar Ferramenta</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        );
      })}
    </div>
  );
}

const COLOR_CLASSES: Record<ToolColor, string> = {
  blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20",
  amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
  emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
  indigo: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20",
  violet: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20",
  rose: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20",
};

function ToolIconBadge({ icon, color, locked }: { icon: ToolIcon; color: ToolColor; locked?: boolean }) {
  return (
    <span
      className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${
        locked
          ? "bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-500"
          : COLOR_CLASSES[color]
      }`}
    >
      <ToolLucideIcon icon={icon} className="h-6 w-6" />
    </span>
  );
}

function ToolLucideIcon({ icon, className }: { icon: ToolIcon; className?: string }) {
  switch (icon) {
    case "sparkles":
      return <Sparkles className={className} />;
    case "compass":
      return <Compass className={className} />;
    case "mic":
      return <Mic className={className} />;
    case "filePlus":
      return <FilePlus className={className} />;
    case "linkedin":
      return <Share2 className={className} />;
    case "github":
      return <Code2 className={className} />;
    case "scale":
      return <Scale className={className} />;
    case "pen":
      return <PenTool className={className} />;
    default:
      return <Wrench className={className} />;
  }
}

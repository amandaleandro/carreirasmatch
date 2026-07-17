import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { CAREER_SEGMENT_LABELS, normalizeCareerSegment } from "@/lib/career-segments";
import { toolsForSegment, type ToolCatalogEntry, type ToolIcon, type ToolColor } from "@/lib/tools-catalog";

export default async function ToolsPage() {
  const session = await auth();
  const user = session?.user?.id
    ? await prisma.user.findUnique({ where: { id: session.user.id }, select: { careerSegment: true } })
    : null;
  const segment = normalizeCareerSegment(user?.careerSegment);
  const { recommended, others } = toolsForSegment(segment);

  return (
    <main className="max-w-5xl mx-auto px-4 py-12 w-full">
      <Link href="/dashboard" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
        ← Voltar
      </Link>

      <header className="relative mt-4 mb-10 overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 p-5 md:p-8 shadow-lg shadow-blue-950/20">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-amber-400/20 blur-2xl" />
        <div className="absolute -left-6 bottom-0 h-28 w-28 rounded-full bg-white/10 blur-2xl" />
        <p className="relative inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-amber-300">
          🏆 Recursos do Plano Profissional
        </p>
        <h1 className="relative text-2xl md:text-3xl font-bold tracking-tight text-white mt-2">Ferramentas</h1>
        <p className="relative text-blue-100 mt-2 max-w-xl">
          Ferramentas extras para complementar seu diagnóstico principal e acelerar sua carreira.
        </p>
        {segment && (
          <p className="relative text-sm text-blue-100/90 mt-3">
            Mostrando recomendações para: <span className="font-medium text-white">{CAREER_SEGMENT_LABELS[segment]}</span>, {" "}
            <Link href="/settings" className="text-amber-300 hover:underline">
              alterar
            </Link>
          </p>
        )}
        {!segment && (
          <p className="relative text-sm text-blue-100/90 mt-3">
            <Link href="/settings" className="text-amber-300 hover:underline font-medium">
              Conte qual é o seu momento
            </Link>{" "}
            para ver recomendações personalizadas.
          </p>
        )}
      </header>

      {recommended.length > 0 && (
        <section className="mb-10">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400 mb-4 flex items-center gap-2">
            <span className="text-amber-500">★</span> Recomendadas para você
          </h2>
          <ToolGrid tools={recommended} highlight />
        </section>
      )}

      {others.length > 0 && (
        <section>
          {recommended.length > 0 && (
            <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500 mb-4">
              Fora do seu perfil
            </h2>
          )}
          <ToolGrid tools={others} locked />
        </section>
      )}
    </main>
  );
}

function ToolGrid({
  tools,
  highlight,
  locked,
}: {
  tools: ToolCatalogEntry[];
  highlight?: boolean;
  locked?: boolean;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {tools.map((tool) => {
        // Guia aberto nunca aparece bloqueado: é público, então vale a pena
        // mesmo para quem está fora do segmento recomendado.
        const isLocked = Boolean(locked) && !tool.free && !tool.accountFree;
        const content = (
          <>
            {tool.free ? (
              <span className="absolute right-4 top-4 text-[10px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/50 rounded-full px-2 py-0.5">
                Cadastro grátis
              </span>
            ) : tool.accountFree ? (
              <span className="absolute right-4 top-4 text-[10px] font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-950/50 rounded-full px-2 py-0.5">
                Cadastro grátis
              </span>
            ) : highlight ? (
              <span className="absolute right-4 top-4 text-[10px] font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/50 rounded-full px-2 py-0.5">
                Recomendada
              </span>
            ) : isLocked ? (
              <span className="absolute right-4 top-4 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-neutral-500 bg-neutral-100 dark:bg-neutral-800 rounded-full px-2 py-0.5">
                <LockIcon className="h-3 w-3" />
                Bloqueada
              </span>
            ) : null}
            <ToolIconBadge icon={tool.icon} color={tool.color} locked={isLocked} />
            <h3 className="font-semibold mt-4 mb-1 pr-16">{tool.title}</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 flex-1">{tool.description}</p>
            {isLocked ? (
              <span className="mt-4 text-sm text-neutral-500">Não disponível para o seu perfil</span>
            ) : (
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-blue-600 dark:text-blue-400">
                Abrir ferramenta
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </span>
            )}
          </>
        );

        if (isLocked) {
          return (
            <div
              key={tool.href}
              aria-disabled
              className="group relative flex flex-col rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-900/40 p-5 opacity-70 cursor-not-allowed"
            >
              {content}
            </div>
          );
        }

        return (
          <Link
            key={tool.href}
            href={tool.href}
            className={`group relative flex flex-col rounded-2xl border p-5 transition-all hover:-translate-y-1 hover:shadow-lg ${
              highlight
                ? "border-blue-200 dark:border-blue-900/60 bg-blue-50/40 dark:bg-blue-950/20 hover:border-blue-400 dark:hover:border-blue-700 hover:shadow-blue-950/10"
                : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600"
            }`}
          >
            {content}
          </Link>
        );
      })}
    </div>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="5" y="10.5" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

const COLOR_CLASSES: Record<ToolColor, string> = {
  blue: "bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400",
  amber: "bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400",
  emerald: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400",
  indigo: "bg-indigo-100 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400",
  violet: "bg-violet-100 text-violet-600 dark:bg-violet-950/50 dark:text-violet-400",
  rose: "bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400",
};

function ToolIconBadge({ icon, color, locked }: { icon: ToolIcon; color: ToolColor; locked?: boolean }) {
  return (
    <span
      className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${
        locked ? "bg-neutral-200 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-500" : COLOR_CLASSES[color]
      }`}
    >
      <ToolSvgIcon icon={icon} className="h-5 w-5" />
    </span>
  );
}

function ToolSvgIcon({ icon, className }: { icon: ToolIcon; className?: string }) {
  switch (icon) {
    case "sparkles":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
          <path d="M12 3.5 13.5 8l4.5 1.5-4.5 1.5-1.5 4.5-1.5-4.5L6 9.5 10.5 8 12 3.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M18.5 15.5 19.3 17.7 21.5 18.5 19.3 19.3 18.5 21.5 17.7 19.3 15.5 18.5 17.7 17.7 18.5 15.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
        </svg>
      );
    case "compass":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
          <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
          <path d="m14.5 9.5-1.5 5-5 1.5 1.5-5 5-1.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
        </svg>
      );
    case "mic":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
          <rect x="9" y="2.5" width="6" height="11" rx="3" stroke="currentColor" strokeWidth="1.6" />
          <path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21.5M8.5 21.5h7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case "filePlus":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
          <path d="M7 3h7l4 4v14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M14 3v4h4" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M12 12.5v5M9.5 15h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case "linkedin":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
          <rect x="3.5" y="3.5" width="17" height="17" rx="3" stroke="currentColor" strokeWidth="1.6" />
          <path d="M7.8 10v6.2M7.8 7.7v.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M11.5 16.2V10M11.5 12.5c0-1.4 1-2.5 2.4-2.5s2.1 1 2.1 2.7v3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "github":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
          <path d="m9 8-4 4 4 4M15 8l4 4-4 4M13.5 5.5l-3 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "scale":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
          <path d="M12 4v16M8 20h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M12 6 5 8.5m7-2.5 7 2.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M5 8.5 3 13a2.5 2.5 0 0 0 4 0L5 8.5ZM19 8.5 17 13a2.5 2.5 0 0 0 4 0l-2-4.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        </svg>
      );
    case "pen":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
          <path d="m14.5 4.5 5 5L8 21H3v-5L14.5 4.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
          <path d="m12.5 6.5 5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
  }
}

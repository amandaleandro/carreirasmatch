import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { hasToolAccess } from "@/lib/tool-access";
import { ToolAccessGate } from "@/components/ToolAccessGate";
import { requireSubscriptionPage } from "@/lib/require-subscription-page";
import { hasFullAccessEmail } from "@/lib/full-access-users";
import { EXAM_ARCHIVE } from "@/lib/exam-archive";
import { MockExamLauncher } from "./MockExamRunner";

const TOOL_HREF = "/tools/vocation-test";

export default async function ExamArchivePage() {
  const session = await requireSubscriptionPage();

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { careerSegment: true },
  });

  if (!hasFullAccessEmail(session.user.email) && !hasToolAccess(user?.careerSegment, TOOL_HREF)) {
    return <ToolAccessGate hasSegment={Boolean(user?.careerSegment)} />;
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-12 w-full">
      <Link href="/tools/vocation-test" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
        ← Voltar para o teste vocacional
      </Link>
      <header className="mt-4 mb-10">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Provas anteriores</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-2">
          ENEM, ITA e vestibular unificado UFSC/IFSC/IFC dos últimos anos, direto das fontes
          oficiais, para você treinar.
        </p>
      </header>

      <div className="space-y-8">
        {EXAM_ARCHIVE.map((institution) => (
          <section key={institution.slug}>
            <h2 className="font-semibold text-lg">{institution.name}</h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
              {institution.description}
            </p>
            <div className="space-y-3">
              {institution.years.map((y) => (
                <div
                  key={y.year}
                  className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4"
                >
                  <p className="text-sm font-medium mb-2">{y.year}</p>
                  <div className="flex flex-wrap items-start gap-2">
                    {y.files.map((f) => (
                      <div key={f.path} className="flex items-center gap-1.5">
                        <a
                          href={f.path}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs rounded-full px-3 py-1 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:underline"
                        >
                          {f.label}
                        </a>
                        {!f.label.toLowerCase().includes("gabarito") && (
                          <MockExamLauncher path={f.path} label={`${institution.name} ${y.year} ${f.label}`} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}

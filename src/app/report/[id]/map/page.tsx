import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { TRACK_LABELS, CareerTrack } from "@/components/analysis-display";
import { canViewFullDiagnostic } from "@/lib/entitlements";

export const dynamic = "force-dynamic";

function MapSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-5 shadow-sm shadow-slate-900/5">
      <h3 className="font-semibold mb-3">{title}</h3>
      {children}
    </div>
  );
}

export default async function OpportunityMapPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;
  const record = await prisma.analysis.findUnique({ where: { id }, include: { resume: true } });

  if (!record || record.resume.userId !== session.user.id) notFound();

  if (!(await canViewFullDiagnostic(session.user.id, id))) {
    redirect(`/report/${id}`);
  }

  const keywordsMissing: string[] = JSON.parse(record.keywordsMissing);
  const studyPlan: { essential: string[]; niceToHave: string[]; later: string[] } =
    JSON.parse(record.studyPlan);
  const fixes: string[] = JSON.parse(record.fixes);
  const alternativeRoles: string[] = JSON.parse(record.alternativeRoles);
  const bridgeRoles: string[] | null = record.bridgeRoles
    ? JSON.parse(record.bridgeRoles)
    : null;

  const nearbyRoles = bridgeRoles ?? studyPlan.niceToHave;

  const statusText =
    record.applicationStatus === "apply_now"
      ? "Seu perfil está bem alinhado com esta vaga agora."
      : record.applicationStatus === "adjust_first"
      ? "Você tem chance nesta vaga, mas vale ajustar alguns pontos antes de aplicar."
      : "Esta vaga específica está distante do seu perfil atual, considere as alternativas abaixo.";

  return (
    <main className="max-w-3xl mx-auto px-4 py-12 w-full">
      <Link
        href={`/report/${id}`}
        className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
      >
        ← Voltar para o diagnóstico
      </Link>
      <header className="mt-4 mb-8">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider rounded-full px-3 py-1 mb-3 bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900">
          Mapa da Próxima Oportunidade
        </span>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight mt-1">{record.jobTitle}</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-1">
          Trilha: {TRACK_LABELS[record.careerTrack as CareerTrack]}
        </p>
      </header>

      <div className="space-y-6">
        <MapSection title="Onde você está agora">
          <p className="text-sm text-neutral-700 dark:text-neutral-300">
            Aderência geral de <strong>{record.overallScore}%</strong> para esta vaga.{" "}
            {statusText}
          </p>
        </MapSection>

        <MapSection title="Para quais vagas você pode aplicar hoje">
          {record.applicationStatus === "apply_now" ? (
            <p className="text-sm text-neutral-700 dark:text-neutral-300">
              Esta vaga ({record.jobTitle}) já é uma opção viável agora.
            </p>
          ) : alternativeRoles.length > 0 ? (
            <ul className="space-y-1 list-disc list-inside text-sm text-neutral-700 dark:text-neutral-300">
              {alternativeRoles.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-neutral-500">
              Ajuste os pontos abaixo e esta vaga pode se tornar viável em breve.
            </p>
          )}
        </MapSection>

        {nearbyRoles.length > 0 && (
          <MapSection title="Quais vagas estão próximas">
            <ul className="space-y-1 list-disc list-inside text-sm text-neutral-700 dark:text-neutral-300">
              {nearbyRoles.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </MapSection>
        )}

        {keywordsMissing.length > 0 && (
          <MapSection title="O que falta para chegar lá">
            <div className="flex flex-wrap gap-2">
              {keywordsMissing.map((k, i) => (
                <span
                  key={i}
                  className="text-xs rounded-full px-3 py-1 bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300"
                >
                  {k}
                </span>
              ))}
            </div>
          </MapSection>
        )}

        {studyPlan.essential.length > 0 && (
          <MapSection title="O que estudar primeiro">
            <ul className="space-y-1 list-disc list-inside text-sm text-neutral-700 dark:text-neutral-300">
              {studyPlan.essential.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </MapSection>
        )}

        <MapSection title="Como ajustar seu currículo">
          <ul className="space-y-1 list-disc list-inside text-sm text-neutral-700 dark:text-neutral-300">
            {fixes.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
        </MapSection>

        <MapSection title="Como se preparar para a entrevista">
          <p className="text-sm text-neutral-700 dark:text-neutral-300">
            Volte ao{" "}
            <Link
              href={`/report/${id}`}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Plano de Candidatura
            </Link>{" "}
            e use o simulado de entrevista com as perguntas prováveis para esta vaga.
          </p>
        </MapSection>
      </div>
    </main>
  );
}

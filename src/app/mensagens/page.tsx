import Link from "next/link";
import { requireAuthPage } from "@/lib/require-auth-page";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function MessagesListPage() {
  const session = await requireAuthPage();
  const uid = session.user.id;

  const threads = await prisma.freelanceThread.findMany({
    where: { OR: [{ clientUserId: uid }, { freelancerUserId: uid }] },
    orderBy: { lastMessageAt: "desc" },
    include: {
      project: { select: { title: true } },
      client: { select: { id: true, name: true } },
      freelancer: { select: { id: true, name: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-8 py-10 space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Mensagens</h1>

      {threads.length === 0 ? (
        <p className="text-neutral-500 py-12 text-center">
          Nenhuma conversa ainda. Elas começam quando uma proposta é aceita.
        </p>
      ) : (
        <div className="space-y-2">
          {threads.map((t) => {
            const isClient = t.clientUserId === uid;
            const other = isClient ? t.freelancer : t.client;
            const last = t.messages[0];
            const unread = last
              ? isClient
                ? !last.readByClient && last.senderUserId !== uid
                : !last.readByFreelancer && last.senderUserId !== uid
              : false;
            return (
              <Link key={t.id} href={`/mensagens/${t.id}`} className="block rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4 hover:border-blue-400 transition-colors">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{other.name ?? "Usuário"}</p>
                    <p className="text-xs text-neutral-500 truncate">{t.project.title}</p>
                    {last && <p className="text-sm text-neutral-600 dark:text-neutral-400 truncate mt-1">{last.body}</p>}
                  </div>
                  {unread && <span className="shrink-0 h-2.5 w-2.5 rounded-full bg-blue-600" aria-label="Não lida" />}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

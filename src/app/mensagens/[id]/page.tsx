import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { MessageComposer } from "@/components/message-composer";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function ThreadPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const uid = session.user.id;

  const thread = await prisma.freelanceThread.findUnique({
    where: { id },
    include: {
      project: { select: { id: true, title: true } },
      client: { select: { id: true, name: true } },
      freelancer: { select: { id: true, name: true } },
    },
  });
  if (!thread) notFound();

  const isClient = thread.clientUserId === uid;
  const isFreelancer = thread.freelancerUserId === uid;
  if (!isClient && !isFreelancer) notFound();

  const messages = await prisma.freelanceMessage.findMany({
    where: { threadId: id },
    orderBy: { createdAt: "asc" },
    take: 200,
  });

  // Marca como lidas as mensagens recebidas pelo viewer.
  await prisma.freelanceMessage.updateMany({
    where: isClient
      ? { threadId: id, readByClient: false, senderUserId: { not: uid } }
      : { threadId: id, readByFreelancer: false, senderUserId: { not: uid } },
    data: isClient ? { readByClient: true } : { readByFreelancer: true },
  });

  const other = isClient ? thread.freelancer : thread.client;

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-8 py-10 flex flex-col min-h-[70vh]">
      <Link href="/mensagens" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">← Mensagens</Link>
      <header className="mt-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <h1 className="text-xl font-bold">{other.name ?? "Usuário"}</h1>
        <Link href={`/projetos/${thread.project.id}`} className="text-sm text-neutral-500 hover:underline">
          {thread.project.title}
        </Link>
      </header>

      <div className="flex-1 space-y-3 py-5">
        {messages.length === 0 ? (
          <p className="text-neutral-500 text-sm text-center py-8">Nenhuma mensagem ainda. Diga olá 👋</p>
        ) : (
          messages.map((m) => {
            const mine = m.senderUserId === uid;
            return (
              <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${mine ? "bg-blue-600 text-white" : "bg-neutral-100 dark:bg-white/5"}`}>
                  <p className="whitespace-pre-wrap break-words">{m.body}</p>
                  <p className={`text-[10px] mt-1 ${mine ? "text-blue-100" : "text-neutral-400"}`}>
                    {m.createdAt.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="sticky bottom-0 bg-white dark:bg-neutral-950 py-3 border-t border-neutral-200 dark:border-neutral-800">
        <MessageComposer threadId={thread.id} />
      </div>
    </div>
  );
}

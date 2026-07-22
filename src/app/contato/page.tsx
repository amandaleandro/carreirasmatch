import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CircleHelp, LifeBuoy, Mail, ShieldCheck } from "lucide-react";
import { ContentPage } from "@/components/content-page";

export const metadata: Metadata = {
  title: "Contato e suporte",
  description: "Fale com o CarreirasMatch sobre conta, cobrança, privacidade ou dúvidas sobre o produto.",
  alternates: { canonical: "/contato" },
};

const CONTACT_EMAIL = "contato@carreirasmatch.com.br";

export default function ContatoPage() {
  return (
    <ContentPage eyebrow="Contato e suporte" title="Encontre o canal certo para falar com a gente." description="Escolha abaixo o caminho mais adequado para sua dúvida. Assim você já chega ao atendimento com o contexto necessário." wide>
      <div className="grid gap-5 md:grid-cols-3">
        <article className="flex flex-col rounded-2xl border border-blue-200 bg-blue-50/60 p-6 dark:border-blue-900 dark:bg-blue-950/20">
          <Mail className="h-6 w-6 text-blue-600" />
          <h2 className="mt-4 text-lg font-bold">Contato geral</h2>
          <p className="mt-2 flex-1 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">Para parcerias, imprensa, sugestões e assuntos que não dependem de uma conta.</p>
          <a href={`mailto:${CONTACT_EMAIL}`} className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:underline">Enviar e-mail <ArrowRight className="h-4 w-4" /></a>
        </article>
        <article className="flex flex-col rounded-2xl border border-neutral-200 p-6 dark:border-neutral-800">
          <LifeBuoy className="h-6 w-6 text-violet-600" />
          <h2 className="mt-4 text-lg font-bold">Ajuda com sua conta</h2>
          <p className="mt-2 flex-1 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">Para análise, cobrança, acesso ou falha técnica, abra um chamado e acompanhe as respostas.</p>
          <Link href="/suporte" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-violet-600 hover:underline">Abrir suporte <ArrowRight className="h-4 w-4" /></Link>
        </article>
        <article className="flex flex-col rounded-2xl border border-neutral-200 p-6 dark:border-neutral-800">
          <CircleHelp className="h-6 w-6 text-emerald-600" />
          <h2 className="mt-4 text-lg font-bold">Resposta rápida</h2>
          <p className="mt-2 flex-1 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">Consulte orientações sobre funcionamento, planos, cancelamento e uso das ferramentas.</p>
          <Link href="/ajuda" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-emerald-700 dark:text-emerald-400 hover:underline">Ver Central de Ajuda <ArrowRight className="h-4 w-4" /></Link>
        </article>
      </div>

      <section className="mt-8 rounded-2xl bg-slate-950 p-6 text-white sm:flex sm:items-center sm:justify-between sm:gap-8">
        <div>
          <p className="flex items-center gap-2 text-sm font-bold"><Mail className="h-4 w-4 text-blue-300" /> Nosso e-mail</p>
          <a href={`mailto:${CONTACT_EMAIL}`} className="mt-2 block text-lg font-bold text-blue-300 hover:underline">{CONTACT_EMAIL}</a>
        </div>
        <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/60 sm:mt-0">Ao escrever, informe o e-mail da conta e descreva o que aconteceu. Não envie senha, dados completos de cartão ou outros dados sensíveis.</p>
      </section>

      <div className="mt-8 flex items-start gap-3 border-t border-neutral-100 pt-8 text-sm text-neutral-500 dark:border-neutral-900">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
        <p>Solicitações relacionadas a dados pessoais também podem ser enviadas por esse e-mail. Consulte a <Link href="/privacidade" className="font-bold text-blue-600 hover:underline">Política de Privacidade</Link>.</p>
      </div>
    </ContentPage>
  );
}

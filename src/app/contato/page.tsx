import type { Metadata } from "next";
import Link from "next/link";
import { ContentPage } from "@/components/content-page";

export const metadata: Metadata = {
  title: "Contato | CarreirasMatch",
  description: "Fale com o time do CarreirasMatch.",
};

const CONTACT_EMAIL = "contato@carreirasmatch.com.br";

export default function ContatoPage() {
  return (
    <ContentPage
      eyebrow="Contato"
      title="Fale com a gente."
      description="Dúvidas sobre sua conta, cobrança, uma análise que não ficou clara ou sugestão para o produto? Escreva pra gente — respondemos por e-mail."
    >
      <a
        href={`mailto:${CONTACT_EMAIL}`}
        className="flex items-center gap-4 rounded-2xl border-2 border-blue-500/30 bg-blue-50/60 dark:bg-blue-950/20 p-5 shadow-sm hover:border-blue-500/60 transition-colors group"
      >
        <span className="h-12 w-12 shrink-0 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xl">
          ✉️
        </span>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
            E-mail
          </p>
          <p className="mt-0.5 text-base font-bold text-neutral-900 dark:text-white group-hover:underline">
            {CONTACT_EMAIL}
          </p>
        </div>
      </a>

      <p className="mt-8 pt-8 border-t border-neutral-100 dark:border-neutral-900 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
        Para dúvidas comuns sobre como usar a plataforma, cancelamento de assinatura ou
        cobrança, dá uma olhada na{" "}
        <Link href="/ajuda" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
          Central de Ajuda
        </Link>{" "}
        — a resposta pode estar lá.
      </p>
    </ContentPage>
  );
}

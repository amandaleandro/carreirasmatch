import type { Metadata } from "next";
import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";

export const metadata: Metadata = {
  title: "Contato | CarreirasMatch",
  description: "Fale com o time do CarreirasMatch.",
};

const CONTACT_EMAIL = "contato@carreirasmatch.com.br";

export default function ContatoPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 text-neutral-800 dark:text-neutral-200">
      <Link href="/">
        <BrandLogo heightClassName="h-8" />
      </Link>

      <h1 className="text-2xl md:text-3xl font-bold tracking-tight mt-8 mb-4">Contato</h1>

      <div className="space-y-6 text-sm leading-relaxed">
        <p>
          Dúvidas sobre sua conta, cobrança, uma análise que não ficou clara ou sugestão para
          o produto? Escreva para a gente — respondemos por e-mail.
        </p>

        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
            E-mail
          </p>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="mt-1 inline-block text-base font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            {CONTACT_EMAIL}
          </a>
        </div>

        <section>
          <h2 className="text-base font-semibold mb-2">Antes de escrever</h2>
          <p>
            Para dúvidas comuns sobre como usar a plataforma, cancelamento de assinatura ou
            cobrança, dá uma olhada na{" "}
            <Link href="/ajuda" className="font-semibold underline underline-offset-2">
              Central de Ajuda
            </Link>{" "}
            — a resposta pode estar lá.
          </p>
        </section>
      </div>
    </main>
  );
}

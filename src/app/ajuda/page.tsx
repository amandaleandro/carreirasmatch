import type { Metadata } from "next";
import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";

export const metadata: Metadata = {
  title: "Central de Ajuda | CarreirasMatch",
  description: "Perguntas frequentes sobre análise de currículo, assinatura e pagamento no CarreirasMatch.",
};

const FAQ_SECTIONS: { title: string; items: { q: string; a: string }[] }[] = [
  {
    title: "Análise de currículo",
    items: [
      {
        q: "Como funciona a análise de currículo?",
        a: "Você envia seu currículo e a descrição da vaga desejada. A plataforma compara os dois com inteligência artificial e devolve um score de aderência, pontos fortes, lacunas (incluindo palavras-chave que faltam) e perguntas prováveis de entrevista.",
      },
      {
        q: "A análise garante que eu vou ser aprovado na vaga?",
        a: "Não. A análise é uma orientação para você se preparar melhor e não substitui a decisão do recrutador nem garante aprovação em nenhum processo seletivo.",
      },
      {
        q: "Não tenho currículo pronto, preciso ter um para usar a plataforma?",
        a: "Não. Você pode montar um currículo do zero gratuitamente pela ferramenta de criação de currículo antes de fazer a análise.",
      },
    ],
  },
  {
    title: "Assinatura e pagamento",
    items: [
      {
        q: "Como cancelo minha assinatura?",
        a: "Acesse a área de configurações da sua conta e cancele a assinatura por lá. O acesso pago permanece ativo até o fim do período já pago, sem multa ou fidelidade.",
      },
      {
        q: "Quais formas de pagamento são aceitas?",
        a: "Os pagamentos são processados pelo Mercado Pago. As formas disponíveis (cartão, Pix, entre outras) são exibidas na tela de checkout antes da confirmação.",
      },
      {
        q: "Meus dados de cartão ficam salvos na plataforma?",
        a: "Não. O processamento de pagamento é feito diretamente pelo Mercado Pago; não armazenamos número de cartão nem outros dados sensíveis de pagamento em nossos servidores.",
      },
    ],
  },
  {
    title: "Conta e dados",
    items: [
      {
        q: "Como excluo minha conta e meus dados?",
        a: "Envie uma solicitação pela página de contato. Seus dados são mantidos apenas enquanto a conta está ativa ou pelo tempo necessário para cumprir obrigações legais.",
      },
      {
        q: "Meus dados são compartilhados com terceiros?",
        a: "Compartilhamos dados apenas com os prestadores necessários para operar o serviço, como o processador de pagamento e o provedor de IA usado nas análises. Não vendemos dados pessoais. Veja mais na Política de Privacidade.",
      },
    ],
  },
];

export default function AjudaPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 text-neutral-800 dark:text-neutral-200">
      <Link href="/">
        <BrandLogo heightClassName="h-8" />
      </Link>

      <h1 className="text-2xl md:text-3xl font-bold tracking-tight mt-8 mb-2">Central de Ajuda</h1>
      <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-8">
        Perguntas frequentes sobre a plataforma. Não achou o que precisava?{" "}
        <Link href="/contato" className="font-semibold underline underline-offset-2">
          Fale com a gente
        </Link>
        .
      </p>

      <div className="space-y-8">
        {FAQ_SECTIONS.map((section) => (
          <section key={section.title}>
            <h2 className="text-base font-semibold mb-3">{section.title}</h2>
            <div className="space-y-3">
              {section.items.map((item) => (
                <div key={item.q} className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
                  <p className="font-semibold text-sm">{item.q}</p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1.5 leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}

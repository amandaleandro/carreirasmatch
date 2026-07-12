import type { Metadata } from "next";
import Link from "next/link";
import { ContentPage } from "@/components/content-page";

export const metadata: Metadata = {
  title: "Central de Ajuda | CarreirasMatch",
  description: "Perguntas frequentes sobre análise de currículo, assinatura e pagamento no CarreirasMatch.",
};

const FAQ_SECTIONS: { title: string; icon: string; items: { q: string; a: string }[] }[] = [
  {
    title: "Análise de currículo",
    icon: "📄",
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
    icon: "💳",
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
    icon: "🔒",
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
    <ContentPage
      eyebrow="Central de Ajuda"
      title="Perguntas frequentes"
      description="Respostas rápidas sobre análise de currículo, assinatura, pagamento e a sua conta."
    >
      <div className="space-y-8">
        {FAQ_SECTIONS.map((section) => (
          <section key={section.title}>
            <div className="flex items-center gap-2.5 mb-3">
              <span className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center text-sm">
                {section.icon}
              </span>
              <h2 className="text-base font-bold text-neutral-900 dark:text-white">{section.title}</h2>
            </div>
            <div className="space-y-2">
              {section.items.map((item) => (
                <details
                  key={item.q}
                  className="group rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-950/95 open:shadow-sm transition-shadow"
                >
                  <summary className="flex cursor-pointer items-center justify-between gap-3 p-4 text-sm font-semibold text-neutral-800 dark:text-neutral-200 list-none">
                    {item.q}
                    <span className="shrink-0 text-neutral-400 transition-transform group-open:rotate-45 text-lg leading-none">
                      +
                    </span>
                  </summary>
                  <p className="px-4 pb-4 text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                    {item.a}
                  </p>
                </details>
              ))}
            </div>
          </section>
        ))}
      </div>

      <p className="mt-8 pt-8 border-t border-neutral-100 dark:border-neutral-900 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
        Não achou o que precisava?{" "}
        <Link href="/contato" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
          Fale com a gente
        </Link>
        .
      </p>
    </ContentPage>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { Bot, CreditCard, FileCheck2, UserRoundCheck } from "lucide-react";
import { ContentPage, ContentSection } from "@/components/content-page";

export const metadata: Metadata = {
  title: "Termos de Uso",
  description: "Termos de uso da plataforma CarreirasMatch.",
  alternates: { canonical: "/termos" },
};

export default function TermosPage() {
  return (
    <ContentPage eyebrow="Última atualização: 22/07/2026" title="Termos de Uso" description="Estas são as regras para usar os serviços, ferramentas e conteúdos do CarreirasMatch." wide>
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          [UserRoundCheck, "Sua conta", "Você é responsável pelas informações enviadas e pela segurança do acesso."],
          [Bot, "Conteúdo por IA", "As sugestões são orientações automáticas e precisam da sua revisão."],
          [CreditCard, "Compras", "Valores e condições aplicáveis aparecem antes da confirmação do pagamento."],
        ].map(([Icon, title, text]) => {
          const TopicIcon = Icon as typeof Bot;
          return <article key={String(title)} className="rounded-2xl border border-neutral-200 bg-neutral-50/60 p-5 dark:border-neutral-800 dark:bg-neutral-900/40"><TopicIcon className="h-5 w-5 text-blue-600" /><h2 className="mt-3 font-bold">{String(title)}</h2><p className="mt-1 text-xs leading-relaxed text-neutral-500">{String(text)}</p></article>;
        })}
      </div>

      <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-5 text-sm leading-relaxed text-neutral-700 dark:border-blue-900 dark:bg-blue-950/20 dark:text-neutral-300">
        <strong className="text-neutral-950 dark:text-white">Resumo importante:</strong> o CarreirasMatch oferece apoio à tomada de decisão, mas não garante contratação, aprovação em prova ou resultado profissional específico. Leia os termos completos abaixo.
      </div>

      <ContentSection title="1. Sobre o CarreirasMatch">
        <p>
          O CarreirasMatch é uma plataforma que analisa currículos com auxílio de
          inteligência artificial, sugere ajustes de aderência a vagas, oferece
          ferramentas de preparação de carreira (simulação de entrevista, plano de
          ação, testes vocacionais, entre outras) e permite o acompanhamento de
          candidaturas. Ao criar uma conta ou usar o site, você concorda com estes
          Termos de Uso.
        </p>
      </ContentSection>

      <ContentSection title="2. Cadastro e conta">
        <p>
          Para usar a maior parte das funcionalidades é necessário criar uma conta
          com e-mail e senha (ou login via Google, quando disponível). Você é
          responsável por manter suas credenciais em sigilo e por todas as
          atividades realizadas na sua conta.
        </p>
      </ContentSection>

      <ContentSection title="3. Uso de inteligência artificial">
        <p>
          As análises de currículo, sugestões de conteúdo, simulações de entrevista
          e planos de estudo são gerados automaticamente por modelos de linguagem
          (IA). Esse conteúdo é uma orientação e não substitui aconselhamento
          profissional, jurídico ou de recursos humanos. O CarreirasMatch não
          garante que as sugestões resultem em aprovação em processos seletivos.
        </p>
      </ContentSection>

      <ContentSection title="4. Pagamentos e assinaturas">
        <p>
          Algumas funcionalidades são pagas, avulsas ou por assinatura recorrente,
          processadas pelo Mercado Pago. Os valores, formas de pagamento e política
          de reembolso vigentes são exibidos antes da confirmação de cada compra.
          Assinaturas recorrentes podem ser canceladas a qualquer momento pela área
          de configurações da conta; o acesso pago permanece ativo até o fim do
          período já pago.
        </p>
      </ContentSection>

      <ContentSection title="5. Conteúdo enviado pelo usuário">
        <p>
          Você é responsável pela veracidade das informações e documentos (como
          currículos) que envia à plataforma. Não envie dados de terceiros sem
          autorização, nem conteúdo ofensivo, ilegal ou que viole direitos de
          propriedade intelectual.
        </p>
      </ContentSection>

      <ContentSection title="6. Limitação de responsabilidade">
        <p>
          O serviço é fornecido &quot;como está&quot;. Não garantimos disponibilidade
          ininterrupta nem resultados específicos em processos de contratação.
        </p>
      </ContentSection>

      <ContentSection title="7. Alterações e contato">
        <p>
          Podemos atualizar estes Termos periodicamente; alterações relevantes serão
          comunicadas na plataforma. Para dúvidas, entre em contato pelo e-mail
          contato@carreirasmatch.com.br ou pela página de contato do site.
        </p>
      </ContentSection>

      <section className="mt-8 flex flex-col gap-4 rounded-2xl bg-slate-950 p-6 text-white sm:flex-row sm:items-center sm:justify-between">
        <div><p className="flex items-center gap-2 font-bold"><FileCheck2 className="h-5 w-5 text-blue-300" /> Ficou com alguma dúvida sobre estes termos?</p><p className="mt-1 text-sm text-white/60">Consulte também a Política de Privacidade ou fale diretamente com a equipe.</p></div>
        <div className="flex shrink-0 flex-wrap gap-2"><Link href="/privacidade" className="rounded-xl border border-white/20 px-4 py-2.5 text-sm font-bold hover:bg-white/10">Ver privacidade</Link><Link href="/contato" className="rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-blue-50">Entrar em contato</Link></div>
      </section>
    </ContentPage>
  );
}

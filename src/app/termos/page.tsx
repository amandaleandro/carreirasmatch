import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Termos de Uso | CarreirasMatch",
  description: "Termos de uso da plataforma CarreirasMatch.",
};

export default function TermosPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 text-neutral-800 dark:text-neutral-200">
      <h1 className="text-2xl font-semibold mb-2">Termos de Uso</h1>
      <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-8">
        Última atualização: 09/07/2026
      </p>

      <div className="space-y-6 text-sm leading-relaxed">
        <section>
          <h2 className="text-base font-semibold mb-2">1. Sobre o CarreirasMatch</h2>
          <p>
            O CarreirasMatch é uma plataforma que analisa currículos com auxílio de
            inteligência artificial, sugere ajustes de aderência a vagas, oferece
            ferramentas de preparação de carreira (simulação de entrevista, plano de
            ação, testes vocacionais, entre outras) e permite o acompanhamento de
            candidaturas. Ao criar uma conta ou usar o site, você concorda com estes
            Termos de Uso.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-2">2. Cadastro e conta</h2>
          <p>
            Para usar a maior parte das funcionalidades é necessário criar uma conta
            com e-mail e senha (ou login via Google, quando disponível). Você é
            responsável por manter suas credenciais em sigilo e por todas as
            atividades realizadas na sua conta.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-2">3. Uso de inteligência artificial</h2>
          <p>
            As análises de currículo, sugestões de conteúdo, simulações de entrevista
            e planos de estudo são gerados automaticamente por modelos de linguagem
            (IA). Esse conteúdo é uma orientação e não substitui aconselhamento
            profissional, jurídico ou de recursos humanos. O CarreirasMatch não
            garante que as sugestões resultem em aprovação em processos seletivos.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-2">4. Pagamentos e assinaturas</h2>
          <p>
            Algumas funcionalidades são pagas, avulsas ou por assinatura recorrente,
            processadas pelo Mercado Pago. Os valores, formas de pagamento e política
            de reembolso vigentes são exibidos antes da confirmação de cada compra.
            Assinaturas recorrentes podem ser canceladas a qualquer momento pela área
            de configurações da conta; o acesso pago permanece ativo até o fim do
            período já pago.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-2">5. Conteúdo enviado pelo usuário</h2>
          <p>
            Você é responsável pela veracidade das informações e documentos (como
            currículos) que envia à plataforma. Não envie dados de terceiros sem
            autorização, nem conteúdo ofensivo, ilegal ou que viole direitos de
            propriedade intelectual.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-2">6. Limitação de responsabilidade</h2>
          <p>
            O serviço é fornecido &quot;como está&quot;. Não garantimos disponibilidade
            ininterrupta nem resultados específicos em processos de contratação.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-2">7. Alterações e contato</h2>
          <p>
            Podemos atualizar estes Termos periodicamente; alterações relevantes serão
            comunicadas na plataforma. Para dúvidas, entre em contato pelo e-mail
            informado na página de suporte/contato do site.
          </p>
        </section>
      </div>
    </main>
  );
}

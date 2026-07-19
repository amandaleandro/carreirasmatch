import type { Metadata } from "next";
import { ContentPage, ContentSection } from "@/components/content-page";

export const metadata: Metadata = {
  title: "Termos de Uso",
  description: "Termos de uso da plataforma CarreirasMatch.",
};

export default function TermosPage() {
  return (
    <ContentPage eyebrow="Última atualização: 09/07/2026" title="Termos de Uso">
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
          informado na página de suporte/contato do site.
        </p>
      </ContentSection>
    </ContentPage>
  );
}

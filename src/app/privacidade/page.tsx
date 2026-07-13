import type { Metadata } from "next";
import { ContentPage, ContentSection } from "@/components/content-page";

export const metadata: Metadata = {
  title: "Política de Privacidade | CarreirasMatch",
  description: "Como o CarreirasMatch coleta, usa e protege seus dados pessoais.",
};

export default function PrivacidadePage() {
  return (
    <ContentPage eyebrow="Última atualização: 09/07/2026" title="Política de Privacidade">
      <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
        Esta Política de Privacidade explica como o CarreirasMatch coleta, usa,
        armazena e protege dados pessoais, em conformidade com a Lei Geral de
        Proteção de Dados (Lei nº 13.709/2018, LGPD).
      </p>

      <ContentSection title="1. Dados que coletamos">
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Dados de cadastro: nome, e-mail e senha (armazenada com hash, nunca em texto puro).</li>
          <li>Dados de contato de visitantes (nome, e-mail, telefone), quando você solicita um resultado de teste vocacional ou análise de currículo antes de criar conta.</li>
          <li>Conteúdo do currículo enviado (texto e, quando aplicável, o arquivo PDF).</li>
          <li>Dados de uso da plataforma: candidaturas registradas, respostas de testes, progresso em ferramentas e planos.</li>
          <li>Dados de pagamento: processados diretamente pelo Mercado Pago; não armazenamos número de cartão nem dados sensíveis de pagamento em nossos servidores.</li>
        </ul>
      </ContentSection>

      <ContentSection title="2. Para que usamos esses dados">
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Gerar as análises de currículo e recomendações de carreira via IA.</li>
          <li>Viabilizar login, cobrança e gestão da assinatura.</li>
          <li>Sugerir vagas e calcular aderência entre currículo e vaga.</li>
          <li>Comunicação sobre a conta, cobrança e melhorias do serviço.</li>
        </ul>
      </ContentSection>

      <ContentSection title="3. Compartilhamento com terceiros">
        <p>
          Compartilhamos dados apenas com prestadores necessários à operação do
          serviço: processamento de pagamento (Mercado Pago) e o provedor de
          inteligência artificial usado para gerar as análises (Groq), ao qual é
          enviado o conteúdo do currículo/vaga necessário para a análise. Não
          vendemos dados pessoais a terceiros.
        </p>
      </ContentSection>

      <ContentSection title="4. Armazenamento e retenção">
        <p>
          Os dados ficam armazenados em nosso banco de dados enquanto sua conta
          estiver ativa ou pelo tempo necessário para cumprir obrigações legais.
          Você pode solicitar a exclusão da sua conta e dos dados associados a
          qualquer momento.
        </p>
      </ContentSection>

      <ContentSection title="5. Seus direitos (LGPD)">
        <p>
          Você pode solicitar, a qualquer momento: confirmação de tratamento,
          acesso, correção, anonimização, portabilidade ou eliminação dos seus
          dados pessoais, além de revogar consentimentos dados. Solicitações podem
          ser feitas pelo e-mail de contato informado na plataforma.
        </p>
      </ContentSection>

      <ContentSection title="6. Cookies e armazenamento local">
        <p>
          Usamos armazenamento local do navegador (localStorage) para lembrar sua
          preferência de tema (claro/escuro) e cookies de sessão para manter você
          autenticado. Não usamos cookies de rastreamento publicitário de
          terceiros.
        </p>
      </ContentSection>

      <ContentSection title="7. Alterações nesta política">
        <p>
          Podemos atualizar esta Política periodicamente. A data da última
          atualização está indicada no topo desta página.
        </p>
      </ContentSection>
    </ContentPage>
  );
}

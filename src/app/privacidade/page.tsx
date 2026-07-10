import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidade | CarreirasMatch",
  description: "Como o CarreirasMatch coleta, usa e protege seus dados pessoais.",
};

export default function PrivacidadePage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 text-neutral-800 dark:text-neutral-200">
      <h1 className="text-2xl font-semibold mb-2">Política de Privacidade</h1>
      <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-8">
        Última atualização: 09/07/2026
      </p>

      <div className="space-y-6 text-sm leading-relaxed">
        <section>
          <p>
            Esta Política de Privacidade explica como o CarreirasMatch coleta, usa,
            armazena e protege dados pessoais, em conformidade com a Lei Geral de
            Proteção de Dados (Lei nº 13.709/2018 — LGPD).
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-2">1. Dados que coletamos</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Dados de cadastro: nome, e-mail e senha (armazenada com hash, nunca em texto puro).</li>
            <li>Dados de contato de visitantes (nome, e-mail, telefone), quando você solicita um resultado de teste vocacional ou análise de currículo antes de criar conta.</li>
            <li>Conteúdo do currículo enviado (texto e, quando aplicável, o arquivo PDF).</li>
            <li>Dados de uso da plataforma: candidaturas registradas, respostas de testes, progresso em ferramentas e planos.</li>
            <li>Dados de pagamento: processados diretamente pelo Mercado Pago; não armazenamos número de cartão nem dados sensíveis de pagamento em nossos servidores.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-2">2. Para que usamos esses dados</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Gerar as análises de currículo e recomendações de carreira via IA.</li>
            <li>Viabilizar login, cobrança e gestão da assinatura.</li>
            <li>Sugerir vagas e calcular aderência entre currículo e vaga.</li>
            <li>Comunicação sobre a conta, cobrança e melhorias do serviço.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-2">3. Compartilhamento com terceiros</h2>
          <p>
            Compartilhamos dados apenas com prestadores necessários à operação do
            serviço: processamento de pagamento (Mercado Pago) e o provedor de
            inteligência artificial usado para gerar as análises (Groq), ao qual é
            enviado o conteúdo do currículo/vaga necessário para a análise. Não
            vendemos dados pessoais a terceiros.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-2">4. Armazenamento e retenção</h2>
          <p>
            Os dados ficam armazenados em nosso banco de dados enquanto sua conta
            estiver ativa ou pelo tempo necessário para cumprir obrigações legais.
            Você pode solicitar a exclusão da sua conta e dos dados associados a
            qualquer momento.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-2">5. Seus direitos (LGPD)</h2>
          <p>
            Você pode solicitar, a qualquer momento: confirmação de tratamento,
            acesso, correção, anonimização, portabilidade ou eliminação dos seus
            dados pessoais, além de revogar consentimentos dados. Solicitações podem
            ser feitas pelo e-mail de contato informado na plataforma.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-2">6. Cookies e armazenamento local</h2>
          <p>
            Usamos armazenamento local do navegador (localStorage) para lembrar sua
            preferência de tema (claro/escuro) e cookies de sessão para manter você
            autenticado. Não usamos cookies de rastreamento publicitário de
            terceiros.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-2">7. Alterações nesta política</h2>
          <p>
            Podemos atualizar esta Política periodicamente. A data da última
            atualização está indicada no topo desta página.
          </p>
        </section>
      </div>
    </main>
  );
}

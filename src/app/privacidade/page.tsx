import type { Metadata } from "next";
import Link from "next/link";
import { Database, LockKeyhole, Scale, UserRoundCheck } from "lucide-react";
import { ContentPage, ContentSection } from "@/components/content-page";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description: "Como o CarreirasMatch coleta, usa e protege seus dados pessoais.",
  alternates: { canonical: "/privacidade" },
};

const TOPICS = [
  ["#dados", "Dados coletados"],
  ["#uso", "Como usamos"],
  ["#terceiros", "Compartilhamento"],
  ["#direitos", "Seus direitos"],
] as const;

export default function PrivacidadePage() {
  return (
    <ContentPage eyebrow="Última atualização: 22/07/2026" title="Política de Privacidade" description="Entenda quais dados tratamos, por que precisamos deles e quais escolhas estão disponíveis para você." wide>
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          [Database, "Uso necessário", "Coletamos dados para entregar as funcionalidades solicitadas."],
          [LockKeyhole, "Proteção", "Senhas não são armazenadas em texto puro e pagamentos ficam com o provedor."],
          [UserRoundCheck, "Você no controle", "Você pode solicitar acesso, correção ou eliminação dos seus dados."],
        ].map(([Icon, title, text]) => {
          const TopicIcon = Icon as typeof Database;
          return <article key={String(title)} className="rounded-2xl border border-neutral-200 bg-neutral-50/60 p-5 dark:border-neutral-800 dark:bg-neutral-900/40"><TopicIcon className="h-5 w-5 text-blue-600" /><h2 className="mt-3 font-bold">{String(title)}</h2><p className="mt-1 text-xs leading-relaxed text-neutral-500">{String(text)}</p></article>;
        })}
      </div>

      <nav aria-label="Nesta política" className="mt-6 flex flex-wrap gap-2 rounded-2xl border border-neutral-200 p-4 dark:border-neutral-800">
        <span className="mr-2 py-1.5 text-xs font-bold uppercase tracking-wide text-neutral-400">Nesta página</span>
        {TOPICS.map(([href, label]) => <a key={href} href={href} className="rounded-lg bg-neutral-100 px-3 py-1.5 text-xs font-semibold hover:bg-blue-50 hover:text-blue-700 dark:bg-neutral-900 dark:hover:bg-blue-950/40">{label}</a>)}
      </nav>

      <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
        Esta Política de Privacidade explica como o CarreirasMatch coleta, usa,
        armazena e protege dados pessoais, em conformidade com a Lei Geral de
        Proteção de Dados (Lei nº 13.709/2018, LGPD).
      </p>

      <ContentSection id="dados" title="1. Dados que coletamos">
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Dados de cadastro: nome, e-mail e senha (armazenada com hash, nunca em texto puro).</li>
          <li>Dados de contato de visitantes (nome, e-mail, telefone), quando você solicita um resultado de teste vocacional ou análise de currículo antes de criar conta.</li>
          <li>Conteúdo do currículo enviado (texto e, quando aplicável, o arquivo PDF).</li>
          <li>Dados de uso da plataforma: candidaturas registradas, respostas de testes, progresso em ferramentas e planos.</li>
          <li>Dados de pagamento: processados diretamente pelo Mercado Pago; não armazenamos número de cartão nem dados sensíveis de pagamento em nossos servidores.</li>
        </ul>
      </ContentSection>

      <ContentSection id="uso" title="2. Para que usamos esses dados">
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Gerar as análises de currículo e recomendações de carreira via IA.</li>
          <li>Viabilizar login, cobrança e gestão da assinatura.</li>
          <li>Sugerir vagas e calcular aderência entre currículo e vaga.</li>
          <li>Comunicação sobre a conta, cobrança e melhorias do serviço.</li>
        </ul>
      </ContentSection>

      <ContentSection id="terceiros" title="3. Compartilhamento com terceiros">
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

      <ContentSection id="direitos" title="5. Seus direitos (LGPD)">
        <p>
          Você pode solicitar, a qualquer momento: confirmação de tratamento,
          acesso, correção, anonimização, portabilidade ou eliminação dos seus
          dados pessoais, além de revogar consentimentos dados. Solicitações podem
          ser feitas pelo e-mail contato@carreirasmatch.com.br.
        </p>
      </ContentSection>

      <ContentSection title="6. Cookies e armazenamento local">
        <p>
          Usamos armazenamento local do navegador (localStorage) para lembrar sua
          preferência de tema (claro/escuro) e cookies de sessão para manter você
          autenticado.
        </p>
      </ContentSection>

      <ContentSection title="7. Publicidade">
        <p>
          Exibimos anúncios do Google AdSense nas páginas de conteúdo público:
          o blog e os guias abertos. As listagens de vagas, as áreas logadas e
          as páginas de pagamento não exibem anúncios, e quem tem assinatura
          ativa não vê anúncio em nenhuma página.
        </p>
        <p>
          O Google, como fornecedor terceirizado, utiliza cookies para exibir
          anúncios com base em visitas anteriores suas a este e a outros sites.
          O uso de cookies de publicidade pelo Google permite que ele e seus
          parceiros veiculem anúncios com base na sua navegação. Terceiros também
          podem usar web beacons e o seu endereço IP para coletar informações
          como resultado da veiculação de anúncios neste site. Para detalhes,
          consulte{" "}
          <a
            href="https://policies.google.com/technologies/partner-sites"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            como o Google usa informações de sites que utilizam seus serviços
          </a>
          .
        </p>
        <p>
          Você pode desativar a publicidade personalizada nas{" "}
          <a
            href="https://www.google.com/settings/ads"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            Configurações de anúncios do Google
          </a>{" "}
          ou gerenciar o uso de cookies por outros fornecedores em{" "}
          <a
            href="https://www.aboutads.info/choices/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            aboutads.info/choices
          </a>
          .
        </p>
      </ContentSection>

      <ContentSection title="8. Alterações nesta política">
        <p>
          Podemos atualizar esta Política periodicamente. A data da última
          atualização está indicada no topo desta página.
        </p>
      </ContentSection>

      <section className="mt-8 flex flex-col gap-4 rounded-2xl bg-slate-950 p-6 text-white sm:flex-row sm:items-center sm:justify-between">
        <div><p className="flex items-center gap-2 font-bold"><Scale className="h-5 w-5 text-blue-300" /> Quer exercer um direito ou tirar uma dúvida?</p><p className="mt-1 text-sm text-white/60">Envie sua solicitação pelo canal de contato e informe o e-mail vinculado à conta.</p></div>
        <Link href="/contato" className="shrink-0 rounded-xl bg-white px-5 py-3 text-center text-sm font-bold text-slate-950 hover:bg-blue-50">Falar sobre meus dados</Link>
      </section>
    </ContentPage>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { FreeResumeBuilder } from "@/components/free-resume-builder";
import { FreeTierAd } from "@/components/free-tier-ad";
import { SiteFooter } from "@/components/site-footer";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbJsonLd, faqJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Currículo grátis: crie um modelo pronto online",
  description:
    "Monte um currículo grátis online em poucos minutos, com modelo pronto para preencher. Veja o que colocar em cada seção, erros comuns e como adaptar o currículo para cada vaga.",
  alternates: { canonical: "/curriculo-gratis" },
};

const FAQ = [
  {
    question: "Como fazer um currículo grátis online?",
    answer:
      "Preencha seus dados no construtor acima (nome, objetivo, formação, cursos, experiências e habilidades) e o currículo é montado automaticamente, sem custo e sem precisar instalar nada. Depois é só revisar e adaptar para a vaga que você quer.",
  },
  {
    question: "O que colocar em um currículo sem experiência?",
    answer:
      "Sem experiência formal, foque em formação, cursos livres, trabalhos voluntários, projetos pessoais ou acadêmicos e habilidades. O que importa é mostrar iniciativa e o que você já sabe fazer, mesmo que fora de um emprego com carteira assinada.",
  },
  {
    question: "Qual é o modelo de currículo ideal?",
    answer:
      "Um bom modelo é simples, de uma página, com seções claras (dados de contato, objetivo, formação, experiência e habilidades) e sem excesso de cores ou colunas que confundem os sistemas de triagem (ATS). Conteúdo objetivo pesa mais que design elaborado.",
  },
  {
    question: "Preciso adaptar o currículo para cada vaga?",
    answer:
      "Sim. Ajustar o objetivo e destacar as habilidades e experiências que a vaga pede aumenta muito suas chances. Um currículo genérico enviado para tudo tende a passar despercebido tanto pelos sistemas quanto pelos recrutadores.",
  },
];

export default function CurriculoGratisPage() {
  return (
    <div className="w-full">
      <JsonLd data={faqJsonLd(FAQ)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Início", path: "/" },
          { name: "Currículo grátis", path: "/curriculo-gratis" },
        ])}
      />

      <FreeResumeBuilder />

      {/* Conteúdo indexável: transforma a ferramenta numa página com chance real
          de ranquear para "currículo grátis" / "modelo de currículo". */}
      <section className="max-w-3xl mx-auto px-4 md:px-8 py-14 space-y-8 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
            Como fazer um currículo grátis do jeito certo
          </h2>
          <p className="mt-3">
            Um bom currículo não precisa ser bonito — precisa ser claro. Em poucos segundos, o
            recrutador (ou o sistema de triagem que lê o arquivo antes dele) tem que entender quem
            você é, o que você sabe fazer e por que serve para a vaga. O construtor acima monta esse
            currículo grátis para você; abaixo explicamos o que colocar em cada parte para ele
            realmente funcionar.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
            As seções essenciais de um currículo
          </h2>
          <ul className="mt-3 list-disc pl-5 space-y-2">
            <li>
              <strong>Dados de contato:</strong> nome, cidade, telefone e e-mail profissional. Não
              precisa de RG, foto ou endereço completo.
            </li>
            <li>
              <strong>Objetivo:</strong> uma frase dizendo o cargo ou a área que você busca. Adapte
              para cada vaga.
            </li>
            <li>
              <strong>Formação:</strong> curso, instituição e ano (ou previsão de conclusão). Quem
              está começando pode incluir o ensino médio.
            </li>
            <li>
              <strong>Experiência:</strong> empresa, cargo, período e o que você fez — de preferência
              com resultados. Sem experiência formal? Use projetos, estágios, voluntariado e trabalhos
              acadêmicos.
            </li>
            <li>
              <strong>Cursos e habilidades:</strong> cursos livres, idiomas, ferramentas e
              competências que a vaga valoriza.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
            Erros comuns que derrubam o currículo
          </h2>
          <ul className="mt-3 list-disc pl-5 space-y-2">
            <li>Currículo com várias páginas quando uma bastaria.</li>
            <li>Layout com muitas colunas e cores que os sistemas de triagem (ATS) não leem bem.</li>
            <li>Objetivo genérico do tipo &ldquo;busco uma oportunidade para crescer&rdquo;.</li>
            <li>Listar tarefas sem mostrar nenhum resultado ou impacto.</li>
            <li>Erros de português e informações de contato desatualizadas.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
            Guias para cada situação
          </h2>
          <p className="mt-3">Escolha o caminho mais parecido com o seu momento:</p>
          <ul className="mt-3 list-disc pl-5 space-y-2">
            <li>
              <Link href="/como-fazer-curriculo" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                Como fazer um currículo do zero
              </Link>{" "}
              — passo a passo completo para quem nunca montou um.
            </li>
            <li>
              <Link href="/curriculo-sem-experiencia" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                Currículo sem experiência
              </Link>{" "}
              — o que colocar quando você ainda não teve um emprego formal.
            </li>
            <li>
              <Link href="/primeiro-emprego" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                Currículo para o primeiro emprego
              </Link>{" "}
              e{" "}
              <Link href="/jovem-aprendiz" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                Jovem Aprendiz
              </Link>
              .
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Perguntas frequentes</h2>
          <div className="mt-3 space-y-5">
            {FAQ.map((item) => (
              <div key={item.question}>
                <h3 className="font-semibold text-neutral-900 dark:text-white">{item.question}</h3>
                <p className="mt-1">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>

        <FreeTierAd name="toolGuide" className="pt-4" />
      </section>

      <SiteFooter />
    </div>
  );
}

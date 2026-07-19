import type { Metadata } from "next";
import Link from "next/link";
import { ContentPage } from "@/components/content-page";
import { TOOLS_CATALOG } from "@/lib/tools-catalog";

export const metadata: Metadata = {
  title: "Ferramentas gratuitas para emprego",
  description: "Currículo, entrevista, salário, estágio e carreira: ferramentas gratuitas para avançar na busca por emprego.",
  alternates: { canonical: "/gratuito" },
};

const EXTRAS = [
  { href: "/curriculo-gratis", title: "Criador de currículo grátis", description: "Monte e baixe um currículo profissional." },
  { href: "/analise", title: "Análise simples de vaga", description: "Descubra sua aderência antes de se candidatar." },
  { href: "/tools/vocation-test", title: "Teste vocacional gratuito", description: "Descubra áreas e caminhos de formação compatíveis com você." },
  { href: "/vagas-de-hoje", title: "Vagas de hoje", description: "Encontre oportunidades recentes em um só lugar." },
];

export default function FreeResourcesPage() {
  const accountTools = TOOLS_CATALOG.filter((tool) => tool.free || tool.accountFree);

  return (
    <ContentPage
      eyebrow="Central gratuita"
      title="Recursos práticos para conseguir emprego."
      description="Currículo, análise de vaga e teste vocacional básico abrem sem cadastro. As outras ferramentas pedem apenas uma conta gratuita, sem cartão."
      wide
    >
      <ResourceSection title="Sem cadastro" subtitle="Abra e use agora.">
        {EXTRAS.map((item) => <ResourceCard key={item.href} {...item} label="Sem cadastro" />)}
      </ResourceSection>

      <ResourceSection title="Com cadastro gratuito" subtitle="Crie sua conta para acessar ferramentas, salvar resultados e experimentar recursos com IA.">
        {accountTools.map((item) => <ResourceCard key={item.href} {...item} label="Cadastro grátis" />)}
      </ResourceSection>

      <div className="mt-10 rounded-2xl bg-blue-600 p-6 text-white md:flex md:items-center md:justify-between md:gap-6">
        <div>
          <h2 className="text-xl font-bold">Salve seu progresso gratuitamente</h2>
          <p className="mt-2 text-sm text-blue-100">Tenha checklist, teste comportamental e experiências gratuitas de IA na sua conta.</p>
        </div>
        <Link href="/register" className="mt-5 inline-flex rounded-xl bg-white px-5 py-3 text-sm font-bold text-blue-700 hover:bg-blue-50 md:mt-0">
          Criar conta grátis
        </Link>
      </div>
    </ContentPage>
  );
}

function ResourceSection({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <section className="mb-10 last:mb-0">
      <h2 className="text-xl font-bold">{title}</h2>
      <p className="mt-1 text-sm text-neutral-500">{subtitle}</p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function ResourceCard({ href, title, description, label }: { href: string; title: string; description: string; label: string }) {
  return (
    <Link href={href} className="group rounded-2xl border border-neutral-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-950">
      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">{label}</span>
      <h3 className="mt-2 font-bold group-hover:text-blue-600 dark:group-hover:text-blue-400">{title}</h3>
      <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">{description}</p>
      <span className="mt-4 inline-flex text-sm font-semibold text-blue-600 dark:text-blue-400">Abrir recurso</span>
    </Link>
  );
}

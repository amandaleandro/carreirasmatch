import { AnalyzeVagaPage } from "@/components/analyze-vaga";
import { breadcrumbJsonLd, faqJsonLd } from "@/lib/seo";

export type LandingFaq = { question: string; answer: string };

/**
 * Casca SEO reutilizável para as landing pages de aquisição da análise
 * gratuita: hero com copy própria por página/termo de busca + FAQ (com
 * JSON-LD para rich results) + o mesmo formulário de análise do /analise.
 * A ferramenta é uma só; cada landing é uma porta de entrada diferente
 * no Google.
 */
export function SeoAnalyzeLanding({
  badge,
  title,
  highlight,
  subtitle,
  bullets,
  faq,
  path,
  breadcrumbName,
}: {
  badge: string;
  title: string;
  /** Trecho do título destacado em azul (deve ser substring de `title`). */
  highlight?: string;
  subtitle: string;
  bullets: { label: string; desc: string }[];
  faq: LandingFaq[];
  path: string;
  breadcrumbName: string;
}) {
  const [before, after] = highlight && title.includes(highlight)
    ? [title.slice(0, title.indexOf(highlight)), title.slice(title.indexOf(highlight) + highlight.length)]
    : [title, ""];

  return (
    <main className="min-h-screen bg-[#F8FAFC] dark:bg-[#071827] font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(faq)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Início", path: "/" },
              { name: breadcrumbName, path },
            ])
          ),
        }}
      />

      <div className="max-w-4xl mx-auto px-4 py-10 sm:py-14 space-y-10">
        <header className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2563EB]/10 border border-[#2563EB]/20 text-[#2563EB] text-[10px] font-bold uppercase tracking-wider">
            {badge}
          </span>
          <h1 className="text-2xl sm:text-4xl font-title font-bold tracking-tight text-[#071827] dark:text-white leading-tight">
            {before}
            {highlight && <span className="text-[#2563EB] dark:text-blue-400">{highlight}</span>}
            {after}
          </h1>
          <p className="text-[#64748B] dark:text-slate-400 text-sm leading-relaxed">{subtitle}</p>
        </header>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {bullets.map((item) => (
            <div
              key={item.label}
              className="bg-white dark:bg-neutral-900 border border-[#E2E8F0] dark:border-neutral-800 rounded-2xl p-3.5 text-center space-y-1"
            >
              <p className="text-xs font-bold text-[#2563EB]">{item.label}</p>
              <p className="text-[10px] text-[#64748B]">{item.desc}</p>
            </div>
          ))}
        </div>

        <AnalyzeVagaPage hideHero />

        <section className="max-w-2xl mx-auto space-y-4">
          <h2 className="text-lg font-title font-bold text-[#071827] dark:text-white text-center">
            Perguntas frequentes
          </h2>
          {faq.map((item) => (
            <details
              key={item.question}
              className="rounded-2xl border border-[#E2E8F0] dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4"
            >
              <summary className="text-sm font-semibold text-[#071827] dark:text-white cursor-pointer">
                {item.question}
              </summary>
              <p className="text-sm text-[#64748B] dark:text-slate-400 mt-2 leading-relaxed">{item.answer}</p>
            </details>
          ))}
        </section>
      </div>
    </main>
  );
}

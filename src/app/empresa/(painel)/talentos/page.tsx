import { Users } from "lucide-react";
import { requireCompanyPage } from "@/lib/company-auth";
import { TalentSearch } from "@/components/talent-search";

export const dynamic = "force-dynamic";

export default async function TalentPoolPage() {
  await requireCompanyPage();

  return (
    <main className="max-w-6xl mx-auto px-4 md:px-8 py-8 space-y-8 font-sans">
      {/* Header Banner */}
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider rounded-full px-3 py-1 mb-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
          <Users className="w-3.5 h-3.5" />
          Banco de Talentos CarreirasMatch
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Busca de Profissionais Verificados
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm max-w-3xl">
          Descreva a vaga ou requisitos técnicos para localizar candidatos que optaram por ser encontrados por empresas. O contato é liberado após o aceite do candidato.
        </p>
      </div>

      <TalentSearch />
    </main>
  );
}

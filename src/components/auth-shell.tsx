"use client";

import Link from "next/link";
import { type ReactNode, useState, useEffect } from "react";
import { BrandLogo } from "@/components/brand-logo";

type AreaKey = "admin" | "law" | "marketing" | "finance" | "health";

interface AreaData {
  title: string;
  fileName: string;
  roleName: string;
  skills: string[];
  score: number;
  icon: string;
  colorClass: string;
  textColor: string;
  borderColor: string;
  bgLight: string;
  pillBg: string;
  pillBorder: string;
}

const AREAS: Record<AreaKey, AreaData> = {
  admin: {
    title: "Administração",
    fileName: "Curriculo_Felipe_Adm.pdf",
    roleName: "Assistente Administrativo",
    skills: ["Gestão de Processos", "Excel Avançado", "Organização"],
    score: 94,
    icon: "💼",
    colorClass: "bg-[#F59E0B]",
    textColor: "text-[#F59E0B]",
    borderColor: "border-[#F59E0B]/20",
    bgLight: "bg-[#F59E0B]/5",
    pillBg: "bg-[#F59E0B]/10",
    pillBorder: "border-[#F59E0B]/30",
  },
  law: {
    title: "Direito",
    fileName: "Curriculo_Juliana_Direito.pdf",
    roleName: "Assistente Jurídico",
    skills: ["Análise de Contratos", "Peticionamento", "Pesquisa Jurisprudencial"],
    score: 89,
    icon: "⚖️",
    colorClass: "bg-[#2563EB]",
    textColor: "text-[#2563EB]",
    borderColor: "border-[#2563EB]/20",
    bgLight: "bg-[#2563EB]/5",
    pillBg: "bg-[#2563EB]/10",
    pillBorder: "border-[#2563EB]/30",
  },
  marketing: {
    title: "Marketing",
    fileName: "Curriculo_Beatriz_Mkt.pdf",
    roleName: "Analista de Marketing Digital",
    skills: ["Google Ads", "Copywriting", "SEO & Analytics"],
    score: 92,
    icon: "📈",
    colorClass: "bg-[#2563EB]",
    textColor: "text-[#2563EB]",
    borderColor: "border-[#2563EB]/20",
    bgLight: "bg-[#2563EB]/5",
    pillBg: "bg-[#2563EB]/10",
    pillBorder: "border-[#2563EB]/30",
  },
  finance: {
    title: "Finanças",
    fileName: "Curriculo_Roberto_Fin.pdf",
    roleName: "Analista Financeiro",
    skills: ["Conciliação Bancária", "Fluxo de Caixa", "Contabilidade Geral"],
    score: 96,
    icon: "💵",
    colorClass: "bg-[#64748B]",
    textColor: "text-[#64748B]",
    borderColor: "border-[#64748B]/20",
    bgLight: "bg-[#64748B]/5",
    pillBg: "bg-[#64748B]/10",
    pillBorder: "border-[#64748B]/30",
  },
  health: {
    title: "Saúde",
    fileName: "Curriculo_Mariana_Saude.pdf",
    roleName: "Técnico de Enfermagem",
    skills: ["Atendimento Triagem", "Prontuário Eletrônico", "Cuidados Intensivos"],
    score: 91,
    icon: "🏥",
    colorClass: "bg-[#22C55E]",
    textColor: "text-[#22C55E]",
    borderColor: "border-[#22C55E]/20",
    bgLight: "bg-[#22C55E]/5",
    pillBg: "bg-[#22C55E]/10",
    pillBorder: "border-[#22C55E]/30",
  },
};

export function AuthShell({
  eyebrow,
  headline,
  description,
  highlights,
  children,
}: {
  eyebrow: string;
  headline: string;
  description: string;
  highlights: string[];
  children: ReactNode;
}) {
  const [selectedArea, setSelectedArea] = useState<AreaKey>("admin");
  const [scanState, setScanState] = useState<"idle" | "scanning" | "done">("idle");
  const [currentScore, setCurrentScore] = useState(0);

  useEffect(() => {
    setScanState("scanning");
    setCurrentScore(0);
    
    let start = 0;
    const target = AREAS[selectedArea].score;
    const duration = 1000;
    const stepTime = Math.abs(Math.floor(duration / target));
    
    const timer = setInterval(() => {
      start += 1;
      setCurrentScore(start);
      if (start >= target) {
        clearInterval(timer);
        setScanState("done");
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [selectedArea]);

  const activeData = AREAS[selectedArea];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#F8FAFC] dark:bg-[#071827] font-sans selection:bg-[#2563EB] selection:text-white">
      {/* Lado Esquerdo: Sidebar de Apresentação (Mais compacta e integrada) */}
      <div className="hidden lg:flex lg:w-[40%] xl:w-[35%] flex-col justify-between px-6 py-6 xl:px-8 xl:py-8 relative overflow-hidden border-r border-[#E2E8F0] dark:border-neutral-800 shrink-0">
        
        {/* Grid e Glow */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f060_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f060_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:28px_28px]" />
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[50%] rounded-full bg-[#2563EB]/5 blur-[70px]" />

        {/* Logo */}
        <Link href="/" className="relative z-10 hover:opacity-90 transition-opacity">
          <BrandLogo heightClassName="h-8 xl:h-9" />
        </Link>

        {/* Simulador Interativo */}
        <div className="relative z-10 my-auto py-4 flex flex-col items-center w-full">
          <div className="text-center mb-4 w-full">
            <span className="text-[9px] uppercase font-bold tracking-widest text-[#64748B] mb-2 block">
              Experimente a análise inteligente em tempo real:
            </span>
            
            {/* Seletor de Áreas */}
            <div className="flex flex-wrap gap-1 justify-center max-w-[280px] mx-auto">
              {(Object.keys(AREAS) as AreaKey[]).map((key) => {
                const isSelected = selectedArea === key;
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedArea(key)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-all duration-300 cursor-pointer ${
                      isSelected
                        ? "bg-[#2563EB] text-white border-transparent shadow-sm shadow-blue-500/10 scale-102"
                        : "bg-[#FFFFFF] dark:bg-neutral-900 text-[#64748B] border-[#E2E8F0] dark:border-neutral-800 hover:bg-[#F8FAFC] hover:text-[#071827] dark:hover:text-white"
                    }`}
                  >
                    {AREAS[key].icon} {AREAS[key].title}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sandbox Scanner Container (Compacto) */}
          <div className="relative w-full max-w-[290px] rounded-2xl bg-[#FFFFFF] dark:bg-neutral-900 border border-[#E2E8F0] dark:border-neutral-800 p-4 shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden min-h-[250px] flex flex-col justify-between">
            
            {scanState === "scanning" && (
              <div className="absolute inset-x-0 h-0.5 bg-[#2563EB] shadow-[0_0_8px_rgba(37,99,235,0.6)] animate-[scan_1.5s_ease-in-out_infinite] z-20 pointer-events-none" />
            )}

            {/* Header */}
            <div className="flex justify-between items-center pb-2.5 border-b border-[#E2E8F0] dark:border-neutral-800">
              <div className="flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${scanState === "scanning" ? "bg-[#F59E0B] animate-ping" : "bg-[#22C55E]"}`} />
                <span className="text-[9px] text-[#64748B] font-bold uppercase tracking-wider">
                  {scanState === "scanning" ? "Escaneando..." : "Concluído"}
                </span>
              </div>
              <span className="text-[8px] text-[#64748B] font-semibold bg-[#F8FAFC] dark:bg-neutral-800 px-1.5 py-0.5 rounded border border-[#E2E8F0] dark:border-neutral-700 truncate max-w-[120px]">
                {activeData.fileName}
              </span>
            </div>

            {/* Comparador */}
            <div className="flex justify-between items-center my-3 px-0.5 relative">
              
              {/* Card Currículo */}
              <div className={`w-[85px] rounded-xl bg-[#F8FAFC] dark:bg-neutral-800 border border-[#E2E8F0] dark:border-neutral-700 p-2 shadow-sm transition-all duration-300 flex flex-col items-center text-center ${scanState === "scanning" ? "scale-95 opacity-60" : "scale-100"}`}>
                <span className="text-base mb-0.5">📄</span>
                <span className="text-[9px] font-bold text-[#071827] dark:text-white block truncate w-full">Seu Currículo</span>
                <span className="text-[8px] text-[#64748B] block truncate w-full">{activeData.title}</span>
              </div>

              {/* Central Dial */}
              <div className="relative flex items-center justify-center">
                <svg className="w-14 h-14 transform -rotate-90">
                  <circle
                    cx="28"
                    cy="28"
                    r="24"
                    className="stroke-[#E2E8F0] dark:stroke-neutral-800"
                    strokeWidth="3.5"
                    fill="transparent"
                  />
                  <circle
                    cx="28"
                    cy="28"
                    r="24"
                    className="stroke-[#2563EB] transition-all duration-100"
                    strokeWidth="3.5"
                    fill="transparent"
                    strokeDasharray="150.7"
                    strokeDashoffset={150.7 - (150.7 * currentScore) / 100}
                  />
                </svg>

                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-xs font-black text-[#071827] dark:text-white">{currentScore}%</span>
                  <span className="text-[5px] text-[#64748B] uppercase tracking-widest font-extrabold">Match</span>
                </div>
              </div>

              {/* Card Vaga */}
              <div className={`w-[85px] rounded-xl bg-[#F8FAFC] dark:bg-neutral-800 border border-[#E2E8F0] dark:border-neutral-700 p-2 shadow-sm transition-all duration-300 flex flex-col items-center text-center ${scanState === "scanning" ? "scale-95 opacity-60" : "scale-100"}`}>
                <span className="text-base mb-0.5">🎯</span>
                <span className="text-[9px] font-bold text-[#071827] dark:text-white block truncate w-full">Vaga</span>
                <span className="text-[8px] text-[#22C55E] font-medium block truncate w-full">{activeData.roleName}</span>
              </div>

            </div>

            {/* Habilidades */}
            <div className="bg-[#F8FAFC] dark:bg-neutral-800 rounded-lg p-2.5 border border-[#E2E8F0] dark:border-neutral-700 transition-all duration-300">
              <span className="text-[8px] text-[#64748B] font-bold uppercase tracking-wider block mb-1.5">
                Habilidades analisadas:
              </span>
              <div className="space-y-1.5">
                {activeData.skills.slice(0, 2).map((skill) => (
                  <div key={skill} className="flex items-center justify-between text-[9px]">
                    <span className="text-[#071827] dark:text-slate-300 font-medium truncate max-w-[130px]">{skill}</span>
                    <span className={`px-1.5 py-0.5 rounded-full text-[7px] font-bold transition-all duration-300 ${
                      scanState === "done" 
                        ? "bg-[#22C55E]/15 text-[#22C55E]" 
                        : "bg-[#F59E0B]/10 text-[#F59E0B] animate-pulse"
                    }`}>
                      {scanState === "done" ? "✓ Ok" : "Análise"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Textos Inferiores (Reduzidos) */}
        <div className="relative z-10">
          <span className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider rounded-full px-2.5 py-0.5 mb-2.5 bg-[#2563EB]/10 text-[#2563EB] border border-[#2563EB]/20">
            {eyebrow}
          </span>
          <h2 className="text-xl font-title font-bold text-[#071827] dark:text-white leading-tight">
            {headline}
          </h2>
          <p className="text-[#64748B] dark:text-slate-400 mt-2 text-[11px] leading-relaxed max-w-xs">
            {description}
          </p>
          <div className="mt-4 space-y-1.5">
            {highlights.map((highlight) => (
              <div key={highlight} className="flex items-center gap-2 text-[11px] text-[#071827] dark:text-slate-300">
                <span className="h-3.5 w-3.5 shrink-0 rounded-full bg-[#22C55E]/15 text-[#22C55E] flex items-center justify-center text-[9px] font-bold">
                  ✓
                </span>
                {highlight}
              </div>
            ))}
          </div>
          
          <p className="text-[9px] text-[#64748B] mt-6">
            © {new Date().getFullYear()} CarreirasMatch.
          </p>
        </div>
        
      </div>

      {/* Lado Direito: Container do Formulário */}
      <div className="flex-1 flex flex-col justify-center items-center px-4 py-8 lg:py-12 bg-[#F8FAFC] dark:bg-[#071827] relative">
        <div className="w-full max-w-md sm:max-w-lg my-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="lg:hidden mb-6 flex flex-col items-center text-center">
            <Link href="/" className="hover:opacity-90 transition-opacity">
              <BrandLogo heightClassName="h-8" />
            </Link>
          </div>
          {children}
        </div>
      </div>

      {/* Custom Scan Line Animation */}
      <style jsx global>{`
        @keyframes scan {
          0% { top: 0%; }
          50% { top: 100%; }
          100% { top: 0%; }
        }
      `}</style>
    </div>
  );
}

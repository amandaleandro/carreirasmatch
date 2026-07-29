"use client";

import { useState, FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AuthShell } from "@/components/auth-shell";
import { CAREER_SEGMENT_OPTIONS, type CareerSegment } from "@/lib/career-segments";
import { COMMON_PROFESSIONAL_AREAS, COMMON_STUDY_AREAS } from "@/lib/course-catalog";
import { track, ANALYTICS_EVENTS } from "@/lib/analytics";
import { formatBrazilPhone } from "@/lib/contact-validation";

const MOMENT_TIPS: Record<string, string> = {
  apprentice: "✨ Encontre vagas de aprendizagem, prepare seu primeiro currículo e descubra áreas para começar.",
  first_job: "✨ Destaque projetos, cursos e habilidades para conquistar sua primeira oportunidade.",
  internship: "✨ Encontre estágios alinhados ao seu curso e organize sua preparação para as seleções.",
  student: "✨ Prepare-se para o próximo passo — mesmo que você já tenha uma profissão em mente ou ainda esteja explorando opções.",
  career_change: "✨ Aproveite sua experiência anterior e construa uma ponte para a nova área.",
  career_pro: "✨ Melhore seu posicionamento, currículo e estratégia para conquistar uma vaga melhor.",
  concurseiro: "✨ Organize seus estudos, acompanhe concursos e prepare-se para as provas.",
  oab: "✨ Monte sua preparação para as duas fases do Exame da OAB.",
};

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [name, setName] = useState("");
  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [phone, setPhone] = useState("");
  const [whatsappOptIn, setWhatsappOptIn] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [careerSegment, setCareerSegment] = useState<CareerSegment | "">("");
  const [professionalArea, setProfessionalArea] = useState("");
  const [currentArea, setCurrentArea] = useState("");
  const [studyCourse, setStudyCourse] = useState("");
  const [coupon, setCoupon] = useState((searchParams.get("cupom") ?? "").toUpperCase());
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const needsTargetArea = ["apprentice", "first_job", "student", "career_change", "career_pro"].includes(careerSegment);
  const showAreaField = needsTargetArea || careerSegment === "internship";
  const isTransition = careerSegment === "career_change";
  const needsCurrentArea = careerSegment === "career_change" || careerSegment === "career_pro";
  const needsCourse = careerSegment === "internship";

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          whatsappOptIn: Boolean(phone) && whatsappOptIn,
          password,
          careerSegment: careerSegment || null,
          professionalArea: needsTargetArea && professionalArea ? professionalArea : null,
          currentProfessionalArea: needsCurrentArea && currentArea ? currentArea : null,
          targetProfessionalArea: needsTargetArea && professionalArea ? professionalArea : null,
          studyCourse: needsCourse && studyCourse ? studyCourse : null,
          coupon: coupon.trim() || null,
        }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error ?? "Erro ao cadastrar.");

      const signInRes = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (signInRes?.error) {
        throw new Error("Cadastro feito, mas não foi possível entrar automaticamente.");
      }

      track(ANALYTICS_EVENTS.SIGNUP_COMPLETED, { careerSegment: careerSegment || "unknown" });
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Comece agora"
      headline="Sua carreira merece um plano inteligente."
      description="Crie sua conta gratuita e receba um diagnóstico claro de aderência a vagas para o seu momento."
      highlights={[
        "Score de match para qualquer profissão",
        "Plano de ação e desenvolvimento",
        "Totalmente grátis para começar",
      ]}
    >
      <header className="mb-4 text-center lg:text-left animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h1 className="text-2xl font-title font-bold tracking-tight text-[#071827] dark:text-white">Criar conta</h1>
        <p className="text-[#64748B] dark:text-neutral-400 mt-1 text-xs">
          Leva menos de um minuto para começar.
        </p>
      </header>

      <div className="rounded-2xl border border-[#E2E8F0] dark:border-neutral-800 bg-[#FFFFFF] dark:bg-neutral-900/40 p-5 md:p-6 animate-in fade-in slide-in-from-bottom-6 duration-600">
        <form onSubmit={handleSubmit} className="space-y-3">
          
          {/* Nome */}
          <div className="space-y-1 relative group">
            <label className="block text-[9px] font-bold text-[#64748B] uppercase tracking-wider group-focus-within:text-[#2563EB] transition-colors">
              Nome
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-neutral-400 group-focus-within:text-[#2563EB] transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </span>
              <input
                type="text"
                name="name"
                autoComplete="name"
                required
                minLength={5}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome completo"
                className="w-full rounded-xl border border-[#E2E8F0] bg-white pl-9.5 pr-4 py-2.5 text-xs text-[#071827] outline-none transition-all placeholder:text-neutral-400 focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10 dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
              />
            </div>
          </div>

          {/* Celular */}
          <div className="space-y-1 relative group">
            <label className="block text-[9px] font-bold text-[#64748B] uppercase tracking-wider group-focus-within:text-[#2563EB] transition-colors">
              Celular com DDD
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-neutral-400 group-focus-within:text-[#2563EB] transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </span>
              <input
                type="tel"
                name="phone"
                autoComplete="tel-national"
                inputMode="numeric"
                value={phone}
                onChange={(e) => setPhone(formatBrazilPhone(e.target.value))}
                placeholder="(11) 99999-9999 (opcional)"
                className="w-full rounded-xl border border-[#E2E8F0] bg-white pl-9.5 pr-4 py-2.5 text-xs text-[#071827] outline-none transition-all placeholder:text-neutral-400 focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10 dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
              />
            </div>
            {phone && (
              <label className="flex items-start gap-2 pt-1 text-[10px] leading-snug text-[#64748B] dark:text-slate-400">
                <input
                  type="checkbox"
                  checked={whatsappOptIn}
                  onChange={(e) => setWhatsappOptIn(e.target.checked)}
                  className="mt-0.5 h-3.5 w-3.5 rounded border-[#E2E8F0] text-[#2563EB] focus:ring-[#2563EB]/30"
                />
                Quero receber dicas e novidades por WhatsApp neste número.
              </label>
            )}
          </div>

          {/* E-mail */}
          <div className="space-y-1 relative group">
            <label className="block text-[9px] font-bold text-[#64748B] uppercase tracking-wider group-focus-within:text-[#2563EB] transition-colors">
              E-mail
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-neutral-400 group-focus-within:text-[#2563EB] transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </span>
              <input
                type="email"
                name="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Seu melhor e-mail"
                className="w-full rounded-xl border border-[#E2E8F0] bg-white pl-9.5 pr-4 py-2.5 text-xs text-[#071827] outline-none transition-all placeholder:text-neutral-400 focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10 dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
              />
            </div>
          </div>

          {/* Senha */}
          <div className="space-y-1 relative group">
            <label className="block text-[9px] font-bold text-[#64748B] uppercase tracking-wider group-focus-within:text-[#2563EB] transition-colors">
              Senha
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-neutral-400 group-focus-within:text-[#2563EB] transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </span>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                placeholder="Crie uma senha forte"
                className="w-full rounded-xl border border-[#E2E8F0] bg-white pl-9.5 pr-9.5 py-2.5 text-xs text-[#071827] outline-none transition-all placeholder:text-neutral-400 focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10 dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 text-neutral-400 hover:text-[#071827] dark:hover:text-white transition-colors cursor-pointer"
              >
                {showPassword ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3.5 3.5 0 114.882 4.882M9.988 9.988L1.72 1.72m16.599 16.599L12 12m0 0l6.599-6.599M22 12c-1.275 4.057-5.065 7-9.543 7a9.963 9.963 0 01-2.062-.218M19.78 19.78L1.22 1.22" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            <p className="text-[9px] text-neutral-500">Mínimo de 8 caracteres.</p>
          </div>

          {/* Objetivo principal */}
          <div className="space-y-1 relative group">
            <label className="block text-[9px] font-bold text-[#64748B] uppercase tracking-wider group-focus-within:text-[#2563EB] transition-colors">
              O que você quer alcançar agora?
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-neutral-400 group-focus-within:text-[#2563EB] transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </span>
              <select
                value={careerSegment}
                onChange={(e) => setCareerSegment(e.target.value as CareerSegment | "")}
                required
                className="w-full rounded-xl border border-[#E2E8F0] bg-white text-[#071827] pl-9.5 pr-4 py-2.5 text-xs outline-none transition-all focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10 dark:border-white/10 dark:bg-white/[0.03] dark:text-neutral-100"
              >
                <option value="" disabled>
                  Escolha seu objetivo principal
                </option>
                {CAREER_SEGMENT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-[10px] leading-relaxed text-neutral-500">
              Usaremos essa resposta para personalizar seu menu, suas vagas e suas recomendações.
            </p>

            {/* Dica do momento */}
            {careerSegment && MOMENT_TIPS[careerSegment] && (
              <div className="mt-2 p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-500/20 text-[11px] text-blue-700 dark:text-blue-300 animate-in fade-in slide-in-from-top-2 duration-300">
                {MOMENT_TIPS[careerSegment]}
              </div>
            )}
          </div>

          {showAreaField && (
            <>
            {needsCurrentArea && (
              <div className="space-y-1 relative group animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="block text-[9px] font-bold text-[#64748B] uppercase tracking-wider">
                  {isTransition ? "De qual área você está saindo?" : "Em qual área você trabalha hoje?"}
                </label>
                <input
                  type="text"
                  list="register-current-areas"
                  value={currentArea}
                  onChange={(e) => setCurrentArea(e.target.value)}
                  required
                  placeholder="Ex: Vendas, Administração, Atendimento..."
                  className="w-full rounded-xl border border-[#E2E8F0] bg-white px-4 py-2.5 text-xs text-[#071827] outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10 dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
                />
                <datalist id="register-current-areas">
                  {COMMON_PROFESSIONAL_AREAS.map((option) => <option key={option} value={option} />)}
                </datalist>
              </div>
            )}
            {needsTargetArea && (
            <div className="space-y-1 relative group animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="block text-[9px] font-bold text-[#64748B] uppercase tracking-wider group-focus-within:text-[#2563EB] transition-colors">
                {careerSegment === "student"
                  ? "Qual profissão ou área interessa a você?"
                  : careerSegment === "career_change"
                    ? "Para qual área você quer migrar?"
                    : careerSegment === "career_pro"
                      ? "Qual cargo ou área você busca?"
                      : "Em qual área você gostaria de trabalhar?"}
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-neutral-400 group-focus-within:text-[#2563EB] transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </span>
                <input
                  type="text"
                  list="register-professional-areas"
                  value={professionalArea}
                  onChange={(e) => setProfessionalArea(e.target.value)}
                  placeholder={careerSegment === "student"
                    ? "Ex: Medicina, Tecnologia, Direito..."
                    : "Ex: Administração, Logística, Marketing..."}
                  className="w-full rounded-xl border border-[#E2E8F0] bg-white pl-9.5 pr-4 py-2.5 text-xs text-[#071827] outline-none transition-all placeholder:text-neutral-400 focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10 dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
                />
              </div>
              <datalist id="register-professional-areas">
                {(careerSegment === "student" || careerSegment === "internship"
                  ? COMMON_STUDY_AREAS
                  : COMMON_PROFESSIONAL_AREAS
                ).map((option) => (
                  <option key={option} value={option} />
                ))}
              </datalist>
            </div>
            )}
            {needsCourse && (
              <div className="space-y-1 relative group animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="block text-[9px] font-bold text-[#64748B] uppercase tracking-wider">
                  Qual curso você faz?
                </label>
                <input
                  type="text"
                  list="register-study-courses"
                  value={studyCourse}
                  onChange={(e) => setStudyCourse(e.target.value)}
                  required
                  placeholder="Ex: Administração, Enfermagem, Sistemas de Informação..."
                  className="w-full rounded-xl border border-[#E2E8F0] bg-white px-4 py-2.5 text-xs text-[#071827] outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10 dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
                />
                <datalist id="register-study-courses">
                  {COMMON_STUDY_AREAS.map((option) => <option key={option} value={option} />)}
                </datalist>
              </div>
            )}
            </>
          )}

          {/* Cupom */}
          <div className="space-y-1 relative group">
            <label className="block text-[9px] font-bold text-[#64748B] uppercase tracking-wider group-focus-within:text-[#2563EB] transition-colors">
              Cupom (opcional)
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-neutral-400 group-focus-within:text-[#2563EB] transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
              </span>
              <input
                type="text"
                name="coupon"
                value={coupon}
                onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                placeholder="Código de indicação"
                className="w-full rounded-xl border border-[#E2E8F0] bg-white pl-9.5 pr-4 py-2.5 text-xs uppercase text-[#071827] outline-none transition-all placeholder:text-neutral-400 focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10 dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
              />
            </div>
          </div>

          {error && (
            <div className="p-2.5 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/20 text-[11px] font-semibold text-[#EF4444]">
              ⚠️ {error}
            </div>
          )}

          <p className="text-[9px] text-[#64748B] dark:text-neutral-400 leading-relaxed">
            Ao criar sua conta, você concorda com os{" "}
            <Link href="/termos" className="underline hover:text-neutral-700 dark:hover:text-neutral-300">
              Termos de Uso
            </Link>{" "}
            e a{" "}
            <Link href="/privacidade" className="underline hover:text-neutral-700 dark:hover:text-neutral-300">
              Política de Privacidade
            </Link>
            .
          </p>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] hover:shadow-md hover:shadow-blue-500/10 px-4 py-2.5 text-xs font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="4 8" className="opacity-40" />
                  <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="2" className="opacity-60" />
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
                Criando conta...
              </>
            ) : (
              "Criar conta"
            )}
          </button>
        </form>

        <p className="text-xs text-center text-[#64748B] dark:text-neutral-400 mt-4">
          Já tem conta?{" "}
          <Link href="/login" className="font-semibold text-[#2563EB] hover:text-[#1D4ED8] hover:underline transition-colors">
            Entrar
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}

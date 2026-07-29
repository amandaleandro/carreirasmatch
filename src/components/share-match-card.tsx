"use client";

import React, { useRef, useState } from "react";
import { Download, Share2, Check, Sparkles } from "lucide-react";
import { ANALYTICS_EVENTS, track } from "@/lib/analytics";

interface ShareMatchCardProps {
  jobTitle: string;
  overallScore: number;
  userName?: string | null;
  userId?: string;
  /** Percentil do score na trilha ("fiquei à frente de X% dos candidatos") — o gancho social do card. */
  betterThanPercent?: number | null;
  analysisId?: string;
}

function wrapTextToLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number = 2
): string[] {
  const words = text.trim().split(/\s+/);
  if (words.length === 0) return [""];

  const lines: string[] = [];
  let currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const testLine = `${currentLine} ${word}`;
    if (ctx.measureText(testLine).width <= maxWidth) {
      currentLine = testLine;
    } else {
      lines.push(currentLine);
      currentLine = word;
      if (lines.length === maxLines - 1) {
        const remaining = words.slice(i).join(" ");
        currentLine = remaining;
        break;
      }
    }
  }
  lines.push(currentLine);

  const lastIdx = lines.length - 1;
  if (ctx.measureText(lines[lastIdx]).width > maxWidth) {
    let truncated = lines[lastIdx];
    while (truncated.length > 1 && ctx.measureText(`${truncated}…`).width > maxWidth) {
      truncated = truncated.slice(0, -1);
    }
    lines[lastIdx] = `${truncated.trimEnd()}…`;
  }
  return lines;
}

function copyTextFallback(value: string): boolean {
  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  let succeeded = false;
  try {
    succeeded = document.execCommand("copy");
  } catch {
    succeeded = false;
  }
  document.body.removeChild(textarea);
  return succeeded;
}

export function ShareMatchCard({ jobTitle, overallScore, userId, betterThanPercent, analysisId }: ShareMatchCardProps) {
  const hasPercentile = typeof betterThanPercent === "number" && betterThanPercent >= 50;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const ringColorClass =
    overallScore >= 70 ? "border-emerald-400 text-emerald-400" : overallScore >= 50 ? "border-amber-400 text-amber-400" : "border-red-400 text-red-400";

  const generateCanvasImage = (): string | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Dimensões do Story (9:16) - 1080x1920
    canvas.width = 1080;
    canvas.height = 1920;

    // Fundo Gradiente Mesh Profundo
    const bgGradient = ctx.createLinearGradient(0, 0, 1080, 1920);
    bgGradient.addColorStop(0, "#080D1A");
    bgGradient.addColorStop(0.3, "#0F172A");
    bgGradient.addColorStop(0.65, "#1E1B4B");
    bgGradient.addColorStop(1, "#0369A1");
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, 1080, 1920);

    // Glows Radiais de Iluminação Ambiente
    // Top Cyan Glow
    const orbTop = ctx.createRadialGradient(540, 280, 20, 540, 280, 550);
    orbTop.addColorStop(0, "rgba(56, 189, 248, 0.22)");
    orbTop.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = orbTop;
    ctx.beginPath();
    ctx.arc(540, 280, 550, 0, Math.PI * 2);
    ctx.fill();

    // Score Glow Central
    const mainGlowColor = overallScore >= 70 ? "16, 185, 129" : overallScore >= 50 ? "245, 158, 11" : "239, 68, 68";
    const orbScore = ctx.createRadialGradient(540, 780, 40, 540, 780, 450);
    orbScore.addColorStop(0, `rgba(${mainGlowColor}, 0.25)`);
    orbScore.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = orbScore;
    ctx.beginPath();
    ctx.arc(540, 780, 450, 0, Math.PI * 2);
    ctx.fill();

    // Bottom Glow
    const orbBottom = ctx.createRadialGradient(540, 1600, 30, 540, 1600, 500);
    orbBottom.addColorStop(0, "rgba(99, 102, 241, 0.28)");
    orbBottom.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = orbBottom;
    ctx.beginPath();
    ctx.arc(540, 1600, 500, 0, Math.PI * 2);
    ctx.fill();

    // Pill Badge de Topo: "⚡ MATCH DE CARREIRA"
    ctx.save();
    ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
    ctx.beginPath();
    ctx.roundRect(540 - 230, 140, 460, 68, 34);
    ctx.fill();
    ctx.strokeStyle = "rgba(56, 189, 248, 0.35)";
    ctx.lineWidth = 2.5;
    ctx.stroke();

    const emojiFontStack = 'Inter, "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif';
    ctx.fillStyle = "#38BDF8";
    ctx.font = `bold 28px ${emojiFontStack}`;
    ctx.textAlign = "center";
    ctx.fillText("⚡ MATCH DE CARREIRA", 540, 184);
    ctx.restore();

    // Card de Vaga Desejada (Glassmorphism backdrop)
    ctx.save();
    ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
    ctx.beginPath();
    ctx.roundRect(100, 250, 880, 190, 28);
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#94A3B8";
    ctx.font = "bold 22px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("VAGA DESEJADA", 540, 295);

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 42px Inter, sans-serif";
    const wrappedJobLines = wrapTextToLines(ctx, jobTitle, 820, 2);
    if (wrappedJobLines.length === 1) {
      ctx.fillText(wrappedJobLines[0], 540, 360);
    } else {
      ctx.fillText(wrappedJobLines[0], 540, 345);
      ctx.fillText(wrappedJobLines[1], 540, 395);
    }
    ctx.restore();

    // Anel Central com Percentual de Match (Expandido para maior respiro de texto)
    const ringCenterX = 540;
    const ringCenterY = 800;
    const ringRadius = 245;

    // Anel de Fundo
    ctx.save();
    ctx.beginPath();
    ctx.arc(ringCenterX, ringCenterY, ringRadius, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.lineWidth = 30;
    ctx.stroke();

    // Preenchimento escuro interno do anel com leve sombra
    ctx.fillStyle = "rgba(15, 23, 42, 0.55)";
    ctx.beginPath();
    ctx.arc(ringCenterX, ringCenterY, ringRadius - 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Anel de Progresso com Glow
    const scoreHex = overallScore >= 70 ? "#10B981" : overallScore >= 50 ? "#F59E0B" : "#EF4444";
    const startAngle = -Math.PI / 2;
    const endAngle = startAngle + Math.PI * 2 * (overallScore / 100);

    ctx.save();
    ctx.shadowColor = scoreHex;
    ctx.shadowBlur = 45;
    ctx.beginPath();
    ctx.arc(ringCenterX, ringCenterY, ringRadius, startAngle, endAngle);
    ctx.strokeStyle = scoreHex;
    ctx.lineWidth = 30;
    ctx.lineCap = "round";
    ctx.stroke();
    ctx.restore();

    // Texto do Score Dentro do Anel (Espaçamento amplo e legível)
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.6)";
    ctx.shadowBlur = 24;
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "900 145px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`${overallScore}%`, ringCenterX, ringCenterY + 30);

    ctx.fillStyle = "#94A3B8";
    ctx.font = "bold 24px Inter, sans-serif";
    ctx.fillText("ADERÊNCIA À VAGA", ringCenterX, ringCenterY + 98);
    ctx.restore();

    // Badge de Percentil ("🏆 À frente de X% dos candidatos")
    let quoteBoxY = 1140;
    if (hasPercentile) {
      ctx.save();
      ctx.fillStyle = "rgba(251, 191, 36, 0.12)";
      ctx.beginPath();
      ctx.roundRect(540 - 330, 1070, 660, 76, 38);
      ctx.fill();
      ctx.strokeStyle = "rgba(251, 191, 36, 0.4)";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = "#FBBF24";
      ctx.font = `bold 31px ${emojiFontStack}`;
      ctx.textAlign = "center";
      ctx.fillText(`🏆 À frente de ${betterThanPercent}% dos candidatos`, 540, 1120);
      ctx.restore();
      quoteBoxY = 1180;
    }

    // Card Glassmorphic de Mensagem Social
    ctx.save();
    ctx.fillStyle = "rgba(15, 23, 42, 0.55)";
    ctx.beginPath();
    ctx.roundRect(110, quoteBoxY, 860, 260, 36);
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.textAlign = "center";
    ctx.font = "bold 40px Inter, sans-serif";
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(`"Meu Match com essa vaga foi de ${overallScore}%!`, 540, quoteBoxY + 95);

    ctx.font = `bold 44px ${emojiFontStack}`;
    ctx.fillStyle = "#38BDF8";
    ctx.fillText("E o seu? 🚀\"", 540, quoteBoxY + 170);
    ctx.restore();

    // Seção de Chamada para Ação
    const ctaY = quoteBoxY + 310;
    ctx.fillStyle = "#CBD5E1";
    ctx.font = "500 32px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Faça o teste grátis do seu currículo em:", 540, ctaY);

    // Botão Container da URL
    ctx.save();
    const btnY = ctaY + 30;
    const btnGradient = ctx.createLinearGradient(540 - 390, btnY, 540 + 390, btnY);
    btnGradient.addColorStop(0, "#0284C7");
    btnGradient.addColorStop(1, "#2563EB");
    ctx.fillStyle = btnGradient;
    ctx.beginPath();
    ctx.roundRect(540 - 390, btnY, 780, 92, 46);
    ctx.fill();

    ctx.shadowColor = "rgba(2, 132, 199, 0.5)";
    ctx.shadowBlur = 25;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#FFFFFF";
    ctx.font = `bold 40px ${emojiFontStack}`;
    ctx.fillText("⚡ carreirasmatch.com.br/desafio", 540, btnY + 58);
    ctx.restore();

    // Rodapé com a Marca
    ctx.fillStyle = "#64748B";
    ctx.font = "bold 26px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("CarreirasMatch • Inteligência Profissional", 540, 1800);

    return canvas.toDataURL("image/png");
  };

  const handleDownload = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const dataUrl = generateCanvasImage();
      if (dataUrl) {
        const link = document.createElement("a");
        link.download = `match-carreira-${overallScore}pct.png`;
        link.href = dataUrl;
        link.click();
        track(ANALYTICS_EVENTS.SHARE_CARD_GENERATED, { method: "download", analysisId: analysisId ?? "" });
      }
      setIsGenerating(false);
    }, 100);
  };

  const handleShare = async () => {
    setIsGenerating(true);
    const dataUrl = generateCanvasImage();
    setIsGenerating(false);
    if (dataUrl) {
      track(ANALYTICS_EVENTS.SHARE_CARD_GENERATED, { method: "share", analysisId: analysisId ?? "" });
    }

    const origin = typeof window !== "undefined" ? window.location.origin : "https://carreirasmatch.com.br";
    const shareUrl = userId ? `${origin}/desafio?ref=${userId}` : `${origin}/desafio`;
    const text = hasPercentile
      ? `Meu Match com a vaga de ${jobTitle} foi de ${overallScore}% no CarreirasMatch — fiquei à frente de ${betterThanPercent}% dos candidatos! Faça o seu teste também:`
      : `Meu Match com a vaga de ${jobTitle} foi de ${overallScore}% no CarreirasMatch! Faça o seu teste também:`;

    if (navigator.share && dataUrl) {
      try {
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        const file = new File([blob], "match-carreira.png", { type: "image/png" });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: "Desafio do Match de Carreira",
            text,
            url: shareUrl,
            files: [file],
          });
          track(ANALYTICS_EVENTS.CARD_SHARED, { method: "native", analysisId: analysisId ?? "" });
          return;
        }

        if (navigator.canShare && navigator.canShare({ text, url: shareUrl })) {
          await navigator.share({
            title: "Desafio do Match de Carreira",
            text,
            url: shareUrl,
          });
          track(ANALYTICS_EVENTS.CARD_SHARED, { method: "native", analysisId: analysisId ?? "" });
          return;
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }
      }
    }

    const fullText = `${text} ${shareUrl}`;
    let copySucceeded = false;

    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(fullText);
        copySucceeded = true;
      } catch {
        copySucceeded = false;
      }
    }

    if (!copySucceeded) {
      copySucceeded = copyTextFallback(fullText);
    }

    if (copySucceeded) {
      track(ANALYTICS_EVENTS.CARD_SHARED, { method: "clipboard", analysisId: analysisId ?? "" });
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } else {
      window.prompt("Copie seu link de convite:", fullText);
    }
  };

  return (
    <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 space-y-6 relative overflow-hidden">
      <canvas ref={canvasRef} className="hidden" />

      {/* Glow de fundo */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2 text-sky-400 font-semibold text-sm">
          <Sparkles className="w-4 h-4" />
          <span>Card do Desafio para Story</span>
        </div>
        <span className="text-xs bg-sky-500/20 text-sky-300 font-bold px-3 py-1 rounded-full border border-sky-500/30">
          Formato 9:16 HD
        </span>
      </div>

      <div className="grid md:grid-cols-2 gap-6 items-center">
        {/* Preview miniaturizado moderno */}
        <div className="mx-auto w-full max-w-[250px] aspect-[9/16] bg-gradient-to-b from-[#080D1A] via-slate-900 to-sky-950 rounded-2xl p-5 flex flex-col justify-between items-center text-center shadow-2xl border border-white/20 relative group overflow-hidden">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-sky-500/20 rounded-full blur-2xl pointer-events-none" />

          <div className="text-[10px] uppercase font-extrabold text-sky-300 tracking-wider bg-white/10 px-2.5 py-1 rounded-full border border-sky-400/30 backdrop-blur-md">
            ⚡ MATCH DE CARREIRA
          </div>

          <div className="space-y-2 my-auto w-full">
            <div className="bg-white/5 border border-white/10 rounded-xl p-2.5">
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Vaga Desejada</p>
              <p className="text-xs font-bold text-white line-clamp-2 mt-0.5 leading-snug">{jobTitle}</p>
            </div>

            <div className={`my-2 inline-flex flex-col items-center justify-center w-28 h-28 rounded-full border-4 ${ringColorClass} bg-slate-950/60 shadow-xl relative`}>
              <span className="text-3xl font-bold text-white leading-none">{overallScore}%</span>
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-1">Aderência</span>
            </div>

            {hasPercentile && (
              <div className="bg-amber-500/10 border border-amber-500/30 px-2 py-1 rounded-full text-[9px] font-bold text-amber-300 inline-block">
                🏆 À frente de {betterThanPercent}% dos candidatos
              </div>
            )}

            <div className="bg-slate-950/70 border border-white/10 p-2.5 rounded-xl text-[11px] font-bold text-white leading-snug">
              &ldquo;Meu Match foi de {overallScore}%! E o seu? 🚀&rdquo;
            </div>
          </div>

          <div className="w-full bg-gradient-to-r from-sky-600 to-blue-600 py-1.5 rounded-lg text-[9px] text-white font-bold tracking-tight shadow-md">
            ⚡ carreirasmatch.com.br/desafio
          </div>
        </div>

        {/* Informações e Botões */}
        <div className="space-y-4 text-left">
          <h3 className="text-xl font-bold text-white">
            Compartilhe seu resultado nos Stories!
          </h3>
          <p className="text-sm text-slate-300">
            Baixe o card em alta resolução pronto para os seus Stories ou envie no WhatsApp para convidar amigos e comparar o percentual de aderência de vocês.
          </p>

          <div className="pt-2 space-y-3">
            <button
              onClick={handleDownload}
              disabled={isGenerating}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold py-3.5 px-5 rounded-xl transition-all shadow-lg shadow-sky-500/25 active:scale-[0.99] disabled:opacity-50 text-sm"
            >
              <Download className="w-4 h-4" />
              <span>{isGenerating ? "Gerando imagem HD..." : "Baixar Imagem do Story (HD)"}</span>
            </button>

            <button
              onClick={handleShare}
              disabled={isGenerating}
              className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold py-3.5 px-5 rounded-xl transition-all border border-white/20 text-sm"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">Link e texto copiados!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  <span>Compartilhar / Copiar Convite</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

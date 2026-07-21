"use client";

import React, { useRef, useState } from "react";
import { Download, Share2, Check, Sparkles } from "lucide-react";

interface ShareMatchCardProps {
  jobTitle: string;
  overallScore: number;
  userName?: string | null;
  userId?: string;
}

function truncateToWidth(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let truncated = text;
  while (truncated.length > 1 && ctx.measureText(`${truncated}…`).width > maxWidth) {
    truncated = truncated.slice(0, -1);
  }
  return `${truncated.trimEnd()}…`;
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

export function ShareMatchCard({ jobTitle, overallScore, userName, userId }: ShareMatchCardProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const ringColorClass =
    overallScore >= 70 ? "border-emerald-400" : overallScore >= 50 ? "border-amber-400" : "border-red-400";

  const generateCanvasImage = (): string | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Dimensões do Story (9:16) - 1080x1920 em HD canvas scale
    canvas.width = 1080;
    canvas.height = 1920;

    // Fundo Gradiente Escuro Moderno
    const gradient = ctx.createLinearGradient(0, 0, 1080, 1920);
    gradient.addColorStop(0, "#0F172A"); // slate-900
    gradient.addColorStop(0.5, "#1E1B4B"); // indigo-950
    gradient.addColorStop(1, "#0284C7"); // sky-600
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1080, 1920);

    // Círculo decorativo brilhante no topo
    const glowGradient = ctx.createRadialGradient(540, 600, 50, 540, 600, 500);
    glowGradient.addColorStop(0, "rgba(56, 189, 248, 0.25)");
    glowGradient.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = glowGradient;
    ctx.beginPath();
    ctx.arc(540, 600, 500, 0, Math.PI * 2);
    ctx.fill();

    // Badge de Topo: "DESAFIO DO MATCH DE CARREIRA"
    ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
    ctx.beginPath();
    ctx.roundRect(540 - 240, 220, 480, 70, 35);
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    ctx.lineWidth = 3;
    ctx.stroke();

    const emojiFontStack = 'Inter, "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif';

    ctx.fillStyle = "#38BDF8";
    ctx.font = `bold 28px ${emojiFontStack}`;
    ctx.textAlign = "center";
    ctx.fillText("⚡ MATCH DE CARREIRA", 540, 265);

    // Vaga Desejada
    ctx.fillStyle = "#94A3B8";
    ctx.font = "500 32px Inter, sans-serif";
    ctx.fillText("VAGA DESEJADA", 540, 420);

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 52px Inter, sans-serif";
    const truncatedJob = truncateToWidth(ctx, jobTitle, 900);
    ctx.fillText(truncatedJob, 540, 490);

    // Anel Central com Percentual de Match
    const ringCenterX = 540;
    const ringCenterY = 820;
    const ringRadius = 220;

    // Anel de Fundo
    ctx.beginPath();
    ctx.arc(ringCenterX, ringCenterY, ringRadius, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 36;
    ctx.stroke();

    // Anel de Progresso
    const scoreColor = overallScore >= 70 ? "#10B981" : overallScore >= 50 ? "#F59E0B" : "#EF4444";
    const startAngle = -Math.PI / 2;
    const endAngle = startAngle + (Math.PI * 2 * (overallScore / 100));

    // Glow suave atrás do anel para destacar o score
    ctx.save();
    ctx.shadowColor = scoreColor;
    ctx.shadowBlur = 30;
    ctx.beginPath();
    ctx.arc(ringCenterX, ringCenterY, ringRadius, startAngle, endAngle);
    ctx.strokeStyle = scoreColor;
    ctx.lineWidth = 36;
    ctx.lineCap = "round";
    ctx.stroke();
    ctx.restore();

    // Texto do Score
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "900 140px Inter, sans-serif";
    ctx.fillText(`${overallScore}%`, ringCenterX, ringCenterY + 40);

    ctx.fillStyle = "#94A3B8";
    ctx.font = "bold 32px Inter, sans-serif";
    ctx.fillText("ADERÊNCIA DA VAGA", ringCenterX, ringCenterY + 110);

    // Card de Mensagem Central
    ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
    ctx.beginPath();
    ctx.roundRect(140, 1180, 800, 260, 40);
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.font = "bold 44px Inter, sans-serif";
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(`"Meu Match com essa vaga foi de ${overallScore}%!`, 540, 1290);
    ctx.fillStyle = "#38BDF8";
    ctx.fillText('E o seu?"', 540, 1360);

    // Chamada para Ação e Rodapé
    ctx.fillStyle = "#E2E8F0";
    ctx.font = "500 36px Inter, sans-serif";
    ctx.fillText("Faça o teste grátis do seu currículo em:", 540, 1560);

    ctx.fillStyle = "#38BDF8";
    ctx.font = "bold 48px Inter, sans-serif";
    ctx.fillText("carreirasmatch.com.br/desafio", 540, 1630);

    // Logo do Rodapé
    ctx.fillStyle = "#94A3B8";
    ctx.font = "bold 28px Inter, sans-serif";
    ctx.fillText("CarreirasMatch • Inteligência Profissional", 540, 1780);

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
      }
      setIsGenerating(false);
    }, 100);
  };

  const handleShare = async () => {
    setIsGenerating(true);
    const dataUrl = generateCanvasImage();
    setIsGenerating(false);

    const origin = typeof window !== "undefined" ? window.location.origin : "https://carreirasmatch.com.br";
    const shareUrl = userId ? `${origin}/desafio?ref=${userId}` : `${origin}/desafio`;
    const text = `Meu Match com a vaga de ${jobTitle} foi de ${overallScore}% no CarreirasMatch! Faça o seu teste também:`;

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
          return;
        }

        if (navigator.canShare && navigator.canShare({ text, url: shareUrl })) {
          await navigator.share({
            title: "Desafio do Match de Carreira",
            text,
            url: shareUrl,
          });
          return;
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }
        // Segue para o fallback de copiar link
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
          Formato 9:16
        </span>
      </div>

      <div className="grid md:grid-cols-2 gap-6 items-center">
        {/* Preview miniaturizado */}
        <div className="mx-auto w-full max-w-[240px] aspect-[9/16] bg-gradient-to-b from-slate-900 via-indigo-950 to-sky-700 rounded-2xl p-5 flex flex-col justify-between items-center text-center shadow-2xl border border-white/20 relative group">
          <div className="text-[10px] uppercase font-extrabold text-sky-300 tracking-wider bg-white/10 px-2 py-0.5 rounded-full border border-white/20">
            ⚡ MATCH DE CARREIRA
          </div>

          <div className="space-y-1 my-auto">
            <p className="text-[10px] text-slate-400 font-medium uppercase">Vaga</p>
            <p className="text-xs font-bold text-white line-clamp-2">{jobTitle}</p>

            <div className={`my-3 inline-flex items-center justify-center w-24 h-24 rounded-full border-4 ${ringColorClass} bg-slate-950/40 text-2xl font-black text-white`}>
              {overallScore}%
            </div>

            <div className="bg-white/10 p-2 rounded-xl text-[11px] font-bold text-white leading-tight">
              "Meu Match com essa vaga foi de {overallScore}%. E o seu?"
            </div>
          </div>

          <div className="text-[9px] text-sky-200 font-semibold">
            carreirasmatch.com.br/desafio
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
              className="w-full flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold py-3 px-5 rounded-xl transition-all shadow-lg shadow-sky-500/20 active:scale-[0.99] disabled:opacity-50 text-sm"
            >
              <Download className="w-4 h-4" />
              <span>{isGenerating ? "Gerando imagem..." : "Baixar Imagem do Story"}</span>
            </button>

            <button
              onClick={handleShare}
              disabled={isGenerating}
              className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-5 rounded-xl transition-all border border-white/20 text-sm"
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

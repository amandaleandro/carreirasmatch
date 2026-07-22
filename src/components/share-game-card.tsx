"use client";

import { useRef, useState } from "react";
import { Download, Share2, Check } from "lucide-react";

interface ShareGameCardProps {
  gameLabel: string;
  score: number;
  scoreSuffix?: string;
  accentColor?: string;
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

/** Card compartilhável (formato Story 9:16) com a pontuação de uma partida de jogo. */
export function ShareGameCard({ gameLabel, score, scoreSuffix = "pts", accentColor = "#2563EB" }: ShareGameCardProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateCanvasImage = (): string | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    canvas.width = 1080;
    canvas.height = 1920;

    const gradient = ctx.createLinearGradient(0, 0, 1080, 1920);
    gradient.addColorStop(0, "#0F172A");
    gradient.addColorStop(0.5, "#1E1B4B");
    gradient.addColorStop(1, accentColor);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1080, 1920);

    const glowGradient = ctx.createRadialGradient(540, 700, 50, 540, 700, 520);
    glowGradient.addColorStop(0, "rgba(255, 255, 255, 0.18)");
    glowGradient.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = glowGradient;
    ctx.beginPath();
    ctx.arc(540, 700, 520, 0, Math.PI * 2);
    ctx.fill();

    ctx.textAlign = "center";

    // Badge de topo
    ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
    ctx.beginPath();
    ctx.roundRect(540 - 260, 240, 520, 70, 35);
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = "#FBBF24";
    ctx.font = 'bold 28px Inter, "Segoe UI Emoji", sans-serif';
    ctx.fillText("🏆 PLAYGROUND CARREIRASMATCH", 540, 285);

    // Nome do jogo
    ctx.fillStyle = "#94A3B8";
    ctx.font = "500 34px Inter, sans-serif";
    ctx.fillText("JOGUEI", 540, 460);

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 64px Inter, sans-serif";
    ctx.fillText(gameLabel, 540, 540);

    // Círculo com o score
    const ringCenterX = 540;
    const ringCenterY = 950;
    const ringRadius = 260;

    ctx.beginPath();
    ctx.arc(ringCenterX, ringCenterY, ringRadius, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
    ctx.lineWidth = 30;
    ctx.stroke();

    ctx.save();
    ctx.shadowColor = accentColor;
    ctx.shadowBlur = 40;
    ctx.beginPath();
    ctx.arc(ringCenterX, ringCenterY, ringRadius, 0, Math.PI * 2);
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 30;
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "900 130px Inter, sans-serif";
    ctx.fillText(`${score}`, ringCenterX, ringCenterY + 20);

    ctx.fillStyle = "#94A3B8";
    ctx.font = "bold 34px Inter, sans-serif";
    ctx.fillText(scoreSuffix.toUpperCase(), ringCenterX, ringCenterY + 80);

    // Card de mensagem
    ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
    ctx.beginPath();
    ctx.roundRect(140, 1330, 800, 220, 40);
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.font = "bold 42px Inter, sans-serif";
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(`"Fiz ${score} ${scoreSuffix} no ${gameLabel}!`, 540, 1420);
    ctx.fillStyle = "#FBBF24";
    ctx.fillText('Supera se for capaz."', 540, 1480);

    // Rodapé
    ctx.fillStyle = "#E2E8F0";
    ctx.font = "500 36px Inter, sans-serif";
    ctx.fillText("Jogue grátis em:", 540, 1650);

    ctx.fillStyle = "#FBBF24";
    ctx.font = "bold 48px Inter, sans-serif";
    ctx.fillText("carreirasmatch.com.br/jogos", 540, 1720);

    ctx.fillStyle = "#94A3B8";
    ctx.font = "bold 28px Inter, sans-serif";
    ctx.fillText("CarreirasMatch • Playground de Carreira", 540, 1830);

    return canvas.toDataURL("image/png");
  };

  const handleDownload = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const dataUrl = generateCanvasImage();
      if (dataUrl) {
        const link = document.createElement("a");
        link.download = `jogo-${gameLabel.toLowerCase().replace(/\s+/g, "-")}-${score}${scoreSuffix}.png`;
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
    const shareUrl = `${origin}/jogos`;
    const text = `Fiz ${score} ${scoreSuffix} no ${gameLabel} do CarreirasMatch! Supera se for capaz:`;

    if (navigator.share && dataUrl) {
      try {
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        const file = new File([blob], "jogo-carreirasmatch.png", { type: "image/png" });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({ title: "Playground CarreirasMatch", text, url: shareUrl, files: [file] });
          return;
        }
        if (navigator.canShare && navigator.canShare({ text, url: shareUrl })) {
          await navigator.share({ title: "Playground CarreirasMatch", text, url: shareUrl });
          return;
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
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
    if (!copySucceeded) copySucceeded = copyTextFallback(fullText);

    if (copySucceeded) {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } else {
      window.prompt("Copie seu link de convite:", fullText);
    }
  };

  return (
    <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/60 p-4 space-y-3">
      <canvas ref={canvasRef} className="hidden" />
      <p className="text-xs font-bold text-neutral-500 dark:text-neutral-400 text-center">
        Compartilhe sua pontuação e desafie seus amigos
      </p>
      <div className="flex flex-col sm:flex-row gap-2">
        <button
          onClick={handleDownload}
          disabled={isGenerating}
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 font-bold px-4 py-2.5 text-xs shadow-sm transition-all disabled:opacity-50 cursor-pointer active:scale-[0.98]"
        >
          <Download className="h-4 w-4" />
          {isGenerating ? "Gerando..." : "Baixar Card"}
        </button>
        <button
          onClick={handleShare}
          disabled={isGenerating}
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-300 dark:border-neutral-700 font-bold px-4 py-2.5 text-xs transition-all cursor-pointer active:scale-[0.98]"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 text-emerald-500" />
              <span className="text-emerald-500">Copiado!</span>
            </>
          ) : (
            <>
              <Share2 className="h-4 w-4" />
              Compartilhar
            </>
          )}
        </button>
      </div>
    </div>
  );
}

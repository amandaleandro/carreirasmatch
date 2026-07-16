import type { Metadata } from "next";
import { FreeTierAd } from "@/components/free-tier-ad";
import { toolMetadata } from "@/lib/tool-metadata";
import { EntrepreneurshipTips } from "./EntrepreneurshipTips";

const TOOL_HREF = "/tools/entrepreneurship-tips";

export const metadata: Metadata = toolMetadata(TOOL_HREF);

/**
 * Guia aberto (`free` no catálogo em src/lib/tools-catalog.ts): sem login e sem
 * assinatura. É conteúdo estático, então não custa chamada de IA por visita, e
 * aberto ele serve de porta de entrada por busca - o acesso público também está
 * declarado em src/auth.config.ts e a rota entra no sitemap.
 */
export default function EntrepreneurshipTipsPage() {
  return (
    <>
      <EntrepreneurshipTips />
      <FreeTierAd name="toolGuide" className="max-w-3xl mx-auto px-4 pb-12 w-full" />
    </>
  );
}

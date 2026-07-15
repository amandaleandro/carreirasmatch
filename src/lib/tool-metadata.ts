import type { Metadata } from "next";
import { TOOLS_CATALOG } from "@/lib/tools-catalog";

/**
 * Metadata de uma ferramenta a partir do catálogo, para o título e a descrição
 * não saírem de sincronia com o card de /tools. Importa para as ferramentas
 * abertas, que são indexadas pelo Google e aparecem no resultado de busca.
 */
export function toolMetadata(href: string): Metadata {
  const tool = TOOLS_CATALOG.find((t) => t.href === href);
  if (!tool) return {};

  return {
    title: `${tool.title} | CarreirasMatch`,
    description: tool.description,
    alternates: { canonical: href },
  };
}

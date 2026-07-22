import type { MetadataRoute } from "next";
import { SITE_NAME } from "@/lib/seo";

// PWA: torna o app instalável ("Adicionar à tela inicial") e habilita o
// service worker de push. O manifest é servido em /manifest.webmanifest.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} | vagas e preparação para entrevista`,
    short_name: SITE_NAME,
    description:
      "Compare seu currículo com a vaga, receba alertas de vagas novas e prepare-se para a entrevista.",
    id: "/",
    start_url: "/?source=pwa",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f8fafc",
    theme_color: "#2563eb",
    lang: "pt-BR",
    categories: ["business", "productivity", "education"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}

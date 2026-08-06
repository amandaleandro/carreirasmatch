import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // As páginas de nicho (uma landing de marketing por segmento) foram
  // removidas em favor das telas-hub por jornada (/descobrir, /aprender,
  // /conquistar, /evoluir, /freelancers) + páginas de conteúdo real
  // (/tools/concurso, /tools/oab). Redirects permanentes preservam links
  // externos, indexação do Google e navegação client-side (o proxy.ts
  // cobre praticamente todas as rotas, então o redirect também vale pra
  // clique em <Link>, não só pra acesso direto).
  async redirects() {
    return [
      { source: "/primeiro-emprego", destination: "/analise", permanent: true },
      { source: "/estagio", destination: "/analise", permanent: true },
      { source: "/recolocacao", destination: "/analise", permanent: true },
      { source: "/transicao", destination: "/tools/matriz-de-skills", permanent: true },
      { source: "/jovem-aprendiz", destination: "/analise", permanent: true },
      { source: "/concurso", destination: "/tools/concurso", permanent: true },
      { source: "/oab", destination: "/tools/oab", permanent: true },
      { source: "/faculdade-ou-tecnico", destination: "/descobrir", permanent: true },
      { source: "/comece", destination: "/", permanent: true },
    ];
  },
  serverExternalPackages: [
    "pdf-parse",
    "pdfjs-dist",
    "playwright",
    "playwright-core",
    "playwright-extra",
    "puppeteer-extra-plugin-stealth",
  ],
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppShell } from "@/components/app-shell";
import { Analytics } from "@/components/analytics";
import { AdsenseScript } from "@/components/adsense-script";
import { AccessTracker } from "@/components/access-tracker";
import { DashSanitizer } from "@/components/dash-sanitizer";
import { JsonLd } from "@/components/json-ld";
import { BASE_URL, SITE_NAME, organizationJsonLd, webSiteJsonLd } from "@/lib/seo";
import { Suspense } from "react";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "CarreirasMatch — compare seu currículo com a vaga",
    template: `%s | ${SITE_NAME}`,
  },
  description: "Descubra sua aderência real a uma vaga e como se preparar para a entrevista.",
  applicationName: SITE_NAME,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "pt_BR",
    url: BASE_URL,
  },
  twitter: {
    card: "summary_large_image",
  },
  // Verificação de propriedade do Google Search Console. O valor vem do env
  // (runtime, não precisa rebuild): pegar o "content" da meta tag que o Search
  // Console gera e definir GOOGLE_SITE_VERIFICATION no .env da VPS. Sem a var,
  // nenhuma meta tag é renderizada.
  verification: { google: process.env.GOOGLE_SITE_VERIFICATION },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');document.documentElement.setAttribute('data-theme',t==='dark'?'dark':'light');}catch(e){}})();`,
          }}
        />
        <AdsenseScript />
        <JsonLd data={organizationJsonLd()} />
        <JsonLd data={webSiteJsonLd()} />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <AppShell>{children}</AppShell>
        <Analytics />
        <Suspense fallback={null}>
          <AccessTracker />
        </Suspense>
        <DashSanitizer />
      </body>
    </html>
  );
}

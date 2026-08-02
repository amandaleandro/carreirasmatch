import type { Metadata, Viewport } from "next";
import { Inter, Manrope } from "next/font/google";
import { AppShell } from "@/components/app-shell";
import { auth } from "@/auth";
import { Analytics } from "@/components/analytics";
import { MarketingPixels } from "@/components/marketing-pixels";
import { AdsenseScript } from "@/components/adsense-script";
import { AccessTracker } from "@/components/access-tracker";
import { DashSanitizer } from "@/components/dash-sanitizer";
import { JsonLd } from "@/components/json-ld";
import { FeedbackProvider } from "@/components/feedback-provider";
import { BASE_URL, SITE_NAME, organizationJsonLd, softwareApplicationJsonLd, webSiteJsonLd } from "@/lib/seo";
import { Suspense } from "react";
import Script from "next/script";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "CarreirasMatch | sua carreira inteira, em um só lugar",
    template: `%s | ${SITE_NAME}`,
  },
  description: "Escolha de profissão, concurso e vestibular, currículo, entrevista, primeiro emprego, recolocação e freelancer: acompanhe cada etapa da sua carreira com inteligência artificial.",
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
  // PWA: nome/estilo quando instalado na tela inicial do iOS.
  appleWebApp: {
    capable: true,
    title: SITE_NAME,
    statusBarStyle: "default",
  },
  manifest: "/manifest.webmanifest",
  // Verificação de propriedade do Google Search Console. O valor vem do env
  // (runtime, não precisa rebuild): pegar o "content" da meta tag que o Search
  // Console gera e definir GOOGLE_SITE_VERIFICATION no .env da VPS. Sem a var,
  // nenhuma meta tag é renderizada.
  verification: { google: process.env.GOOGLE_SITE_VERIFICATION },
};

export const viewport: Viewport = {
  themeColor: "#2563eb",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${manrope.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <AdsenseScript />
        <JsonLd id="jsonld-org" data={organizationJsonLd()} />
        <JsonLd id="jsonld-website" data={webSiteJsonLd()} />
        <JsonLd id="jsonld-software" data={softwareApplicationJsonLd()} />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <Script
          id="theme-initializer"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');document.documentElement.setAttribute('data-theme',t==='dark'?'dark':'light');}catch(e){}})();`,
          }}
        />
        <FeedbackProvider>
          <AppShell>{children}</AppShell>
        </FeedbackProvider>
        <Analytics />
        <MarketingPixels />
        <Suspense fallback={null}>
          <AccessTracker
            user={
              session?.user?.id
                ? {
                    id: session.user.id,
                    email: session.user.email,
                    name: session.user.name,
                    accountType: session.user.accountType ?? "candidate",
                  }
                : null
            }
          />
        </Suspense>
        <DashSanitizer />
      </body>
    </html>
  );
}

import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

export const proxy = auth;

// ads.txt/manifest.webmanifest ficam fora do matcher junto com robots.txt/sitemap.xml:
// são arquivos lidos sem sessão (crawler ou o navegador checando instalabilidade do
// PWA). Passando pelo proxy, responderiam um redirect para /login em vez do
// conteúdo esperado — o Google trataria o ads.txt como ausente, e o navegador
// recebia HTML no lugar do JSON do manifest.
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|ads.txt|manifest.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

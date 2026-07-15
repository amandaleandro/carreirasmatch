import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

export const proxy = auth;

// ads.txt fica fora do matcher junto com robots.txt/sitemap.xml: são arquivos
// lidos por crawler, sem sessão. Passando pelo proxy, o /ads.txt responderia um
// redirect para /login e o Google trataria o arquivo como ausente.
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|ads.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

import type { NextAuthConfig } from "next-auth";
import { NextResponse } from "next/server";
const PUBLIC_PATHS = [
  "/login",
  "/register",
  "/gratuito",
  "/assinar",
  "/report",
  "/comece",
  "/curriculo-gratis",
  "/vagas-de-hoje",
  "/vagas-publicas",
  "/cursos-gratuitos",
  "/mentorias",
  "/concursos",
  "/vestibulares",
  "/mercado-de-trabalho",
  "/parceiros",
  "/vagas",
  "/analise",
  "/tools/vocation-test",
  "/tools/concurso",
  "/tools/oab",
  "/sobre",
  "/blog",
  "/contato",
  "/ajuda",
  "/termos",
  "/privacidade",
  "/esqueci-senha",
  "/redefinir-senha",
];

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = Boolean(auth?.user);
      const pathname = request.nextUrl.pathname;

      // Área de empresa: login/cadastro são públicos; o resto exige sessão de empresa.
      if (pathname.startsWith("/empresa")) {
        if (pathname === "/empresa/login" || pathname === "/empresa/cadastro") return true;
        if (auth?.user?.accountType === "company") return true;
        return NextResponse.redirect(new URL("/empresa/login", request.nextUrl));
      }

      const isPublic =
        pathname === "/" || pathname === "/tools" || PUBLIC_PATHS.some((p) => pathname.startsWith(p));
      if (isPublic) return true;
      return isLoggedIn;
    },
  },
};

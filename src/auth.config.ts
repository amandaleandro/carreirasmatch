import type { NextAuthConfig } from "next-auth";
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
  "/mercado-de-trabalho",
  "/parceiros",
  "/vagas",
  "/analise",
  "/tools/vocation-test",
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
      const isPublic =
        pathname === "/" || pathname === "/tools" || PUBLIC_PATHS.some((p) => pathname.startsWith(p));
      if (isPublic) return true;
      return isLoggedIn;
    },
  },
};

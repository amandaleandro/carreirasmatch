import type { NextAuthConfig } from "next-auth";
import { NextResponse } from "next/server";
import { isFreeTool } from "@/lib/tools-catalog";
const PUBLIC_PATHS = [
  "/login",
  "/register",
  "/gratuito",
  "/assinar",
  "/report",
  "/comece",
  "/estagio",
  "/jovem-aprendiz",
  "/primeiro-emprego",
  "/faculdade-ou-tecnico",
  "/concurso",
  "/oab",
  "/recolocacao",
  "/transicao",
  "/curriculo-gratis",
  "/como-fazer-curriculo",
  "/curriculo-sem-experiencia",
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
    // jwt/session precisam viver aqui (e não só em auth.ts): o proxy.ts cria
    // uma instância separada do NextAuth só com este config, e sem eles o
    // middleware não enxerga o accountType — toda sessão de empresa era
    // devolvida para /empresa/login.
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        const accountType = (user as { accountType?: "company" }).accountType;
        if (accountType === "company") {
          token.accountType = "company";
          token.companyId = user.id;
        } else {
          token.accountType = "candidate";
          token.companyId = undefined;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
        session.user.accountType = (token.accountType as "candidate" | "company") ?? "candidate";
        session.user.companyId = token.companyId as string | undefined;
      }
      return session;
    },
    authorized({ auth, request }) {
      const isLoggedIn = Boolean(auth?.user);
      const pathname = request.nextUrl.pathname;

      // Área de empresa: login/cadastro são públicos; o resto exige sessão de empresa.
      if (pathname.startsWith("/empresa")) {
        if (pathname === "/empresa/login" || pathname === "/empresa/cadastro") return true;
        if (auth?.user?.accountType === "company") return true;
        return NextResponse.redirect(new URL("/empresa/login", request.nextUrl));
      }

      // Sessão de empresa não navega na área de candidato: qualquer rota
      // protegida fora de /empresa volta para o painel da empresa.
      const isCompany = auth?.user?.accountType === "company";

      const isPublic =
        pathname === "/" ||
        pathname === "/tools" ||
        // Ferramentas marcadas como `free` no catálogo são conteúdo aberto (guias
        // com anúncio, liberadas no robots) e devem ser acessíveis sem login.
        isFreeTool(pathname) ||
        PUBLIC_PATHS.some((p) => pathname.startsWith(p));
      if (isPublic) return true;
      if (isCompany) return NextResponse.redirect(new URL("/empresa", request.nextUrl));
      return isLoggedIn;
    },
  },
};

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
  "/freelancers",
  "/projetos",
  "/todas-as-vagas",
  "/vagas-publicas",
  "/cursos-gratuitos",
  "/mentorias",
  "/concursos",
  "/vestibulares",
  "/mercado-de-trabalho",
  "/parceiros",
  "/vagas",
  "/empresas",
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
        const u = user as {
          accountType?: "company" | "partner";
          companyId?: string;
          companyRole?: "owner" | "member";
          partnerId?: string;
        };
        if (u.accountType === "company") {
          token.accountType = "company";
          // companyId vem do membro (a Company é a organização); memberId = user.id.
          token.companyId = u.companyId ?? user.id;
          token.companyRole = u.companyRole ?? "member";
          token.memberId = user.id;
        } else if (u.accountType === "partner") {
          token.accountType = "partner";
          token.partnerId = u.partnerId ?? user.id;
        } else {
          token.accountType = "candidate";
          token.companyId = undefined;
          token.companyRole = undefined;
          token.memberId = undefined;
          token.partnerId = undefined;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
        session.user.accountType = (token.accountType as "candidate" | "company" | "partner") ?? "candidate";
        session.user.companyId = token.companyId as string | undefined;
        session.user.companyRole = token.companyRole as "owner" | "member" | undefined;
        session.user.memberId = token.memberId as string | undefined;
        session.user.partnerId = token.partnerId as string | undefined;
      }
      return session;
    },
    authorized({ auth, request }) {
      const isLoggedIn = Boolean(auth?.user);
      const isCompany = auth?.user?.accountType === "company";
      const isPartner = auth?.user?.accountType === "partner";
      const pathname = request.nextUrl.pathname;

      // Área de empresa: login/cadastro são públicos; o resto exige sessão de empresa.
      if (pathname.startsWith("/empresa")) {
        if (pathname === "/empresa/login" || pathname === "/empresa/cadastro") {
          // Empresa já logada não precisa reautenticar; vai direto pro painel.
          if (isCompany) return NextResponse.redirect(new URL("/empresa", request.nextUrl));
          return true;
        }
        if (isCompany) return true;
        return NextResponse.redirect(new URL("/empresa/login", request.nextUrl));
      }

      // Área de parceiro: login/cadastro são públicos; o resto exige sessão de parceiro.
      if (pathname.startsWith("/parceiro")) {
        if (pathname === "/parceiro/login" || pathname === "/parceiro/cadastro") {
          if (isPartner) return NextResponse.redirect(new URL("/parceiro/dashboard", request.nextUrl));
          return true;
        }
        if (isPartner) return true;
        return NextResponse.redirect(new URL("/parceiro/login", request.nextUrl));
      }

      // Candidato já logado não precisa ver login/cadastro de candidato.
      if ((pathname === "/login" || pathname === "/register") && isLoggedIn && !isCompany && !isPartner) {
        return NextResponse.redirect(new URL("/dashboard", request.nextUrl));
      }

      const isPublic =
        pathname === "/" ||
        pathname === "/tools" ||
        // Ferramentas marcadas como `free` no catálogo são conteúdo aberto (guias
        // com anúncio, liberadas no robots) e devem ser acessíveis sem login.
        isFreeTool(pathname) ||
        PUBLIC_PATHS.some((p) => pathname.startsWith(p));
      if (isPublic) return true;
      if (isCompany) return NextResponse.redirect(new URL("/empresa", request.nextUrl));
      if (isPartner) return NextResponse.redirect(new URL("/parceiro/dashboard", request.nextUrl));
      return isLoggedIn;
    },
  },
};

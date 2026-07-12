import type { NextAuthConfig } from "next-auth";

const PUBLIC_PATHS = [
  "/login",
  "/register",
  "/assinar",
  "/report",
  "/comece",
  "/curriculo-gratis",
  "/analise",
  "/tools/vocation-test",
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
        pathname === "/" || PUBLIC_PATHS.some((p) => pathname.startsWith(p));
      if (isPublic) return true;
      return isLoggedIn;
    },
  },
};

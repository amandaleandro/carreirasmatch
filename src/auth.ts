import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/auth.config";
import { normalizeEmail } from "@/lib/email";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const LOGIN_LIMIT = { limit: 10, windowMs: 15 * 60 * 1000 };

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
    Credentials({
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials, request) {
        const email = normalizeEmail(credentials?.email);
        const password = credentials?.password as string | undefined;

        if (!email || !password) return null;

        const ip = getClientIp(request);
        const rateLimit = checkRateLimit(`login:${ip}:${email}`, LOGIN_LIMIT);
        if (!rateLimit.allowed) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.passwordHash) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return { id: user.id, name: user.name, email: user.email };
      },
    }),
    Credentials({
      id: "company-credentials",
      name: "Empresa",
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials, request) {
        const email = normalizeEmail(credentials?.email);
        const password = credentials?.password as string | undefined;

        if (!email || !password) return null;

        const ip = getClientIp(request);
        const rateLimit = checkRateLimit(`company-login:${ip}:${email}`, LOGIN_LIMIT);
        if (!rateLimit.allowed) return null;

        const company = await prisma.company.findUnique({ where: { email } });
        if (!company?.passwordHash) return null;

        const valid = await bcrypt.compare(password, company.passwordHash);
        if (!valid) return null;

        // O `accountType` marca esta sessão como de empresa; propagado no callback jwt.
        return { id: company.id, name: company.name, email: company.email, accountType: "company" as const };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
  },
});

import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      /** "company" para sessões de empregador; ausente/"candidate" para candidatos. */
      accountType?: "candidate" | "company";
      companyId?: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    accountType?: "candidate" | "company";
    companyId?: string;
  }
}

import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      /** "company" para sessões de empregador; "partner" para parceiros; ausente/"candidate" para candidatos. */
      accountType?: "candidate" | "company" | "partner";
      companyId?: string;
      /** Papel do membro dentro da empresa (sessões de empresa). */
      companyRole?: "owner" | "member";
      /** Id do CompanyMember logado (sessões de empresa). */
      memberId?: string;
      partnerId?: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    accountType?: "candidate" | "company" | "partner";
    companyId?: string;
    companyRole?: "owner" | "member";
    memberId?: string;
    partnerId?: string;
  }
}

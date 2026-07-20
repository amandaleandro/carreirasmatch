import { requireCompanyPage } from "@/lib/company-auth";
import { CompanyProfileForm } from "@/components/company-profile-form";

export const dynamic = "force-dynamic";

export default async function CompanyProfilePage() {
  const { company, session } = await requireCompanyPage();

  return (
    <div>
      <div className="max-w-2xl mx-auto px-4 md:px-8 py-10 space-y-6">
        <header>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Perfil</h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-2">
            Dados da empresa e da sua conta de acesso.
          </p>
        </header>

        <CompanyProfileForm
          company={{
            name: company.name,
            cnpj: company.cnpj,
            city: company.city,
            state: company.state,
            logoUrl: company.logoUrl,
          }}
          account={{
            name: session.user.name ?? "",
            email: session.user.email ?? "",
          }}
        />
      </div>
    </div>
  );
}

import { requireCompanyPage } from "@/lib/company-auth";
import { CompanyProfileForm } from "@/components/company-profile-form";

export const dynamic = "force-dynamic";

export default async function CompanyProfilePage() {
  const { company } = await requireCompanyPage();

  return (
    <div>
      <div className="max-w-2xl mx-auto px-4 md:px-8 py-10 space-y-6">
        <header>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Perfil da empresa</h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-2">
            Atualize os dados da empresa, o e-mail de acesso e a senha.
          </p>
        </header>

        <CompanyProfileForm
          company={{
            name: company.name,
            cnpj: company.cnpj,
            city: company.city,
            state: company.state,
            logoUrl: company.logoUrl,
            email: company.email,
          }}
        />
      </div>
    </div>
  );
}

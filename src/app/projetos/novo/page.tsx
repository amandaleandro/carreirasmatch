import Link from "next/link";
import { requireAuthPage } from "@/lib/require-auth-page";
import { NewProjectForm } from "@/components/new-project-form";

export const dynamic = "force-dynamic";

export default async function NewProjectPage() {
  await requireAuthPage();

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-8 py-10 space-y-6">
      <Link href="/projetos" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
        ← Voltar para projetos
      </Link>
      <header>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Publicar projeto</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-2">
          Descreva o que precisa. Freelancers vão enviar propostas com preço e prazo, e você escolhe.
        </p>
      </header>

      <NewProjectForm />
    </div>
  );
}

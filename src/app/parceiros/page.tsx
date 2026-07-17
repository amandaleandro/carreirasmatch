import type { Metadata } from "next";
import { ContentPage } from "@/components/content-page";
import { PartnerSubmissionForm } from "@/components/partner-submission-form";

export const metadata: Metadata = {
  title: "Publique vagas, cursos e parcerias | CarreirasMatch",
  description: "Empresas, prefeituras e instituições podem enviar oportunidades para revisão gratuita.",
  alternates: { canonical: "/parceiros" },
};

export default function PartnersPage() {
  return (
    <ContentPage eyebrow="Parceiros" title="Divulgue uma oportunidade" description="Empresas, prefeituras, escolas e instituições podem enviar vagas, cursos ou propostas. Toda publicação passa por revisão antes de aparecer no sistema." wide>
      <PartnerSubmissionForm />
    </ContentPage>
  );
}

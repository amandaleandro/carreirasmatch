import { CoverLetterForm } from "./CoverLetterForm";
import { requireAuthPage } from "@/lib/require-auth-page";

export default async function CoverLetterPage() {
  await requireAuthPage();

  return <CoverLetterForm />;
}

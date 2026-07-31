import { ApplicationAnswerForm } from "./ApplicationAnswerForm";
import { requireAuthPage } from "@/lib/require-auth-page";

export default async function ApplicationAnswerPage() {
  await requireAuthPage();

  return <ApplicationAnswerForm />;
}

import { InterviewSimulatorForm } from "./InterviewSimulatorForm";
import { requireAuthPage } from "@/lib/require-auth-page";

export default async function InterviewSimulatorPage() {
  await requireAuthPage();

  return <InterviewSimulatorForm />;
}

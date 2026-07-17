import { requireAuthPage } from "@/lib/require-auth-page";
import { BehavioralTest } from "./BehavioralTest";

export default async function BehavioralTestPage() {
  await requireAuthPage();

  return <BehavioralTest />;
}

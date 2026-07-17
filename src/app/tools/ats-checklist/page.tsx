import type { Metadata } from "next";
import { toolMetadata } from "@/lib/tool-metadata";
import { AtsChecklist } from "./ats-checklist";

export const metadata: Metadata = toolMetadata("/tools/ats-checklist");

export default function AtsChecklistPage() {
  return <AtsChecklist />;
}

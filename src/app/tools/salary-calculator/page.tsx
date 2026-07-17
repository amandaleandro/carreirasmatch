import type { Metadata } from "next";
import { toolMetadata } from "@/lib/tool-metadata";
import { SalaryCalculator } from "./salary-calculator";

export const metadata: Metadata = toolMetadata("/tools/salary-calculator");

export default function SalaryCalculatorPage() {
  return <SalaryCalculator />;
}

import type { Metadata } from "next";
import { toolMetadata } from "@/lib/tool-metadata";
import { InterviewQuestions } from "./interview-questions";

export const metadata: Metadata = toolMetadata("/tools/interview-questions");

export default function InterviewQuestionsPage() {
  return <InterviewQuestions />;
}

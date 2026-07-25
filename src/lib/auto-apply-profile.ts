import { z } from "zod";

const optionalText = z.string().trim().max(2000).optional().default("");

export const autoApplyProfileSchema = z.object({
  fullName: optionalText,
  email: z.union([z.literal(""), z.string().trim().email().max(320)]).optional().default(""),
  phone: z.string().trim().max(40).optional().default(""),
  city: z.string().trim().max(120).optional().default(""),
  state: z.string().trim().max(120).optional().default(""),
  linkedinUrl: z.union([z.literal(""), z.string().trim().url().max(500)]).optional().default(""),
  salaryExpectation: z.string().trim().max(120).optional().default(""),
  availability: z.string().trim().max(300).optional().default(""),
  workAuthorization: z.enum(["", "yes", "no"]).optional().default(""),
  willingToRelocate: z.enum(["", "yes", "no"]).optional().default(""),
  coverLetter: optionalText,
  customAnswers: z.record(z.string().trim().min(1).max(300), z.string().trim().max(2000))
    .optional()
    .default({}),
});

export type AutoApplyProfile = z.infer<typeof autoApplyProfileSchema>;

export function parseAutoApplyProfile(value: string | null | undefined): AutoApplyProfile {
  if (!value) return autoApplyProfileSchema.parse({});
  try {
    const parsed = autoApplyProfileSchema.safeParse(JSON.parse(value));
    return parsed.success ? parsed.data : autoApplyProfileSchema.parse({});
  } catch {
    return autoApplyProfileSchema.parse({});
  }
}

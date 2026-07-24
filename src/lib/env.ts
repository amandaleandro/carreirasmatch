import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().optional(),
  NEXTAUTH_SECRET: z.string().optional(),
  GROQ_API_KEY: z.string().optional(),
  MERCADOPAGO_ACCESS_TOKEN: z.string().optional(),
  MERCADOPAGO_WEBHOOK_SECRET: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM_EMAIL: z.string().optional(),
  ADMIN_EMAILS: z.string().optional(),
  VAPID_PUBLIC_KEY: z.string().optional(),
  VAPID_PRIVATE_KEY: z.string().optional(),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Valida o ambiente em runtime e emite avisos/erros amigáveis.
 */
export function validateEnv(): { valid: boolean; errors: string[] } {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const errors = result.error.issues.map((e) => `${e.path.join(".")}: ${e.message}`);
    console.error("❌ Erro de validação de ambiente (.env):", errors);
    return { valid: false, errors };
  }

  const missingWarnings: string[] = [];
  if (!process.env.GROQ_API_KEY) missingWarnings.push("GROQ_API_KEY ausente: análises por IA desativadas.");
  if (!process.env.MERCADOPAGO_ACCESS_TOKEN) missingWarnings.push("MERCADOPAGO_ACCESS_TOKEN ausente: checkout desativado.");
  if (!process.env.RESEND_API_KEY) missingWarnings.push("RESEND_API_KEY ausente: envio de e-mails desativado.");

  if (missingWarnings.length > 0) {
    console.warn("⚠️ Avisos de configuração de ambiente (.env):", missingWarnings);
  }

  return { valid: true, errors: [] };
}

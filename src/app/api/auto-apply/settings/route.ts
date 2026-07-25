import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { runAutoApplyForUser } from "@/lib/auto-apply";
import { autoApplyProfileSchema, parseAutoApplyProfile } from "@/lib/auto-apply-profile";
import { prisma } from "@/lib/prisma";

const settingsSchema = z.object({
  enabled: z.boolean().optional(),
  action: z.enum(["activate", "deactivate"]).optional(),
  minMatchScore: z.number().int().min(60).max(95).optional(),
  autoTailorResume: z.boolean().optional(),
  externalAutomationEnabled: z.boolean().optional(),
  applicationProfile: autoApplyProfileSchema.optional(),
  dailyLimit: z.number().int().min(1).max(50).optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const [settings, queue] = await Promise.all([
    prisma.autoApplicationSettings.findUnique({
      where: { userId: session.user.id },
    }),
    prisma.autoApplicationQueue.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  const responseSettings = settings
    ? { ...settings, applicationProfile: parseAutoApplyProfile(settings.applicationProfile) }
    : {
      enabled: false,
      minMatchScore: 75,
      autoTailorResume: true,
      externalAutomationEnabled: false,
      applicationProfile: parseAutoApplyProfile(null),
      dailyLimit: 10,
      consentedAt: null,
      externalConsentedAt: null,
      lastRunAt: null,
    };

  return NextResponse.json({
    settings: responseSettings,
    queue,
  });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const parsed = settingsSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Configurações inválidas.", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const {
      enabled,
      action,
      minMatchScore,
      autoTailorResume,
      externalAutomationEnabled,
      applicationProfile,
      dailyLimit,
    } = parsed.data;
    const nextEnabled = action === "activate" ? true : action === "deactivate" ? false : enabled;
    const settings = await prisma.autoApplicationSettings.upsert({
      where: { userId: session.user.id },
      update: {
        ...(nextEnabled !== undefined && {
          enabled: nextEnabled,
          ...(nextEnabled && { consentedAt: new Date() }),
        }),
        ...(minMatchScore !== undefined && { minMatchScore }),
        ...(autoTailorResume !== undefined && { autoTailorResume }),
        ...(externalAutomationEnabled !== undefined && {
          externalAutomationEnabled,
          ...(externalAutomationEnabled && { externalConsentedAt: new Date() }),
        }),
        ...(applicationProfile !== undefined && {
          applicationProfile: JSON.stringify(applicationProfile),
        }),
        ...(dailyLimit !== undefined && { dailyLimit }),
      },
      create: {
        userId: session.user.id,
        enabled: nextEnabled ?? false,
        minMatchScore: minMatchScore ?? 75,
        autoTailorResume: autoTailorResume ?? true,
        externalAutomationEnabled: externalAutomationEnabled ?? false,
        applicationProfile: JSON.stringify(applicationProfile ?? {}),
        dailyLimit: dailyLimit ?? 10,
        consentedAt: nextEnabled ? new Date() : null,
        externalConsentedAt: externalAutomationEnabled ? new Date() : null,
      },
    });

    if (externalAutomationEnabled || applicationProfile) {
      await prisma.autoApplicationQueue.updateMany({
        where: {
          userId: session.user.id,
          status: { in: ["unsupported_external", "blocked_external"] },
        },
        data: { status: "queued", failureReason: null },
      });
    }

    const shouldRunNow = settings.enabled && (
      nextEnabled === true ||
      externalAutomationEnabled === true ||
      applicationProfile !== undefined
    );
    const run = shouldRunNow
      ? await runAutoApplyForUser(session.user.id)
      : null;

    return NextResponse.json({
      success: true,
      settings: {
        ...settings,
        applicationProfile: parseAutoApplyProfile(settings.applicationProfile),
      },
      run,
    });
  } catch (error: unknown) {
    console.error("auto-apply settings:", error);
    return NextResponse.json({ error: "Não foi possível salvar as configurações." }, { status: 500 });
  }
}

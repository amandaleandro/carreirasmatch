import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin";
import { getSetting, setSetting } from "@/lib/app-settings";
import { GROQ_MODEL_SETTING_KEY, GROQ_MODEL_OPTIONS } from "@/lib/groq-model-options";

export async function GET() {
  const { session, response } = await requireAdminApi();
  if (!session) return response!;

  const value = await getSetting(GROQ_MODEL_SETTING_KEY);
  return NextResponse.json({ model: value || GROQ_MODEL_OPTIONS[0].value });
}

export async function POST(req: NextRequest) {
  const { session, response } = await requireAdminApi();
  if (!session) return response!;

  const { model } = await req.json();
  if (typeof model !== "string" || !GROQ_MODEL_OPTIONS.some((o) => o.value === model)) {
    return NextResponse.json({ error: "Modelo inválido." }, { status: 400 });
  }

  await setSetting(GROQ_MODEL_SETTING_KEY, model);
  return NextResponse.json({ model });
}

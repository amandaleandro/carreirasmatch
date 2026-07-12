import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin";
import { generateNextPost } from "@/lib/blog-scheduler";

export async function POST() {
  const { session, response } = await requireAdminApi();
  if (!session) return response!;

  try {
    const post = await generateNextPost();
    return NextResponse.json({ post });
  } catch (error) {
    console.error("admin blog generate: failed", error);
    return NextResponse.json({ error: "Falha ao gerar post." }, { status: 500 });
  }
}

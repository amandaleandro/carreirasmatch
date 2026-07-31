import { NextResponse } from "next/server";
import { ensureCommercialProducts } from "@/lib/commercial-products";
import { prisma } from "@/lib/prisma";

export async function GET() {
  await ensureCommercialProducts();
  const products = await prisma.product.findMany({ where: { active: true }, orderBy: [{ recurring: "desc" }, { priceCents: "asc" }] });
  return NextResponse.json({ products });
}

import { ImageResponse } from "next/og";
import { prisma } from "@/lib/prisma";
import { gradientIndexForSlug } from "@/lib/blog-generator";

export const alt = "CarreirasMatch | Blog";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Mesma ordem de COVER_GRADIENTS em blog-generator.ts, convertida para hex
// porque ImageResponse não resolve classes Tailwind.
const GRADIENT_HEX: [string, string][] = [
  ["#2563eb", "#06b6d4"],
  ["#7c3aed", "#d946ef"],
  ["#059669", "#14b8a6"],
  ["#ea580c", "#f59e0b"],
  ["#e11d48", "#ec4899"],
  ["#4f46e5", "#3b82f6"],
  ["#0d9488", "#84cc16"],
  ["#9333ea", "#6366f1"],
];

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await prisma.post.findUnique({
    where: { slug },
    select: { title: true, coverEmoji: true, areaLabel: true },
  });

  const title = post?.title ?? "CarreirasMatch";
  const emoji = post?.coverEmoji ?? "📝";
  const areaLabel = post?.areaLabel ?? "Blog";
  const [from, to] = GRADIENT_HEX[gradientIndexForSlug(slug)] ?? GRADIENT_HEX[0];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)`,
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ fontSize: 64 }}>{emoji}</div>
          <div style={{ display: "flex", fontSize: 28, fontWeight: 700, opacity: 0.85 }}>
            CarreirasMatch · {areaLabel}
          </div>
        </div>
        <div
          style={{
            fontSize: title.length > 70 ? 48 : 60,
            fontWeight: 800,
            lineHeight: 1.15,
            maxWidth: 1040,
          }}
        >
          {title}
        </div>
      </div>
    ),
    { ...size }
  );
}

import { ImageResponse } from "next/og";
import { prisma } from "@/lib/prisma";

/**
 * Card OG público de "meu match com esta vaga é X%", pensado pra ser
 * compartilhado (link com preview) e não pra embutir dado sensível do
 * currículo — só os campos abaixo são lidos do Analysis.
 */
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export async function GET(_req: Request, { params }: { params: Promise<{ analysisId: string }> }) {
  const { analysisId } = await params;

  const analysis = await prisma.analysis.findUnique({
    where: { id: analysisId },
    select: { jobTitle: true, careerTrack: true, overallScore: true, atsScore: true },
  });

  if (!analysis) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#0b1220",
            color: "white",
            fontSize: 40,
            fontFamily: "sans-serif",
          }}
        >
          CarreirasMatch
        </div>
      ),
      { ...size },
    );
  }

  const { jobTitle, careerTrack, overallScore, atsScore } = analysis;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #0b1220 0%, #1d4ed8 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: -1, opacity: 0.85, display: "flex" }}>
          CarreirasMatch · {careerTrack}
        </div>
        <div style={{ fontSize: 140, fontWeight: 800, lineHeight: 1, marginTop: 32, display: "flex" }}>
          {overallScore}%
        </div>
        <div style={{ fontSize: 40, marginTop: 16, opacity: 0.9, maxWidth: 950, display: "flex" }}>
          de match com a vaga de {jobTitle}
        </div>
        <div style={{ fontSize: 26, marginTop: 40, opacity: 0.7, display: "flex" }}>
          ATS score: {atsScore}%
        </div>
      </div>
    ),
    { ...size },
  );
}

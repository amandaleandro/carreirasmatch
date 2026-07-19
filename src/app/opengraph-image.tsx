import { ImageResponse } from "next/og";

// Imagem Open Graph padrão do site (usada quando uma rota não define a sua).
// 1200x630 é o tamanho recomendado para cards de redes sociais.
export const alt = "CarreirasMatch — compare seu currículo com a vaga";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
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
        <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: -1, opacity: 0.9 }}>
          CarreirasMatch
        </div>
        <div style={{ fontSize: 72, fontWeight: 800, lineHeight: 1.1, marginTop: 24, maxWidth: 900 }}>
          Compare seu currículo com a vaga
        </div>
        <div style={{ fontSize: 34, marginTop: 28, opacity: 0.85, maxWidth: 900 }}>
          Veja sua aderência real, o que ajustar e como se preparar antes de se candidatar.
        </div>
      </div>
    ),
    { ...size }
  );
}

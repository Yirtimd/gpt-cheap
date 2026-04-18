import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "ChatGPT.cheap — AEO monitoring for SMB";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "flex-start",
        width: "100%",
        height: "100%",
        padding: "80px",
        background: "linear-gradient(135deg, #fafafa 0%, #e4e4e7 100%)",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div
        style={{
          fontSize: 28,
          fontWeight: 600,
          color: "#52525b",
          marginBottom: 24,
        }}
      >
        ChatGPT.cheap
      </div>
      <div
        style={{
          fontSize: 64,
          fontWeight: 800,
          color: "#18181b",
          lineHeight: 1.1,
          letterSpacing: "-0.03em",
        }}
      >
        Know when ChatGPT
        <br />
        recommends your brand.
      </div>
      <div
        style={{
          fontSize: 28,
          color: "#52525b",
          marginTop: 32,
        }}
      >
        AEO monitoring for SMB · From $9/mo
      </div>
    </div>,
    { ...size },
  );
}

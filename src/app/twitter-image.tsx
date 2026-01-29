import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt = "Better PDF - Free Online PDF Tools"
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = "image/png"

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a0a",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "40px",
          }}
        >
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="18" height="18" rx="4" fill="#fafafa" />
            <path d="M8 7h4.5a2.5 2.5 0 0 1 0 5H8V7z" fill="#0a0a0a" />
            <path d="M8 12h5a2.5 2.5 0 0 1 0 5H8v-5z" fill="#0a0a0a" />
            <rect x="8" y="7" width="2" height="10" fill="#0a0a0a" />
          </svg>
          <span
            style={{
              fontSize: "64px",
              fontWeight: "bold",
              color: "#fafafa",
              marginLeft: "24px",
              letterSpacing: "-0.02em",
            }}
          >
            BETTER PDF
          </span>
        </div>
        <p
          style={{
            fontSize: "32px",
            color: "#737373",
            textAlign: "center",
            maxWidth: "800px",
            margin: "0",
          }}
        >
          Free PDF tools that run entirely in your browser
        </p>
        <div
          style={{
            display: "flex",
            gap: "32px",
            marginTop: "48px",
          }}
        >
          {["100% Private", "Lightning Fast", "Open Source"].map((text) => (
            <div
              key={text}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: "#22C55E",
                fontSize: "20px",
              }}
            >
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  background: "#22C55E",
                }}
              />
              {text}
            </div>
          ))}
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}

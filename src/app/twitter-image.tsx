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
          background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
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
          <div
            style={{
              width: "80px",
              height: "80px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)",
              borderRadius: "20px",
              marginRight: "24px",
            }}
          >
            <svg width="50" height="50" viewBox="0 0 32 32" fill="none">
              <rect x="4" y="2" width="24" height="28" rx="3" fill="white" fillOpacity="0.95" />
              <path d="M20 2V8C20 9.1 20.9 10 22 10H28L20 2Z" fill="white" fillOpacity="0.7" />
              <rect x="8" y="14" width="16" height="2" rx="1" fill="#3B82F6" fillOpacity="0.5" />
              <rect x="8" y="19" width="12" height="2" rx="1" fill="#3B82F6" fillOpacity="0.5" />
              <rect x="8" y="24" width="14" height="2" rx="1" fill="#3B82F6" fillOpacity="0.5" />
            </svg>
          </div>
          <span
            style={{
              fontSize: "64px",
              fontWeight: "bold",
              color: "white",
            }}
          >
            Better PDF
          </span>
        </div>
        <p
          style={{
            fontSize: "32px",
            color: "#94A3B8",
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

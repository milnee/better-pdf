import { ImageResponse } from "next/og"

export const size = {
  width: 180,
  height: 180,
}
export const contentType = "image/png"

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a0a",
          borderRadius: "32px",
        }}
      >
        <svg width="120" height="120" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="3" width="18" height="18" rx="4" fill="#fafafa" />
          <path d="M8 7h4.5a2.5 2.5 0 0 1 0 5H8V7z" fill="#0a0a0a" />
          <path d="M8 12h5a2.5 2.5 0 0 1 0 5H8v-5z" fill="#0a0a0a" />
          <rect x="8" y="7" width="2" height="10" fill="#0a0a0a" />
        </svg>
      </div>
    ),
    { ...size }
  )
}

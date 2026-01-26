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
          background: "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)",
          borderRadius: "32px",
        }}
      >
        <svg width="120" height="120" viewBox="0 0 32 32" fill="none">
          <rect x="4" y="2" width="24" height="28" rx="3" fill="white" fillOpacity="0.95" />
          <path d="M20 2V8C20 9.1 20.9 10 22 10H28L20 2Z" fill="white" fillOpacity="0.7" />
          <rect x="8" y="14" width="16" height="2" rx="1" fill="#3B82F6" fillOpacity="0.5" />
          <rect x="8" y="19" width="12" height="2" rx="1" fill="#3B82F6" fillOpacity="0.5" />
          <rect x="8" y="24" width="14" height="2" rx="1" fill="#3B82F6" fillOpacity="0.5" />
        </svg>
      </div>
    ),
    { ...size }
  )
}

import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0a0a0a",
          borderRadius: "36px",
          border: "4px solid #e50914",
          boxSizing: "border-box",
        }}
      >
        <svg
          width="120"
          height="120"
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Main F letter */}
          <path
            d="M4 3H31V10.5H14.5V16H24.5V23.5H14.5V33H4V3Z"
            fill="#e50914"
          />
          {/* Play triangle accent */}
          <path
            d="M8 14.5L18.5 20L8 25.5V14.5Z"
            fill="#ffffff"
          />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}

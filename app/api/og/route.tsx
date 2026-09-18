import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

// Category color mapping
const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  "ai-insights": { bg: "rgba(0, 240, 255, 0.12)", text: "#00F0FF", border: "rgba(0, 240, 255, 0.35)" },
  "AI Insights": { bg: "rgba(0, 240, 255, 0.12)", text: "#00F0FF", border: "rgba(0, 240, 255, 0.35)" },
  philosophy: { bg: "rgba(0, 255, 65, 0.12)", text: "#00FF41", border: "rgba(0, 255, 65, 0.35)" },
  Philosophy: { bg: "rgba(0, 255, 65, 0.12)", text: "#00FF41", border: "rgba(0, 255, 65, 0.35)" },
  blockchain: { bg: "rgba(247, 147, 26, 0.12)", text: "#F7931A", border: "rgba(247, 147, 26, 0.35)" },
  Blockchain: { bg: "rgba(247, 147, 26, 0.12)", text: "#F7931A", border: "rgba(247, 147, 26, 0.35)" },
  investing: { bg: "rgba(0, 255, 65, 0.12)", text: "#00FF41", border: "rgba(0, 255, 65, 0.35)" },
  Investing: { bg: "rgba(0, 255, 65, 0.12)", text: "#00FF41", border: "rgba(0, 255, 65, 0.35)" },
  "sheshin-notes": { bg: "rgba(163, 163, 163, 0.12)", text: "#D4D4D4", border: "rgba(163, 163, 163, 0.35)" },
  "Sheshin Notes": { bg: "rgba(163, 163, 163, 0.12)", text: "#D4D4D4", border: "rgba(163, 163, 163, 0.35)" },
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || "Philosophy";
    const title = searchParams.get("title");
    const readTime = searchParams.get("readTime") || "5 min read";
    const cover = searchParams.get("cover");

    // If no cover image provided, immediately serve the 1200x630 Master Artwork
    if (!cover) {
      const filePath = path.join(process.cwd(), "public", "og-image.png");
      if (fs.existsSync(filePath)) {
        const fileBuffer = fs.readFileSync(filePath);
        return new Response(fileBuffer, {
          status: 200,
          headers: {
            "Content-Type": "image/png",
            "Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable",
          },
        });
      }
    }

    const catStyle = CATEGORY_COLORS[category] || {
      bg: "rgba(0, 240, 255, 0.12)",
      text: "#00F0FF",
      border: "rgba(0, 240, 255, 0.35)",
    };

    // Case 1: Custom Article with Cover Image (Auto-widen and frame inside 1200x630 safe zone)
    if (cover) {
      return new ImageResponse(
        (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              backgroundColor: "#070C08",
              position: "relative",
              padding: "24px",
              boxSizing: "border-box",
            }}
          >
            {/* Outer Border with Cyber Corner Accents */}
            <div
              style={{
                position: "absolute",
                top: "20px",
                left: "20px",
                right: "20px",
                bottom: "20px",
                border: "1px solid rgba(0, 240, 255, 0.25)",
                display: "flex",
                pointerEvents: "none",
              }}
            />

            {/* Corner Bracket TL */}
            <div
              style={{
                position: "absolute",
                top: "16px",
                left: "16px",
                width: "24px",
                height: "24px",
                borderTop: "3px solid #00F0FF",
                borderLeft: "3px solid #00F0FF",
                display: "flex",
              }}
            />
            {/* Corner Bracket TR */}
            <div
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                width: "24px",
                height: "24px",
                borderTop: "3px solid #00F0FF",
                borderRight: "3px solid #00F0FF",
                display: "flex",
              }}
            />
            {/* Corner Bracket BL */}
            <div
              style={{
                position: "absolute",
                bottom: "16px",
                left: "16px",
                width: "24px",
                height: "24px",
                borderBottom: "3px solid #00F0FF",
                borderLeft: "3px solid #00F0FF",
                display: "flex",
              }}
            />
            {/* Corner Bracket BR */}
            <div
              style={{
                position: "absolute",
                bottom: "16px",
                right: "16px",
                width: "24px",
                height: "24px",
                borderBottom: "3px solid #00F0FF",
                borderRight: "3px solid #00F0FF",
                display: "flex",
              }}
            />

            {/* Top HUD Line */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
                paddingBottom: "12px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    backgroundColor: "#00FF41",
                    display: "flex",
                  }}
                />
                <span
                  style={{
                    fontFamily: "monospace",
                    fontSize: "14px",
                    fontWeight: 700,
                    letterSpacing: "2px",
                    color: "#F5FAF5",
                  }}
                >
                  POSTSOMA 2050
                </span>
                <span style={{ color: "#00F0FF", fontFamily: "monospace", fontSize: "14px" }}>
                  /
                </span>
                <span
                  style={{
                    fontFamily: "monospace",
                    fontSize: "13px",
                    color: "#8DA593",
                    letterSpacing: "1px",
                  }}
                >
                  TRANSMISSION
                </span>
              </div>

              {/* Category Badge */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "4px 12px",
                  borderRadius: "6px",
                  backgroundColor: catStyle.bg,
                  border: `1px solid ${catStyle.border}`,
                }}
              >
                <span
                  style={{
                    fontFamily: "monospace",
                    fontSize: "12px",
                    fontWeight: 700,
                    letterSpacing: "1px",
                    color: catStyle.text,
                    textTransform: "uppercase",
                  }}
                >
                  {category}
                </span>
              </div>
            </div>

            {/* Main Content Area: Split 55% Title / Info + 45% Framed Cover */}
            <div
              style={{
                display: "flex",
                flex: 1,
                alignItems: "center",
                gap: "28px",
                marginTop: "12px",
                marginBottom: "12px",
              }}
            >
              {/* Left Column: Title + Excerpt */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  flex: 1,
                  justifyContent: "center",
                  paddingRight: "16px",
                }}
              >
                <h1
                  style={{
                    fontSize: title && title.length > 30 ? "34px" : "40px",
                    fontWeight: 800,
                    lineHeight: 1.25,
                    color: "#FFFFFF",
                    margin: 0,
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {title || "PostSoma 2050 Transmission"}
                </h1>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    marginTop: "24px",
                    fontFamily: "monospace",
                    fontSize: "13px",
                    color: "#8DA593",
                  }}
                >
                  <span>EST. READ: {readTime}</span>
                  <span>•</span>
                  <span>STATUS: VERIFIED</span>
                </div>
              </div>

              {/* Right Column: Framed Viewport for the Cover Image */}
              <div
                style={{
                  width: "440px",
                  height: "420px",
                  display: "flex",
                  position: "relative",
                  borderRadius: "12px",
                  overflow: "hidden",
                  border: "1px solid rgba(0, 240, 255, 0.3)",
                  backgroundColor: "#030603",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={cover}
                  alt={title || "Cover"}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </div>
            </div>

            {/* Bottom HUD Bar */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
                paddingTop: "12px",
                borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                fontFamily: "monospace",
                fontSize: "11px",
                color: "#6B8572",
              }}
            >
              <span>RATIO: 1.91:1 [1200x630] // SAFE-ZONE COMPLIANT</span>
              <span>https://www.postsoma-2050.com</span>
            </div>
          </div>
        ),
        {
          width: 1200,
          height: 630,
        }
      );
    }

    // Case 2: Article Without Cover (Typographic Cyberpunk Layout)
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            backgroundColor: "#070C08",
            position: "relative",
            padding: "36px 44px",
            boxSizing: "border-box",
            justifyContent: "space-between",
          }}
        >
          {/* Subtle Grid Lines Overlay */}
          <div
            style={{
              position: "absolute",
              top: "24px",
              left: "24px",
              right: "24px",
              bottom: "24px",
              border: "1px solid rgba(0, 240, 255, 0.22)",
              display: "flex",
              pointerEvents: "none",
            }}
          />

          {/* Corner Bracket TL */}
          <div
            style={{
              position: "absolute",
              top: "20px",
              left: "20px",
              width: "28px",
              height: "28px",
              borderTop: "3px solid #00F0FF",
              borderLeft: "3px solid #00F0FF",
              display: "flex",
            }}
          />
          {/* Corner Bracket TR */}
          <div
            style={{
              position: "absolute",
              top: "20px",
              right: "20px",
              width: "28px",
              height: "28px",
              borderTop: "3px solid #00F0FF",
              borderRight: "3px solid #00F0FF",
              display: "flex",
            }}
          />
          {/* Corner Bracket BL */}
          <div
            style={{
              position: "absolute",
              bottom: "20px",
              left: "20px",
              width: "28px",
              height: "28px",
              borderBottom: "3px solid #00F0FF",
              borderLeft: "3px solid #00F0FF",
              display: "flex",
            }}
          />
          {/* Corner Bracket BR */}
          <div
            style={{
              position: "absolute",
              bottom: "20px",
              right: "20px",
              width: "28px",
              height: "28px",
              borderBottom: "3px solid #00F0FF",
              borderRight: "3px solid #00F0FF",
              display: "flex",
            }}
          />

          {/* Header Row */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  backgroundColor: "#00FF41",
                  display: "flex",
                }}
              />
              <span
                style={{
                  fontFamily: "monospace",
                  fontSize: "16px",
                  fontWeight: 700,
                  letterSpacing: "2px",
                  color: "#F5FAF5",
                }}
              >
                POSTSOMA 2050
              </span>
              <span style={{ color: "#00F0FF", fontFamily: "monospace", fontSize: "16px" }}>
                /
              </span>
              <span
                style={{
                  fontFamily: "monospace",
                  fontSize: "14px",
                  color: "#8DA593",
                  letterSpacing: "1px",
                }}
              >
                ARCHIVE TRANSMISSION
              </span>
            </div>

            {/* Category Pill */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "6px 16px",
                borderRadius: "8px",
                backgroundColor: catStyle.bg,
                border: `1px solid ${catStyle.border}`,
              }}
            >
              <span
                style={{
                  fontFamily: "monospace",
                  fontSize: "13px",
                  fontWeight: 700,
                  letterSpacing: "1.5px",
                  color: catStyle.text,
                  textTransform: "uppercase",
                }}
              >
                {category}
              </span>
            </div>
          </div>

          {/* Central Title Display */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginTop: "20px",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                fontFamily: "monospace",
                fontSize: "12px",
                color: "#00F0FF",
                letterSpacing: "2px",
                marginBottom: "16px",
              }}
            >
              [ NODE DECRYPTED // COGNITIVE REPOSITORY ]
            </div>

            <h1
              style={{
                fontSize: title && title.length > 35 ? "44px" : "52px",
                fontWeight: 800,
                lineHeight: 1.25,
                color: "#FFFFFF",
                margin: 0,
                letterSpacing: "-0.5px",
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {title || "PostSoma 2050 — Cyberpunk-Humanist Knowledge Garden"}
            </h1>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "24px",
                marginTop: "28px",
                fontFamily: "monospace",
                fontSize: "14px",
                color: "#8DA593",
              }}
            >
              <span>READING TIME: {readTime}</span>
              <span>•</span>
              <span>SYSTEM PROTOCOL: 2050</span>
              <span>•</span>
              <span>SECURITY LEVEL: PUBLIC</span>
            </div>
          </div>

          {/* Footer Row */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
              paddingTop: "16px",
              borderTop: "1px solid rgba(255, 255, 255, 0.1)",
              fontFamily: "monospace",
              fontSize: "12px",
              color: "#6B8572",
            }}
          >
            <span>STANDARDIZED 1.91:1 [1200x630] // ALL PLATFORMS OPTIMIZED</span>
            <span>https://www.postsoma-2050.com</span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    console.error("Failed to generate dynamic OG image:", e);
    // Fallback: return static og-image.png
    const filePath = path.join(process.cwd(), "public", "og-image.png");
    if (fs.existsSync(filePath)) {
      const fileBuffer = fs.readFileSync(filePath);
      return new Response(fileBuffer, {
        status: 200,
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": "public, max-age=86400",
        },
      });
    }
    return new Response("Error generating image", { status: 500 });
  }
}

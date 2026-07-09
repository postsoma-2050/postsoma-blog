import { NextResponse } from "next/server";

export const revalidate = 1800; // Cache on Vercel CDN for 30 minutes

const USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

type FomoLabel = "FEAR" | "NEUTRAL" | "GREED" | "EXTREME FEAR" | "EXTREME GREED" | "UNKNOWN";

function normalizeLabel(raw: string): FomoLabel {
  const clean = raw.trim().toLowerCase();
  if (clean.includes("extreme fear")) return "EXTREME FEAR";
  if (clean.includes("extreme greed")) return "EXTREME GREED";
  if (clean.includes("fear")) return "FEAR";
  if (clean.includes("greed")) return "GREED";
  if (clean.includes("neutral")) return "NEUTRAL";
  return "UNKNOWN";
}

export async function GET() {
  // Try CNN (Primary)
  try {
    const res = await fetch(
      "https://production.dataviz.cnn.io/index/fearandgreed/graphdata",
      {
        next: { revalidate: 1800 },
        headers: {
          "User-Agent": USER_AGENT,
          "Accept": "application/json"
        }
      }
    );

    if (res.ok) {
      const data = await res.json();
      const current = data?.fear_and_greed?.score;
      const rating = data?.fear_and_greed?.rating;
      
      if (typeof current === "number") {
        return NextResponse.json({
          score: Math.round(current),
          label: normalizeLabel(rating || "UNKNOWN"),
          source: "cnn",
          updatedAt: new Date().toISOString(),
          fallback: false
        });
      }
    }
  } catch (error) {
    console.warn("⚠️ CNN FNG fetch failed, falling back to Alternative.me:", error);
  }

  // Fallback: Alternative.me (Secondary)
  try {
    const res = await fetch(
      "https://api.alternative.me/fng/",
      {
        next: { revalidate: 1800 },
        headers: {
          "User-Agent": USER_AGENT,
          "Accept": "application/json"
        }
      }
    );

    if (res.ok) {
      const data = await res.json();
      const item = data?.data?.[0];
      if (item) {
        const score = parseInt(item.value, 10);
        return NextResponse.json({
          score: isNaN(score) ? 50 : score,
          label: normalizeLabel(item.value_classification || "UNKNOWN"),
          source: "alternative_me",
          updatedAt: new Date().toISOString(),
          fallback: true
        });
      }
    }
  } catch (error) {
    console.error("❌ Both CNN and Alternative.me FNG fetches failed:", error);
  }

  // Safe offline fallback
  return NextResponse.json({
    score: 50,
    label: "NEUTRAL",
    source: "unavailable",
    updatedAt: new Date().toISOString(),
    fallback: true
  });
}

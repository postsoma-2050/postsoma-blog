import { NextResponse } from "next/server";

export const revalidate = 300; // Cache on Vercel CDN for 5 minutes (price index)

function formatUsd(raw: string): string {
  const n = parseFloat(raw);
  if (isNaN(n)) return "unavailable";
  return (
    "$" +
    n.toLocaleString("en-US", {
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    })
  );
}

export async function GET() {
  let btc = "unavailable";
  let eth = "unavailable";
  try {
    const priceRes = await fetch(
      'https://api.binance.com/api/v3/ticker/price?symbols=["BTCUSDT","ETHUSDT"]',
      {
        next: { revalidate: 300 },
        headers: { "Content-Type": "application/json" }
      }
    );
    if (priceRes.ok) {
      const data = (await priceRes.json()) as Array<{ symbol: string; price: string }>;
      const get = (sym: string) =>
        data.find((d) => d.symbol === sym)?.price ?? "";
      btc = formatUsd(get("BTCUSDT"));
      eth = formatUsd(get("ETHUSDT"));
    }
  } catch (error) {
    console.error("❌ Server-side fetch to Binance failed:", error);
  }

  return NextResponse.json({
    btc,
    eth,
    updatedAt: new Date().toISOString(),
  });
}

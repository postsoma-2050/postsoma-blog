import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

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
  let source = "none";

  // 1. Try Binance.US (permits US-based IPs like Vercel serverless)
  try {
    const symbolsParam = encodeURIComponent('["BTCUSDT","ETHUSDT"]');
    const res = await fetch(
      `https://api.binance.us/api/v3/ticker/price?symbols=${symbolsParam}`,
      {
        cache: "no-store",
        headers: { "Content-Type": "application/json" }
      }
    );
    if (res.ok) {
      const data = (await res.json()) as Array<{ symbol: string; price: string }>;
      const get = (sym: string) =>
        data.find((d) => d.symbol === sym)?.price ?? "";
      btc = formatUsd(get("BTCUSDT"));
      eth = formatUsd(get("ETHUSDT"));
      if (btc !== "unavailable" && eth !== "unavailable") {
        source = "binance_us";
      }
    }
  } catch (error) {
    console.warn("⚠️ Binance.US price fetch failed:", error);
  }

  // 2. Try Coinbase (US public API, highly stable, direct USD spot prices)
  if (btc === "unavailable" || eth === "unavailable") {
    try {
      const [btcRes, ethRes] = await Promise.all([
        fetch("https://api.coinbase.com/v2/prices/BTC-USD/spot", {
          cache: "no-store",
        }),
        fetch("https://api.coinbase.com/v2/prices/ETH-USD/spot", {
          cache: "no-store",
        }),
      ]);

      if (btcRes.ok && ethRes.ok) {
        const btcData = (await btcRes.json()) as { data: { amount: string } };
        const ethData = (await ethRes.json()) as { data: { amount: string } };
        btc = formatUsd(btcData.data.amount);
        eth = formatUsd(ethData.data.amount);
        if (btc !== "unavailable" && eth !== "unavailable") {
          source = "coinbase";
        }
      }
    } catch (error) {
      console.warn("⚠️ Coinbase price fetch failed:", error);
    }
  }

  // 3. Try Binance.com (Original, kept as a fallback for non-US hosts)
  if (btc === "unavailable" || eth === "unavailable") {
    try {
      const symbolsParam = encodeURIComponent('["BTCUSDT","ETHUSDT"]');
      const res = await fetch(
        `https://api.binance.com/api/v3/ticker/price?symbols=${symbolsParam}`,
        {
          cache: "no-store",
          headers: { "Content-Type": "application/json" }
        }
      );
      if (res.ok) {
        const data = (await res.json()) as Array<{ symbol: string; price: string }>;
        const get = (sym: string) =>
          data.find((d) => d.symbol === sym)?.price ?? "";
        btc = formatUsd(get("BTCUSDT"));
        eth = formatUsd(get("ETHUSDT"));
        if (btc !== "unavailable" && eth !== "unavailable") {
          source = "binance";
        }
      }
    } catch (error) {
      console.warn("⚠️ Binance.com price fetch failed:", error);
    }
  }

  return NextResponse.json({
    btc,
    eth,
    source,
    updatedAt: new Date().toISOString(),
  });
}


import { NextResponse } from "next/server"

let cachedRates = null;
let cacheTime = 0;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

export async function GET() {
  const now = Date.now();

  if (cachedRates && now - cacheTime < CACHE_DURATION) {
    return NextResponse.json(cachedRates);
  }

  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD", {
      next: { revalidate: 3600 },
    });
    const data = await res.json();

    if (data.result !== "success") {
      throw new Error("API error");
    }

    const supported = {
      USD: { rate: 1, symbol: "$", name: "US Dollar" },
      INR: { rate: data.rates.INR, symbol: "₹", name: "Indian Rupee" },
      EUR: { rate: data.rates.EUR, symbol: "€", name: "Euro" },
    };

    cachedRates = {
      rates: supported,
      lastUpdated: data.time_last_update_utc,
      base: "USD",
    };
    cacheTime = now;

    return NextResponse.json(cachedRates);
  } catch (error) {
    const fallback = {
      rates: {
        USD: { rate: 1, symbol: "$", name: "US Dollar" },
        INR: { rate: 84.5, symbol: "₹", name: "Indian Rupee" },
        EUR: { rate: 0.92, symbol: "€", name: "Euro" },
      },
      lastUpdated: "Fallback rates",
      base: "USD",
    };
    return NextResponse.json(fallback);
  }
}

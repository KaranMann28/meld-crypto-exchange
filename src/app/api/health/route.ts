import { NextResponse } from "next/server";
import { getCountries, MeldAPIError } from "@/lib/meld";

export async function GET() {
  const start = Date.now();
  try {
    const countries = await getCountries();
    return NextResponse.json({
      status: "ok",
      environment: "sandbox",
      apiBase: process.env.MELD_API_BASE_URL || "https://api-sb.meld.io",
      apiVersion: process.env.MELD_API_VERSION || "2026-02-03",
      countriesLoaded: countries.length,
      latencyMs: Date.now() - start,
    });
  } catch (error) {
    const msg =
      error instanceof MeldAPIError
        ? error.message
        : "Unknown connection error";
    return NextResponse.json(
      {
        status: "error",
        error: msg,
        latencyMs: Date.now() - start,
      },
      { status: 502 },
    );
  }
}

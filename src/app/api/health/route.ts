import { NextResponse } from "next/server";
import { getCountries, MeldAPIError } from "@/lib/meld";
import { log } from "@/lib/logger";

export async function GET() {
  const start = Date.now();
  try {
    const countries = await getCountries();
    const resp = {
      status: "ok",
      environment: "sandbox",
      apiBase: (process.env.MELD_API_BASE_URL || "https://api-sb.meld.io").trim(),
      apiVersion: (process.env.MELD_API_VERSION || "2026-02-03").trim(),
      countriesLoaded: countries.length,
      latencyMs: Date.now() - start,
    };
    log.info({ route: "/api/health", method: "GET", status: 200, latencyMs: resp.latencyMs, detail: `${resp.countriesLoaded} countries` });
    return NextResponse.json(resp);
  } catch (error) {
    const msg =
      error instanceof MeldAPIError
        ? error.message
        : "Unknown connection error";
    log.error({ route: "/api/health", method: "GET", status: 502, latencyMs: Date.now() - start, detail: msg });
    return NextResponse.json(
      { status: "error", error: msg, latencyMs: Date.now() - start },
      { status: 502 },
    );
  }
}

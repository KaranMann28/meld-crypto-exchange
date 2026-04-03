import { NextResponse } from "next/server";
import { getCountries, getCountryDefaults, MeldAPIError } from "@/lib/meld";
import { log } from "@/lib/logger";

export async function GET(request: Request) {
  const start = Date.now();
  try {
    const { searchParams } = new URL(request.url);
    const countryCode = searchParams.get("defaults");

    if (countryCode) {
      const defaults = await getCountryDefaults(countryCode);
      log.info({ route: "/api/countries", method: "GET", status: 200, latencyMs: Date.now() - start, detail: `defaults for ${countryCode}` });
      return NextResponse.json(defaults);
    }

    const countries = await getCountries();
    log.info({ route: "/api/countries", method: "GET", status: 200, latencyMs: Date.now() - start, detail: `${countries.length} countries` });
    return NextResponse.json(countries);
  } catch (error) {
    if (error instanceof MeldAPIError) {
      log.error({ route: "/api/countries", method: "GET", status: error.status, latencyMs: Date.now() - start, detail: error.message });
      return NextResponse.json(
        { error: error.message },
        { status: error.status >= 500 ? 502 : error.status },
      );
    }
    log.error({ route: "/api/countries", method: "GET", status: 500, latencyMs: Date.now() - start, detail: String(error) });
    return NextResponse.json(
      { error: "Failed to fetch countries" },
      { status: 500 },
    );
  }
}

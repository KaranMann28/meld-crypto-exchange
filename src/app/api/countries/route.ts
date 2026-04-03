import { NextResponse } from "next/server";
import { getCountries, getCountryDefaults } from "@/lib/meld";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const countryCode = searchParams.get("defaults");

    if (countryCode) {
      const defaults = await getCountryDefaults(countryCode);
      return NextResponse.json(defaults);
    }

    const countries = await getCountries();
    return NextResponse.json(countries);
  } catch (error) {
    console.error("Countries API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch countries" },
      { status: 500 },
    );
  }
}

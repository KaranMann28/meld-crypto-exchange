import { NextResponse } from "next/server";
import { createWidgetSession } from "@/lib/meld";
import type { SessionRequest } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body: SessionRequest = await request.json();

    if (
      !body.sessionData?.walletAddress ||
      !body.sessionData?.serviceProvider ||
      !body.sessionData?.destinationCurrencyCode
    ) {
      return NextResponse.json(
        { error: "Missing required session fields" },
        { status: 400 },
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    body.sessionData.redirectUrl =
      body.sessionData.redirectUrl || `${appUrl}/transaction/complete`;

    body.externalSessionId =
      body.externalSessionId || `session_${Date.now()}`;
    body.externalCustomerId =
      body.externalCustomerId || `customer_${Date.now()}`;

    const session = await createWidgetSession(body);
    return NextResponse.json(session);
  } catch (error) {
    console.error("Session API error:", error);
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 },
    );
  }
}

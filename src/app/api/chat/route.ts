import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { log } from "@/lib/logger";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const MAX_MESSAGE_CHARS = 2000;
const MAX_TURNS = 20;
const MAX_BODY_BYTES = 48_000;
const CHAT_RATE_MAX = 45;
const CHAT_RATE_WINDOW_MS = 15 * 60 * 1000;

const SYSTEM_INSTRUCTION = `You are the in-app support assistant for a demo crypto exchange that integrates Meld's White-Label API (sandbox).
Keep replies short (2–5 sentences unless the user asks for detail). Use bullet lists only when helpful.
Topics you cover: buying crypto (on-ramp), selling crypto (off-ramp), quotes, fees, rampScore, sandbox test cards, wallet addresses, supported sandbox tokens (BTC, ETH, USDC), and how to use the UI (Get Quotes, provider cards, settings).
If asked about live production limits, compliance, or anything you are unsure about, say this is a sandbox demo and they should check Meld's official docs or their Meld account manager.
Never ask for private keys, seed phrases, or full card numbers. Never pretend a sandbox transaction moved real funds.
Tone: friendly, clear, non-hype.`;

type ChatMessage = { role: "user" | "assistant"; text: string };

function trimMessages(raw: unknown): ChatMessage[] | null {
  if (!Array.isArray(raw)) return null;
  const out: ChatMessage[] = [];
  for (const item of raw) {
    if (out.length >= MAX_TURNS) break;
    if (!item || typeof item !== "object") continue;
    const role = (item as { role?: string }).role;
    const text = (item as { text?: string }).text;
    if (role !== "user" && role !== "assistant") continue;
    if (typeof text !== "string" || !text.trim()) continue;
    const trimmed = text.trim().slice(0, MAX_MESSAGE_CHARS);
    out.push({ role, text: trimmed });
  }
  return out.length ? out : null;
}

/** Public capability flag — never exposes the API key. */
export async function GET() {
  const aiEnabled = Boolean(process.env.GEMINI_API_KEY?.trim());
  return NextResponse.json({ aiEnabled });
}

export async function POST(request: Request) {
  const start = Date.now();
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  const lenHeader = request.headers.get("content-length");
  if (lenHeader) {
    const n = Number.parseInt(lenHeader, 10);
    if (Number.isFinite(n) && n > MAX_BODY_BYTES) {
      log.warn({
        route: "/api/chat",
        method: "POST",
        status: 413,
        latencyMs: Date.now() - start,
        detail: "body too large",
      });
      return NextResponse.json({ error: "Request body too large" }, { status: 413 });
    }
  }

  const ip = getClientIp(request);
  const limited = checkRateLimit(`chat:${ip}`, CHAT_RATE_MAX, CHAT_RATE_WINDOW_MS);
  if (!limited.ok) {
    log.warn({
      route: "/api/chat",
      method: "POST",
      status: 429,
      latencyMs: Date.now() - start,
      detail: `rate limit ip=${ip}`,
    });
    return NextResponse.json(
      { error: "Too many chat requests. Try again shortly.", code: "RATE_LIMIT" },
      {
        status: 429,
        headers: { "Retry-After": String(limited.retryAfterSec) },
      },
    );
  }

  if (!apiKey) {
    log.warn({
      route: "/api/chat",
      method: "POST",
      status: 503,
      latencyMs: Date.now() - start,
      detail: "GEMINI_API_KEY not configured",
    });
    return NextResponse.json(
      { error: "Chat AI is not configured", code: "NO_API_KEY" },
      { status: 503 },
    );
  }

  try {
    const body = await request.json();
    const messages = trimMessages(body?.messages);
    if (!messages) {
      log.warn({
        route: "/api/chat",
        method: "POST",
        status: 400,
        latencyMs: Date.now() - start,
        detail: "invalid messages payload",
      });
      return NextResponse.json(
        { error: "Expected a non-empty messages array with role user|assistant and text" },
        { status: 400 },
      );
    }

    const last = messages[messages.length - 1];
    if (last.role !== "user") {
      return NextResponse.json(
        { error: "Last message must be from the user" },
        { status: 400 },
      );
    }

    const prior = messages.slice(0, -1);
    for (let i = 0; i < prior.length; i++) {
      const want: ChatMessage["role"] = i % 2 === 0 ? "user" : "assistant";
      if (prior[i].role !== want) {
        return NextResponse.json(
          { error: "Messages must alternate user → assistant → user → …" },
          { status: 400 },
        );
      }
    }

    // Default to 1.5 Flash — widely enabled on AI Studio keys; override with GEMINI_MODEL (e.g. gemini-2.0-flash).
    const modelName = process.env.GEMINI_MODEL?.trim() || "gemini-1.5-flash";
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: SYSTEM_INSTRUCTION,
    });

    const history = prior.map((m) => ({
      role: m.role === "user" ? ("user" as const) : ("model" as const),
      parts: [{ text: m.text }],
    }));

    const chat = model.startChat({ history });
    const result = await chat.sendMessage(last.text);
    const text = result.response.text()?.trim();

    if (!text) {
      log.warn({
        route: "/api/chat",
        method: "POST",
        status: 502,
        latencyMs: Date.now() - start,
        detail: "empty model response",
      });
      return NextResponse.json({ error: "Empty response from model" }, { status: 502 });
    }

    log.info({
      route: "/api/chat",
      method: "POST",
      status: 200,
      latencyMs: Date.now() - start,
      detail: `${prior.length + 1} turns, model ${modelName}`,
    });

    return NextResponse.json({ text });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    log.error({
      route: "/api/chat",
      method: "POST",
      status: 500,
      latencyMs: Date.now() - start,
      detail: message,
    });
    return NextResponse.json(
      { error: "Chat request failed. Try again in a moment." },
      { status: 500 },
    );
  }
}

"use client";

import { useEffect, useState } from "react";

interface HealthResponse {
  status: string;
  environment?: string;
  apiVersion?: string;
  countriesLoaded?: number;
  latencyMs?: number;
  error?: string;
}

export function ApiStatus() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [state, setState] = useState<"loading" | "ok" | "error">("loading");

  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then((data: HealthResponse) => {
        setHealth(data);
        setState(data.status === "ok" ? "ok" : "error");
      })
      .catch(() => setState("error"));
  }, []);

  const color =
    state === "ok"
      ? "bg-green-500"
      : state === "error"
        ? "bg-red-500"
        : "bg-yellow-500 animate-pulse";

  const label =
    state === "ok"
      ? "Sandbox Connected"
      : state === "error"
        ? health?.error || "API Error"
        : "Connecting...";

  return (
    <span
      className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-default"
      title={
        health
          ? `${health.environment || "sandbox"} · v${health.apiVersion || "?"} · ${health.countriesLoaded || 0} countries · ${health.latencyMs || 0}ms`
          : "Checking API connection..."
      }
    >
      <span className={`w-2 h-2 rounded-full ${color}`} />
      {label}
    </span>
  );
}

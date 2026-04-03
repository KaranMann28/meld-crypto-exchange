"use client";

import { useEffect, useState } from "react";

export function ApiStatus() {
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");

  useEffect(() => {
    fetch("/api/countries")
      .then((r) => {
        setStatus(r.ok ? "ok" : "error");
      })
      .catch(() => setStatus("error"));
  }, []);

  const color =
    status === "ok"
      ? "bg-green-500"
      : status === "error"
        ? "bg-red-500"
        : "bg-yellow-500 animate-pulse";

  const label =
    status === "ok"
      ? "Sandbox Connected"
      : status === "error"
        ? "API Error"
        : "Connecting...";

  return (
    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <span className={`w-2 h-2 rounded-full ${color}`} />
      {label}
    </span>
  );
}

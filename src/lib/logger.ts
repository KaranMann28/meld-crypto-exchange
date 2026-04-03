type LogLevel = "info" | "warn" | "error";

interface LogEntry {
  route: string;
  method: string;
  status?: number;
  latencyMs?: number;
  detail?: string;
}

function formatEntry(level: LogLevel, entry: LogEntry): string {
  const ts = new Date().toISOString();
  const parts = [
    `[${ts}]`,
    `[${level.toUpperCase()}]`,
    `[${entry.route}]`,
    entry.method,
  ];
  if (entry.status != null) parts.push(`${entry.status}`);
  if (entry.latencyMs != null) parts.push(`${entry.latencyMs}ms`);
  if (entry.detail) parts.push(`— ${entry.detail}`);
  return parts.join(" ");
}

export const log = {
  info(entry: LogEntry) {
    console.log(formatEntry("info", entry));
  },
  warn(entry: LogEntry) {
    console.warn(formatEntry("warn", entry));
  },
  error(entry: LogEntry) {
    console.error(formatEntry("error", entry));
  },
};

export type LogLevel = "debug" | "info" | "warn" | "error";

const levelOrder: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

function configuredLevel(): LogLevel {
  const raw = (globalThis as { LOG_LEVEL?: string }).LOG_LEVEL?.toLowerCase();
  if (raw === "debug" || raw === "info" || raw === "warn" || raw === "error") {
    return raw;
  }
  return "info";
}

export const logger = {
  log(level: LogLevel, message: string, meta?: Record<string, unknown>) {
    if (levelOrder[level] < levelOrder[configuredLevel()]) {
      return;
    }

    const payload = JSON.stringify({
      level,
      message,
      meta: meta ?? {},
      timestamp: new Date().toISOString(),
    });

    if (level === "error") {
      console.error(payload);
      return;
    }

    if (level === "warn") {
      console.warn(payload);
      return;
    }

    console.log(payload);
  },
};

// One channel for everything the server says. The only file allowed to use console.
// Production: one JSON object per line. Development: a short human line.
// Never pass a raw error or a request object in `fields`. Describe it with scalars.

export type LogLevel = "debug" | "info" | "warn" | "error" | "silent";
export type LogFields = Record<string, unknown>;

const LEVELS: Record<LogLevel, number> = { debug: 10, info: 20, warn: 30, error: 40, silent: 100 };

const isLevel = (value: string | undefined): value is LogLevel => value !== undefined && value in LEVELS;

const configured = process.env.LOG_LEVEL;
const threshold: LogLevel = isLevel(configured) ? configured : process.env.NODE_ENV === "production" ? "info" : "debug";

const write = (level: Exclude<LogLevel, "silent">, msg: string, fields: LogFields = {}) => {
  if (LEVELS[level] < LEVELS[threshold]) return;

  const line =
    process.env.NODE_ENV === "production"
      ? JSON.stringify({ level, time: new Date().toISOString(), msg, ...fields })
      : `${level.toUpperCase().padEnd(5)} ${msg} ${Object.entries(fields)
          .map(([key, value]) => `${key}=${typeof value === "string" ? value : JSON.stringify(value)}`)
          .join(" ")}`.trimEnd();

  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
};

export const logger = {
  debug: (msg: string, fields?: LogFields) => write("debug", msg, fields),
  info: (msg: string, fields?: LogFields) => write("info", msg, fields),
  warn: (msg: string, fields?: LogFields) => write("warn", msg, fields),
  error: (msg: string, fields?: LogFields) => write("error", msg, fields),
};

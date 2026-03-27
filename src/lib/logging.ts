import { randomUUID } from "crypto";

export interface LogContext {
  correlationId?: string;
  userId?: string;
  email?: string;
  role?: string;
  ip?: string;
  path?: string;
  method?: string;
}

export interface StructuredLog extends LogContext {
  timestamp: string;
  level: "info" | "warn" | "error" | "debug";
  message: string;
  error?: string;
  stack?: string;
  duration?: number;
  metadata?: Record<string, unknown>;
}

const logLevelPriority: Record<string, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const currentLogLevel = process.env.LOG_LEVEL || "info";

function shouldLog(level: string): boolean {
  return logLevelPriority[level] >= logLevelPriority[currentLogLevel];
}

function formatLog(log: StructuredLog): string {
  return JSON.stringify({
    timestamp: log.timestamp,
    level: log.level,
    message: log.message,
    correlationId: log.correlationId,
    userId: log.userId,
    email: log.email,
    role: log.role,
    ip: log.ip,
    path: log.path,
    method: log.method,
    error: log.error,
    stack: log.stack,
    duration: log.duration,
    metadata: log.metadata,
  });
}

export function createLogger(context: LogContext = {}) {
  return {
    info(message: string, metadata?: Record<string, unknown>) {
      if (!shouldLog("info")) return;
      const log: StructuredLog = {
        ...context,
        timestamp: new Date().toISOString(),
        level: "info",
        message,
        metadata,
      };
      console.log(formatLog(log));
    },

    warn(message: string, metadata?: Record<string, unknown>) {
      if (!shouldLog("warn")) return;
      const log: StructuredLog = {
        ...context,
        timestamp: new Date().toISOString(),
        level: "warn",
        message,
        metadata,
      };
      console.warn(formatLog(log));
    },

    error(message: string, error?: Error, metadata?: Record<string, unknown>) {
      if (!shouldLog("error")) return;
      const log: StructuredLog = {
        ...context,
        timestamp: new Date().toISOString(),
        level: "error",
        message,
        error: error?.message,
        stack: error?.stack,
        metadata,
      };
      console.error(formatLog(log));
    },

    debug(message: string, metadata?: Record<string, unknown>) {
      if (!shouldLog("debug")) return;
      const log: StructuredLog = {
        ...context,
        timestamp: new Date().toISOString(),
        level: "debug",
        message,
        metadata,
      };
      console.debug(formatLog(log));
    },

    withCorrelationId(correlationId: string) {
      return createLogger({ ...context, correlationId });
    },

    withUser(userId: string, email?: string, role?: string) {
      return createLogger({ ...context, userId, email, role });
    },
  };
}

export function generateCorrelationId(): string {
  return randomUUID();
}

export function getCorrelationId(request: Request): string {
  return request.headers.get("x-correlation-id") || randomUUID();
}

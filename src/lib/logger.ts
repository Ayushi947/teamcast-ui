/* eslint-disable no-console */
import { ENV } from './env';

// Simple logger for both client and server
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

type LogLevel = keyof typeof logLevels;

// Determine log level based on environment and context
const getLogLevel = (): LogLevel => {
  const isProduction = ENV.NODE_ENV === 'production';
  const isBrowser = typeof window !== 'undefined';

  if (isProduction && isBrowser) {
    // In production browser: Only show ERROR and WARN (no INFO/DEBUG)
    return 'warn';
  } else if (isProduction) {
    // In production server: Show INFO level (useful for server logs)
    return 'info';
  } else {
    // In development: Show all logs (DEBUG, INFO, WARN, ERROR levels)
    return 'debug' as LogLevel | 'info' as LogLevel | 'warn' as
      | LogLevel
      | 'error' as LogLevel;
  }
};

const currentLogLevel: LogLevel = getLogLevel();

class SimpleLogger {
  private shouldLog(level: LogLevel): boolean {
    return logLevels[level] <= logLevels[currentLogLevel];
  }

  error(message: string, meta?: any): void {
    if (this.shouldLog('error')) {
      if (meta) {
        console.error(`[ERROR] ${message}`, meta);
      } else {
        console.error(`[ERROR] ${message}`);
      }
    }
  }

  warn(message: string, meta?: any): void {
    if (this.shouldLog('warn')) {
      if (meta) {
        console.warn(`[WARN] ${message}`, meta);
      } else {
        console.warn(`[WARN] ${message}`);
      }
    }
  }

  info(message: string, meta?: any): void {
    if (this.shouldLog('info')) {
      if (meta) {
        console.info(`[INFO] ${message}`, meta);
      } else {
        console.info(`[INFO] ${message}`);
      }
    }
  }

  debug(message: string, meta?: any): void {
    if (this.shouldLog('debug')) {
      if (meta) {
        console.debug(`[DEBUG] ${message}`, meta);
      } else {
        console.debug(`[DEBUG] ${message}`);
      }
    }
  }
}

export const logger = new SimpleLogger();
export const requestLogger = new SimpleLogger();

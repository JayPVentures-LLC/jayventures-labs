// Logger Utility: Structured logging for actions, errors, and admin events
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export const logger = {
  log: (level: LogLevel, message: string, meta?: Record<string, unknown>) => {
    const logObj = {
      level,
      message,
      meta: meta || {},
      timestamp: new Date().toISOString()
    };
    // eslint-disable-next-line no-console
    if (level === 'error') {
      console.error(JSON.stringify(logObj));
    } else if (level === 'warn') {
      console.warn(JSON.stringify(logObj));
    } else {
      console.log(JSON.stringify(logObj));
    }
  },
};

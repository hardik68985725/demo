export const myLogger = {
  log: (...args: unknown[]) => {
    console.log(`[${new Date().toISOString()}] [MY_LOGGER-i-LOG]-`, ...args);
  },
  warn: (...args: unknown[]) => {
    console.warn(`[${new Date().toISOString()}] [MY_LOGGER-!-WARN]-`, ...args);
  },
  error: (...args: unknown[]) => {
    console.error(
      `[${new Date().toISOString()}] [MY_LOGGER-x-ERROR]-`,
      ...args
    );
  }
};

export type TMyLogger = typeof myLogger;

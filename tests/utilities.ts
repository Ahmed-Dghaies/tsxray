import { afterEach, beforeEach, vi } from "vitest";

export const useFakeTimers = (systemTime: Date = new Date("2026-09-01T12:00:00+02:00")) => {
  const previousSystemTime = process.env.TSXRAY_SYSTEM_TIME;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(systemTime);
    process.env.TSXRAY_SYSTEM_TIME = systemTime.toISOString();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();

    if (previousSystemTime === undefined) {
      delete process.env.TSXRAY_SYSTEM_TIME;
    } else {
      process.env.TSXRAY_SYSTEM_TIME = previousSystemTime;
    }
  });
};

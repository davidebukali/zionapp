import { formatRelativeTime } from "./date";

describe("formatRelativeTime", () => {
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-07-21T12:00:00.000Z"));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it("uses just now for timestamps under one minute old", () => {
    expect(formatRelativeTime("2026-07-21T11:59:01.000Z")).toBe("Just now");
  });

  it("uses compact relative units", () => {
    expect(formatRelativeTime("2026-07-21T10:00:00.000Z")).toBe("2h ago");
    expect(formatRelativeTime("2025-11-21T12:00:00.000Z")).toBe("8mo ago");
  });

  it("supports future and invalid timestamps", () => {
    expect(formatRelativeTime("2026-07-21T14:00:00.000Z")).toBe("in 2h");
    expect(formatRelativeTime("not-a-date")).toBe("");
  });
});

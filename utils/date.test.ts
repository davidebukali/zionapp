import {
  formatMessageDateHeader,
  formatMessageTime,
  formatRelativeTime,
  getDateGroupKey,
} from "./date";

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

describe("formatMessageTime", () => {
  it("formats ISO string into 12-hour AM/PM time", () => {
    // 2026-05-21T06:16:00
    const date = new Date(2026, 4, 21, 6, 16);
    expect(formatMessageTime(date)).toBe("6:16 AM");

    const eveningDate = new Date(2026, 4, 21, 23, 45);
    expect(formatMessageTime(eveningDate)).toBe("11:45 PM");
  });

  it("preserves already-formatted time strings", () => {
    expect(formatMessageTime("6:16 AM")).toBe("6:16 AM");
    expect(formatMessageTime("9:12")).toBe("9:12");
    expect(formatMessageTime("11:30 pm")).toBe("11:30 PM");
  });

  it("handles empty or invalid inputs gracefully", () => {
    expect(formatMessageTime("")).toBe("");
    expect(formatMessageTime(null)).toBe("");
    expect(formatMessageTime("not-a-valid-date")).toBe("");
  });
});

describe("formatMessageDateHeader", () => {
  it("formats date into 'MMM d, yyyy' label", () => {
    const date = new Date(2026, 4, 21, 10, 0); // May 21, 2026
    expect(formatMessageDateHeader(date)).toBe("May 21, 2026");
  });

  it("handles empty or invalid inputs gracefully", () => {
    expect(formatMessageDateHeader("")).toBe("");
    expect(formatMessageDateHeader(null)).toBe("");
    expect(formatMessageDateHeader("invalid")).toBe("");
  });
});

describe("getDateGroupKey", () => {
  it("returns 'yyyy-MM-dd' string for daily grouping", () => {
    const date = new Date(2026, 4, 21, 10, 0);
    expect(getDateGroupKey(date)).toBe("2026-05-21");
  });

  it("returns empty string for invalid date", () => {
    expect(getDateGroupKey("invalid")).toBe("");
  });
});

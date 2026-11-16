import { throttle } from "./throttle";

describe("utils/throttle", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("executes immediately on the first invocation (leading edge)", () => {
    const mockCallback = jest.fn();
    const throttled = throttle(mockCallback, 500);

    throttled("call 1");
    expect(mockCallback).toHaveBeenCalledTimes(1);
    expect(mockCallback).toHaveBeenCalledWith("call 1");
  });

  it("ignores rapid subsequent invocations within waitMs", () => {
    const mockCallback = jest.fn();
    const throttled = throttle(mockCallback, 500);

    throttled("call 1");
    expect(mockCallback).toHaveBeenCalledTimes(1);

    // Call again within wait window
    jest.advanceTimersByTime(200);
    throttled("call 2");
    expect(mockCallback).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(200);
    throttled("call 3");
    expect(mockCallback).toHaveBeenCalledTimes(1);
  });

  it("allows execution again after waitMs has elapsed", () => {
    const mockCallback = jest.fn();
    const throttled = throttle(mockCallback, 500);

    throttled("call 1");
    expect(mockCallback).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(500);
    throttled("call 2");
    expect(mockCallback).toHaveBeenCalledTimes(2);
    expect(mockCallback).toHaveBeenLastCalledWith("call 2");
  });

  it("supports per-key throttling independently when keyResolver is provided", () => {
    const mockCallback = jest.fn();
    const throttled = throttle(
      mockCallback,
      500,
      (user: { id: string }) => user.id
    );

    const userA = { id: "user-a", name: "Alice" };
    const userB = { id: "user-b", name: "Bob" };

    // First call for user A succeeds
    throttled(userA);
    expect(mockCallback).toHaveBeenCalledTimes(1);
    expect(mockCallback).toHaveBeenLastCalledWith(userA);

    // Rapid second call for user A is suppressed
    throttled(userA);
    expect(mockCallback).toHaveBeenCalledTimes(1);

    // Call for user B immediately succeeds (does not get blocked by user A)
    throttled(userB);
    expect(mockCallback).toHaveBeenCalledTimes(2);
    expect(mockCallback).toHaveBeenLastCalledWith(userB);

    // Rapid second call for user B is suppressed
    throttled(userB);
    expect(mockCallback).toHaveBeenCalledTimes(2);

    // After waitMs, user A can be called again
    jest.advanceTimersByTime(500);
    throttled(userA);
    expect(mockCallback).toHaveBeenCalledTimes(3);
    expect(mockCallback).toHaveBeenLastCalledWith(userA);
  });

  it("resets cooldown when cancel is called", () => {
    const mockCallback = jest.fn();
    const throttled = throttle(mockCallback, 500);

    throttled("call 1");
    expect(mockCallback).toHaveBeenCalledTimes(1);

    throttled.cancel();

    // Immediately callable again because timer was cancelled/reset
    throttled("call 2");
    expect(mockCallback).toHaveBeenCalledTimes(2);
    expect(mockCallback).toHaveBeenLastCalledWith("call 2");
  });

  it("resets key-specific cooldown when cancel is called with key", () => {
    const mockCallback = jest.fn();
    const throttled = throttle(
      mockCallback,
      500,
      (user: { id: string }) => user.id
    );

    const userA = { id: "user-a" };
    const userB = { id: "user-b" };

    throttled(userA);
    throttled(userB);
    expect(mockCallback).toHaveBeenCalledTimes(2);

    // Cancel only user A
    throttled.cancel("user-a");

    // User A can be called immediately
    throttled(userA);
    expect(mockCallback).toHaveBeenCalledTimes(3);

    // User B is still throttled
    throttled(userB);
    expect(mockCallback).toHaveBeenCalledTimes(3);
  });
});

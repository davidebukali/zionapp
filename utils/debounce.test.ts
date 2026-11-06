import { debounce } from "./debounce";

describe("utils/debounce", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("delays function invocation until waitMs has elapsed", () => {
    const mockCallback = jest.fn();
    const debounced = debounce(mockCallback, 300);

    debounced("call 1");
    expect(mockCallback).not.toHaveBeenCalled();

    jest.advanceTimersByTime(200);
    expect(mockCallback).not.toHaveBeenCalled();

    jest.advanceTimersByTime(100);
    expect(mockCallback).toHaveBeenCalledTimes(1);
    expect(mockCallback).toHaveBeenCalledWith("call 1");
  });

  it("resets timer if called multiple times within the wait interval", () => {
    const mockCallback = jest.fn();
    const debounced = debounce(mockCallback, 300);

    debounced("call 1");
    jest.advanceTimersByTime(150);

    debounced("call 2");
    jest.advanceTimersByTime(200);
    expect(mockCallback).not.toHaveBeenCalled();

    jest.advanceTimersByTime(100);
    expect(mockCallback).toHaveBeenCalledTimes(1);
    expect(mockCallback).toHaveBeenCalledWith("call 2");
  });

  it("cancels pending invocation when cancel is called", () => {
    const mockCallback = jest.fn();
    const debounced = debounce(mockCallback, 300);

    debounced("call 1");
    debounced.cancel();

    jest.advanceTimersByTime(500);
    expect(mockCallback).not.toHaveBeenCalled();
  });
});


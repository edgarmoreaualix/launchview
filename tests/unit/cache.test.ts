import "../setup";
import { describe, expect, test, vi } from "vitest";

import { TTLCache } from "../../backend/utils/cache";

describe("TTLCache", () => {
  test("returns null on cache miss", () => {
    const cache = new TTLCache<string>(1_000);

    expect(cache.get()).toBeNull();
  });

  test("returns cached value before ttl expires", () => {
    vi.useFakeTimers();
    const cache = new TTLCache<string>(1_000);

    cache.set("cached");
    vi.advanceTimersByTime(999);

    expect(cache.get()).toBe("cached");
  });

  test("expires value when ttl boundary is reached", () => {
    vi.useFakeTimers();
    const cache = new TTLCache<string>(1_000);

    cache.set("cached");
    vi.advanceTimersByTime(1_000);

    expect(cache.get()).toBeNull();
  });

  test("resets ttl when value is set again", () => {
    vi.useFakeTimers();
    const cache = new TTLCache<string>(1_000);

    cache.set("first");
    vi.advanceTimersByTime(900);
    cache.set("second");
    vi.advanceTimersByTime(900);

    expect(cache.get()).toBe("second");

    vi.advanceTimersByTime(100);
    expect(cache.get()).toBeNull();
  });

  test("clear removes cached value immediately", () => {
    const cache = new TTLCache<string>(1_000);

    cache.set("cached");
    cache.clear();

    expect(cache.get()).toBeNull();
  });
});

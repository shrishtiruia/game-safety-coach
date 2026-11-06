import { describe, expect, it } from "vitest";
import { emptyFilters, searchGames, timeBucket } from "./catalog";

describe("catalog search", () => {
  it("has 24 games", () => expect(searchGames(emptyFilters)).toHaveLength(24));
  it("free filter returns only free games", () => {
    const r = searchGames({ ...emptyFilters, prices: ["free"] });
    expect(r.length).toBeGreaterThan(0);
    expect(r.every((g) => g.price === 0)).toBe(true);
  });
  it("screen-free device filter", () => {
    expect(searchGames({ ...emptyFilters, devices: ["screen-free"] }).every((g) => g.devices.includes("screen-free"))).toBe(true);
  });
  it("price sort ascending", () => {
    const r = searchGames({ ...emptyFilters, sort: "price" });
    expect(r[0]!.price).toBeLessThanOrEqual(r[r.length - 1]!.price);
  });
  it("impossible combo is empty", () => {
    expect(searchGames({ ...emptyFilters, q: "zzzz-nothing" })).toHaveLength(0);
  });
  it("time buckets", () => {
    expect(timeBucket(5)).toBe("5");
    expect(timeBucket(45)).toBe("45+");
  });
});

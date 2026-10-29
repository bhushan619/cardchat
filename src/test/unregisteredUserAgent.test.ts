import { beforeEach, describe, expect, it } from "vitest";
import { getUnregisteredUserAgent, saveUnregisteredUserAgent } from "@/lib/unregisteredUserAgent";
import { getWarmupPolicy } from "@/lib/waBusinessNumbers";

beforeEach(() => sessionStorage.clear());

describe("unregistered-user agent configuration", () => {
  it("retains the selected agent across page reloads within the session", () => {
    expect(getUnregisteredUserAgent()).toBe("");
    saveUnregisteredUserAgent("4");
    expect(getUnregisteredUserAgent()).toBe("4");
  });
});

describe("screenshot gateway policy", () => {
  it("uses the shown warmup phase caps", () => {
    expect(getWarmupPolicy().dailyCaps).toEqual([
      { day: "Day 1-3", conv: 20, msg: 50 },
      { day: "Day 4-7", conv: 50, msg: 150 },
      { day: "Day 8-14", conv: 100, msg: 400 },
      { day: "Day 15+", conv: 0, msg: 0 },
    ]);
  });
  it("uses the shown policy values", () => {
    expect(getWarmupPolicy()).toMatchObject({ warmupEnforcement: true, minReplyRatioPct: 40, burstMaxPer60s: 9999, msgDelayMinMs: 500, msgDelayMaxMs: 1000 });
  });
});
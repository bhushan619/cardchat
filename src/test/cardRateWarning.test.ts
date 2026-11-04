import { describe, expect, it } from "vitest";
import { exceedsAdvertisedRate, getOrderCardRate } from "@/lib/cardRateWarning";

describe("card rate warning", () => {
  it("warns when the card rate exceeds the buyer's advertised price", () => {
    expect(exceedsAdvertisedRate(6.1275, 5.85)).toBe(true);
  });
  it("does not warn at or below the advertised price", () => {
    expect(exceedsAdvertisedRate(5.85, 5.85)).toBe(false);
    expect(exceedsAdvertisedRate(5.72, 5.85)).toBe(false);
  });
  it("compares CNY rates rather than points prices", () => {
    expect(getOrderCardRate(1250, 204)).toBeCloseTo(6.12745, 5);
    expect(exceedsAdvertisedRate(getOrderCardRate(1250, 204), 5.85)).toBe(true);
    expect(exceedsAdvertisedRate(getOrderCardRate(1000, 204), 5.85)).toBe(false);
  });
  it("does not invent a comparison for invalid rates", () => {
    expect(getOrderCardRate(1250, 0)).toBeNull();
    expect(exceedsAdvertisedRate(null, 5.85)).toBe(false);
    expect(exceedsAdvertisedRate(6.1275, NaN)).toBe(false);
  });
});
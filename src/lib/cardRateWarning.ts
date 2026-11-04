/** Convert an order's points price to the same CNY units as a buyer quote. */
export function getOrderCardRate(pointsPrice: number, pointsRate: number): number | null {
  if (!Number.isFinite(pointsPrice) || !Number.isFinite(pointsRate) || pointsPrice <= 0 || pointsRate <= 0) return null;
  return pointsPrice / pointsRate;
}

export function exceedsAdvertisedRate(cardRate: number | null, advertisedRate: number): boolean {
  return cardRate !== null && Number.isFinite(advertisedRate) && advertisedRate > 0 && cardRate - advertisedRate > 1e-9;
}
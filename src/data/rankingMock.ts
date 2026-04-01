export type RankingTier = {
  threshold: number;
  reward: number;
};

export const rankingTiers: RankingTier[] = [
  { threshold: 10000, reward: 10 },
  { threshold: 25000, reward: 20 },
  { threshold: 50000, reward: 30 },
  { threshold: 75000, reward: 50 },
  { threshold: 100000, reward: 80 },
  { threshold: 150000, reward: 120 },
  { threshold: 250000, reward: 200 },
  { threshold: 500000, reward: 500 },
  { threshold: 1000000, reward: 1000 },
];

export type RankingUser = {
  rank: number;
  alias: string;
  volume: number;
  reward: number;
};

export const currentUserAlias = "A7X3KP";

export const rankingList: RankingUser[] = [
  { rank: 1, alias: "Z9W4MK", volume: 980000, reward: 500 },
  { rank: 2, alias: "P3L7GX", volume: 742000, reward: 500 },
  { rank: 3, alias: "T6N8QR", volume: 615000, reward: 500 },
  { rank: 4, alias: "F1H5VB", volume: 489000, reward: 200 },
  { rank: 5, alias: "C8J2YS", volume: 412000, reward: 200 },
  { rank: 6, alias: "M4R9DL", volume: 358000, reward: 200 },
  { rank: 7, alias: "W2K6PN", volume: 301000, reward: 200 },
  { rank: 8, alias: "G7X1AT", volume: 276000, reward: 200 },
  { rank: 9, alias: "B5E3UF", volume: 245000, reward: 120 },
  { rank: 10, alias: "N9S4HC", volume: 198000, reward: 120 },
  { rank: 11, alias: "L2V7JQ", volume: 172000, reward: 120 },
  { rank: 12, alias: "R6D8WM", volume: 155000, reward: 120 },
  { rank: 13, alias: "Y1P3KX", volume: 138000, reward: 80 },
  { rank: 14, alias: "Q4T9BN", volume: 121000, reward: 80 },
  { rank: 15, alias: "H8A2FL", volume: 108000, reward: 80 },
  { rank: 16, alias: "J5G6RS", volume: 97000, reward: 50 },
  { rank: 17, alias: "X3M1YD", volume: 92000, reward: 50 },
  { rank: 18, alias: currentUserAlias, volume: 86400, reward: 50 },
  { rank: 19, alias: "E7C4VP", volume: 78000, reward: 50 },
  { rank: 20, alias: "U2N8TK", volume: 68000, reward: 50 },
  { rank: 21, alias: "I6B5QL", volume: 54000, reward: 30 },
  { rank: 22, alias: "O9F3WA", volume: 47000, reward: 30 },
  { rank: 23, alias: "S1H7MG", volume: 39000, reward: 20 },
  { rank: 24, alias: "V4K2XJ", volume: 28000, reward: 20 },
  { rank: 25, alias: "D8L6PR", volume: 15000, reward: 10 },
];

export function getCurrentTier(volume: number): RankingTier | null {
  let current: RankingTier | null = null;
  for (const tier of rankingTiers) {
    if (volume >= tier.threshold) current = tier;
  }
  return current;
}

export function getNextTier(volume: number): RankingTier | null {
  for (const tier of rankingTiers) {
    if (volume < tier.threshold) return tier;
  }
  return null;
}

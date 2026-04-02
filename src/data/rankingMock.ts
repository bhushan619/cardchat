export type RankingTier = {
  threshold: number;
  reward: number;
};

export const rankingTiers: RankingTier[] = [
  { threshold: 2000000, reward: 10000 },
  { threshold: 3000000, reward: 20000 },
  { threshold: 5000000, reward: 30000 },
  { threshold: 7000000, reward: 50000 },
  { threshold: 10000000, reward: 80000 },
  { threshold: 20000000, reward: 170000 },
];

export type RankingUser = {
  rank: number;
  alias: string;
  volume: number;
  reward: number;
};

export const currentUserAlias = "A7X3KP";

export const rankingList: RankingUser[] = [
  { rank: 1, alias: "Z9W4MK", volume: 22500000, reward: 170000 },
  { rank: 2, alias: "P3L7GX", volume: 18200000, reward: 80000 },
  { rank: 3, alias: "T6N8QR", volume: 15400000, reward: 80000 },
  { rank: 4, alias: "F1H5VB", volume: 12100000, reward: 80000 },
  { rank: 5, alias: "C8J2YS", volume: 10800000, reward: 80000 },
  { rank: 6, alias: "M4R9DL", volume: 9200000, reward: 50000 },
  { rank: 7, alias: "W2K6PN", volume: 8100000, reward: 50000 },
  { rank: 8, alias: "G7X1AT", volume: 7500000, reward: 50000 },
  { rank: 9, alias: "B5E3UF", volume: 6800000, reward: 30000 },
  { rank: 10, alias: "N9S4HC", volume: 5900000, reward: 30000 },
  { rank: 11, alias: "L2V7JQ", volume: 5200000, reward: 30000 },
  { rank: 12, alias: "R6D8WM", volume: 4600000, reward: 20000 },
  { rank: 13, alias: "Y1P3KX", volume: 3800000, reward: 20000 },
  { rank: 14, alias: "Q4T9BN", volume: 3200000, reward: 20000 },
  { rank: 15, alias: "H8A2FL", volume: 2900000, reward: 10000 },
  { rank: 16, alias: "J5G6RS", volume: 2500000, reward: 10000 },
  { rank: 17, alias: "X3M1YD", volume: 2200000, reward: 10000 },
  { rank: 18, alias: currentUserAlias, volume: 2100000, reward: 10000 },
  { rank: 19, alias: "E7C4VP", volume: 1800000, reward: 0 },
  { rank: 20, alias: "U2N8TK", volume: 1500000, reward: 0 },
  { rank: 21, alias: "I6B5QL", volume: 1200000, reward: 0 },
  { rank: 22, alias: "O9F3WA", volume: 950000, reward: 0 },
  { rank: 23, alias: "S1H7MG", volume: 720000, reward: 0 },
  { rank: 24, alias: "V4K2XJ", volume: 480000, reward: 0 },
  { rank: 25, alias: "D8L6PR", volume: 250000, reward: 0 },
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

export type BiWeeklyPeriod = {
  start: Date;
  end: Date;
  label: string;
};

/**
 * Returns the two bi-weekly periods for a given month/year.
 * Period 1: 1st to 15th (or 16th depending on month length)
 * Period 2: 15th/16th to 1st of next month
 * Split: first half gets floor(days/2), second half gets ceil(days/2)
 */
export function getBiWeeklyPeriods(year: number, month: number): [BiWeeklyPeriod, BiWeeklyPeriod] {
  const start = new Date(year, month, 1);
  const nextMonthStart = new Date(year, month + 1, 1);
  const totalDays = (nextMonthStart.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
  const firstHalfDays = Math.floor(totalDays / 2);
  const midDate = new Date(year, month, 1 + firstHalfDays);

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const mn = monthNames[month];
  const nextMn = monthNames[nextMonthStart.getMonth()];

  return [
    {
      start,
      end: midDate,
      label: `${mn} 01 – ${mn} ${String(midDate.getDate()).padStart(2, "0")}, ${year} (H1)`,
    },
    {
      start: midDate,
      end: nextMonthStart,
      label: `${mn} ${String(midDate.getDate()).padStart(2, "0")} – ${nextMn} 01, ${nextMonthStart.getFullYear()} (H2)`,
    },
  ];
}

/**
 * Returns the current bi-weekly period for a given date.
 */
export function getCurrentBiWeeklyPeriod(date: Date): BiWeeklyPeriod {
  const [p1, p2] = getBiWeeklyPeriods(date.getFullYear(), date.getMonth());
  return date < p2.start ? p1 : p2;
}

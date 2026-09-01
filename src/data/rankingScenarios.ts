import { currentUserAlias, rankingList, type RankingUser } from "@/data/rankingMock";

/** Prototype-only scenario simulator for the bi-weekly ranking. */
export type Scenario =
  | "live"
  | "empty"
  | "unranked_me"
  | "first_order"
  | "top3"
  | "outside_top20"
  | "tie";

export const scenarioOptions: { value: Scenario; label: string; hint: string }[] = [
  { value: "live", label: "Live (default)", hint: "Full leaderboard" },
  { value: "empty", label: "Empty period", hint: "Nobody has traded yet" },
  { value: "unranked_me", label: "Unranked user", hint: "A7X3KP has TTV = 0" },
  { value: "first_order", label: "Single first order", hint: "Only one ranked user" },
  { value: "top3", label: "Top 3", hint: "A7X3KP ranked #3" },
  { value: "outside_top20", label: "Outside top 20", hint: "A7X3KP far down the list" },
  { value: "tie", label: "Tie-break", hint: "Same volume, earlier trade wins" },
];

export function buildScenarioList(scenario: Scenario): RankingUser[] {
  const others = rankingList.filter((u) => u.alias !== currentUserAlias);
  const me = rankingList.find((u) => u.alias === currentUserAlias)!;

  switch (scenario) {
    case "empty":
      return rankingList.map((u) => ({ ...u, volume: 0, reward: 0 }));
    case "unranked_me":
      return [...others, { ...me, volume: 0, reward: 0 }];
    case "first_order":
      return [
        ...others.map((u) => ({ ...u, volume: 0, reward: 0 })),
        { ...me, volume: 350000, reward: 0 },
      ];
    case "top3":
      return [...others, { ...me, volume: 15500000, reward: 80000 }];
    case "outside_top20":
      return [...others, { ...me, volume: 300000, reward: 0 }];
    case "tie": {
      const rival = others[0];
      return [
        ...others.map((u) =>
          u.alias === rival.alias
            ? { ...u, volume: 5900000, reward: 30000, reachedAt: 1000 }
            : u
        ),
        { ...me, volume: 5900000, reward: 30000, reachedAt: 2000 },
      ];
    }
    default:
      return rankingList;
  }
}

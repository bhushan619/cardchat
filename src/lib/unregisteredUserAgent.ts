import { adminUsers } from "@/data/mock";

const KEY = "cc_unregistered_user_agent";
export const unregisteredUserAgents = adminUsers.filter((user) => user.role === "agent");

export function getUnregisteredUserAgent(): string {
  const saved = sessionStorage.getItem(KEY) ?? "";
  return unregisteredUserAgents.some((user) => String(user.id) === saved) ? saved : "";
}

export function saveUnregisteredUserAgent(agentId: string): void {
  sessionStorage.setItem(KEY, agentId);
}
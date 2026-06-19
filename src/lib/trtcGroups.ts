// Mock TRTC group store backed by sessionStorage so AdminUsers (CRUD)
// and AdminTeamChat (consumer) can share the same group state.

import { adminUsers } from "@/data/mock";

export type TrtcGroup = {
  id: string;
  name: string;
  description?: string;
  memberIds: number[];
  createdAt: number;
};

const STORAGE_KEY = "cc_trtc_groups";
const EVENT_NAME = "cc_trtc_groups_changed";

const seed = (): TrtcGroup[] => {
  const allIds = adminUsers.map(u => u.id);
  const agentIds = adminUsers.filter(u => u.role === "agent").map(u => u.id);
  const leadIds = adminUsers
    .filter(u => u.role === "super_admin" || u.role === "team_lead" || u.role === "finance")
    .map(u => u.id);
  return [
    { id: "grp_all", name: "All Team", description: "Default group with every system user", memberIds: allIds, createdAt: Date.now() },
    { id: "grp_agents", name: "Agents Room", description: "Frontline agents collaboration", memberIds: agentIds, createdAt: Date.now() },
    { id: "grp_leads", name: "Leads & Finance", description: "Leadership and finance discussion", memberIds: leadIds, createdAt: Date.now() },
  ];
};

export const getGroups = (): TrtcGroup[] => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeded = seed();
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    return JSON.parse(raw) as TrtcGroup[];
  } catch {
    return seed();
  }
};

export const saveGroups = (groups: TrtcGroup[]) => {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
  window.dispatchEvent(new CustomEvent(EVENT_NAME));
};

export const onGroupsChanged = (cb: () => void) => {
  const handler = () => cb();
  window.addEventListener(EVENT_NAME, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(EVENT_NAME, handler);
    window.removeEventListener("storage", handler);
  };
};

export const createGroup = (name: string, description = "", memberIds: number[] = []) => {
  const groups = getGroups();
  const newGroup: TrtcGroup = {
    id: `grp_${Date.now().toString(36)}`,
    name: name.trim(),
    description: description.trim(),
    memberIds,
    createdAt: Date.now(),
  };
  saveGroups([...groups, newGroup]);
  return newGroup;
};

export const updateGroup = (id: string, patch: Partial<Omit<TrtcGroup, "id" | "createdAt">>) => {
  const groups = getGroups().map(g => (g.id === id ? { ...g, ...patch } : g));
  saveGroups(groups);
};

export const deleteGroup = (id: string) => {
  saveGroups(getGroups().filter(g => g.id !== id));
};

export const addMember = (groupId: string, userId: number) => {
  const groups = getGroups().map(g =>
    g.id === groupId && !g.memberIds.includes(userId)
      ? { ...g, memberIds: [...g.memberIds, userId] }
      : g
  );
  saveGroups(groups);
};

export const removeMember = (groupId: string, userId: number) => {
  const groups = getGroups().map(g =>
    g.id === groupId ? { ...g, memberIds: g.memberIds.filter(id => id !== userId) } : g
  );
  saveGroups(groups);
};

import { useCallback, useEffect, useState } from "react";

const KEY = "customer_blocked_agents";
const EVENT = "blocked-agents-changed";

function read(): string[] {
  try {
    const raw = sessionStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(list: string[]) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(list));
  } catch {}
  window.dispatchEvent(new Event(EVENT));
}

export function blockAgent(name: string) {
  const list = read();
  if (!list.includes(name)) write([...list, name]);
}

export function unblockAgent(name: string) {
  write(read().filter(n => n !== name));
}

export function useBlockedAgents() {
  const [blocked, setBlocked] = useState<string[]>(read);

  useEffect(() => {
    const sync = () => setBlocked(read());
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const isBlocked = useCallback((name: string) => blocked.includes(name), [blocked]);

  return { blocked, isBlocked, blockAgent, unblockAgent };
}

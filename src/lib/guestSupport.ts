import { useEffect, useState } from "react";
import type { conversations } from "@/data/mock";

const KEY = "cardchat_guest_support";
const EVENT = "cardchat-guest-support-updated";
export interface SupportMessage {
  id: number;
  from: "support" | "customer";
  text: string;
  time: string;
}
export interface GuestThread {
  id: string;
  email: string;
  source: "sign_in_help";
  messages: SupportMessage[];
}
export function loadGuestThreads(): GuestThread[] {
  try { return JSON.parse(sessionStorage.getItem(KEY) || "[]"); }
  catch { return []; }
}
function save(threads: GuestThread[]) {
  sessionStorage.setItem(KEY, JSON.stringify(threads));
  window.dispatchEvent(new Event(EVENT));
}
export function startGuestThread(email = ""): GuestThread {
  const threads = loadGuestThreads();
  const existing = threads.find((thread) => thread.email.toLowerCase() === email.trim().toLowerCase());
  if (existing) return existing;
  const thread: GuestThread = { id: `guest-${crypto.randomUUID()}`, email: email.trim(), source: "sign_in_help", messages: [] };
  save([...threads, thread]);
  return thread;
}
export function appendGuestMessage(id: string, message: SupportMessage) {
  save(loadGuestThreads().map((thread) => thread.id === id ? { ...thread, messages: [...thread.messages, message] } : thread));
}
export function isGuestConversation(conversation: { channel: string; source?: string }) {
  return conversation.channel === "trtc" && conversation.source === "sign_in_help";
}
export type AppConversation = typeof conversations[number] & { source?: "sign_in_help" };
export function guestConversations(threads: GuestThread[]): AppConversation[] {
  return threads.filter((thread) => thread.messages.some((message) => message.from === "customer")).map((thread, index) => {
    const latest = thread.messages[thread.messages.length - 1];
    return {
      id: thread.id, alias: thread.email || `Guest ${index + 1}`, alias2: "", waNickname: "",
      lastMessage: latest?.text ?? "", time: latest?.time ?? "", unread: thread.messages.filter((message) => message.from === "customer").length,
      status: "consulting", goodRate: 0, totalValue: "₦0", tags: [], channel: "trtc", whatsappNumber: "", source: thread.source,
    };
  });
}
export function useGuestThreads() {
  const [threads, setThreads] = useState(loadGuestThreads);
  useEffect(() => {
    const refresh = () => setThreads(loadGuestThreads());
    window.addEventListener(EVENT, refresh);
    return () => window.removeEventListener(EVENT, refresh);
  }, []);
  return threads;
}
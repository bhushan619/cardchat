import { beforeEach, describe, expect, it } from "vitest";
import { appendGuestMessage, guestConversations, isGuestConversation, loadGuestThreads, startGuestThread } from "@/lib/guestSupport";

describe("sign-in help guest conversations", () => {
  beforeEach(() => sessionStorage.clear());
  it("identifies sign-in help App Messages users as guests, not regular or WhatsApp users", () => {
    expect(isGuestConversation({ channel: "trtc", source: "sign_in_help" })).toBe(true);
    expect(isGuestConversation({ channel: "trtc" })).toBe(false);
    expect(isGuestConversation({ channel: "whatsapp", source: "sign_in_help" })).toBe(false);
  });
  it("shows the guest's sent message in App Messages and retains its origin after reload", () => {
    const thread = startGuestThread("guest@example.com");
    expect(guestConversations(loadGuestThreads())).toHaveLength(0);
    appendGuestMessage(thread.id, { id: 1, from: "customer", text: "I cannot sign in", time: "2026-11-06T11:46:00Z" });
    const rows = guestConversations(loadGuestThreads());
    expect(rows).toHaveLength(1);
    expect(rows[0].lastMessage).toBe("I cannot sign in");
    expect(isGuestConversation(rows[0])).toBe(true);
  });
});
import { describe, expect, it } from "vitest";
import { markConversationsRead } from "@/lib/conversationReadState";

describe("mark all conversations read", () => {
  it("marks both consulting and processing conversations, including groups", () => {
    const result = markConversationsRead(new Set(), [{ id: "consulting" }, { id: "processing" }, { id: "group" }]);
    expect([...result]).toEqual(["consulting", "processing", "group"]);
  });

  it("preserves previous read state without marking another channel", () => {
    const previous = new Set(["previous"]);
    const result = markConversationsRead(previous, [{ id: "app" }]);
    expect(result.has("whatsapp")).toBe(false);
    expect([...result]).toEqual(["previous", "app"]);
    expect([...previous]).toEqual(["previous"]);
  });
});
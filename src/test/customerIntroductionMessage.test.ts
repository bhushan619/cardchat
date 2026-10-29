import { beforeEach, describe, expect, it } from "vitest";
import { getCustomerIntroductionMessage, saveCustomerIntroductionMessage } from "@/lib/customerIntroductionMessage";

beforeEach(() => sessionStorage.clear());

describe("customer introduction message configuration", () => {
  it("retains the configured message, including line breaks, within the session", () => {
    const message = "Welcome to CardChat!\nHow can we help you today?";
    saveCustomerIntroductionMessage(message);
    expect(getCustomerIntroductionMessage()).toBe(message);
  });

  it("allows clearing the introduction message", () => {
    saveCustomerIntroductionMessage("Welcome!");
    saveCustomerIntroductionMessage("");
    expect(getCustomerIntroductionMessage()).toBe("");
  });
});
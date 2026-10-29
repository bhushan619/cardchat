import { beforeEach, describe, expect, it } from "vitest";
import {
  getCustomerIntroductionMessage,
  isCustomerIntroductionMessageEnabled,
  saveCustomerIntroductionMessage,
  setCustomerIntroductionMessageEnabled,
} from "@/lib/customerIntroductionMessage";

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

  it("sends the introduction message by default", () => {
    expect(isCustomerIntroductionMessageEnabled()).toBe(true);
  });

  it("keeps the message switched off until it is switched back on", () => {
    setCustomerIntroductionMessageEnabled(false);
    expect(isCustomerIntroductionMessageEnabled()).toBe(false);
    setCustomerIntroductionMessageEnabled(true);
    expect(isCustomerIntroductionMessageEnabled()).toBe(true);
  });

  it("keeps the saved message while the switch is off", () => {
    saveCustomerIntroductionMessage("Welcome to CardChat!");
    setCustomerIntroductionMessageEnabled(false);
    expect(getCustomerIntroductionMessage()).toBe("Welcome to CardChat!");
    expect(isCustomerIntroductionMessageEnabled()).toBe(false);
  });
});

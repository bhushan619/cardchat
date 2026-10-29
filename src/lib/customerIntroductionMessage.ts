const MESSAGE_KEY = "cc_customer_introduction_message";
const ENABLED_KEY = "cc_customer_introduction_message_enabled";

export function getCustomerIntroductionMessage(): string {
  return sessionStorage.getItem(MESSAGE_KEY) ?? "";
}

export function saveCustomerIntroductionMessage(message: string): void {
  sessionStorage.setItem(MESSAGE_KEY, message);
}

export function isCustomerIntroductionMessageEnabled(): boolean {
  return sessionStorage.getItem(ENABLED_KEY) !== "false";
}

export function setCustomerIntroductionMessageEnabled(enabled: boolean): void {
  sessionStorage.setItem(ENABLED_KEY, enabled ? "true" : "false");
}

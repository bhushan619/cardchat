const KEY = "cc_customer_introduction_message";

export function getCustomerIntroductionMessage(): string {
  return sessionStorage.getItem(KEY) ?? "";
}

export function saveCustomerIntroductionMessage(message: string): void {
  sessionStorage.setItem(KEY, message);
}
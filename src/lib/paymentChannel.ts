import { useEffect, useState } from "react";

const STORAGE_KEY = "cardchat_payment_channel";
const EVENT = "cardchat:payment-channel-changed";

export const PAYMENT_CHANNELS = [
  { value: "palmpay1", label: "PalmPay 1" },
  { value: "palmpay2", label: "PalmPay 2" },
  { value: "palmpay3", label: "PalmPay 3" },
  { value: "palmpay4", label: "PalmPay 4" },
] as const;

export type PaymentChannelValue = (typeof PAYMENT_CHANNELS)[number]["value"];

const DEFAULT_PAYMENT_CHANNEL: PaymentChannelValue = "palmpay1";

function getPaymentChannel(): PaymentChannelValue {
  try {
    const v = sessionStorage.getItem(STORAGE_KEY) as PaymentChannelValue | null;
    if (v && PAYMENT_CHANNELS.some((c) => c.value === v)) return v;
  } catch {
    /* ignore */
  }
  return DEFAULT_PAYMENT_CHANNEL;
}

function setPaymentChannel(value: PaymentChannelValue) {
  try {
    sessionStorage.setItem(STORAGE_KEY, value);
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: value }));
}

export function paymentChannelLabel(value: string): string {
  return PAYMENT_CHANNELS.find((c) => c.value === value)?.label ?? value;
}

/** Reactive hook — re-renders when the active channel changes anywhere in the app. */
export function usePaymentChannel() {
  const [channel, setChannel] = useState<PaymentChannelValue>(getPaymentChannel);

  useEffect(() => {
    const sync = () => setChannel(getPaymentChannel());
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return { channel, label: paymentChannelLabel(channel), setChannel: setPaymentChannel };
}

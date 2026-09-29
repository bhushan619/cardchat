// Auto Rate Quotation (AQ-01/02/03) — detects card type + amount mentions in
// customer messages, builds quote cards, and stores quoted rates with a
// 15-minute lock so an accepted quote pre-fills the Sales Order wizard.

import { cardRates } from "@/data/mock";

export interface DetectedRateQuote {
  cardType: string;
  cardFormat: string;
  currency: string;
  /** Points per unit of card currency (current sell rate). */
  rate: number;
  /** Detected amount in card currency, or null when not mentioned. */
  amount: number | null;
}

export interface LockedQuote {
  cardType: string;
  cardFormat: string;
  currency: string;
  rate: number;
  amount: number;
  quotedAt: number; // epoch ms
}

export const QUOTE_LOCK_MS = 15 * 60 * 1000; // 15-minute rate lock

const STORAGE_KEY = "cardchat_rate_quotes";

// Common abbreviations → canonical card type names in the rate list.
const CARD_ALIASES: Record<string, string> = {
  itunes: "iTunes US",
  "google play": "Google Play US",
  googleplay: "Google Play US",
  gplay: "Google Play US",
  steam: "Steam US",
  amazon: "Amazon US",
  apple: "iTunes US",
  ebay: "eBay US",
  walmart: "Walmart",
  sephora: "Sephora",
  nike: "Nike",
  visa: "Vanilla Visa",
  "vanilla visa": "Vanilla Visa",
  xbox: "Xbox",
  "razer gold": "Razer Gold",
  razer: "Razer Gold",
  netflix: "Netflix",
  nordstrom: "Nordstrom",
  "foot locker": "Foot Locker",
  footlocker: "Foot Locker",
  "macy's": "Macy's",
  macys: "Macy's",
};

function normalize(text: string): string {
  return text.toLowerCase().replace(/[’‘]/g, "'").replace(/\s+/g, " ").trim();
}

/**
 * Detect a card type and/or amount in a customer message.
 * Matches card names against the active card rate list (plus common
 * abbreviations), case-insensitive. Amounts: $100, 100 dollars, 100 USD.
 */
export function detectRateQuote(text: string): DetectedRateQuote | null {
  const norm = normalize(text);

  // Amount: $100 / 100 dollars / 100 usd / 100$
  let amount: number | null = null;
  const amountMatch =
    norm.match(/\$\s?(\d+(?:\.\d+)?)/) ||
    norm.match(/(\d+(?:\.\d+)?)\s?(?:dollars?|usd|bucks?)/) ||
    norm.match(/(\d+(?:\.\d+)?)\s?\$/);
  if (amountMatch) amount = Number(amountMatch[1]);

  // Card type: check rate list names first, then aliases.
  const lowered = norm;
  let cardType: string | null = null;

  const names = [...new Set(cardRates.map((r) => r.cardType))];
  const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  // Longest names first so "Google Play US" wins over "Google Play".
  for (const name of names.sort((a, b) => b.length - a.length)) {
    const needle = name.toLowerCase();
    if (new RegExp(`(^|[^a-z])${escapeRe(needle)}([^a-z]|$)`, "i").test(lowered)) {
      cardType = name;
      break;
    }
    // Also match the base name without a country suffix ("iTunes" → "iTunes US").
    const base = needle.replace(/\s+(us|uk|eu|ca|au|de|fr)$/i, "");
    if (base !== needle && new RegExp(`(^|[^a-z])${escapeRe(base)}([^a-z]|$)`, "i").test(lowered)) {
      cardType = name;
      break;
    }
  }
  if (!cardType) {
    for (const [alias, canonical] of Object.entries(CARD_ALIASES).sort((a, b) => b[0].length - a[0].length)) {
      if (new RegExp(`(^|[^a-z])${alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^a-z]|$)`, "i").test(lowered)) {
        cardType = canonical;
        break;
      }
    }
  }

  if (!cardType) return null;

  const rate = cardRates.find((r) => r.cardType === cardType);
  if (!rate) return null;

  return {
    cardType: rate.cardType,
    cardFormat: rate.cardFormat,
    currency: rate.currency,
    rate: rate.sellRate,
    amount,
  };
}

/** True when a customer message is a quote acceptance ("accept", "ok", "yes", "deal", ...). */
export function isAcceptMessage(text: string): boolean {
  const norm = normalize(text).replace(/[!.,?]+$/g, "");
  return /^(accept|accepted|i accept|ok|okay|yes|yeah|yep|deal|confirm|confirmed|agree|agreed|go ahead|proceed|let'?s do it|lets do it)$/.test(
    norm,
  );
}

function loadQuotes(): Record<string, LockedQuote> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveQuotes(map: Record<string, LockedQuote>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  window.dispatchEvent(new CustomEvent("rate-quotes-updated"));
}

/** Store the quoted rate for a conversation (15-minute lock starts now). */
export function lockQuote(conversationId: string, quote: Omit<LockedQuote, "quotedAt">) {
  const map = loadQuotes();
  map[conversationId] = { ...quote, quotedAt: Date.now() };
  saveQuotes(map);
}

/** Returns the locked quote for a conversation, or null when missing/expired. */
export function getActiveQuote(conversationId: string): LockedQuote | null {
  const q = loadQuotes()[conversationId];
  if (!q) return null;
  if (Date.now() - q.quotedAt > QUOTE_LOCK_MS) return null;
  return q;
}

/** Returns the raw quote even when expired (for "quote expired" notifications). */
export function getQuote(conversationId: string): LockedQuote | null {
  return loadQuotes()[conversationId] ?? null;
}

export function isQuoteExpired(q: LockedQuote): boolean {
  return Date.now() - q.quotedAt > QUOTE_LOCK_MS;
}

export function quoteMinutesRemaining(q: LockedQuote): number {
  return Math.max(0, Math.ceil((QUOTE_LOCK_MS - (Date.now() - q.quotedAt)) / 60000));
}

export function clearQuote(conversationId: string) {
  const map = loadQuotes();
  delete map[conversationId];
  saveQuotes(map);
}

/** Build the formatted quote message sent to the customer. */
export function buildQuoteMessage(q: {
  cardType: string;
  amount: number;
  cardFormat: string;
  rate: number;
  currency: string;
}): string {
  const total = Math.round(q.amount * q.rate);
  const symbol = q.currency === "USD" ? "$" : `${q.currency} `;
  return [
    "📋 Rate Quote",
    `Card: ${q.cardType} ${symbol}${q.amount} (${q.cardFormat})`,
    `Rate: Pts ${q.rate.toLocaleString()} / ${symbol === "$" ? "$" : q.currency}`,
    `You receive: Pts ${total.toLocaleString()}`,
    "",
    'Reply "Accept" to start the trade.',
  ].join("\n");
}

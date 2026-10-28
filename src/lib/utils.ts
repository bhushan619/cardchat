import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Mask a person's name for privacy display.
 * Keeps first & last character of each word, replaces the middle with •.
 * e.g. "BLESSING UGO" -> "B••••••G U••"
 */
export function maskName(name: string | null | undefined): string {
  if (!name) return "";
  return name
    .trim()
    .split(/\s+/)
    .map((w) => {
      if (w.length <= 1) return w;
      if (w.length === 2) return w[0] + "•";
      return w[0] + "•".repeat(w.length - 2) + w[w.length - 1];
    })
    .join(" ");
}

/**
 * Mask an alias for privacy display.
 * Keeps the first and last character, replaces the middle with •.
 * e.g. "A7X3KP" -> "A••••P"
 */
export function maskAlias(alias: string | null | undefined): string {
  if (!alias) return "";
  const cleaned = alias.trim();
  if (cleaned.length <= 2) return cleaned;
  return cleaned[0] + "•".repeat(cleaned.length - 2) + cleaned[cleaned.length - 1];
}

/**
 * Format a date value as dd/mm/yyyy.
 * Accepts Date objects or ISO/date strings.
 */
export function formatDate(value: Date | string | number | null | undefined): string {
  if (!value) return "";
  const d = typeof value === "object" ? value : new Date(value);
  if (isNaN(d.getTime())) return String(value);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Match a typed bank account number filter against a stored account value.
 * Compares digits only, so spaces, dashes and masking characters are ignored.
 * An empty/whitespace-only filter matches everything.
 */
export function accountNumberMatches(filter: string, value: string | null | undefined): boolean {
  const digits = (filter || "").replace(/\D/g, "");
  if (!digits) return true;
  return (value || "").replace(/\D/g, "").includes(digits);
}

/**
 * Parse a ledger timestamp formatted as "dd/mm/yyyy · hh:mm AM/PM".
 * Returns null when the value does not match the expected format.
 */
export function parseLedgerDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const m = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})\s*·\s*(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!m) return null;
  let hours = Number(m[4]) % 12;
  if (m[6].toUpperCase() === "PM") hours += 12;
  const d = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]), hours, Number(m[5]));
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Check a ledger timestamp against an optional from/to range (datetime-local values).
 * Empty bounds are ignored; unparseable timestamps are kept so records never vanish.
 */
export function withinDateRange(value: string, from: string, to: string): boolean {
  if (!from && !to) return true;
  const d = parseLedgerDate(value);
  if (!d) return true;
  if (from) {
    const f = new Date(from);
    if (!isNaN(f.getTime()) && d < f) return false;
  }
  if (to) {
    const t = new Date(to);
    if (!isNaN(t.getTime()) && d > t) return false;
  }
  return true;
}

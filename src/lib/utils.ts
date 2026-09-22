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

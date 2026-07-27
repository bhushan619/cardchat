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

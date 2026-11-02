import { format, isValid, parse } from "date-fns";

export const DATE_TIME_FORMAT = "dd-MMM-yyyy HH:mm";
const referenceTime = new Date();

/** Parse stored dates without changing the original storage or schedule timezone. */
export function parseDateTime(value: Date | string | number | null | undefined, reference = referenceTime): Date | null {
  if (value === null || value === undefined || value === "") return null;
  if (value instanceof Date) return isValid(value) ? value : null;
  if (typeof value === "number") return isValid(new Date(value)) ? new Date(value) : null;
  const text = value.trim();
  const relative = text.match(/^(\d+)\s*(s|sec(?:ond)?s?|m|min(?:ute)?s?|h|hrs?|hours?|d|days?)\s*(?:ago)?$/i);
  if (relative) {
    const unit = relative[2].toLowerCase()[0];
    return new Date(reference.getTime() - Number(relative[1]) * ({ s: 1000, m: 60000, h: 3600000, d: 86400000 }[unit] ?? 0));
  }
  if (/^(now|just now|today)$/i.test(text)) return new Date(reference);
  if (/^yesterday$/i.test(text)) { const date = new Date(reference); date.setDate(date.getDate() - 1); return date; }
  const normalized = text.replace(/\s*[·|]\s*/g, " ").replace(/\s+/g, " ");
  for (const pattern of [DATE_TIME_FORMAT, "dd/MM/yyyy hh:mm a", "dd/MM/yyyy HH:mm", "dd/MM/yyyy", "MMM dd, yyyy hh:mm a", "MMM d, yyyy HH:mm", "MMM d, yyyy", "MMM d, hh:mm a", "dd MMM yyyy HH:mm", "dd MMM yyyy", "yyyy-MM-dd HH:mm", "yyyy-MM-dd", "MMM yyyy", "hh:mm a", "HH:mm"]) {
    const date = parse(normalized, pattern, reference);
    if (isValid(date)) return date;
  }
  const date = new Date(text);
  return isValid(date) ? date : null;
}

export function formatDateTime(value: Date | string | number | null | undefined): string {
  const date = parseDateTime(value);
  return date ? format(date, DATE_TIME_FORMAT) : "—";
}

/** Combine legacy date and time columns; already-full timestamps are not duplicated. */
export function formatDateAndTime(date: string, time?: string): string {
  if (/\d{1,2}:\d{2}/.test(date)) return formatDateTime(date);
  return formatDateTime(time ? `${date} ${time}` : date);
}
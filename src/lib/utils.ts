import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string, locale: "zh-TW" | "en-US" = "zh-TW") {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(d);
}

export function formatRelativeTime(date: Date | string, locale: "zh-TW" | "en-US" = "zh-TW") {
  const d = typeof date === "string" ? new Date(date) : date;
  const diff = Date.now() - d.getTime();
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  const minutes = Math.round(diff / 60000);
  if (Math.abs(minutes) < 60) return rtf.format(-minutes, "minute");
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return rtf.format(-hours, "hour");
  const days = Math.round(hours / 24);
  return rtf.format(-days, "day");
}

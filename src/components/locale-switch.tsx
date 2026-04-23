"use client";

import { useTransition } from "react";
import { Languages } from "lucide-react";
import { switchLocale } from "@/app/actions/locale";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n";

export function LocaleSwitch({ current }: { current: Locale }) {
  const [pending, start] = useTransition();

  const toggle = () => {
    const next: Locale = current === "zh-TW" ? "en-US" : "zh-TW";
    start(async () => {
      await switchLocale(next);
    });
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium",
        "border border-border bg-background/80 backdrop-blur",
        "hover:bg-secondary transition-colors",
        "disabled:opacity-60"
      )}
      aria-label="Switch language"
    >
      <Languages className="size-4" aria-hidden />
      <span>{current === "zh-TW" ? "繁中 · EN" : "EN · 繁中"}</span>
    </button>
  );
}

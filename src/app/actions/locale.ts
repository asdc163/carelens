"use server";

import { revalidatePath } from "next/cache";
import { setLocale } from "@/lib/locale";
import type { Locale } from "@/lib/i18n";

export async function switchLocale(locale: Locale) {
  await setLocale(locale);
  revalidatePath("/", "layout");
}

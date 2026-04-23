import { cookies } from "next/headers";
import { DEFAULT_LOCALE, LOCALES, type Locale, t } from "./i18n";

const LOCALE_COOKIE = "cl_locale";

export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const raw = store.get(LOCALE_COOKIE)?.value;
  if (raw && (LOCALES as readonly string[]).includes(raw)) return raw as Locale;
  return DEFAULT_LOCALE;
}

export async function setLocale(locale: Locale) {
  const store = await cookies();
  store.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
}

export async function getMessages() {
  const locale = await getLocale();
  return { locale, m: t(locale) };
}

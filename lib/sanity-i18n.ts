type LocaleValue<T> = Partial<Record<"it" | "en" | "de" | "fr", T>> | null | undefined;

export function pickLocale<T = string>(value: LocaleValue<T>, locale: string): T | undefined {
  if (!value) return undefined;
  return (value as Record<string, T>)[locale] ?? value.it;
}

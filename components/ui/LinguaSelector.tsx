"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/lib/i18n/navigation";
import { routing } from "@/lib/i18n/routing";

const LABELS: Record<string, string> = { it: "IT", en: "EN", de: "DE", fr: "FR" };
const FLAGS: Record<string, string> = { it: "🇮🇹", en: "🇬🇧", de: "🇩🇪", fr: "🇫🇷" };

export default function LinguaSelector() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="flex items-center gap-1">
      {routing.locales.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => router.replace(pathname, { locale: l })}
          aria-current={l === locale}
          className={`rounded-md px-1.5 py-1 text-xs font-medium transition-colors hover:bg-surface ${
            l === locale ? "text-accent" : "text-textMuted"
          }`}
        >
          <span className="mr-1">{FLAGS[l]}</span>
          {LABELS[l]}
        </button>
      ))}
    </div>
  );
}

"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/lib/i18n/navigation";
import { routing } from "@/lib/i18n/routing";

const LABELS: Record<string, string> = { it: "IT", en: "EN", de: "DE", fr: "FR" };

export default function LinguaSelector() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="flex items-center gap-1">
      {routing.locales.map((l, i) => (
        <span key={l} className="flex items-center">
          {i > 0 && <span className="mx-1 text-border">·</span>}
          <button
            type="button"
            onClick={() => router.replace(pathname, { locale: l })}
            aria-current={l === locale}
            className={`text-xs font-semibold tracking-wide transition-colors ${
              l === locale ? "text-accent" : "text-textMuted hover:text-text"
            }`}
          >
            {LABELS[l]}
          </button>
        </span>
      ))}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { acceptedCategory, showPreferences } from "vanilla-cookieconsent";
import { onConsentChanged } from "@/lib/consent";

export default function MapEmbed({ lat, lon }: { lat: number; lon: number }) {
  const t = useTranslations("CookieConsent");
  const [consented, setConsented] = useState(false);

  useEffect(() => {
    const check = () => setConsented(acceptedCategory("functional"));
    check();
    return onConsentChanged(check);
  }, []);

  if (!consented) {
    return (
      <button
        type="button"
        onClick={() => showPreferences()}
        className="flex h-full w-full flex-col items-center justify-center gap-2 bg-surface p-6 text-center text-sm text-textMuted"
      >
        <span>{t("mapPlaceholder")}</span>
        <span className="font-semibold text-primary underline">{t("mapManage")}</span>
      </button>
    );
  }

  return (
    <iframe
      title="Hotel del Golfo — mappa"
      src={`https://www.google.com/maps?q=${lat},${lon}&z=15&output=embed`}
      className="h-full w-full border-0"
      loading="lazy"
    />
  );
}

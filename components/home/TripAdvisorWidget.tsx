"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

// Widget ufficiale TripAdvisor (gratuito, stile fisso — TripAdvisor Widget
// Center). Estrae il locationId direttamente dall'URL della scheda (es.
// ".../Hotel_Review-g194792-d567523-Reviews-...") così che aggiornare il
// link in Sanity (Impostazioni ▸ Info Hotel ▸ Link TripAdvisor) aggiorni
// anche il widget, senza toccare il codice.
//
// ATTENZIONE (06/08/2026): i parametri dello script (wtype=selfserveprop)
// sono il pattern pubblico più diffuso per questo tipo di embed, ma non
// generato/verificato dal Widget Center ufficiale (nessun accesso browser
// disponibile in questa sessione per generarlo e controllarlo a schermo).
// Se il riquadro resta vuoto una volta pubblicato: generare l'embed reale
// da https://www.tripadvisor.com/Widgets (nessun login richiesto) con lo
// stesso locationId e sostituire lo script qui sotto. Il link "leggi le
// recensioni" invece è un link diretto, sempre funzionante a prescindere
// dallo script.

function estraiLocationId(url: string | undefined | null): string | null {
  if (!url) return null;
  const match = url.match(/-d(\d+)-/);
  return match ? match[1] : null;
}

export default function TripAdvisorWidget({ url, locale }: { url: string; locale: string }) {
  const t = useTranslations("Home.recensioni");
  const locationId = estraiLocationId(url);
  const containerId = `TA_selfserveprop${locationId ?? ""}`;

  useEffect(() => {
    if (!locationId) return;
    const script = document.createElement("script");
    script.src = `https://www.jscache.com/wejs?wtype=selfserveprop&uniq=${containerId}&locationId=${locationId}&lang=${locale}&border=true&display_version=2`;
    script.async = true;
    document.getElementById(containerId)?.appendChild(script);
    return () => {
      script.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationId, locale]);

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      {locationId && <div id={containerId} className="TA_selfserveprop min-h-[60px] w-full" />}
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm font-semibold text-primary hover:text-accent"
      >
        {t("cta")} →
      </a>
    </div>
  );
}

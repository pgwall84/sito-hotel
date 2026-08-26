"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/lib/i18n/navigation";
import { routing } from "@/lib/i18n/routing";

// Bandiere disegnate a mano (26/08/2026, Fase 5 coerenza visiva) al posto
// delle sigle testuali IT/EN/DE/FR — stesso principio già usato per
// l'icona WhatsApp in WhatsAppButton.tsx: SVG inline, nessuna nuova
// dipendenza. Rappresentano il paese associato a ogni lingua, non la
// lingua in sé (semplificazione nota e accettata per un set fisso di 4
// lingue rivolte a turisti europei — vedi spec docs/superpowers/specs/
// 2026-08-26-coerenza-visiva-design.md, §"LinguaSelector"). Ogni bandiera
// è un rettangolo 3:2 (viewBox 0 0 60 40) ritagliato in cerchio dal
// bottone contenitore (overflow-hidden rounded-full sul <button>,
// preserveAspectRatio="xMidYMid slice" sull'<svg> per riempire il cerchio
// senza distorsione) — molto più semplice da disegnare a mano di una
// bandiera davvero circolare.
const BANDIERE: Record<string, React.ReactNode> = {
  it: (
    <svg viewBox="0 0 60 40" className="h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="20" height="40" fill="#009246" />
      <rect x="20" width="20" height="40" fill="#FFFFFF" />
      <rect x="40" width="20" height="40" fill="#CE2B37" />
    </svg>
  ),
  en: (
    <svg viewBox="0 0 60 40" className="h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="60" height="40" fill="#012169" />
      <line x1="0" y1="0" x2="60" y2="40" stroke="#FFFFFF" strokeWidth="10" />
      <line x1="60" y1="0" x2="0" y2="40" stroke="#FFFFFF" strokeWidth="10" />
      <line x1="0" y1="0" x2="60" y2="40" stroke="#C8102E" strokeWidth="4" />
      <line x1="60" y1="0" x2="0" y2="40" stroke="#C8102E" strokeWidth="4" />
      <rect x="24" width="12" height="40" fill="#FFFFFF" />
      <rect y="14" width="60" height="12" fill="#FFFFFF" />
      <rect x="27" width="6" height="40" fill="#C8102E" />
      <rect y="17" width="60" height="6" fill="#C8102E" />
    </svg>
  ),
  de: (
    <svg viewBox="0 0 60 40" className="h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="60" height="40" fill="#000000" />
      <rect y="13.33" width="60" height="13.34" fill="#DD0000" />
      <rect y="26.67" width="60" height="13.33" fill="#FFCE00" />
    </svg>
  ),
  fr: (
    <svg viewBox="0 0 60 40" className="h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="20" height="40" fill="#0055A4" />
      <rect x="20" width="20" height="40" fill="#FFFFFF" />
      <rect x="40" width="20" height="40" fill="#EF4135" />
    </svg>
  ),
};

// Nomi nella lingua stessa, per l'aria-label — la bandiera è aria-hidden
// (decorativa): senza questo il bottone perderebbe il nome accessibile
// per chi usa uno screen reader, che prima veniva dal testo visibile
// ("IT" ecc.). Non un dettaglio opzionale, è una correzione di
// accessibilità necessaria per non introdurre una regressione.
const NOMI_LINGUA: Record<string, string> = { it: "Italiano", en: "English", de: "Deutsch", fr: "Français" };

export default function LinguaSelector() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="flex items-center gap-2">
      {routing.locales.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => router.replace(pathname, { locale: l })}
          aria-current={l === locale}
          aria-label={NOMI_LINGUA[l]}
          className={`flex h-5 w-5 items-center justify-center overflow-hidden rounded-full border transition-colors ${
            l === locale ? "border-accent" : "border-border hover:border-primary"
          }`}
        >
          {BANDIERE[l]}
        </button>
      ))}
    </div>
  );
}

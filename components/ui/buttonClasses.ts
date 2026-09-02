// Modulo separato SENZA "use client" (fix 26/08/2026): buttonClasses è
// una funzione pura che concatena stringhe Tailwind, nessuna API
// client-only — ma se vive nello stesso file di Button.tsx (che ha
// "use client" per il componente <Button> vero e proprio, con routing
// interattivo) l'intero modulo diventa un confine client per il
// bundler RSC di Next.js. I Server Component che la chiamano
// direttamente come funzione in fase di render (es. Hero.tsx,
// OffertaCard.tsx — NON come JSX <Button>, quello è sempre permesso)
// vanno in errore runtime: "Attempted to call buttonClasses() from
// the server but buttonClasses is on the client." Tenendola qui, in
// un modulo senza direttiva, resta chiamabile sia da Server che da
// Client Component.

import { focusRingClasses } from "@/lib/a11y";

export type ButtonVariant = "primary" | "accent" | "outline-primary" | "outline-white" | "solid-white-accent";
export type ButtonSize = "grande" | "compatta";

// Le 5 combinazioni reali trovate nell'audit di coerenza visiva del
// 26/08/2026 (docs/superpowers/specs/2026-08-26-coerenza-visiva-design.md):
// primary/accent per le azioni piene (piena navy = funzionale, piena
// accent = calda/promozionale), outline-primary/outline-white per le due
// varianti outline già in uso (LavoroBanner, Hero secondaria),
// solid-white-accent per il bottone bianco su sfondo accent di
// PestoHighlight — non è "outline" (nessun bordo, sfondo pieno bianco).
const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "bg-primary text-white hover:bg-primaryLight",
  accent: "bg-accentDeep text-white hover:bg-accentLight",
  "outline-primary": "border border-primary text-primary hover:bg-primary hover:text-white",
  "outline-white": "border border-white text-white hover:bg-white hover:text-primary",
  "solid-white-accent": "bg-white text-accentDeep hover:bg-surface",
};

// "compatta" a px-5/py-2.5 (non py-2): l'audit ha trovato 3 varianti della
// stessa "pillola media" (Header desktop px-5/py-2, Header mobile e
// OffertaCard px-5/py-2.5) — py-2.5 è la maggioranza (2 su 3), si
// standardizza su quella invece che sulla minoranza.
const SIZE_CLASSES: Record<ButtonSize, string> = {
  grande: "px-7 py-3",
  compatta: "px-5 py-2.5",
};

export function buttonClasses(variant: ButtonVariant, size: ButtonSize = "grande"): string {
  return `rounded-full text-sm font-semibold transition-colors ${focusRingClasses} ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]}`;
}

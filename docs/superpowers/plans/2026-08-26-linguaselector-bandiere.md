# LinguaSelector — bandiere al posto delle sigle (Fase 5) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sostituire in `components/ui/LinguaSelector.tsx` le sigle testuali "IT/EN/DE/FR" con 4 bandiere SVG disegnate a mano, dentro chip circolari, mantenendo identico il comportamento di cambio lingua.

**Architecture:** Riscrittura completa di un unico file (33 righe) — nessun componente nuovo, nessuna nuova dipendenza. Ogni bandiera è un rettangolo SVG 3:2 ritagliato in cerchio dal bottone contenitore (`overflow-hidden rounded-full`), stesso principio dell'icona WhatsApp disegnata a mano in `WhatsAppButton.tsx` (SVG inline, nessuna libreria di icone).

**Tech Stack:** Next.js App Router, TypeScript, Tailwind (token da `lib/theme.ts`), next-intl (routing/locale, invariato).

## Global Constraints

- Mai eseguire `git` da questa sessione Cowork — commit reali fatti dal titolare dal tab Code.
- Nessun accesso a database/VPS da questa sessione.
- Verifica disponibile solo tramite `npx tsc --noEmit` ed `esbuild --bundle --jsx=automatic` in una sandbox scratch temporanea — nessun `npm run dev`/build reale possibile da qui. Sandbox sempre eliminata prima della consegna finale.
- Sostituzione completa (non affiancamento) delle sigle testuali — dalla spec (`docs/superpowers/specs/2026-08-26-coerenza-visiva-design.md`, §"LinguaSelector"): "le bandiere rappresentano paesi, non lingue (semplificazione nota e comune nel settore alberghiero per un set fisso di 4 lingue rivolte a turisti europei — non è una scelta neutra ma è accettata per questo contesto)".
- Nessuna nuova dipendenza npm. Nessuna modifica a `components/layout/Header.tsx` (i 2 punti di utilizzo, `<LinguaSelector />` alle righe 62 e 99, restano identici — il componente è drop-in), a `lib/i18n/routing.ts`, o a qualunque altro file.

---

### Task 1: Riscrivere LinguaSelector.tsx con le bandiere

**Files:**
- Modify: `components/ui/LinguaSelector.tsx` (riscrittura completa, 33 righe → nuovo contenuto sotto)

**Interfaces:**
- Produces: `export default function LinguaSelector(): JSX.Element` — stessa firma di prima (nessun prop), consumato invariato da `Header.tsx:62` e `Header.tsx:99`.

Contenuto attuale di riferimento (33 righe, letto fresh il 26/08/2026):

```tsx
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
```

- [x] **Step 1: Sostituire l'intero contenuto del file**

Sostituire tutte le 33 righe con:

```tsx
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
          className={`flex h-7 w-7 items-center justify-center overflow-hidden rounded-full border transition-colors ${
            l === locale ? "border-accent" : "border-border hover:border-primary"
          }`}
        >
          {BANDIERE[l]}
        </button>
      ))}
    </div>
  );
}
```

Note sulle differenze deliberate rispetto all'originale (non effetti collaterali):
- Il divider "·" tra le lingue è rimosso: aveva senso per disambiguare sigle di testo ravvicinate, non per chip circolari già distinte dal proprio bordo — sostituito da `gap-2` nel contenitore flex (prima `gap-1` + divider).
- La struttura `<span>` di wrapping con divider condizionale basato sull'indice `i` non serve più — si torna a un `.map((l) => ...)` diretto.
- Chip `h-7 w-7` (28px): è un miglioramento del target di tocco rispetto a prima (solo glifi di testo ~12px, nessun box dedicato), non un compromesso.
- Un solo bordo da 1px che cambia colore tra stato attivo (`border-accent`) e inattivo (`border-border`, `hover:border-primary`) — nessun `ring` Tailwind aggiuntivo, niente cambio di spessore tra stati per evitare un micro-scatto di layout.
- `aria-current={l === locale}` resta identico all'originale, non toccato.

- [x] **Step 2: Verificare con tsc in sandbox scratch**

Creare una sandbox temporanea (`/tmp/lingua-verify`), symlink di `node_modules` (react@19.2.4, react-dom@19.2.4, typescript, esbuild, @types/react, @types/react-dom, @types/node) nel mirror del repo, `tsconfig.verify.json` con `"paths": {"@/*": ["./*"]}` e un file di dichiarazioni ambiente per i moduli non presenti nel mirror parziale di Cowork (`@/lib/i18n/navigation`, `@/lib/i18n/routing`, `next-intl`) — stesso principio già usato nei piani Card e Fase 4.

Run: `npx tsc --noEmit -p tsconfig.verify.json`
Expected: nessun errore su `components/ui/LinguaSelector.tsx`.

- [x] **Step 3: Verificare con esbuild**

Run: `npx esbuild components/ui/LinguaSelector.tsx --bundle --jsx=automatic --tsconfig=tsconfig.verify.json --external:react --external:react-dom --external:@/* --external:next-intl --outdir=/tmp/lingua-verify/out`
Expected: bundle completato senza errori.

- [x] **Step 4: Nota di verifica per il titolare**

Aprire qualunque pagina pubblica in `npm run dev` locale: nell'header desktop e nel menu mobile, al posto delle sigle "IT/EN/DE/FR" devono comparire 4 cerchietti con le bandiere corrispondenti, riconoscibili anche alla dimensione ridotta (28px). Il cerchio della lingua corrente deve avere un bordo colorato accent (terracotta) visibile; passando il mouse sugli altri cerchi, il bordo deve diventare navy. Cliccando su un cerchio, il cambio lingua deve funzionare esattamente come prima (comportamento invariato, solo l'aspetto cambia).

- [x] **Step 5: Eliminare la sandbox scratch**

Rimuovere `/tmp/lingua-verify`, il symlink `node_modules`, `tsconfig.verify.json` e il file di dichiarazioni ambiente dal mirror del repo.

---

### Task 2: Aggiornare la documentazione di progetto

**Files:**
- Modify: `STATO_PROGETTO.md`

- [x] **Step 1: Aggiungere la voce di chiusura della Fase 5**

Nella sezione "Redesign visivo", sotto la voce della Fase 4 (chiusa il 26/08/2026), aggiungere una sotto-voce per questo piano (Fase 5, `LinguaSelector`) con: le 4 bandiere disegnate a mano (colori esatti, tecnica del rettangolo 3:2 ritagliato in cerchio); la rimozione del divider "·" (decisione dichiarata); il chip 28px come miglioramento del target di tocco; l'`aria-label` aggiunto come correzione di accessibilità (non regressione); nessuna modifica a `Header.tsx`/`routing.ts`/nuove dipendenze; i limiti di verifica di Cowork dichiarati esplicitamente (stesso principio dei piani precedenti); aggiornare la riga "Prossimo piano" indicandolo come Fase 6 (sweep finale — titoli isolati `<p>`→`<h2>`, `LavoroBanner` `text-2xl`→`text-3xl`, radius di box/immagini rimasti, verifica finale di coerenza su tutte le pagine non ancora toccate).

- [x] **Step 2: Rileggere la sezione aggiornata**

Verificare che la voce sia coerente con lo stile delle voci precedenti e non contenga placeholder.

---

## Note finali per chi esegue

- Consegna finale: un solo `SendUserFile` con `components/ui/LinguaSelector.tsx` e `STATO_PROGETTO.md` + un solo `device_commit_files`.
- Prima di modificare il file, ri-leggerlo fresh da device con `device_stage_files` (non fidarsi della cache di questa conversazione).

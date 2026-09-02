# Audit accessibilità (Punto 5) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Aggiungere stati di focus visibili su tutti gli elementi interattivi del sito pubblico, correggere i fallimenti di contrasto colore trovati (calcolo WCAG reale su `lib/theme.ts`), e completare la semantica ARIA/gestione focus del date-picker — le tre lacune di accessibilità individuabili da codice senza un browser reale.

**Architecture:** Due token di base (`lib/theme.ts`) e una costante di classi Tailwind riusabile (`lib/a11y.ts`) propagati a 14 file consumatori. Nessun nuovo componente, nessuna nuova dipendenza, nessuna modifica alla logica esistente (solo classi CSS e attributi ARIA aggiuntivi, tranne il ripristino del focus sul date-picker che aggiunge due `ref` + due chiamate `.focus()`).

**Tech Stack:** Classi utility Tailwind (`focus-visible:`), colori esadecimali, attributi ARIA HTML standard.

## Global Constraints

- Nessun comando `git` da questa sessione — commit/push restano al titolare dal suo tab Code locale. Nessuno step di commit in questo piano.
- Verifica tramite `tsc` mirato (mai full-project: supera il timeout di 45s dell'ambiente), tsconfig di scratch nella ROOT del repo con `next-env.d.ts` sempre incluso in `"files"` (altrimenti falsi positivi TS2769 su `lib/queries.ts` — vedi memoria di progetto `sito_hotel_verifica_tsc_reale.md`). Rimuovere il tsconfig di scratch dopo ogni verifica.
- Editing diretto sui file nella cartella connessa dell'utente — nessun passaggio di consegna aggiuntivo necessario.
- Nessuna modifica a schema Sanity, nessuna nuova dipendenza npm.
- Valori esatti dei nuovi colori: `textLight: '#767676'` (era `#9A9A9A`), `accentDeep: '#A65F31'` (nuovo) — già calcolati e verificati nello spec, non ricalcolare.
- Costante focus riusabile (definita in Task 1): `focusRingClasses = "focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"`.

---

### Task 1: Token di base — `lib/a11y.ts` (nuovo) e `lib/theme.ts`

**Files:**
- Create: `lib/a11y.ts`
- Modify: `lib/theme.ts`

**Interfaces:**
- Consumes: nessuna.
- Produces: `focusRingClasses` (stringa, da `lib/a11y.ts`) — importata da ogni task successivo che tocca un elemento interattivo. Classi Tailwind `text-accentDeep`/`bg-accentDeep` e `text-textLight`/`bg-textLight` (invariato nel nome) — disponibili automaticamente via `tailwind.config.ts` (che già fa `colors: theme.colors`), nessuna modifica al config necessaria.

- [ ] **Step 1: Creare `lib/a11y.ts`**

```ts
// Costante di classi Tailwind per lo stato di focus visibile, riusata da
// ogni elemento interattivo del sito (Punto 5, audit accessibilità,
// 27/08/2026). focus-visible (non focus): l'anello appare solo alla
// navigazione da tastiera, non al click del mouse. outline (proprietà CSS
// nativa) e non ring (box-shadow Tailwind) per non entrare in collisione
// con eventuali anelli di stato già esistenti sullo stesso elemento (es.
// il ring-1 ring-primary di DateRangePicker.tsx sul campo attivo).
export const focusRingClasses =
  "focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";
```

- [ ] **Step 2: Leggere `lib/theme.ts` per confermare che la sezione colori non sia cambiata**

Contenuto atteso delle righe rilevanti (dentro `colors: { ... }`):
```ts
    accent: '#C4703A',       // terracotta ligure
    accentLight: '#D4875A',  // terracotta hover
```
e, più sotto nello stesso oggetto:
```ts
    textLight: '#9A9A9A',    // testo terziario
```

Se il contenuto è diverso, fermarsi e segnalarlo.

- [ ] **Step 3: Modificare `lib/theme.ts`**

Cambiare la riga `textLight`:
```ts
    textLight: '#767676',    // testo terziario (scurito 27/08/2026, audit accessibilità: 2.81:1 -> 4.54:1 su bianco)
```

Aggiungere una nuova riga subito dopo `accentLight`:
```ts
    accentLight: '#D4875A',  // terracotta hover
    accentDeep: '#A65F31',   // terracotta scurita per testo/sfondo a contrasto AA (27/08/2026, audit accessibilità: 4.88:1)
```

- [ ] **Step 4: Verifica `tsc` mirata**

Creare nella root del repo `.verify.tsconfig.json`:
```json
{
  "extends": "./tsconfig.json",
  "include": [],
  "files": ["next-env.d.ts", "lib/a11y.ts", "lib/theme.ts"]
}
```

Run: `timeout 35 npx tsc --noEmit -p .verify.tsconfig.json`
Expected: nessun output.

Poi: `rm -f .verify.tsconfig.json`.

---

### Task 2: `components/ui/buttonClasses.ts`

**Files:**
- Modify: `components/ui/buttonClasses.ts`

**Interfaces:**
- Consumes: `focusRingClasses` da `lib/a11y.ts` (Task 1); `accentDeep` da `lib/theme.ts` (Task 1, via classe Tailwind `bg-accentDeep`/`text-accentDeep`, non serve importare `theme`).
- Produces: nessuna nuova interfaccia — `buttonClasses()` mantiene la stessa firma, cambia solo la stringa restituita. Ogni consumatore esistente (`Button.tsx`, `BookingButton` a tutti i call site) eredita il fix senza modifiche proprie.

- [ ] **Step 1: Aggiungere l'import**

In cima al file, dopo i commenti esistenti, aggiungere:
```ts
import { focusRingClasses } from "@/lib/a11y";
```

- [ ] **Step 2: Aggiornare `VARIANT_CLASSES`**

```ts
const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "bg-primary text-white hover:bg-primaryLight",
  accent: "bg-accentDeep text-white hover:bg-accentLight",
  "outline-primary": "border border-primary text-primary hover:bg-primary hover:text-white",
  "outline-white": "border border-white text-white hover:bg-white hover:text-primary",
  "solid-white-accent": "bg-white text-accentDeep hover:bg-surface",
};
```

(Solo `accent` e `solid-white-accent` cambiano: `bg-accent`→`bg-accentDeep`,
`text-accent`→`text-accentDeep`. Le altre tre varianti restano invariate.)

- [ ] **Step 3: Aggiornare `buttonClasses()`**

```ts
export function buttonClasses(variant: ButtonVariant, size: ButtonSize = "grande"): string {
  return `rounded-full text-sm font-semibold transition-colors ${focusRingClasses} ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]}`;
}
```

- [ ] **Step 4: Verifica `tsc` mirata**

`.verify.tsconfig.json` con `"files": ["next-env.d.ts", "components/ui/buttonClasses.ts"]`, stesso comando del Task 1 Step 4, poi rimuovere il file.

---

### Task 3: `components/ui/Card.tsx` e `components/ui/EscursioneCard.tsx`

**Files:**
- Modify: `components/ui/Card.tsx`
- Modify: `components/ui/EscursioneCard.tsx`

**Interfaces:**
- Consumes: `focusRingClasses` da `lib/a11y.ts` (Task 1); `accentDeep` da `lib/theme.ts` (Task 1).
- Produces: nessuna nuova interfaccia — stesso comportamento, solo classi aggiuntive quando la card è cliccabile, più il fix di contrasto sul sottotitolo.

- [ ] **Step 1: `Card.tsx` — aggiungere l'import**

```ts
import { focusRingClasses } from "@/lib/a11y";
```

- [ ] **Step 2: `Card.tsx` — aggiornare l'array `classi`**

```ts
  const classi = [
    "rounded-lg",
    "bg-background",
    "shadow-card",
    conFoto ? "overflow-hidden" : "border border-border",
    hover ? `transition-shadow hover:shadow-cardHover ${focusRingClasses}` : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
```

- [ ] **Step 3: `EscursioneCard.tsx` — aggiungere l'import**

```ts
import { focusRingClasses } from "@/lib/a11y";
```

- [ ] **Step 4: `EscursioneCard.tsx` — aggiornare `CLASSI_CARD`**

```ts
const CLASSI_CARD =
  `block overflow-hidden rounded-lg bg-background shadow-card transition-shadow hover:shadow-cardHover ${focusRingClasses}`;
const CLASSI_CARD_STATICA = "overflow-hidden rounded-lg bg-background shadow-card";
```

(`CLASSI_CARD_STATICA`, usata quando non c'è `link`, resta invariata: non è
cliccabile, non serve focus.)

- [ ] **Step 5: `EscursioneCard.tsx` — fix di contrasto sul sottotitolo**

Da:
```tsx
        {sottotitolo && <p className="mt-1 text-sm text-accent">{sottotitolo}</p>}
```
A:
```tsx
        {sottotitolo && <p className="mt-1 text-sm text-accentDeep">{sottotitolo}</p>}
```

- [ ] **Step 6: Verifica `tsc` mirata**

`"files": ["next-env.d.ts", "components/ui/Card.tsx", "components/ui/EscursioneCard.tsx"]`, stesso comando, poi rimuovere il file.

---

### Task 4: `components/ui/LuogoCard.tsx`

**Files:**
- Modify: `components/ui/LuogoCard.tsx`

**Interfaces:**
- Consumes: `focusRingClasses` da `lib/a11y.ts` (Task 1).
- Produces: nessuna.

- [ ] **Step 1: Aggiungere l'import**

```tsx
import { focusRingClasses } from "@/lib/a11y";
```

- [ ] **Step 2: Individuare le due righe (contenuto atteso, già con `transition-colors` dal Punto 4)**

```tsx
              className="flex h-9 w-9 items-center justify-center rounded-full bg-surface text-primary transition-colors hover:bg-surfaceDark"
```
```tsx
              className="ml-auto text-sm font-semibold text-primary transition-colors hover:text-accent"
```

Se il contenuto è diverso, fermarsi e segnalarlo.

- [ ] **Step 3: Aggiungere `focusRingClasses` a entrambe**

```tsx
              className={`flex h-9 w-9 items-center justify-center rounded-full bg-surface text-primary transition-colors hover:bg-surfaceDark ${focusRingClasses}`}
```
```tsx
              className={`ml-auto text-sm font-semibold text-primary transition-colors hover:text-accent ${focusRingClasses}`}
```

(Nota: da stringa statica a template literal — necessario per interpolare
`focusRingClasses`.)

- [ ] **Step 4: Verifica `tsc` mirata**

`"files": ["next-env.d.ts", "components/ui/LuogoCard.tsx"]`, stesso comando, poi rimuovere il file.

---

### Task 5: `components/layout/Header.tsx`

**Files:**
- Modify: `components/layout/Header.tsx`

**Interfaces:**
- Consumes: `focusRingClasses` da `lib/a11y.ts` (Task 1); `accentDeep` da `lib/theme.ts` (Task 1).
- Produces: nessuna.

- [ ] **Step 1: Aggiungere l'import**

```tsx
import { focusRingClasses } from "@/lib/a11y";
```

- [ ] **Step 2: Link di navigazione desktop — focus + colore**

Da:
```tsx
              className={`text-sm font-medium transition-colors hover:text-accent ${
                pathname === item.href ? "text-accent" : "text-text"
              }`}
```
A:
```tsx
              className={`text-sm font-medium transition-colors hover:text-accent ${focusRingClasses} ${
                pathname === item.href ? "text-accentDeep" : "text-text"
              }`}
```

- [ ] **Step 3: Bottone toggle menu mobile — solo focus**

Da:
```tsx
          className="flex h-10 w-10 items-center justify-center lg:hidden"
```
A:
```tsx
          className={`flex h-10 w-10 items-center justify-center lg:hidden ${focusRingClasses}`}
```

- [ ] **Step 4: Link di navigazione mobile — focus + colore**

Da:
```tsx
              className={`rounded-md px-3 py-2 text-sm font-medium hover:bg-surface ${
                pathname === item.href ? "text-accent" : "text-text"
              }`}
```
A:
```tsx
              className={`rounded-md px-3 py-2 text-sm font-medium hover:bg-surface ${focusRingClasses} ${
                pathname === item.href ? "text-accentDeep" : "text-text"
              }`}
```

- [ ] **Step 5: Verifica `tsc` mirata**

`"files": ["next-env.d.ts", "components/layout/Header.tsx"]`, stesso comando, poi rimuovere il file.

---

### Task 6: `components/ui/OffertaCard.tsx` e `components/ui/CameraCard.tsx`

**Files:**
- Modify: `components/ui/OffertaCard.tsx`
- Modify: `components/ui/CameraCard.tsx`

**Interfaces:**
- Consumes: `accentDeep` da `lib/theme.ts` (Task 1).
- Produces: nessuna.

- [ ] **Step 1: `OffertaCard.tsx` — badge "evidenziata"**

Da:
```tsx
        <span className="absolute left-3 top-3 z-10 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-white">
```
A:
```tsx
        <span className="absolute left-3 top-3 z-10 rounded-full bg-accentDeep px-3 py-1 text-xs font-semibold text-white">
```

- [ ] **Step 2: `CameraCard.tsx` — stesso badge**

Da:
```tsx
      {evidenziata && badgeLabel && (
        <span className="absolute left-3 top-3 z-10 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-white">
```
A:
```tsx
      {evidenziata && badgeLabel && (
        <span className="absolute left-3 top-3 z-10 rounded-full bg-accentDeep px-3 py-1 text-xs font-semibold text-white">
```

- [ ] **Step 3: Verifica `tsc` mirata**

`"files": ["next-env.d.ts", "components/ui/OffertaCard.tsx", "components/ui/CameraCard.tsx"]`, stesso comando, poi rimuovere il file.

---

### Task 7: `components/home/EsperienzeInEvidenza.tsx` e `components/layout/SectionWrapper.tsx`

**Files:**
- Modify: `components/home/EsperienzeInEvidenza.tsx`
- Modify: `components/layout/SectionWrapper.tsx`

**Interfaces:**
- Consumes: `accentDeep` da `lib/theme.ts` (Task 1).
- Produces: nessuna.

- [ ] **Step 1: `EsperienzeInEvidenza.tsx` — box pesto**

Da:
```tsx
            <div className="grid items-center gap-10 overflow-hidden rounded-lg bg-accent p-8 md:grid-cols-2 md:p-10">
```
A:
```tsx
            <div className="grid items-center gap-10 overflow-hidden rounded-lg bg-accentDeep p-8 md:grid-cols-2 md:p-10">
```

- [ ] **Step 2: `SectionWrapper.tsx` — variante `accent`**

Da:
```ts
const BG_CLASS: Record<Bg, string> = {
  white: "bg-background text-text",
  surface: "bg-surface text-text",
  primary: "bg-primary text-white",
  accent: "bg-accent text-white",
};
```
A:
```ts
const BG_CLASS: Record<Bg, string> = {
  white: "bg-background text-text",
  surface: "bg-surface text-text",
  primary: "bg-primary text-white",
  accent: "bg-accentDeep text-white",
};
```

- [ ] **Step 3: Verifica `tsc` mirata**

`"files": ["next-env.d.ts", "components/home/EsperienzeInEvidenza.tsx", "components/layout/SectionWrapper.tsx"]`, stesso comando, poi rimuovere il file.

---

### Task 8: `components/forms/ContattoForm.tsx`

**Files:**
- Modify: `components/forms/ContattoForm.tsx`

**Interfaces:**
- Consumes: `accentDeep` da `lib/theme.ts` (Task 1).
- Produces: nessuna.

- [ ] **Step 1: Messaggi di errore**

Da:
```tsx
      {status === "error" && <p className="text-sm text-accent sm:col-span-2">{t("formError")}</p>}
      {status === "rate-limited" && <p className="text-sm text-accent sm:col-span-2">{t("formRateLimited")}</p>}
```
A:
```tsx
      {status === "error" && <p className="text-sm text-accentDeep sm:col-span-2">{t("formError")}</p>}
      {status === "rate-limited" && <p className="text-sm text-accentDeep sm:col-span-2">{t("formRateLimited")}</p>}
```

- [ ] **Step 2: Verifica `tsc` mirata**

`"files": ["next-env.d.ts", "components/forms/ContattoForm.tsx"]`, stesso comando, poi rimuovere il file.

---

### Task 9: I tre CTA scritti a mano

**Files:**
- Modify: `app/[locale]/(public)/esperienze/page.tsx`
- Modify: `app/[locale]/(public)/camere/[slug]/page.tsx`
- Modify: `app/[locale]/(public)/ristorante/page.tsx`

**Interfaces:**
- Consumes: `accentDeep` da `lib/theme.ts` (Task 1).
- Produces: nessuna.

- [ ] **Step 1: `esperienze/page.tsx` — CTA mailto pesto**

Da:
```tsx
              className="mt-6 inline-block rounded-full bg-white px-7 py-3 text-sm font-semibold text-accent transition-colors hover:bg-surface"
```
A:
```tsx
              className="mt-6 inline-block rounded-full bg-white px-7 py-3 text-sm font-semibold text-accentDeep transition-colors hover:bg-surface"
```

- [ ] **Step 2: `camere/[slug]/page.tsx` — CTA prenotazione**

Da:
```tsx
            className="mt-6 inline-block rounded-full bg-accent px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-accentLight"
```
A:
```tsx
            className="mt-6 inline-block rounded-full bg-accentDeep px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-accentLight"
```

- [ ] **Step 3: `ristorante/page.tsx` — CTA menu**

Da:
```tsx
                className="mt-6 inline-block rounded-full bg-accent px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-accentLight"
```
A:
```tsx
                className="mt-6 inline-block rounded-full bg-accentDeep px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-accentLight"
```

- [ ] **Step 4: Verifica `tsc` mirata**

`"files": ["next-env.d.ts", "app/[locale]/(public)/esperienze/page.tsx", "app/[locale]/(public)/camere/[slug]/page.tsx", "app/[locale]/(public)/ristorante/page.tsx"]`, stesso comando, poi rimuovere il file.

---

### Task 10: `components/ui/DateRangePicker.tsx` — focus-visible, ARIA, ripristino focus

**Files:**
- Modify: `components/ui/DateRangePicker.tsx`

**Interfaces:**
- Consumes: `focusRingClasses` da `lib/a11y.ts` (Task 1).
- Produces: nessuna — nessun altro file dipende da questo componente per l'accessibilità.

- [ ] **Step 1: Aggiungere l'import e due `ref`**

In cima, dopo gli import esistenti:
```tsx
import { focusRingClasses } from "@/lib/a11y";
```

Dopo `const containerRef = useRef<HTMLDivElement>(null);`, aggiungere:
```tsx
  const arrivoBtnRef = useRef<HTMLButtonElement>(null);
  const partenzaBtnRef = useRef<HTMLButtonElement>(null);
```

- [ ] **Step 2: Riportare il focus alla chiusura su Escape**

Nella funzione `chiudiSuEscape` dentro il primo `useEffect`, da:
```tsx
    function chiudiSuEscape(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setAperto(false);
        setCampoAttivo(null);
      }
    }
```
A:
```tsx
    function chiudiSuEscape(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setAperto(false);
        (campoAttivo === "partenza" ? partenzaBtnRef : arrivoBtnRef).current?.focus();
        setCampoAttivo(null);
      }
    }
```

(Ordine: leggere `campoAttivo` PRIMA di azzerarlo con `setCampoAttivo(null)` —
altrimenti il focus tornerebbe sempre sul campo "arrivo".)

- [ ] **Step 3: Riportare il focus alla chiusura per selezione completata**

In `gestisciClick`, nel ramo finale (range completo), da:
```tsx
    onChange(dataArrivo, iso);
    setCampoAttivo(null);
    setAperto(false); // range completo: selezione conclusa, si chiude da sola
```
A:
```tsx
    onChange(dataArrivo, iso);
    setCampoAttivo(null);
    setAperto(false); // range completo: selezione conclusa, si chiude da sola
    partenzaBtnRef.current?.focus();
```

(Sempre il bottone "partenza": è l'ultimo campo impostato in questo ramo.)

- [ ] **Step 4: `aria-expanded`/`aria-haspopup` + `ref` + focus-visible sui due bottoni trigger**

Da:
```tsx
        <button
          type="button"
          onClick={() => apriCampo("arrivo")}
          className={`flex flex-1 flex-col gap-1 rounded-md border px-3 py-2 text-left ${
            aperto && campoAttivo === "arrivo" ? "border-primary ring-1 ring-primary" : "border-border"
          }`}
        >
          <span className="text-xs text-textMuted">{labelArrivo}</span>
          <span className="text-sm">{dataArrivo || "—"}</span>
        </button>
        <button
          type="button"
          onClick={() => apriCampo("partenza")}
          className={`flex flex-1 flex-col gap-1 rounded-md border px-3 py-2 text-left ${
            aperto && campoAttivo === "partenza" ? "border-primary ring-1 ring-primary" : "border-border"
          }`}
        >
          <span className="text-xs text-textMuted">{labelPartenza}</span>
          <span className="text-sm">{dataPartenza || "—"}</span>
        </button>
```
A:
```tsx
        <button
          ref={arrivoBtnRef}
          type="button"
          onClick={() => apriCampo("arrivo")}
          aria-haspopup="dialog"
          aria-expanded={aperto && campoAttivo === "arrivo"}
          className={`flex flex-1 flex-col gap-1 rounded-md border px-3 py-2 text-left ${focusRingClasses} ${
            aperto && campoAttivo === "arrivo" ? "border-primary ring-1 ring-primary" : "border-border"
          }`}
        >
          <span className="text-xs text-textMuted">{labelArrivo}</span>
          <span className="text-sm">{dataArrivo || "—"}</span>
        </button>
        <button
          ref={partenzaBtnRef}
          type="button"
          onClick={() => apriCampo("partenza")}
          aria-haspopup="dialog"
          aria-expanded={aperto && campoAttivo === "partenza"}
          className={`flex flex-1 flex-col gap-1 rounded-md border px-3 py-2 text-left ${focusRingClasses} ${
            aperto && campoAttivo === "partenza" ? "border-primary ring-1 ring-primary" : "border-border"
          }`}
        >
          <span className="text-xs text-textMuted">{labelPartenza}</span>
          <span className="text-sm">{dataPartenza || "—"}</span>
        </button>
```

- [ ] **Step 5: `role="dialog"` + `aria-label` sul popup**

Da:
```tsx
      {aperto && (
        <div className="absolute z-10 mt-2 rounded-lg border border-border bg-background p-4 shadow-cardHover">
```
A:
```tsx
      {aperto && (
        <div
          role="dialog"
          aria-label={campoAttivo === "partenza" ? labelPartenza : labelArrivo}
          className="absolute z-10 mt-2 rounded-lg border border-border bg-background p-4 shadow-cardHover"
        >
```

- [ ] **Step 6: Verifica `tsc` mirata**

`"files": ["next-env.d.ts", "components/ui/DateRangePicker.tsx"]`, stesso comando, poi rimuovere il file.

---

## Verifica finale del piano

- [ ] Verifica `tsc` cumulativa su tutti i 15 file `.ts`/`.tsx` toccati insieme (oltre a `lib/a11y.ts` nuovo), in un'unica chiamata `.verify.tsconfig.json`, per controllare che non ci siano incoerenze tra file modificati in task diversi (es. l'import di `focusRingClasses` risolto correttamente ovunque).
- [ ] Rileggere `lib/theme.ts` e confermare che `textLight`/`accentDeep` abbiano esattamente i valori del Task 1 (nessun refuso).
- [ ] Aggiornare `STATO_PROGETTO.md` con una voce "Punto 5 (audit accessibilità) CHIUSO" — cosa è stato corretto (focus-visible, contrasto, ARIA date-picker), cosa resta esplicitamente fuori scope (Lighthouse/axe, overlay Hero, refactor dei 3 CTA), e il checkpoint visivo/funzionale da fare dal titolare via `npm run dev` (elenco nello spec, sezione "Verifica prevista").

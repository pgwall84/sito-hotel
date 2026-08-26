# Coerenza visiva del flusso booking/pagamento (Fase 4) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Portare `components/booking/BookingWidget.tsx` e `components/booking/PaymentStep.tsx` alla stessa coerenza visiva già raggiunta dal resto del sito — token tema al posto di `rounded`/`border`/`text-red-600` non tematizzati, componente `Button` condiviso al posto dei bottoni pieni navy scritti a mano, titoli allineati alla scala tipografica della spec.

**Architecture:** Nessun componente nuovo. Riuso di `Button` (`components/ui/Button.tsx`) e del nuovo token colore `error` in `lib/theme.ts` (unica estensione al design system prevista da questo piano). `Card` (già applicato al risultato-camera nel piano precedente) non viene ritoccato.

**Tech Stack:** Next.js App Router, TypeScript, Tailwind (token da `lib/theme.ts`), Stripe (`@stripe/react-stripe-js`, invariato).

## Global Constraints

- Mai eseguire `git` da questa sessione Cowork — commit reali fatti dal titolare dal tab Code.
- Nessun accesso a database/VPS da questa sessione.
- Verifica disponibile solo tramite `npx tsc --noEmit` ed `esbuild --bundle --jsx=automatic` in una sandbox scratch temporanea (react/react-dom/typescript/esbuild installati a parte, mai committati) — nessun `npm run dev`/build reale possibile da qui. Sandbox sempre eliminata prima della consegna finale.
- **Premessa di verifica valida per TUTTI i task di questo piano** (non ripetuta task per task): l'intero flusso booking (ricerca disponibilità → selezione camera → dati ospite → pagamento Stripe) richiede dati reali (una data con disponibilità nel gestionale, una prenotazione di prova, un pagamento Stripe di test) per essere verificato interamente a video con `npm run dev` in locale — nessuna sessione Cowork può generare questi dati. Il colore `error` in particolare (Task 2) è verificabile solo forzando manualmente un errore nel flusso (es. cercare disponibilità con il gestionale non raggiungibile, o inviare un form con un campo non valido).
- Nessuna modifica a `components/ui/Button.tsx`, `components/ui/buttonClasses.ts`, `components/ui/Card.tsx`, `tailwind.config.ts` — questo piano riusa quanto già esiste. `tailwind.config.ts` fa `colors: theme.colors` come spread diretto (verificato leggendo il file fresh il 26/08/2026): aggiungere una chiave a `lib/theme.ts` genera automaticamente le utility Tailwind corrispondenti (`bg-error`, `text-error`, `border-error`, `hover:text-error`, ecc.), nessuna modifica separata necessaria.
- Regola CTA già stabilita nel piano Button: `primary`/navy per azioni funzionali/transazionali. Tutti e 4 i bottoni di questo piano sono azioni transazionali (cerca disponibilità, seleziona camera, continua verso pagamento, paga) — tutti `variant="primary"`.

---

### Task 1: Aggiungere il token colore `error` a `lib/theme.ts`

**Files:**
- Modify: `lib/theme.ts:14-15`

**Interfaces:**
- Produces: `theme.colors.error` (stringa esadecimale `'#B23B2E'`) — consumato dal Task 2 tramite le utility Tailwind generate automaticamente (`text-error`, `hover:text-error`).

Contenuto attuale di riferimento (righe 3-17, letto fresh il 26/08/2026):

```ts
export const theme = {
  colors: {
    primary: '#1B3A5C',      // blu profondo del golfo
    primaryLight: '#2A5A8C', // blu hover
    accent: '#C4703A',       // terracotta ligure
    accentLight: '#D4875A',  // terracotta hover
    background: '#FFFFFF',   // bianco caldo
    surface: '#F5F0E8',      // sabbia chiara (sezioni alternate)
    surfaceDark: '#EDE8DF',  // sabbia più scura
    text: '#2C2C2C',         // antracite morbido
    textMuted: '#6B6B6B',    // testo secondario
    textLight: '#9A9A9A',    // testo terziario
    border: '#E0D8CE',       // bordi sabbia
    white: '#FFFFFF',
    gold: '#C4A882',         // oro antico — eyebrow/testo secondario su navy
  },
```

- [x] **Step 1: Aggiungere la riga del nuovo colore**

Sostituire le righe 14-15:

```ts
    border: '#E0D8CE',       // bordi sabbia
    white: '#FFFFFF',
```

con:

```ts
    border: '#E0D8CE',       // bordi sabbia
    error: '#B23B2E',        // rosso mattone smorzato — sostituisce text-red-600 (stonato con la palette calda)
    white: '#FFFFFF',
```

- [x] **Step 2: Verificare con tsc in sandbox scratch**

Creare una sandbox temporanea (`/tmp/booking-verify`), symlink di `node_modules` (react@19.2.4, react-dom@19.2.4, typescript, esbuild, lucide-react, react-day-picker, @types/react, @types/react-dom, @types/node) nel mirror del repo, `tsconfig.verify.json` con `"paths": {"@/*": ["./*"]}` (niente `baseUrl`, non supportato dalla versione di TypeScript installata) e un file di dichiarazioni ambiente per i moduli non presenti nel mirror parziale di Cowork (`@/lib/i18n/navigation`, `@/lib/queries`, `@/lib/servizi`, `@/lib/sanity`, `@/lib/sanity-i18n`, `@/components/ui/BookingButton`, `@/components/layout/SectionWrapper`, `next/image`, `next-intl`, `next-sanity`, `@stripe/stripe-js`, `@stripe/react-stripe-js`) — stesso principio già usato nel piano Card, dichiarato esplicitamente come limite di verifica in STATO_PROGETTO.md.

Run: `npx tsc --noEmit -p tsconfig.verify.json`
Expected: nessun errore su `lib/theme.ts`.

- [x] **Step 3: Nota di verifica per il titolare**

Nessun checkpoint visivo per questo task: il token non è ancora usato da nessun componente. Il checkpoint comincia dal Task 2.

- [x] **Step 4: Non eliminare la sandbox** — resta in uso per i task successivi di questo piano, verrà eliminata solo alla fine (Task 7).

---

### Task 2: Sostituire `text-red-600` con `text-error`

**Files:**
- Modify: `components/booking/BookingWidget.tsx:314`, `components/booking/BookingWidget.tsx:330`
- Modify: `components/booking/PaymentStep.tsx:91`

**Interfaces:**
- Consumes: `theme.colors.error` (Task 1), via l'utility Tailwind generata `text-error`.

Contenuto attuale di riferimento (letto fresh il 26/08/2026):

`components/booking/BookingWidget.tsx:310-317`:
```tsx
              <button
                type="button"
                onClick={() => setBambiniEta(bambiniEta.filter((_, i) => i !== indice))}
                aria-label={t("rimuoviBambino")}
                className="text-textMuted hover:text-red-600 px-1"
              >
                ×
              </button>
```

`components/booking/BookingWidget.tsx:330`:
```tsx
      {errore && <p className="mt-4 text-red-600">{errore}</p>}
```

`components/booking/PaymentStep.tsx:91`:
```tsx
      {errore && <p className="mt-4 text-red-600">{errore}</p>}
```

- [x] **Step 1: BookingWidget.tsx — bottone × rimuovi bambino**

Sostituire la riga 314 (`className="text-textMuted hover:text-red-600 px-1"`) con:

```tsx
                className="text-textMuted hover:text-error px-1"
```

- [x] **Step 2: BookingWidget.tsx — messaggio di errore ricerca disponibilità**

Sostituire la riga 330 con:

```tsx
      {errore && <p className="mt-4 text-error">{errore}</p>}
```

- [x] **Step 3: PaymentStep.tsx — messaggio di errore pagamento**

Sostituire la riga 91 con:

```tsx
      {errore && <p className="mt-4 text-error">{errore}</p>}
```

- [x] **Step 4: Verificare con tsc ed esbuild**

Stessa sandbox del Task 1. Run: `npx tsc --noEmit -p tsconfig.verify.json` su entrambi i file, ed `npx esbuild components/booking/BookingWidget.tsx components/booking/PaymentStep.tsx --bundle --jsx=automatic --tsconfig=tsconfig.verify.json --external:react --external:react-dom --external:@/* --external:next/image --external:next-intl --external:next-sanity --external:@stripe/stripe-js --external:@stripe/react-stripe-js --outdir=/tmp/booking-verify/out`.
Expected: nessun errore.

- [x] **Step 5: Nota di verifica per il titolare**

Il colore `error` (rosso mattone `#B23B2E` invece del rosso Tailwind di default) è verificabile a video solo forzando un errore reale: rimuovere un bambino aggiunto (hover sulla ×), oppure far fallire la ricerca disponibilità o il pagamento (es. gestionale non raggiungibile). Nessuno di questi stati è raggiungibile senza interagire col flusso reale in locale.

---

### Task 3: Migrare i 4 bottoni pieni navy al componente Button

**Files:**
- Modify: `components/booking/BookingWidget.tsx:9-18` (import), `components/booking/BookingWidget.tsx:282`, `components/booking/BookingWidget.tsx:378`, `components/booking/BookingWidget.tsx:475`
- Modify: `components/booking/PaymentStep.tsx:1-14` (import non necessario — vedi sotto), `components/booking/PaymentStep.tsx:92`

**Interfaces:**
- Consumes: `Button` da `@/components/ui/Button` (già esistente, piano `2026-08-26-button-condiviso.md`) — `variant="primary"`, `size="compatta"`.

Decisione di taglia (dichiarata, non silenziosa): i 4 bottoni originali usano `px-4 py-2`, che non corrisponde a nessuna delle 2 taglie esistenti di `Button` (`grande` px-7/py-3, `compatta` px-5/py-2.5). Si standardizza su `compatta`, la più vicina — un aumento visibile di qualche pixel in ogni bottone, stessa logica già applicata al bottone Header desktop nel piano Button (25/08/2026, lì la maggioranza ha prevalso sulla minoranza).

Contenuto attuale di riferimento (letto fresh il 26/08/2026):

`components/booking/BookingWidget.tsx:9-18` (import):
```tsx
import { useEffect, useState } from "react";
import Image from "next/image";
import { groq } from "next-sanity";
import { useTranslations } from "next-intl";
import { client, urlFor } from "@/lib/sanity";
import { pickLocale } from "@/lib/sanity-i18n";
import { SERVIZI_ICONS } from "@/lib/servizi";
import DateRangePicker from "@/components/ui/DateRangePicker";
import Card from "@/components/ui/Card";
import PaymentStep from "./PaymentStep";
```

`components/booking/BookingWidget.tsx:282` (bottone "cerca", dentro il form di ricerca — `type="submit"` esplicito da preservare):
```tsx
        <button type="submit" disabled={caricamento || !dataArrivo || !dataPartenza} className="bg-primary text-white rounded px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed">
          {t("cerca")}
        </button>
```

`components/booking/BookingWidget.tsx:372-381` (bottone "seleziona camera", dentro ogni card risultato — NON dentro un form, nessun `type` esplicito nell'originale, `disabled={capienzaSuperata}` da preservare):
```tsx
                  <button
                    onClick={() => {
                      setTrattamento("bb");
                      setTipoSelezionato(tipo);
                    }}
                    disabled={capienzaSuperata}
                    className="mt-3 bg-primary text-white rounded px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t("selezionaCamera")}
                  </button>
```

`components/booking/BookingWidget.tsx:472-478` (bottone "continua", dentro il form dati ospite — `type="submit"` esplicito, `className` aggiuntiva `md:col-span-2` da preservare):
```tsx
          <button
            type="submit"
            disabled={caricamento || tipoSelezionato.prezzi[trattamento] === null}
            className="md:col-span-2 bg-primary text-white rounded px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t("continua")}
          </button>
```

`components/booking/PaymentStep.tsx:1-14` (import, invariato — `Button` va aggiunto):
```tsx
"use client";

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
```

`components/booking/PaymentStep.tsx:92` (bottone "Paga €X", dentro il proprio form — `type="submit"` esplicito, `className` aggiuntiva `mt-4` da preservare, testo dinamico da preservare come children):
```tsx
      <button type="submit" disabled={!stripe || elaborazione} className="mt-4 bg-primary text-white rounded px-4 py-2">
        {elaborazione ? "Elaborazione..." : `Paga €${importoCaparra}`}
      </button>
```

- [x] **Step 1: Aggiungere l'import di Button in BookingWidget.tsx**

Sostituire le righe 16-18:

```tsx
import DateRangePicker from "@/components/ui/DateRangePicker";
import Card from "@/components/ui/Card";
import PaymentStep from "./PaymentStep";
```

con:

```tsx
import DateRangePicker from "@/components/ui/DateRangePicker";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import PaymentStep from "./PaymentStep";
```

- [x] **Step 2: Migrare il bottone "cerca" (riga 282)**

Sostituire:

```tsx
        <button type="submit" disabled={caricamento || !dataArrivo || !dataPartenza} className="bg-primary text-white rounded px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed">
          {t("cerca")}
        </button>
```

con:

```tsx
        <Button type="submit" variant="primary" size="compatta" disabled={caricamento || !dataArrivo || !dataPartenza}>
          {t("cerca")}
        </Button>
```

- [x] **Step 3: Migrare il bottone "seleziona camera" (righe 372-381)**

Sostituire:

```tsx
                  <button
                    onClick={() => {
                      setTrattamento("bb");
                      setTipoSelezionato(tipo);
                    }}
                    disabled={capienzaSuperata}
                    className="mt-3 bg-primary text-white rounded px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t("selezionaCamera")}
                  </button>
```

con:

```tsx
                  <Button
                    variant="primary"
                    size="compatta"
                    className="mt-3"
                    onClick={() => {
                      setTrattamento("bb");
                      setTipoSelezionato(tipo);
                    }}
                    disabled={capienzaSuperata}
                  >
                    {t("selezionaCamera")}
                  </Button>
```

- [x] **Step 4: Migrare il bottone "continua" (righe 472-478)**

Sostituire:

```tsx
          <button
            type="submit"
            disabled={caricamento || tipoSelezionato.prezzi[trattamento] === null}
            className="md:col-span-2 bg-primary text-white rounded px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t("continua")}
          </button>
```

con:

```tsx
          <Button
            type="submit"
            variant="primary"
            size="compatta"
            className="md:col-span-2"
            disabled={caricamento || tipoSelezionato.prezzi[trattamento] === null}
          >
            {t("continua")}
          </Button>
```

- [x] **Step 5: Aggiungere l'import di Button in PaymentStep.tsx**

Sostituire le righe 1-6:

```tsx
"use client";

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
```

con:

```tsx
"use client";

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import Button from "@/components/ui/Button";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
```

- [x] **Step 6: Migrare il bottone "Paga" (riga 92)**

Sostituire:

```tsx
      <button type="submit" disabled={!stripe || elaborazione} className="mt-4 bg-primary text-white rounded px-4 py-2">
        {elaborazione ? "Elaborazione..." : `Paga €${importoCaparra}`}
      </button>
```

con:

```tsx
      <Button type="submit" variant="primary" size="compatta" className="mt-4" disabled={!stripe || elaborazione}>
        {elaborazione ? "Elaborazione..." : `Paga €${importoCaparra}`}
      </Button>
```

- [x] **Step 7: Verificare con tsc ed esbuild**

Stessa sandbox. Run `tsc`/`esbuild` su entrambi i file (stessi comandi del Task 2, Step 4).
Expected: nessun errore.

- [x] **Step 8: Nota di verifica per il titolare**

I 4 bottoni ("cerca", "seleziona camera", "continua", "paga") sono ora leggermente più grandi (px-5/py-2.5 invece di px-4/py-2) — cambio visibile, dichiarato sopra. Comportamento invariato: disabilitazione, submit dei form, `onClick` di selezione camera, testo dinamico "Elaborazione..." del bottone paga.

---

### Task 4: Tematizzare gli elementi `border`/`rounded` non tematizzati in BookingWidget.tsx

**Files:**
- Modify: `components/booking/BookingWidget.tsx:294`, `components/booking/BookingWidget.tsx:323`, `components/booking/BookingWidget.tsx:406`, `components/booking/BookingWidget.tsx:443`, `components/booking/BookingWidget.tsx:447`, `components/booking/BookingWidget.tsx:451`, `components/booking/BookingWidget.tsx:455`, `components/booking/BookingWidget.tsx:466`

Contenuto attuale di riferimento (letto fresh il 26/08/2026):

Riga 294:
```tsx
            <div key={indice} className="flex items-center gap-1 border rounded px-2 py-1">
```

Riga 323:
```tsx
            className="text-sm border border-dashed rounded px-3 py-1 text-textMuted hover:text-primary hover:border-primary"
```

Righe 404-407 (label trattamento — attenzione, vedi nota sotto):
```tsx
                <label
                  key={opzione}
                  className={`flex items-center justify-between gap-3 border rounded px-3 py-2 ${prezzo === null ? "opacity-50 cursor-not-allowed" : "cursor-pointer"} ${trattamento === opzione ? "border-primary" : ""}`}
                >
```

Righe 443, 447, 451, 455 (4 input dati ospite, stesso pattern ripetuto):
```tsx
            <input required value={datiOspite.nome} onChange={(e) => setDatiOspite({ ...datiOspite, nome: e.target.value })} className="border rounded px-3 py-2" />
```
```tsx
            <input required value={datiOspite.cognome} onChange={(e) => setDatiOspite({ ...datiOspite, cognome: e.target.value })} className="border rounded px-3 py-2" />
```
```tsx
            <input type="email" required value={datiOspite.email} onChange={(e) => setDatiOspite({ ...datiOspite, email: e.target.value })} className="border rounded px-3 py-2" />
```
```tsx
            <input value={datiOspite.telefono} onChange={(e) => setDatiOspite({ ...datiOspite, telefono: e.target.value })} className="border rounded px-3 py-2" />
```

Riga 466:
```tsx
            <div className="md:col-span-2 border rounded p-3 bg-surfaceDark/40">
```

**Nota importante sulla label trattamento (righe 404-407)**: oggi il bordo generico `border` (senza colore) è sempre presente, e `border-primary` si aggiunge SOLO quando l'opzione è selezionata (`trattamento === opzione`) — quando non selezionata, la stringa finale contiene `border-primary` sostituito da stringa vuota, quindi resta solo `border` generico. Applicare qui il pattern generico "aggiungi `border-border` sempre" creerebbe DUE utility Tailwind (`border-border` e `border-primary`) che competono sulla stessa proprietà CSS `border-color` con specificità identica quando l'opzione è selezionata — quale vince dipende dall'ordine nel foglio di stile compilato da Tailwind, non dall'ordine nella stringa JSX: rischio concreto di rompere lo stato "selezionato" a runtime, in un modo che `tsc`/`esbuild` non possono rilevare (è un conflitto CSS, non un errore di tipo). Fix corretto: rendere la classe colore del bordo mutuamente esclusiva — `border-primary` quando selezionato, `border-border` quando non selezionato, MAI entrambe. È la stessa identica famiglia di bug del fix "campo adulti" del 25/08/2026 in questo stesso file (bordo generico non tematizzato, troppo scuro), mai stata corretta qui finché non è stata trovata in questo audit.

- [x] **Step 1: Chip età bambino (riga 294)**

Sostituire:

```tsx
            <div key={indice} className="flex items-center gap-1 border rounded px-2 py-1">
```

con:

```tsx
            <div key={indice} className="flex items-center gap-1 rounded-md border border-border px-2 py-1">
```

- [x] **Step 2: Bottone "+ aggiungi bambino" (riga 323)**

Sostituire:

```tsx
            className="text-sm border border-dashed rounded px-3 py-1 text-textMuted hover:text-primary hover:border-primary"
```

con:

```tsx
            className="text-sm rounded-md border border-dashed border-border px-3 py-1 text-textMuted hover:text-primary hover:border-primary"
```

Resta un `<button>` semplice, non migrato a `Button`: nessuna delle 5 varianti esistenti ha un bordo tratteggiato, e inventarne una sesta violerebbe il principio "dedotto da usi reali, non inventato" già seguito per il componente `Button`.

- [x] **Step 3: Label trattamento (righe 404-407) — fix mutua esclusività**

Sostituire:

```tsx
                <label
                  key={opzione}
                  className={`flex items-center justify-between gap-3 border rounded px-3 py-2 ${prezzo === null ? "opacity-50 cursor-not-allowed" : "cursor-pointer"} ${trattamento === opzione ? "border-primary" : ""}`}
                >
```

con:

```tsx
                <label
                  key={opzione}
                  className={`flex items-center justify-between gap-3 rounded-md border px-3 py-2 ${prezzo === null ? "opacity-50 cursor-not-allowed" : "cursor-pointer"} ${trattamento === opzione ? "border-primary" : "border-border"}`}
                >
```

- [x] **Step 4: I 4 input dati ospite (righe 443, 447, 451, 455)**

Sostituire (4 occorrenze, stesso pattern):

```tsx
            <input required value={datiOspite.nome} onChange={(e) => setDatiOspite({ ...datiOspite, nome: e.target.value })} className="border rounded px-3 py-2" />
```

con:

```tsx
            <input required value={datiOspite.nome} onChange={(e) => setDatiOspite({ ...datiOspite, nome: e.target.value })} className="rounded-md border border-border px-3 py-2" />
```

Sostituire:

```tsx
            <input required value={datiOspite.cognome} onChange={(e) => setDatiOspite({ ...datiOspite, cognome: e.target.value })} className="border rounded px-3 py-2" />
```

con:

```tsx
            <input required value={datiOspite.cognome} onChange={(e) => setDatiOspite({ ...datiOspite, cognome: e.target.value })} className="rounded-md border border-border px-3 py-2" />
```

Sostituire:

```tsx
            <input type="email" required value={datiOspite.email} onChange={(e) => setDatiOspite({ ...datiOspite, email: e.target.value })} className="border rounded px-3 py-2" />
```

con:

```tsx
            <input type="email" required value={datiOspite.email} onChange={(e) => setDatiOspite({ ...datiOspite, email: e.target.value })} className="rounded-md border border-border px-3 py-2" />
```

Sostituire:

```tsx
            <input value={datiOspite.telefono} onChange={(e) => setDatiOspite({ ...datiOspite, telefono: e.target.value })} className="border rounded px-3 py-2" />
```

con:

```tsx
            <input value={datiOspite.telefono} onChange={(e) => setDatiOspite({ ...datiOspite, telefono: e.target.value })} className="rounded-md border border-border px-3 py-2" />
```

- [x] **Step 5: Box termini di cancellazione (riga 466)**

Sostituire:

```tsx
            <div className="md:col-span-2 border rounded p-3 bg-surfaceDark/40">
```

con:

```tsx
            <div className="md:col-span-2 rounded-md border border-border p-3 bg-surfaceDark/40">
```

- [x] **Step 6: Verificare con tsc ed esbuild**

Stessa sandbox. Run `tsc`/`esbuild` su `components/booking/BookingWidget.tsx` (stessi comandi del Task 2, Step 4).
Expected: nessun errore.

- [x] **Step 7: Nota di verifica per il titolare**

Chip età bambino, bottone "+ aggiungi bambino", le opzioni di trattamento (B&B/mezza pensione/pensione completa — **controllare in particolare che l'opzione selezionata mantenga il bordo navy** dopo il fix di mutua esclusività), i 4 campi dati ospite, e il box termini di cancellazione: tutti devono avere lo stesso bordo sabbia (`border-border`) già usato altrove nel sito, non più il bordo generico più scuro di prima.

---

### Task 5: Tematizzare l'input in PaymentStep.tsx

**Files:**
- Modify: `components/booking/PaymentStep.tsx:87`

Contenuto attuale di riferimento (letto fresh il 26/08/2026):

```tsx
        <input
          required
          value={nomeTitolareCarta}
          onChange={(e) => setNomeTitolareCarta(e.target.value)}
          className="border rounded px-3 py-2"
        />
```

- [x] **Step 1: Tematizzare l'input nome titolare carta**

Sostituire `className="border rounded px-3 py-2"` con:

```tsx
          className="rounded-md border border-border px-3 py-2"
```

- [x] **Step 2: Verificare con tsc ed esbuild**

Stessa sandbox. Run su `components/booking/PaymentStep.tsx` (stessi comandi del Task 2, Step 4).
Expected: nessun errore.

- [x] **Step 3: Nota di verifica per il titolare**

Il campo "Nome e cognome del titolare della carta" nello step di pagamento Stripe deve avere lo stesso bordo sabbia degli altri campi del flusso, non più il bordo generico più scuro di prima.

---

### Task 6: Correggere i 2 titoli fuori standard in BookingWidget.tsx

**Files:**
- Modify: `components/booking/BookingWidget.tsx:350`, `components/booking/BookingWidget.tsx:467`

Contenuto attuale di riferimento (letto fresh il 26/08/2026):

Riga 350:
```tsx
                  <h3 className="font-heading text-xl">{tipo.nome}</h3>
```

Riga 467:
```tsx
              <h4 className="text-sm font-semibold text-text">{t("terminiCancellazione")}</h4>
```

- [x] **Step 1: Titolo camera nella card-risultato (riga 350)**

Sostituire:

```tsx
                  <h3 className="font-heading text-xl">{tipo.nome}</h3>
```

con:

```tsx
                  <h3 className="font-heading text-xl text-primary">{tipo.nome}</h3>
```

Manca `text-primary`: per la scala titoli della spec, un h3 su una card con foto (stesso ruolo di `CameraCard`/`OffertaCard`) è `font-heading text-xl text-primary` — questa era l'unica eccezione mai stata allineata.

- [x] **Step 2: Titolo termini di cancellazione (riga 467)**

Sostituire:

```tsx
              <h4 className="text-sm font-semibold text-text">{t("terminiCancellazione")}</h4>
```

con:

```tsx
              <h4 className="font-heading text-sm font-semibold text-text">{t("terminiCancellazione")}</h4>
```

`font-heading` (famiglia Playfair Display) e `font-semibold` (peso) sono indipendenti e coesistono — nessuna delle due sostituisce l'altra.

- [x] **Step 3: Verificare con tsc ed esbuild**

Stessa sandbox. Run su `components/booking/BookingWidget.tsx` (stessi comandi del Task 2, Step 4).
Expected: nessun errore.

- [x] **Step 4: Nota di verifica per il titolare**

Il nome della camera in ogni card-risultato deve avere lo stesso colore navy dei titoli di `CameraCard`/`OffertaCard` (prima era antracite come il testo normale). Il titolo "Termini di cancellazione" (visibile solo dopo aver selezionato una camera, prima dei dati ospite) deve avere il font serif Playfair Display come tutti gli altri titoli del sito, prima era in Inter come il corpo del testo.

---

### Task 7: Aggiornare la documentazione di progetto ed eliminare la sandbox

**Files:**
- Modify: `STATO_PROGETTO.md`

- [x] **Step 1: Aggiungere la voce di chiusura della Fase 4**

Nella sezione "Redesign visivo", sotto la voce del secondo piano (Card, chiuso il 26/08/2026), aggiungere una sotto-voce per questo terzo piano (Fase 4, flusso booking/pagamento) con: il nuovo token `error` in `lib/theme.ts` e la sua propagazione automatica via `tailwind.config.ts`; le 3 sostituzioni `text-red-600` → `text-error`; i 4 bottoni migrati a `Button` (`variant="primary"`, `size="compatta"` — con la nota sull'aumento di padding dichiarato); gli 8 elementi `border`/`rounded` tematizzati in `BookingWidget.tsx` e l'1 in `PaymentStep.tsx`, inclusa la spiegazione del fix di mutua esclusività sulla label trattamento (bug della stessa famiglia del fix "campo adulti" del 25/08/2026, mai corretto fino a questo audit); i 2 titoli corretti (h3 camera senza `text-primary`, h4 termini cancellazione senza `font-heading`); i limiti di verifica di Cowork dichiarati esplicitamente (nessun accesso a browser, mirror parziale con dichiarazioni di tipo scritte a mano per i moduli mai caricati in questa sessione, stesso principio già usato nel piano Card); la premessa unica sui checkpoint non verificabili senza dati reali nel flusso booking; aggiornare la riga "Prossimo piano" indicandolo come Fase 5 (`LinguaSelector`, bandiere SVG).

- [x] **Step 2: Rileggere la sezione aggiornata**

Verificare che la voce sia coerente con lo stile delle voci precedenti (Punto 1, primo e secondo piano di Punto 2) e non contenga placeholder.

- [x] **Step 3: Eliminare la sandbox scratch**

Rimuovere `/tmp/booking-verify`, il symlink `node_modules`, `tsconfig.verify.json` e il file di dichiarazioni ambiente dal mirror del repo — mai committati, mai consegnati.

---

## Note finali per chi esegue

- I Task 2-6 dipendono dal Task 1 solo per il token colore (Task 2); i Task 3, 4, 5, 6 sono altrimenti indipendenti tra loro e possono essere eseguiti in qualunque ordine — l'ordine sopra è solo quello scelto per la stesura.
- Prima di modificare ciascun file, ri-leggerlo fresh da device con `device_stage_files` (non fidarsi della cache di questa conversazione) — stesso principio già seguito nei piani precedenti.
- Consegna finale: un solo `SendUserFile` con tutti i file toccati nell'intero piano (`lib/theme.ts`, `components/booking/BookingWidget.tsx`, `components/booking/PaymentStep.tsx`, `STATO_PROGETTO.md`) + un solo `device_commit_files`, mai consegne sparse per singolo task.

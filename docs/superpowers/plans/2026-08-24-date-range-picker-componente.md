# Date range picker — componente e integrazione — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sostituire i due `<input type="date">` nativi nel booking widget con `DateRangePicker.tsx`, un calendario interattivo (`react-day-picker`) che mostra le notti non disponibili mentre l'utente sfoglia i mesi, interrogando il nuovo endpoint `GET /api/booking-pubblico/disponibilita-mese` (Piano 1, gestionale-hotel — **prerequisito, deve essere già consegnato e verificato**).

**Architecture:** Componente client (`"use client"`) che avvolge `<DayPicker mode="range">`, con una cache in memoria per `mese+occupazione`, fetch del mese visibile + del successivo ad ogni apertura/cambio mese/cambio occupazione (con debounce), degrado grazioso se la fetch fallisce (nessun giorno bloccato). Vestito con `lib/theme.ts` via le classi Tailwind già in `tailwind.config.ts`, nessun CSS nuovo fuori da Tailwind.

**Tech Stack:** Next.js 16.3 (React 19.2), Tailwind v4, `react-day-picker` (nuova dipendenza — al 24/08/2026 `npm install` senza pin risolve alla **10.0.1**; il codice di Task 1 è stato compilato per davvero con `tsc --noEmit` contro i tipi reali di quella versione installata in questa sessione, non solo dedotto dalla documentazione: `mode="range"`, `disabled` come funzione `(date: Date) => boolean` — tipo `Matcher` verificato in `dist/esm/types/shared.d.ts` —, `month`/`onMonthChange`/`startMonth`/`endMonth` verificati in `dist/esm/types/props.d.ts`, stile importabile da `react-day-picker/style.css` verificato nella `exports` map di `package.json`. Zero errori di tipo).

## Global Constraints

- **Prerequisito**: il Piano 1 (`gestionale-hotel/docs/superpowers/plans/2026-08-24-endpoint-disponibilita-mese.md`) deve essere già implementato e verificato dal titolare prima di iniziare Task 1 — questo piano chiama `GET /api/booking-pubblico/disponibilita-mese`, che non esiste finché quel piano non è eseguito.
- Il calendario mese **non** tiene conto delle restrizioni planning-tariffe (min_stay/chiuso_arrivo/ecc.) — decisione di design approvata dal titolare, non un difetto da correggere qui. Un giorno "verde" può ancora risultare bloccato alla chiamata vera su `/disponibilita` con il trattamento scelto.
- Nessuna integrazione nella Hero in questo piano (fuori scope, Punto 6 del piano redesign, sessione separata).
- Nessun dark mode (escluso dal piano redesign).
- **Mai `git` da Cowork.** Se questo piano viene eseguito da una sessione Cowork, i passi "commit" sotto vanno saltati: consegna via `SendUserFile` + `device_commit_files`, commit reali dal titolare dal "tab Code". Se eseguito dal tab Code, i comandi git vanno eseguiti normalmente.
- Nessun `npm run dev`/`npm run build` reale, nessun browser possibile da Cowork — solo `npx esbuild --bundle --jsx=automatic` come controllo sintattico/di tipo sui file `.tsx` toccati. Il checkpoint visivo vero è sempre il titolare, in locale.
- Le prop di `react-day-picker` usate in Task 1 sono state verificate il 24/08/2026 con una compilazione reale (`npm install react-day-picker` in una sandbox pulita → `tsc --noEmit` contro il codice di Task 1, zero errori) contro la 10.0.1, la versione risolta da `npm install` senza pin a quella data — non solo dedotte dalla documentazione online. Anche i selettori CSS (`.rdp-selected .rdp-day_button`, `.rdp-day_button:disabled`) sono stati letti direttamente dal `src/style.css` reale del pacchetto installato, non stimati dal naming convention — **resta comunque non verificato a video** (nessun browser da questa sessione): se al controllo visivo (Step 6) lo stile non si applica come atteso, ispezionare il markup renderizzato e correggere il `className`. **Chi esegue deve comunque rilanciare `npx tsc --noEmit` (o l'errore di `esbuild`) dopo `npm install`**: se tra oggi e l'esecuzione esce una versione più recente con prop rinominate, l'errore di tipo lo segnala subito, non un bug silenzioso.
- Due task, non frammentato oltre: il titolare vuole "un passo alla volta con controllo visivo" — per questo componente il checkpoint naturale è "il calendario funziona nel booking widget reale", non "il componente esiste isolato senza un consumer che lo mostri".

---

## File Structure

- **Crea:** `components/ui/DateRangePicker.tsx` — componente calendario, nessuna dipendenza da `BookingWidget.tsx` (riceve tutto via props: date correnti, callback, occupazione, label).
- **Modifica:** `components/booking/BookingWidget.tsx` — sostituisce i due `<input type="date">` (blocco JSX attuale righe ~249-265) con `<DateRangePicker>`, aggiunge l'import.
- **Modifica:** `package.json` — nuova dipendenza `react-day-picker`.
- **Modifica:** `STATO_PROGETTO.md` — chiusura Punto 1 del piano redesign (Task 2).

---

## Task 1: Creare `DateRangePicker.tsx` e integrarlo in `BookingWidget.tsx`

**Files:**
- Create: `components/ui/DateRangePicker.tsx`
- Modify: `components/booking/BookingWidget.tsx`
- Modify: `package.json`

**Interfaces:**
- Consumes (da `BookingWidget.tsx`, stato già esistente): `dataArrivo: string`, `dataPartenza: string`, `setDataArrivo`, `setDataPartenza`, `adulti: number` (default 2), `bambiniEta: number[]` (default `[]`), la funzione di traduzione `t` (`next-intl`, chiave `Booking.dataArrivo`/`Booking.dataPartenza` già esistenti — usate anche prima nei due `<label>` nativi).
- Produces: `DateRangePicker` — props `{ dataArrivo, dataPartenza, onChange(dataArrivo, dataPartenza), adulti, bambiniEta, labelArrivo, labelPartenza }`, esportato come default da `components/ui/DateRangePicker.tsx`.

### Step 1: Installare la libreria

```bash
npm install react-day-picker
```

### Step 2: Creare `components/ui/DateRangePicker.tsx`

```tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DayPicker, type DateRange, type Matcher } from "react-day-picker";
import "react-day-picker/style.css";

const API_BASE = process.env.NEXT_PUBLIC_GESTIONALE_API_URL;

type DisponibilitaMese = Record<string, boolean>; // "YYYY-MM-DD" -> disponibile

export type DateRangePickerProps = {
  dataArrivo: string; // "" se non scelta, altrimenti "YYYY-MM-DD"
  dataPartenza: string;
  onChange: (dataArrivo: string, dataPartenza: string) => void;
  adulti: number;
  bambiniEta: number[];
  labelArrivo: string;
  labelPartenza: string;
};

function isoData(d: Date): string {
  const anno = d.getFullYear();
  const mese = String(d.getMonth() + 1).padStart(2, "0");
  const giorno = String(d.getDate()).padStart(2, "0");
  return `${anno}-${mese}-${giorno}`;
}

function chiaveMese(anno: number, mese1indicizzato: number): string {
  return `${anno}-${mese1indicizzato}`;
}

export default function DateRangePicker({
  dataArrivo,
  dataPartenza,
  onChange,
  adulti,
  bambiniEta,
  labelArrivo,
  labelPartenza,
}: DateRangePickerProps) {
  const [aperto, setAperto] = useState(false);
  const [meseVisibile, setMeseVisibile] = useState<Date>(new Date());
  const [disponibilitaCache, setDisponibilitaCache] = useState<Record<string, DisponibilitaMese>>({});
  const [caricamento, setCaricamento] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cacheRef = useRef<Record<string, DisponibilitaMese>>({});

  useEffect(() => {
    cacheRef.current = disponibilitaCache;
  }, [disponibilitaCache]);

  const caricaMese = useCallback(
    async (data: Date, cache: Record<string, DisponibilitaMese>) => {
      const anno = data.getFullYear();
      const mese = data.getMonth() + 1;
      const chiave = chiaveMese(anno, mese);
      if (cache[chiave] || !API_BASE) return null;

      const url = new URL(`${API_BASE}/api/booking-pubblico/disponibilita-mese`);
      url.searchParams.set("anno", String(anno));
      url.searchParams.set("mese", String(mese));
      url.searchParams.set("adulti", String(adulti));
      if (bambiniEta.length > 0) url.searchParams.set("bambini_eta", bambiniEta.join(","));

      const res = await fetch(url.toString());
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Errore nel controllo disponibilità");
      return { chiave, disponibilita: body.disponibilita as DisponibilitaMese };
    },
    [adulti, bambiniEta]
  );

  const caricaMesiVisibili = useCallback(
    async (data: Date) => {
      setCaricamento(true);
      try {
        const meseSuccessivo = new Date(data.getFullYear(), data.getMonth() + 1, 1);
        const risultati = await Promise.all([
          caricaMese(data, cacheRef.current),
          caricaMese(meseSuccessivo, cacheRef.current),
        ]);
        const aggiornamenti = risultati.filter(
          (r): r is { chiave: string; disponibilita: DisponibilitaMese } => r !== null
        );
        if (aggiornamenti.length > 0) {
          setDisponibilitaCache((prev) => {
            const nuova = { ...prev };
            aggiornamenti.forEach(({ chiave, disponibilita }) => {
              nuova[chiave] = disponibilita;
            });
            return nuova;
          });
        }
      } catch {
        // Degrado grazioso (design doc 24/08/2026): nessuna indicazione
        // invece di bloccare il calendario — un guasto di questo servizio
        // non deve mai impedire una prenotazione.
      } finally {
        setCaricamento(false);
      }
    },
    [caricaMese]
  );

  // Occupazione cambiata: i booleani in cache non sono più validi (dipendono
  // da adulti/bambini) — si svuota e si ricarica il mese visibile, con un
  // piccolo debounce per non rilanciare la fetch ad ogni click sui controlli
  // ospiti nel widget.
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDisponibilitaCache({});
      if (aperto) caricaMesiVisibili(meseVisibile);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adulti, bambiniEta.join(",")]);

  useEffect(() => {
    if (aperto) caricaMesiVisibili(meseVisibile);
  }, [aperto, meseVisibile, caricaMesiVisibili]);

  const isGiornoNonDisponibile: Matcher = (giorno: Date) => {
    const chiave = chiaveMese(giorno.getFullYear(), giorno.getMonth() + 1);
    const mappa = disponibilitaCache[chiave];
    if (!mappa) return false; // nessun dato ancora caricato = non blocca (degrado grazioso)
    return mappa[isoData(giorno)] === false;
  };

  const range: DateRange | undefined = dataArrivo
    ? {
        from: new Date(`${dataArrivo}T00:00:00`),
        to: dataPartenza ? new Date(`${dataPartenza}T00:00:00`) : undefined,
      }
    : undefined;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setAperto((v) => !v)}
        className="flex w-full flex-col gap-1 rounded-md border border-border px-3 py-2 text-left"
      >
        <span className="text-sm text-textMuted">
          {dataArrivo && dataPartenza ? `${dataArrivo} → ${dataPartenza}` : `${labelArrivo} / ${labelPartenza}`}
        </span>
      </button>

      {aperto && (
        <div className="absolute z-10 mt-2 rounded-lg border border-border bg-white p-4 shadow-cardHover">
          <DayPicker
            mode="range"
            selected={range}
            onSelect={(nuovoRange) => {
              onChange(
                nuovoRange?.from ? isoData(nuovoRange.from) : "",
                nuovoRange?.to ? isoData(nuovoRange.to) : ""
              );
              if (nuovoRange?.from && nuovoRange?.to) setAperto(false);
            }}
            month={meseVisibile}
            onMonthChange={setMeseVisibile}
            disabled={isGiornoNonDisponibile}
            startMonth={new Date()}
            className="[&_.rdp-selected_.rdp-day_button]:bg-primary [&_.rdp-selected_.rdp-day_button]:text-white [&_.rdp-day_button:disabled]:opacity-40 [&_.rdp-day_button:disabled]:line-through"
          />
          {caricamento && <p className="mt-2 text-xs text-textMuted">Verifica disponibilità…</p>}
        </div>
      )}
    </div>
  );
}
```

Nota sui selettori CSS sopra: `.rdp-selected`/`.rdp-disabled` sono applicati dalla libreria alla cella giorno (elemento genitore), non al `<button>` — lo stile va quindi al discendente `.rdp-day_button` dentro quella cella (`.rdp-selected .rdp-day_button`, non `.rdp-day_button.rdp-selected`). Verificato leggendo `node_modules/react-day-picker/src/style.css` reale (righe 286-300 nella 10.0.1), non stimato dal naming convention — l'errore più comune in guide non ufficiali su questa libreria è proprio applicare selettori sull'elemento sbagliato.

### Step 3: Controllo sintattico/di tipo sul nuovo file

```bash
npx esbuild components/ui/DateRangePicker.tsx --bundle --jsx=automatic --outfile=/tmp/check.js
```
Atteso: nessun errore. Se `react-day-picker` installato ha un'API diversa da quella qui usata (prop rinominata, tipo `Matcher` non esportato), l'errore lo segnala qui — vedi Global Constraints sopra.

### Step 4: Integrare in `BookingWidget.tsx`

Aggiungere l'import in cima al file, vicino agli altri import di componenti:

```tsx
import DateRangePicker from "../ui/DateRangePicker";
```

Sostituire il blocco form attuale (i due `<label>` con `<input type="date">` per arrivo/partenza, righe ~249-265) con:

```tsx
<form onSubmit={cercaDisponibilita} className="grid gap-4 md:grid-cols-3 items-end">
  <DateRangePicker
    dataArrivo={dataArrivo}
    dataPartenza={dataPartenza}
    onChange={(nuovoArrivo, nuovaPartenza) => {
      setDataArrivo(nuovoArrivo);
      setDataPartenza(nuovaPartenza);
    }}
    adulti={adulti}
    bambiniEta={bambiniEta}
    labelArrivo={t("dataArrivo")}
    labelPartenza={t("dataPartenza")}
  />
  <label className="flex flex-col gap-1">
    <span className="text-sm text-textMuted">{t("adulti")}</span>
    <input
      type="number"
      min={1}
      max={10}
      value={adulti}
      onChange={(e) => setAdulti(Math.max(1, Number(e.target.value)))}
      className="border rounded px-3 py-2"
    />
  </label>
  <button type="submit" disabled={caricamento} className="bg-primary text-white rounded px-4 py-2">
    {t("cerca")}
  </button>
</form>
```

Note per chi esegue:
- La griglia passa da `md:grid-cols-4` a `md:grid-cols-3` (4 campi diventano 3 blocchi: date, adulti, bottone).
- I due `<input type="date" required>` avevano validazione nativa del browser (`required`) — `DateRangePicker` non la replica. **Verificare `cercaDisponibilita`** (l'handler già esistente nel file): se assume che il browser abbia già bloccato la submit senza date, va aggiunto un controllo esplicito (`if (!dataArrivo || !dataPartenza) return;` all'inizio dell'handler) prima di procedere — non è stato possibile verificare il corpo esatto dell'handler da questa sessione oltre a quanto già letto (costruzione URL + fetch), quindi questo è un controllo da fare, non un'assunzione silenziosa.

### Step 5: Controllo sintattico/di tipo sul file integrato

```bash
npx esbuild components/booking/BookingWidget.tsx --bundle --jsx=automatic --outfile=/tmp/check2.js
```
Atteso: nessun errore.

### Step 6 (checkpoint del titolare): verifica visiva reale

Da locale (non da Cowork, nessun browser disponibile qui):
```bash
npm run dev
```
Aprire la pagina con il booking widget (`/prenota` o dove è montato), verificare:
- Il calendario si apre cliccando sul campo date, mostra il mese corrente.
- Selezionando arrivo+partenza il campo si chiude e mostra il range scelto.
- Cambiando il numero di adulti, dopo una breve pausa (~300ms) il calendario ricarica la disponibilità (visibile nel network tab: nuova chiamata a `/disponibilita-mese`).
- Le notti non disponibili appaiono visivamente distinte (opacità ridotta, barrate) e non cliccabili.
- Se il backend (Piano 1) non è raggiungibile, il calendario resta comunque interamente cliccabile (degrado grazioso, nessun blocco).

**Questo è il checkpoint richiesto dal titolare prima di passare al punto 2 del piano redesign** — non sostituibile da nessun controllo automatico eseguibile da questa sessione.

### Step 7: Commit (solo se eseguito dal tab Code — MAI da Cowork)

```bash
git add components/ui/DateRangePicker.tsx components/booking/BookingWidget.tsx package.json package-lock.json
git commit -m "feat: DateRangePicker con calendario OTA-style, sostituisce gli input date nativi nel booking widget"
```

---

## Task 2: Documentazione

**Files:**
- Modify: `STATO_PROGETTO.md`

**Interfaces:**
- Consumes: nessuna.
- Produces: nessuna.

### Step 1: Aggiornare la sezione "Redesign visivo" in `STATO_PROGETTO.md`

Sostituire il paragrafo attuale ("Non ancora iniziata l'esecuzione...") con:

```markdown
## Redesign visivo (24/08/2026)

Piano dettagliato: `docs/superpowers/plans/2026-08-24-redesign-visivo-sito.md`.
**Punto 1 (date-range picker) completato**: `components/ui/DateRangePicker.tsx`
(nuovo, `react-day-picker`) sostituisce i due `<input type="date">` nativi
in `BookingWidget.tsx`, calendario aggregato/occupancy-aware collegato al
nuovo endpoint `gestionale-hotel` `/api/booking-pubblico/disponibilita-mese`
(Piano `gestionale-hotel/docs/superpowers/plans/2026-08-24-endpoint-disponibilita-mese.md`).
[COMPILARE: esito verifica visiva reale del titolare, eventuali
scostamenti, commit reali se già eseguiti dal tab Code.] Prossimo punto del
piano redesign: audit palette/tipografia/bottoni/card (Punto 2).
```

### Step 2 (checkpoint del titolare): coerenza col resto del file

Verifica: la sezione "Bloccato su terzi" e le altre non contraddicono questo aggiornamento.

### Step 3: Commit (solo se eseguito dal tab Code — MAI da Cowork)

```bash
git add STATO_PROGETTO.md
git commit -m "docs: chiudere Punto 1 del piano redesign (date-range picker)"
```

---

## Self-Review

**1. Copertura spec:** contratto del componente (props `adulti`/`bambiniEta`/`value`/`onChange` dal design doc — qui esplicitati come `dataArrivo`/`dataPartenza`/`onChange` invece di un singolo `value` oggetto, scelta implementativa più semplice da collegare allo stato esistente di `BookingWidget.tsx`, che già tiene `dataArrivo`/`dataPartenza` separati), fetch mese visibile + successivo con debounce, degrado grazioso, libreria `react-day-picker`, niente prezzo nel calendario, niente dark mode, niente Hero: tutti coperti da Task 1. La deviazione dal design doc (prop separate invece di un oggetto `value`) è dichiarata qui, non silenziata.

**2. Scansione placeholder:** nessun placeholder nel codice. Il `[COMPILARE...]` in Task 2 Step 1 è dichiarato esplicitamente come tale, stesso trattamento del piano gemello in gestionale-hotel.

**3. Coerenza dei tipi:** `DateRangePickerProps` in Task 1 Step 2 corrisponde esattamente alle prop passate nell'integrazione di Task 1 Step 4 (`dataArrivo`, `dataPartenza`, `onChange`, `adulti`, `bambiniEta`, `labelArrivo`, `labelPartenza`) — nessun nome disallineato tra definizione e uso.

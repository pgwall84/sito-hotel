# Micro-interazioni su hover (Punto 4) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Aggiungere il supporto `prefers-reduced-motion` (mancante in tutto il progetto) e completare i due micro-hover di `LuogoCard.tsx` con una transizione fluida — unico lavoro reale rimasto del Punto 4 del piano master, dopo che il brainstorming ha confermato che card e bottoni hanno già il trattamento hover previsto.

**Architecture:** Due modifiche indipendenti e non correlate tra loro: un blocco CSS globale (media query kill-switch) in `app/globals.css`, e l'aggiunta della classe Tailwind `transition-colors` a due elementi già esistenti in `components/ui/LuogoCard.tsx`. Nessun nuovo componente, nessuna nuova dipendenza.

**Tech Stack:** CSS puro (media query `prefers-reduced-motion`), classi utility Tailwind esistenti nel progetto.

## Global Constraints

- Nessun comando `git` da questa sessione (nemmeno di sola lettura) — commit/push/deploy restano responsabilità del titolare dal suo "Code" tab locale. Ogni task qui sotto NON include uno step di commit.
- Nessuna modifica a `Card.tsx`, `CameraCard.tsx`, `OffertaCard.tsx`, `EscursioneCard.tsx`, `buttonClasses.ts` — confermato in brainstorming che sono già a posto.
- Nessuna modifica a schema Sanity, nessuna nuova dipendenza npm.
- Verifica tramite `tsc` mirato (non full-project: supera il timeout di 45s dell'ambiente di esecuzione), usando un tsconfig di scratch nella ROOT del repo (non altrove — `@types/node` non si risolverebbe) con `next-env.d.ts` incluso in `"files"` (altrimenti falsi positivi TS2769 su `lib/queries.ts`). Metodologia completa in memoria di progetto `sito_hotel_verifica_tsc_reale.md`.
- Editing diretto sui file nella cartella connessa dell'utente (non build in un workspace separato) — le modifiche sono già "consegnate" nel momento in cui vengono scritte, nessun passaggio di consegna file aggiuntivo necessario.

---

### Task 1: `prefers-reduced-motion` kill-switch globale

**Files:**
- Modify: `app/globals.css` (intero file, 5 righe attuali)

**Interfaces:**
- Consumes: nessuna.
- Produces: nessuna — è una foglia, non usata da nessun altro task.

- [ ] **Step 1: Leggere il contenuto attuale di `app/globals.css` per confermare che non sia cambiato dall'ultima verifica**

Contenuto atteso (4 righe non vuote):
```css
@import "tailwindcss";
@config "../tailwind.config.ts";

body {
  @apply bg-background text-text font-body;
}
```

Se il contenuto è diverso da questo, fermarsi e segnalarlo prima di procedere (qualcun altro potrebbe aver modificato il file nel frattempo).

- [ ] **Step 2: Aggiungere il blocco reduced-motion in coda al file**

Nuovo contenuto completo del file (aggiunta in fondo, tutto il resto invariato):

```css
@import "tailwindcss";
@config "../tailwind.config.ts";

body {
  @apply bg-background text-text font-body;
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

- [ ] **Step 3: Verificare che il file sia CSS valido**

CSS puro, nessun compilatore TypeScript coinvolto — verifica manuale: rileggere il file e controllare che le graffe siano bilanciate e che non ci siano refusi di sintassi (`;` mancanti, selettori non chiusi). Non serve `tsc`/`esbuild` per questo task: non è codice TypeScript/JSX.

- [ ] **Step 4: Nota per il titolare**

Non verificabile da questa sessione: aprire il sito con `npm run dev`, attivare "riduci movimento" nelle impostazioni di sistema operativo/browser, e controllare che le transizioni hover (ombra su card, colore su bottoni e su `LuogoCard`) scompaiano o diventino istantanee. Annotare questo come parte del checkpoint visivo del Punto 4.

---

### Task 2: `transition-colors` sui due hover di `LuogoCard.tsx`

**Files:**
- Modify: `components/ui/LuogoCard.tsx:76` (bottone "chiama") e `:87` (link "apri mappa") — numeri di riga indicativi, individuare per contenuto testuale come da Step 1.

**Interfaces:**
- Consumes: nessuna (nessuna prop o firma cambia).
- Produces: nessuna — puramente visivo, nessun altro file dipende da queste classi.

- [ ] **Step 1: Individuare le due righe da modificare**

Cercare in `components/ui/LuogoCard.tsx` i due blocchi seguenti (contenuto atteso, invariato dall'ultima verifica):

Bottone "chiama":
```tsx
              className="flex h-9 w-9 items-center justify-center rounded-full bg-surface text-primary hover:bg-surfaceDark"
```

Link "apri mappa":
```tsx
              className="ml-auto text-sm font-semibold text-primary hover:text-accent"
```

Se il contenuto di queste righe è diverso da quanto sopra, fermarsi e segnalarlo prima di procedere.

- [ ] **Step 2: Aggiungere `transition-colors` a entrambe**

Bottone "chiama" — nuova riga:
```tsx
              className="flex h-9 w-9 items-center justify-center rounded-full bg-surface text-primary transition-colors hover:bg-surfaceDark"
```

Link "apri mappa" — nuova riga:
```tsx
              className="ml-auto text-sm font-semibold text-primary transition-colors hover:text-accent"
```

Nessun'altra riga del file cambia.

- [ ] **Step 3: Creare il tsconfig di scratch per la verifica mirata**

Nella ROOT del repo (non altrove), creare `.verify.tsconfig.json`:

```json
{
  "extends": "./tsconfig.json",
  "include": [],
  "files": ["next-env.d.ts", "components/ui/LuogoCard.tsx"]
}
```

- [ ] **Step 4: Eseguire la verifica `tsc` mirata**

Run: `timeout 35 npx tsc --noEmit -p .verify.tsconfig.json`
Expected: nessun output (nessun errore). Se compaiono errori TS2769 su file non toccati da questo task, controllare che `next-env.d.ts` sia effettivamente incluso in `"files"` (causa nota, vedi Global Constraints).

- [ ] **Step 5: Rimuovere il tsconfig di scratch**

Run: `rm -f .verify.tsconfig.json` (nella root del repo). Se fallisce con "Operation not permitted", il permesso di cancellazione per questa cartella è già stato concesso in questa sessione — riprovare; altrimenti richiederlo con `device_request_delete_permission`.

- [ ] **Step 6: Nota per il titolare**

Non verificabile da questa sessione: confermare visivamente via `npm run dev` che i due hover in una pagina del Welcome Book (es. `/benvenuto/dintorni` o dove è renderizzato `LuogoCard`) ora sfumano invece di cambiare colore di scatto.

---

## Verifica finale del piano

- [ ] Rileggere entrambi i file modificati per confermare che non sia cambiuto nient'altro oltre a quanto descritto sopra.
- [ ] Aggiornare `STATO_PROGETTO.md` con una voce "Punto 4 (micro-interazioni hover) CHIUSO" che riassuma: cosa era già fatto prima di questo piano, cosa è stato aggiunto (reduced-motion + LuogoCard), e il checkpoint visivo non verificabile da questa sessione (Task 1 Step 4, Task 2 Step 6) da controllare dal titolare.

# Sweep finale coerenza visiva (Fase 6) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Chiudere l'ultima fase (Fase 6, "sweep finale") della spec `docs/superpowers/specs/2026-08-26-coerenza-visiva-design.md`: 2 titoli mistaggati come `<p>`, un h2 fuori scala in `LavoroBanner`, un radius isolato in un box callout, e una verifica di coerenza finale su tutto il resto del sito.

**Architecture:** Nessun componente nuovo, nessuna dipendenza. Solo correzioni puntuali di tag/classi in 3 file più una verifica grep-based dell'intero repo. Include una deviazione dichiarata dal testo letterale della spec (Task 5) e un secondo bug trovato oltre l'elenco della spec (Task 2, Step 2).

**Tech Stack:** Next.js App Router, TypeScript, Tailwind (token da `lib/theme.ts`).

## Global Constraints

- Mai eseguire `git` da questa sessione Cowork — commit reali fatti dal titolare dal tab Code.
- Nessun accesso a database/VPS da questa sessione.
- Verifica disponibile solo tramite `npx tsc --noEmit` ed `esbuild --bundle --jsx=automatic` in una sandbox scratch temporanea (react/react-dom/typescript/esbuild installati a parte, mai committati) — nessun `npm run dev`/build reale, nessun accesso a browser. Sandbox sempre eliminata prima della consegna finale.
- Questa è la Fase 6, ultima delle 6 fasi del piano di migrazione della spec (§"Piano di migrazione"). A checkpoint confermato dal titolare, l'intero Punto 2 del redesign (`docs/superpowers/plans/2026-08-24-redesign-visivo-sito.md`) risulta chiuso.
- Tutti i "contenuto attuale di riferimento" sotto vengono da una lettura fresh del repo reale (via `device_bash` sul computer del titolare, non dalla cache locale di Cowork), fatta il 26/08/2026 subito prima di scrivere questo piano.
- Consegna finale in un solo batch (`SendUserFile` + `device_commit_files`) con tutti i file toccati dall'intero piano — nessuna consegna sparsa per task.

---

### Task 1: `LavoroBanner.tsx` — allineare l'h2 alla scala titoli home page

**Files:**
- Modify: `components/home/LavoroBanner.tsx:10`

**Interfaces:** Nessuna — solo una classe Tailwind.

Contenuto attuale di riferimento (file intero, 17 righe, letto fresh il 26/08/2026):

```tsx
import { useTranslations } from "next-intl";
import Button from "@/components/ui/Button";
import SectionWrapper from "@/components/layout/SectionWrapper";

export default function LavoroBanner() {
  const t = useTranslations("Home.lavoro");

  return (
    <SectionWrapper bg="surface" className="text-center">
      <h2 className="font-heading text-2xl text-primary">{t("title")}</h2>
      <p className="mt-2 text-textMuted">{t("subtitle")}</p>
      <Button href="/lavoro" variant="outline-primary" className="mt-6 inline-block">
        {t("cta")}
      </Button>
    </SectionWrapper>
  );
}
```

Perché questo file e non altri: `LavoroBanner` è una delle 7 sezioni impilate sulla home page, sorella di `CamereInEvidenza`, `FAQ`, `GalleriaPreview`, `LericiDintorni`, `PestoHighlight`, `RistorantePreview` — TUTTE già `text-3xl` per il loro `<h2>` di sezione. `LavoroBanner` è l'unico outlier reale in quel gruppo di 7. Il resto del sito ha `<h2>` più piccoli (`text-2xl`, `text-xl`, `text-lg`) ma appartengono a un ruolo diverso — "sottotitolo dentro una pagina interna" (es. "Cosa vedere"/"Borghi" in `/lerici`, "Servizi"/"Convenzioni" in `/lavoro`, sottosezioni di `/privacy-policy`) — e sono già coerenti internamente al loro gruppo. Non toccarli: non fanno parte di questa fase, la spec non li segnala come incoerenti e un confronto diretto conferma che ciascun gruppo è già omogeneo al proprio interno.

- [x] **Step 1: Sostituire la riga 10**

Sostituire:

```tsx
      <h2 className="font-heading text-2xl text-primary">{t("title")}</h2>
```

con:

```tsx
      <h2 className="font-heading text-3xl text-primary">{t("title")}</h2>
```

- [x] **Step 2: Nota di verifica per il titolare**

Da controllare in `npm run dev` locale: aprire la home page, scorrere fino al banner "Lavora con noi" (sezione su sfondo sabbia, tra le altre sezioni impilate) — il titolo deve avere la stessa dimensione visiva delle altre sezioni della home (es. "Le nostre camere", "Domande frequenti"), non più piccolo.

---

### Task 2: `contatti/page.tsx` — correggere 2 titoli mistaggati `<p>`→`<h2>`

**Files:**
- Modify: `app/[locale]/(public)/contatti/page.tsx:48`
- Modify: `app/[locale]/(public)/contatti/page.tsx:53`

**Interfaces:** Nessuna — solo cambio di tag, className invariato.

Contenuto attuale di riferimento (righe 40-58, letto fresh il 26/08/2026):

```tsx
          <div>
            <h2 className="font-heading text-xl text-primary">{t("formTitle")}</h2>
            <div className="mt-4">
              <ContattoForm />
            </div>
          </div>

          <div className="text-sm text-text">
            <p className="font-heading text-xl text-primary">{t("orariTitle")}</p>
            <p className="mt-2 text-textMuted">+39 0187 967400 · +39 335 7579786</p>
            <p className="text-textMuted">info@hoteldelgolfo.com</p>
            <p className="mt-2 text-textMuted">Via Gerini 37, 19032 Lerici (SP)</p>

            <p className="mt-6 font-heading text-xl text-primary">{t("comeArrivareTitle")}</p>
            <ul className="mt-2 space-y-1 text-textMuted">
              <li>{t("auto")}</li>
              <li>{t("treno")}</li>
              <li>{t("battello")}</li>
            </ul>
```

`formTitle` (riga 41) è già correttamente un `<h2>`, stesso identico className (`font-heading text-xl text-primary`) delle due righe sotto — la colonna ha 3 sottotitoli fratelli con lo stesso stile, ma solo uno dei tre ha il tag giusto.

- [x] **Step 1: `orariTitle` (riga 48) — elemento nominato esplicitamente dalla spec**

Sostituire:

```tsx
            <p className="font-heading text-xl text-primary">{t("orariTitle")}</p>
```

con:

```tsx
            <h2 className="font-heading text-xl text-primary">{t("orariTitle")}</h2>
```

- [x] **Step 2: `comeArrivareTitle` (riga 53) — trovato oltre l'elenco della spec**

La spec (`docs/superpowers/specs/2026-08-26-coerenza-visiva-design.md`, §"Altre correzioni puntuali") nomina esplicitamente solo `contatti/page.tsx:48`. Questa riga è un secondo mistag identico nello stesso file, stessa natura del bug, trovato in un audit fresh fatto oggi e non nell'audit originale che ha prodotto la spec — va corretto per lo stesso motivo del Task precedente, non per un requisito esplicito del documento.

Sostituire:

```tsx
            <p className="mt-6 font-heading text-xl text-primary">{t("comeArrivareTitle")}</p>
```

con:

```tsx
            <h2 className="mt-6 font-heading text-xl text-primary">{t("comeArrivareTitle")}</h2>
```

- [x] **Step 3: Nota di verifica per il titolare**

Da controllare in `npm run dev` locale: aprire `/contatti`, colonna destra "Orari"/informazioni di contatto. Visivamente nulla deve cambiare (stesso className) — il controllo reale è nell'ispettore browser o nel lettore di accessibilità: i 3 sottotitoli della pagina (Form di contatto, Orari, Come arrivare) devono ora essere tutti `<h2>` nell'albero DOM, non un mix di `<h2>`/`<p>`.

---

### Task 3: `posizione/page.tsx` — correggere il titolo mistaggato `<p>`→`<h2>`

**Files:**
- Modify: `app/[locale]/(benvenuto)/benvenuto/posizione/page.tsx:47`

**Interfaces:** Nessuna — solo cambio di tag, className invariato.

Contenuto attuale di riferimento (righe 34-51, letto fresh il 26/08/2026):

```tsx
  return (
    <SectionWrapper bg="white">
      <p className="text-sm text-textMuted">
        {info.indirizzo}, {info.cap} {info.citta} ({info.provincia})
      </p>

      {wb?.posizioneTesto && <p className="mt-4 max-w-2xl text-text">{wb.posizioneTesto}</p>}

      <div className="mt-6 aspect-[4/3] overflow-hidden rounded-lg border border-border">
        <MapEmbed lat={lat} lon={lon} />
      </div>

      <div className="mt-6">
        <p className="font-heading text-lg text-primary">{tContatti("comeArrivareTitle")}</p>
        <ul className="mt-2 space-y-1 text-sm text-textMuted">
          <li>{tContatti("auto")}</li>
          <li>{tContatti("treno")}</li>
          <li>{tContatti("battello")}</li>
        </ul>
      </div>
```

Nota: questa pagina Welcome Book non ha un `<h1>` nel body — il titolo vero vive nella topbar condivisa dell'area Welcome Book (eccezione già dichiarata nella spec, §"Estensioni a lib/theme.ts", scala titoli). Nessun conflitto di gerarchia da gestire: il documento non ha altri heading oltre a questo.

- [x] **Step 1: Sostituire la riga 47**

Sostituire:

```tsx
        <p className="font-heading text-lg text-primary">{tContatti("comeArrivareTitle")}</p>
```

con:

```tsx
        <h2 className="font-heading text-lg text-primary">{tContatti("comeArrivareTitle")}</h2>
```

- [x] **Step 2: Nota di verifica per il titolare**

Da controllare in `npm run dev` locale: pagina Welcome Book `/benvenuto/posizione` (area riservata post-prenotazione, serve una prenotazione di prova per accedervi — stesso limite già segnalato per altre pagine Welcome Book nei piani precedenti). Visivamente nulla cambia; il controllo reale è di struttura DOM, non visivo.

---

### Task 4: `wifi/page.tsx` — unificare il radius del box callout

**Files:**
- Modify: `app/[locale]/(benvenuto)/benvenuto/wifi/page.tsx:30`

**Interfaces:** Nessuna — solo una classe Tailwind.

Contenuto attuale di riferimento (riga 30, letto fresh il 26/08/2026):

```tsx
        <div className="inline-flex flex-col gap-2 rounded-lg border border-border bg-surface px-6 py-5 text-sm">
```

Confermato con audit fresh (`grep -rn "bg-surface.*rounded"` su tutto il repo): esistono esattamente 3 file con questo ruolo "box informativo/callout" (sfondo `bg-surface` + radius + testo su sfondo chiaro):
- `cookie-policy/page.tsx:30` — `rounded-md` (non toccare, già corretto)
- `privacy-policy/page.tsx:28` — `rounded-md` (non toccare, già corretto)
- `wifi/page.tsx:30` — `rounded-lg` (questo task, l'unico isolato)

Corrisponde esattamente alla voce della spec "Box informativo/callout: 2 varianti di radius (`rounded-md` vs `rounded-lg`) per lo stesso ruolo, in 3 file — unificare su `rounded-md` (maggioritario, 2 file su 3)".

- [x] **Step 1: Sostituire la riga 30**

Sostituire:

```tsx
        <div className="inline-flex flex-col gap-2 rounded-lg border border-border bg-surface px-6 py-5 text-sm">
```

con:

```tsx
        <div className="inline-flex flex-col gap-2 rounded-md border border-border bg-surface px-6 py-5 text-sm">
```

- [x] **Step 2: Nota di verifica per il titolare**

Da controllare in `npm run dev` locale: pagina Welcome Book `/benvenuto/wifi` (area riservata, stesso limite di accesso del Task 3) — il box con le credenziali WiFi (SSID/password) deve avere angoli leggermente meno arrotondati di prima (12px invece di 8px — differenza sottile, non un cambio radicale).

---

### Task 5: `lerici/page.tsx` — deviazione dichiarata, NESSUNA modifica

**Files:** Nessuno — questo task documenta esplicitamente una non-modifica.

**Interfaces:** Nessuna.

Il testo letterale della spec (`docs/superpowers/specs/2026-08-26-coerenza-visiva-design.md`, §"Altre correzioni puntuali", voce "Cornici immagine/mappa") dice:

> "Cornici immagine/mappa: `rounded-lg` maggioritario (5 file), `rounded-md` in `lerici/page.tsx` (1 file, isolato) — allineare a `rounded-lg`."

Contenuto attuale di riferimento (`app/[locale]/(public)/lerici/page.tsx`, righe 38-44, letto fresh il 26/08/2026):

```tsx
        {foto.length > 0 && (
          <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
            {foto.map((f, i) => (
              <div key={i} className="relative aspect-square overflow-hidden rounded-md">
                <Image src={f.fotoUrl} alt={f.didascalia || t("title")} fill className="object-cover" />
              </div>
            ))}
          </div>
        )}
```

**Perché questo piano NON esegue la modifica letterale della spec:**

L'elemento a questa riga non è una "cornice immagine/mappa singola" — quel ruolo (una foto o una mappa unica, formato `aspect-[4/3]` o `aspect-[16/10]`) è occupato da 5 file diversi, tutti `rounded-lg`:

- `posizione/page.tsx:42` (mappa)
- `contatti/page.tsx:60` (mappa)
- `esperienze/page.tsx:65` (foto singola)
- `ristorante/page.tsx:65` (foto singola)
- `RistorantePreview.tsx:18` (foto singola)

Questo È il gruppo dei "5 file" citato dalla spec. La riga di `lerici/page.tsx:41`, invece, è dentro una **griglia di miniature quadrate** (`aspect-square`, in un `.map()` su un array di foto) — un ruolo completamente diverso: "griglia di anteprime", non "cornice singola". Il pattern esatto (`relative aspect-square overflow-hidden rounded-md`, carattere per carattere identico) è già usato in modo coerente in altri due file, entrambe già `rounded-md`:

- `components/ui/GalleriaGrid.tsx:53`
- `components/home/GalleriaPreview.tsx:23`

Applicare la modifica letterale della spec (`lerici/page.tsx:41` → `rounded-lg`) risolverebbe un'incoerenza che non esiste in quel ruolo (griglia di miniature) e ne creerebbe una vera, nuova, contro le sue 2 vere sorelle di ruolo (`GalleriaGrid`/`GalleriaPreview`). L'ipotesi più probabile è che l'audit originale che ha prodotto la spec abbia classificato questo elemento nel gruppo sbagliato (per via del nome del file, "cornici immagine", senza distinguere "cornice singola" da "griglia di miniature").

- [x] **Step 1: Nessuna modifica al codice — nota per il titolare**

Questo task è una decisione, non una modifica. Se il titolare ritiene che la lettura sopra sia sbagliata (es. preferisce comunque uniformare visivamente tutte le cornici del sito indipendentemente dal ruolo semantico), la riga da cambiare resta `app/[locale]/(public)/lerici/page.tsx:41`, sostituendo `rounded-md` con `rounded-lg` — un intervento di un minuto, rimandato a un'eventuale richiesta esplicita dopo questo checkpoint.

---

### Task 6: Sweep di verifica finale (grep riproducibili, nessuna modifica attesa)

**Files:** Nessuno atteso — task di sola verifica.

**Interfaces:** Nessuna.

Comandi eseguiti (dalla radice del repo) e risultato ottenuto il 26/08/2026, prima di scrivere questo piano — da rieseguire identici per riconfermare dopo i Task 1-4:

- [x] **Step 1: Colori hardcoded fuori da `lib/theme.ts`**

Run:
```bash
grep -rn "#[0-9a-fA-F]\{6\}\|#[0-9a-fA-F]\{3\}\b" --include="*.tsx" app components | grep -v "LinguaSelector.tsx\|WhatsAppButton.tsx"
```
Expected: nessun risultato (le uniche occorrenze legittime sono le 4 bandiere SVG in `LinguaSelector.tsx` e l'icona WhatsApp in `WhatsAppButton.tsx`, escluse dal grep — sono colori-marchio dichiarati fuori tema per motivi già documentati in quei file, non un difetto).

- [x] **Step 2: `text-red`/`bg-red` residui**

Run:
```bash
grep -rn "text-red\|bg-red" --include="*.tsx" app components
```
Expected: nessun risultato (la Fase 4 li ha già sostituiti tutti con il token `error`).

- [x] **Step 3: `rounded`/`border` non tematizzati residui**

Run:
```bash
grep -rnoE 'className="[^"]*"' --include="*.tsx" app components | grep -E '\brounded\b' | grep -v "rounded-"
grep -rnoE 'className="[^"]*"' --include="*.tsx" app components | grep -E '\bborder\b' | grep -vE "border-(border|primary|accent|error|white|background|surface|text|dashed|t\b|b\b|l\b|r\b)"
```
Expected: solo 3 risultati legittimi, nessuno da correggere — `cookie-policy/page.tsx:39` (`border-collapse` su una tabella, proprietà CSS diversa da un bordo colorato), `BookingWidget.tsx:280` e `MapEmbed.tsx:35` (`border-0` per rimuovere il bordo nativo di un `<input>`/`<iframe>`, non un bordo da tematizzare).

- [x] **Step 4: Ogni `<p className="...font-heading...">` del repo**

Run:
```bash
grep -rn '<p className="[^"]*font-heading' --include="*.tsx" app components
```
Expected dopo i Task 1-3: solo 3 risultati residui, tutti da NON toccare —
- `esperienze/page.tsx:48` e `PestoHighlight.tsx:12` — numeri statistici decorativi (`text-6xl`), non titoli di sezione, correttamente `<p>`.
- `LuogoCard.tsx:103` — dentro la modale di conferma chiamata (`role="dialog"`), esplicitamente fuori scope dichiarato dalla spec del componente Card (§"Restano fuori scope, deliberatamente").

- [x] **Step 5: Verificare con tsc ed esbuild i file toccati dai Task 1-4**

Creare una sandbox temporanea (`/tmp/sweep-finale-verify`), symlink di `node_modules` (react@19.2.4, react-dom@19.2.4, typescript, esbuild, @types/react, @types/react-dom, @types/node) nel mirror del repo, `tsconfig.verify.json` con `"paths": {"@/*": ["./*"]}` e `"types": ["node", "react"]` (stessa configurazione già validata nel piano LinguaSelector — necessaria per i file che usano `React.ReactNode`/JSX senza import esplicito di `"react"`), stub tipizzati per i moduli non presenti nel mirror parziale di Cowork (`next-intl`, `next-intl/server`, `@/lib/i18n/navigation`, `@/lib/queries`, `@/lib/seo`, `@/components/layout/SectionWrapper`, `@/components/ui/Button`, `@/components/ui/MapEmbed`, `@/components/forms/ContattoForm`, `next/image`, `next/metadata`).

Run: `npx tsc --noEmit -p tsconfig.verify.json`
Expected: nessun errore sui 4 file toccati (`LavoroBanner.tsx`, `contatti/page.tsx`, `posizione/page.tsx`, `wifi/page.tsx`).

Run: `npx esbuild <ognuno dei 4 file> --bundle --jsx=automatic --tsconfig=tsconfig.verify.json --external:next-intl --external:next-intl/server --external:react --external:react-dom --external:@/lib/i18n/navigation --external:@/lib/queries --external:@/lib/seo --external:@/components/layout/SectionWrapper --external:@/components/ui/Button --external:@/components/ui/MapEmbed --external:@/components/forms/ContattoForm --external:next/image --outdir=/tmp/sweep-finale-verify/out`
Expected: bundle prodotto senza errori per ciascuno dei 4 file.

- [x] **Step 6: Eliminare la sandbox scratch**

Rimuovere `node_modules` (symlink), `stubs.verify.d.ts`, `tsconfig.verify.json`, `tsconfig.verify.tsbuildinfo` dal mirror del repo, e `/tmp/sweep-finale-verify` per intero.

---

### Task 7: Aggiornare `STATO_PROGETTO.md` e chiudere il Punto 2

**Files:**
- Modify: `STATO_PROGETTO.md`

**Interfaces:** Nessuna — solo documentazione.

- [x] **Step 1: Aggiungere la voce di chiusura Fase 6**

Aggiungere, nella sezione "Redesign visivo" dove sono già documentate le Fasi 1-5, una nuova voce che copre:
- I 4 file modificati (Task 1-4) con una riga ciascuno.
- La deviazione dichiarata del Task 5 (`lerici/page.tsx` NON modificato, con la motivazione sintetica: griglia di miniature, stesso ruolo di `GalleriaGrid`/`GalleriaPreview`, non "cornice singola").
- Il secondo mistag trovato oltre l'elenco della spec (Task 2, Step 2 — `contatti/page.tsx:53`).
- I limiti di verifica di questa sessione Cowork (solo `tsc --noEmit`/`esbuild --bundle`, nessun accesso a browser/`npm run dev` reale — il controllo visivo resta del titolare).
- Una nota che questa è l'ultima fase (Fase 6) del piano di migrazione a 6 fasi della spec `2026-08-26-coerenza-visiva-design.md`, e che — a checkpoint confermato dal titolare — l'intero Punto 2 del redesign visivo (`docs/superpowers/plans/2026-08-24-redesign-visivo-sito.md`) risulta chiuso.

- [x] **Step 2: Nessun checkpoint visivo per questo task**

Documentazione pura, nessun impatto sul sito.

---

## Note di esecuzione

- I Task 1-4 sono indipendenti tra loro (file diversi) — possono essere eseguiti in qualunque ordine.
- Il Task 5 non produce codice: va comunque presentato al titolare come parte del checkpoint, non saltato.
- Il Task 6 va rieseguito DOPO i Task 1-4 (non prima), per confermare che il sweep resti pulito anche con le modifiche applicate.
- Il Task 7 è sempre l'ultimo.
- Consegna: un solo `SendUserFile` con i 4 file di codice + `STATO_PROGETTO.md` + questo file di piano, seguito da un solo `device_commit_files` — mai consegne per singolo task.

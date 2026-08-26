# Redesign visivo sito-hotel — piano di lavoro

> Piano di ragionamento/priorità, non un piano TDD in stile
> `superpowers:writing-plans` — qui il gate di completamento di ogni punto
> è il controllo visivo del titolare, non un test automatico. Esecuzione
> a passi singoli: un punto alla volta, verifica a video di Marco prima di
> passare al successivo. Nessun `git` da Cowork (convenzione di progetto)
> — ogni consegna via `SendUserFile` + `device_commit_files`, commit reali
> fatti dal titolare dal "tab Code".

**Origine**: conversazione 24/08/2026 — Marco valutava Medusa.js (framework
di commerce, non pertinente a un redesign visivo) contro Claude Design
(strumento di mockup, pertinente) per migliorare l'aspetto grafico del
sito. Ha elencato una serie di feature ispirate a portali di viaggio
moderni (hero video, ricerca stile Airbnb, Framer Motion, bento grid,
micro-interazioni, filtri istantanei, dark mode). Qui sotto la valutazione
punto per punto, in ordine di priorità, **esclude esplicitamente il dark
mode** su richiesta del titolare ("visto che non lo usa quasi nessuno").

## Stato di partenza verificato (non supposizioni)

Letti direttamente `lib/theme.ts`, `tailwind.config.ts`, `app/globals.css`,
`package.json`, `components/home/Hero.tsx`,
`components/booking/BookingWidget.tsx` il 24/08/2026:

- **Sistema di design già esistente e coerente** in `lib/theme.ts`: navy
  `#1B3A5C`/`#2A5A8C`, terracotta `#C4703A`/`#D4875A`, oro `#C4A882`,
  sabbia `#F5F0E8`/`#EDE8DF`, testo antracite `#2C2C2C`. Font Playfair
  Display (titoli) + Inter (corpo). Raggi bordo contenuti (4-16px + full
  per i pill button). Ombre tinte di navy, non nere. **Non va ricostruito,
  va esteso e applicato con più coerenza dove manca.**
- **Hero già impostata bene strutturalmente**: immagine full-bleed da
  Sanity con `priority` (scelta corretta per LCP), overlay navy
  semitrasparente per leggibilità, due CTA, badge row. Manca: qualunque
  forma di ricerca/date-picker.
- **Framer Motion NON è nelle dipendenze** (`package.json`) — va aggiunto
  da zero se lo si vuole usare.
- **Dark mode: nessuna infrastruttura** (niente `next-themes`, nessuna
  strategia dark in Tailwind) — coerente con la scelta di escluderlo.
- **Date-picker booking: due `<input type="date">` nativi**, stile minimo
  (`border rounded px-3 py-2`), nessuna libreria calendario nel progetto.
  Non c'è nulla da "spostare" in hero — va progettato un componente nuovo.
- Stack: Next.js 16.3, React 19.2, Tailwind v4 (sintassi nuova
  `@import "tailwindcss"` + `@config`), lucide-react per le icone, Stripe
  per i pagamenti, next-intl per le 4 lingue, Sanity come CMS.

## Ordine di priorità e approccio

### 1. Barra di ricerca / date-range picker (componente nuovo, condiviso)

**Stato: CHIUSO (24/08/2026)** — `DateRangePicker.tsx` costruito e in uso
nel booking widget, checkpoint visivo confermato dal titolare. Dettaglio:
`docs/superpowers/specs/2026-08-24-date-range-picker-design.md`,
`STATO_PROGETTO.md`.

**Perché per primo**: non è solo estetica — oggi il booking widget usa
input data nativi del browser, un'esperienza sotto lo standard atteso da
chi prenota un hotel online nel 2026. È anche l'unico punto della lista
che Marco ha esplicitamente confermato di voler fare. Costruirlo bene una
volta sola conviene farlo PRIMA di toccare la hero, perché la hero lo
userà.

**Come**:
- Un componente React nuovo (`components/ui/DateRangePicker.tsx` o simile)
  che sostituisce i due `<input type="date">` sia nel booking widget sia
  (dopo, punto 6) nella hero.
- Valutare una libreria leggera (es. `react-day-picker`, non ancora nel
  progetto) contro un componente scritto a mano — con Tailwind v4 e i
  token già in `lib/theme.ts` non serve molto codice per uno stile
  coerente; una libreria toglie però la gestione di accessibilità da
  tastiera/screen reader (rilevante per il punto 5, WCAG) che altrimenti
  va scritta a mano.
- Deve restare **un date-range per una singola struttura**, non una
  ricerca multi-destinazione: l'estetica può ispirarsi ad Airbnb, la
  logica sotto resta quella già esistente (arrivo/partenza →
  `/api/booking-pubblico/disponibilita`).
- Stati da coprire: nessuna data selezionata, solo arrivo selezionato,
  range completo, date non disponibili (da `disponibilita()`, se si vuole
  mostrarle disabilitate nel calendario — verificare con gestionale-hotel
  se l'endpoint espone già questo dato per range, o solo per una coppia di
  date specifica).

**Checkpoint visivo**: il nuovo componente funziona nel booking widget
esistente, sostituendo i due input nativi, prima di essere riusato altrove.

### 2. Palette/tipografia/bottoni/card — audit di coerenza, non ricostruzione

**Stato: CHIUSO (26/08/2026)** — eseguito in 6 fasi (token, `Button`,
`Card`, flusso booking/pagamento, `LinguaSelector`, sweep finale), ognuna
con checkpoint visivo confermato dal titolare. Dettaglio completo:
`docs/superpowers/specs/2026-08-26-coerenza-visiva-design.md`,
`STATO_PROGETTO.md`.

**Perché**: il sistema in `lib/theme.ts` è già buono ma non è detto sia
applicato ovunque con la stessa disciplina (pagine costruite in momenti
diversi). Prima di aggiungere elementi nuovi (bento grid, micro-
interazioni) conviene un passaggio di coerenza su quello che c'è.

**Come**: rivedere le pagine principali (home, camere, prenota) cercando
scostamenti dai token — colori hard-coded invece di `bg-primary`/
`text-gold`/ecc., bottoni con raggio o padding diversi dallo standard,
card senza l'ombra tinta navy già definita in `theme.shadows`. Correggere,
non reinventare.

**Checkpoint visivo**: confronto prima/dopo di 2-3 pagine chiave.

### 3. Bento grid per camere/esperienze

**Perché**: con poche categorie (camere, ristorante, esperienze locali)
una griglia asimmetrica ha un impatto visivo reale senza il rischio di
sembrare forzata che avrebbe su un catalogo enorme — qui il numero di
elementi è contenuto, il formato si presta bene.

**Come**: applicarlo dove già esistono `CameraCard.tsx`/`OffertaCard.tsx`
— riorganizzare il layout della griglia (dimensioni asimmetriche per
riquadro "in evidenza" + riquadri più piccoli), non riscrivere le card
stesse se già coerenti col punto 2.

**Checkpoint visivo**: sezione camere/esperienze in home.

### 4. Micro-interazioni su hover (card, bottoni, filtri)

**Perché**: basso sforzo, alto valore percepito, coerente con
"elegante" se fatte con misura (scala leggera, ombra che si accende,
niente rimbalzi).

**Come**: transizioni CSS/Tailwind (`transition`, `hover:scale-[1.02]`,
`hover:shadow-cardHover` — quest'ultima già definita in `lib/theme.ts`,
da riusare) — non serve necessariamente Framer Motion per hover semplici;
riservare Framer Motion (se lo si aggiunge, vedi punto 6) alle transizioni
di ingresso/scroll, non ai micro-hover che Tailwind gestisce già bene da
solo.

**Checkpoint visivo**: hover su card camere/esperienze e sui bottoni CTA.

### 5. Audit accessibilità (WCAG)

**Perché**: non è un "tenerlo a mente mentre si scrive" — richiede un
passaggio dedicato, soprattutto una volta aggiunto un componente
interattivo nuovo come il date-picker (punto 1) e qualunque animazione
(punto 6).

**Come**: contrasto testo su overlay navy/immagini (verificare eyebrow
oro e testo bianco su foto chiare), stati di focus visibili su ogni
elemento interattivo nuovo, gestione `prefers-reduced-motion` per
qualunque animazione aggiunta, navigabilità da tastiera del date-picker.
Strumenti: Lighthouse/axe — non eseguibili da questo sandbox (nessun
browser reale), da fare dal tab Code o in locale.

**Checkpoint visivo**: non è visivo in senso stretto — checkpoint è un
report Lighthouse/axe pulito (o le correzioni ai problemi trovati).

### 6. Hero: video di sfondo + Framer Motion (opzionale, da valutare per ultimo)

**Perché per ultimo**: impatto reale ma anche il punto con più rischio
(performance, dati mobile) e il meno urgente — la hero attuale con foto
statica + `priority` è già una base solida, il salto a video è un
miglioramento incrementale, non una lacuna come il date-picker.

**Come, se si procede**:
- Video SOLO desktop, muto, breve, con poster/fallback a immagine statica
  su mobile (stessa immagine Sanity già in uso).
- Rispettare `prefers-reduced-motion`: chi lo richiede vede la versione
  statica.
- Framer Motion solo qui aggiunge valore reale (fade-in del titolo,
  reveal degli elementi all'ingresso) — se si aggiunge la libreria, va
  aggiunta per questo, non per gli hover del punto 4.
- Integrare la barra di ricerca del punto 1 nella hero, sopra il video/
  immagine.

**Checkpoint visivo**: hero completa, desktop e mobile, con e senza
`prefers-reduced-motion` attivo.

### 7. Filtri istantanei senza reload — da valutare, non pianificare ora

**Perché non è nella sequenza sopra**: prima di scrivere codice va
capito cosa esattamente si filtrerebbe — con poche tipologie di camera e
poche esperienze il valore è dubbio. Punto da riaprire solo se emerge un
catalogo abbastanza ampio da giustificarlo (es. se le esperienze/pacchetti
crescono molto), non un'attività da mettere in coda adesso.

## Escluso esplicitamente

**Dark mode** — richiesta del titolare, motivazione: scarsa diffusione
nel settore hôtellerie di lusso, dove un tono scuro comunica "prodotto
tech" più che "accoglienza calda". Nessuna infrastruttura da costruire,
nessun lavoro da stimare finché non cambia la decisione.

## Note operative per l'esecuzione

- Un punto alla volta, nell'ordine sopra — non passare al successivo senza
  conferma visiva del titolare sul precedente.
- Nessuna verifica visiva reale possibile da questo sandbox Cowork (niente
  browser) — solo `esbuild --bundle --jsx=automatic` come controllo
  sintattico sui file `.tsx` toccati, mai sostitutivo del controllo a
  video del titolare.
- Nessun `git` da qui — consegna di ogni punto via `SendUserFile` +
  `device_commit_files`, il titolare esegue/testa/committa dal tab Code.
- Aggiornare questo piano (spuntando i punti fatti) e
  `STATO_PROGETTO.md` mano a mano, non solo alla fine.

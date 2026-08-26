# STATO_PROGETTO.md — Hotel del Golfo — Sito Web

> Fotografia dello stato attuale, NON cronaca. Nuovo (23/08/2026), stesso
> principio applicato oggi a `gestionale-hotel/STATO_PROGETTO.md`: questo
> repo non aveva alcun file di stato — `SPEC_SITO_HOTEL.md` è la spec
> permanente (design, schema, convenzioni), non uno snapshot di cosa è
> fatto e cosa no. Aggiornare questo file dopo ogni sessione che tocca il
> sito; se supera ~150 righe, le voci più vecchie migrano in un futuro
> `docs/DIARIO_SESSIONI.md` (questo repo non ne ha ancora uno — da creare
> se la cronologia continua a crescere, come suggerito in CLAUDE.md
> Sezione 4).

## Welcome Book digitale (modulo 4.2)

⚠️ **Scoperto oggi (23/08/2026) che questa espansione non era documentata
da nessuna parte**: il 16/08/2026 il Welcome Book è stato esteso da 6 a
**15 sezioni** (Check-in/Check-out separati, Posizione, Trasporti, Servizi,
Attività, Ristoranti, Bar, Shopping, Informazioni, Emergenza — vedi
`docs/superpowers/specs/2026-08-16-welcome-book-design.md`). **Codice
completo e committato** (verificato via `git log`: 9 commit il 16/08,
route group `(benvenuto)` con le 15 sottopagine tutte presenti su disco,
schema Sanity `luogo` esteso, i18n per le 4 lingue). `gestionale-hotel/
CLAUDE.md` §8 riportava ancora la versione a 6 pulsanti del 02/08 — corretto
oggi.

**Non confermato** (nessun record trovato):
- Se `npm run build`/`npm run lint` e la verifica visiva a 375px
  (previsti nel design doc, sezione 7) sono stati fatti.
- Se il contenuto reale è stato incollato in Sanity Studio dal titolare
  (`docs/content-brief-welcome-book-parte1.md` è pronto per farlo, ma
  inserirlo è compito del titolare, non di questo lavoro).
- **Seconda parte dei contenuti mai arrivata**: banca/bancomat,
  supermercati con orari, chiese con orari funzioni, stazione di
  servizio — richiesti al titolare il 16/08/2026, ancora in attesa.

## Booking Engine Diretto v2 (modulo 4.1, gestionale-hotel + sito-hotel)

Pagina `/prenota` con calendario, disponibilità e prezzo reali, caparra
30% via Stripe — costruita **senza WuBook** (vedi sotto). Stato tecnico
dettagliato: `gestionale-hotel/STATO_PROGETTO.md`.

## Channel manager OTA — fornitore cambiato

**19/08/2026**: WuBook/WooDoo escluso — **verificato direttamente con
WuBook**, accettano solo fornitori certificati multi-cliente, non un
hotel col proprio gestionale. Stessa risposta da RoomCloud. Octorate
escluso: richiede comprare il loro gestionale in bundle (~160€/mese).
**Beds24 scelto al suo posto** — spec e piano non ancora scritti.
Dettaglio completo: `SPEC_SITO_HOTEL.md` §10 (fonte più aggiornata,
corretta lo stesso giorno).

## Redesign visivo (24/08/2026)

Piano dettagliato: `docs/superpowers/plans/2026-08-24-redesign-visivo-sito.md`.

**Punto 1 (date-range picker) — CHIUSO (25/08/2026, confermato dal
titolare dopo il terzo controllo visivo)**: `components/ui/DateRangePicker.tsx`
(nuovo, `react-day-picker` ^10.0.1) sostituisce i due `<input
type="date">` nativi in `BookingWidget.tsx` — calendario aggregato,
occupancy-aware, collegato al nuovo endpoint `gestionale-hotel`
`GET /api/booking-pubblico/disponibilita-mese` (Piano
`gestionale-hotel/docs/superpowers/plans/2026-08-24-endpoint-disponibilita-mese.md`,
già chiuso e verificato — 35/35 suite, 969/969 test). Piano di questo
componente: `docs/superpowers/plans/2026-08-24-date-range-picker-componente.md`.

Due scostamenti dal piano, deliberati e non silenziati: (1) l'import usa
l'alias `@/components/ui/DateRangePicker` invece del percorso relativo
`../ui/DateRangePicker` indicato nel piano — confermato leggendo
`components/ui/BookingButton.tsx` (già esistente) che questo repo usa
`@/lib/...` per import fuori dalla stessa cartella, il percorso relativo
era solo una scelta prudente presa senza aver ancora letto quella
convenzione; (2) invece di aggiungere un controllo `if (!dataArrivo ||
!dataPartenza) return;` dentro `cercaDisponibilita` (suggerito dal
piano per rimpiazzare la validazione nativa `required` persa con i due
`<input type="date">`), il bottone "Cerca" è stato disabilitato finché
`dataArrivo`/`dataPartenza` non sono entrambe valorizzate — blocca sia il
click sia l'invio da tastiera (Enter), stesso effetto del `required`
nativo, senza toccare la logica async esistente.

**Verificato da questa sessione Cowork**: `npx esbuild --bundle
--jsx=automatic` su entrambi i file toccati (zero errori, incluso il
resolving dell'alias `@/` verificato con un `tsconfig.json` di prova) e
`npx tsc --noEmit` reale su `DateRangePicker.tsx` contro i tipi veri di
`react-day-picker` 10.0.1 installato in una sandbox pulita (zero errori).
**Rifatto dopo il primo controllo visivo del titolare (24/08/2026, stessa
giornata)**: funzionava ma non era intuitivo — "più click per capire come
rimodificare data inizio e data fine, calendario che rimane aperto se non
clicchi su un giorno". Due fix, non uno: (1) il calendario ora si chiude
anche cliccando fuori, con Escape, o con una × esplicita — prima si
chiudeva solo selezionando un range completo; (2) `DateRangePicker.tsx` è
stato riscritto con due campi distinti "Check-in"/"Check-out" (pattern
Airbnb, scelto esplicitamente dal titolare tra due opzioni proposte —
l'alternativa più economica era un solo campo con indicazioni testuali
più chiare, scartata). Il campo attivo determina quale estremo del range
il prossimo click sul calendario imposta, con evidenza visiva (bordo
colorato) di quale sia; il `DayPicker` sottostante ora usa `mode="single"`
con un range disegnato a mano via `modifiers` invece della modalità range
integrata della libreria (troppo poco controllabile su "quale estremo sto
modificando" per questo caso). Contratto del componente (props) invariato
— nessuna modifica a `BookingWidget.tsx` necessaria per questa revisione.

**Verificato di nuovo dopo la riscrittura**: `tsc --noEmit` reale contro
react-day-picker 10.0.1 e `esbuild --bundle` su entrambi i file, zero
errori in entrambi i casi. **Secondo controllo visivo del titolare
(25/08/2026): funzionale, ma il campo adulti in `BookingWidget.tsx` non
era uniforme al nuovo DateRangePicker** — bordo più scuro (Tailwind
`border` semplice, senza colore tema, risolve a `currentColor` cioè il
testo antracite `#2C2C2C`, molto più scuro del `border-border` sabbia
`#E0D8CE` usato dai campi Check-in/Check-out) e proporzioni diverse
("campo enorme"). Fix: il wrapper del campo adulti ora usa la stessa
struttura visiva dei due campi data — `rounded-md border border-border`,
label `text-xs text-textMuted` sopra, valore `text-sm` sotto, anello di
fuoco `border-primary`/`ring-primary` (con `focus-within` invece di
`focus` sul `<label>`, perché il focus reale è sull'`<input>` interno).
Nessuna modifica a `DateRangePicker.tsx`: l'uniformità è stata portata
sul campo adulti, non viceversa. **Verificato**: `tsc --noEmit` (zero
errori nuovi — restano solo gli errori pre-esistenti attesi per moduli
non installati nel mirror parziale di Cowork: `next/image`,
`next-sanity`, `next-intl`, `@/lib/sanity`, `@/lib/sanity-i18n`,
`@/lib/servizi`, `@stripe/*`, e un `implicit any` preesistente riga 185
non toccato da questa modifica) ed `esbuild --bundle --jsx=automatic`
con quei moduli esternalizzati (zero errori, bundle prodotto).

**Chiusura (25/08/2026)**: il titolare ha confermato via `npm run dev`
in locale — flusso di correzione date e uniformità visiva campo
adulti/date picker entrambi verificati a video, nessun altro problema
segnalato. Punto 1 del piano redesign è completo. Storico completo del
percorso (tre round: implementazione iniziale → fix UX chiusura/due
campi → fix uniformità visiva campo adulti) sopra in questa stessa
sezione. **Prossimo passo**: Punto 2 (audit palette/tipografia/bottoni/
card) — per lo stesso principio operativo già seguito per il Punto 1
(`docs/superpowers/plans/2026-08-24-redesign-visivo-sito.md`, Note
operative), va ri-scopato con una sessione di brainstorming dedicata
prima di scrivere un piano di implementazione, non partire direttamente
dal testo sintetico del piano originale.

## Bloccato su terzi

- Dominio `hoteldelgolfolerici.com`: **AGGIORNATO 24/08/2026** — il
  titolare ha ricevuto il codice di migrazione da LivelloUno (non più
  "in attesa di risposta"), dettaglio completo in
  `gestionale-hotel/STATO_PROGETTO.md` (sezione "Bloccato su terzi").
  Resta da eseguire il trasferimento vero e proprio, e — prima di
  renderlo pubblico — popolare il DB di produzione del gestionale con
  dati reali (vedi stesso file, modulo 4.1): oggi è quasi vuoto, il sito
  diventerebbe pubblico su prezzi/trattamenti non configurati.
- GA4: componente già scritto e montato, manca solo il Measurement ID —
  titolare senza accesso all'account Google al momento del blocco.
- Privacy/cookie policy: testo placeholder, mai passato da un legale o da
  Iubenda — unico costo reale non gratuito di questo backlog (piano
  Essentials, soglia 25.000 pageview/mese, cifra esatta da verificare).

## Item scoperti oggi, da riconciliare col resto della documentazione

- `SPEC_SITO_HOTEL.md` §10 è la fonte più completa e più aggiornata sulla
  decisione WuBook→Beds24 (menziona anche Octorate, assente altrove) —
  propagata oggi in `gestionale-hotel/CLAUDE.md`, `STATO_PROGETTO.md`,
  `docs/EVOLUTIVE.md`.
- `docs/EVOLUTIVE.md` di questo repo aveva un item ancora aperto
  ("disponibilità/prezzo in pagina, Fase 2 su API WuBook") in realtà già
  risolto dal Booking Engine Diretto v2 — corretto oggi.

---

*Creato 23/08/2026, prima versione — vedi la sessione in chat per il
contesto completo di come sono stati trovati questi disallineamenti.*

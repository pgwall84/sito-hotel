# Date range picker con disponibilità aggregata — design

> Sotto-progetto del Punto 1 di
> `docs/superpowers/plans/2026-08-24-redesign-visivo-sito.md`. Tocca DUE
> repository: `gestionale-hotel` (nuovo endpoint) e `sito-hotel` (nuovo
> componente). Nessun `git` da Cowork — consegna via `SendUserFile` +
> `device_commit_files`, commit reali dal tab Code.

## Obiettivo

Sostituire i due `<input type="date">` nativi in `BookingWidget.tsx` con
un vero calendario interattivo che mostra in anticipo, mentre l'utente
sfoglia i mesi, quali notti hanno almeno una tipologia camera disponibile
per il numero di ospiti indicato — esperienza da OTA (Booking.com,
Airbnb), non un date-picker generico. Prima applicazione nel booking
widget; il riuso nella Hero (Punto 6 del piano redesign) è deliberatamente
fuori da questo design, verrà ripreso quando si arriva a quel punto.

## Decisioni prese in fase di brainstorming (24/08/2026)

- **Calendario aggregato, non per tipologia**: un giorno è "disponibile"
  se ALMENO UNA tipologia camera ha posto quella notte — coerente con
  come oggi si cerca sul sito (prima le date, poi si vedono le
  tipologie). Costo noto e accettato: un giorno "verde" non garantisce
  che ogni categoria sia libera, solo che l'hotel ha posto — stesso
  comportamento di Booking.com/Airbnb.
- **Sensibile al numero di ospiti**: il calcolo di disponibilità tiene
  conto di adulti+bambini scelti, non un'occupazione fissa di default.
  Implica che il selettore ospiti e il calendario sono collegati (il
  calendario deve ri-interrogare il nuovo endpoint quando cambia
  l'occupazione), anche restando due componenti visivamente distinti.
- **Libreria pronta** (`react-day-picker`) invece di un componente scritto
  a mano — gestisce da sola tastiera/screen reader, importante per
  l'accessibilità (vedi Punto 5 del piano redesign). Da rivalutare in
  futuro, a sito in produzione, se emergono limiti reali.

## Decisione presa qui, non ancora discussa esplicitamente — da confermare

**Il nuovo endpoint calcola solo disponibilità di inventario (camere non
prenotate, capienza sufficiente), NON le restrizioni di planning-tariffe**
(min_stay/chiuso_arrivo/chiuso_partenza/stop_sell da
`planning_tariffe_giorni`) — quelle sono per tipo_camera+trattamento, e a
questo punto del flusso l'utente non ha ancora scelto un trattamento.
Conseguenza pratica: un giorno può apparire "disponibile" nel calendario e
risultare comunque bloccato (es. min_stay non rispettato) quando si arriva
alla chiamata vera su `/disponibilita` con range e trattamento scelti —
stesso tipo di scostamento già accettato con la scelta "aggregato, non per
tipologia" sopra. Se non va bene, va segnalato prima di passare al piano
di implementazione.

## Architettura

```
sito-hotel                              gestionale-hotel
┌─────────────────────────┐             ┌──────────────────────────────┐
│ DateRangePicker.tsx      │  GET        │ /api/booking-pubblico/       │
│ (components/ui/, nuovo)  │ ──────────► │   disponibilita-mese         │
│ - react-day-picker       │             │ (bookingPubblicoController.js│
│   vestito con lib/theme  │ ◄────────── │   nuova funzione)             │
│ - fetch per mese visibile│  {giorni}   │ - riusa inventario/capienza  │
│ - cache in memoria per   │             │   già scritti per            │
│   mese+occupazione       │             │   disponibilita(), NIENTE    │
└───────────┬───────────────┘             │   calcolo prezzo/derivazione │
            │ onChange(range)             └──────────────────────────────┘
            ▼
  BookingWidget.tsx (esistente, integrazione)
  → alla conferma range, chiamata invariata a
    /api/booking-pubblico/disponibilita (prezzo/tipologie reali)
```

## Contratto del nuovo endpoint (gestionale-hotel)

`GET /api/booking-pubblico/disponibilita-mese`

Query: `anno` (es. 2026), `mese` (1-12), `adulti`, `bambini_eta` — stessa
normalizzazione già usata da `disponibilita()`
(`normalizzaComposizioneOspiti`).

Risposta:
```json
{ "disponibilita": { "2026-09-01": true, "2026-09-02": false, "...": "..." } }
```
Una chiave per ogni notte del mese richiesto. `true` = almeno una
tipologia camera con posto e capienza sufficiente per quella notte;
`false` altrimenti. Nessun prezzo, nessuna tipologia elencata — solo il
booleano, per restare economico da calcolare su un mese intero.

Endpoint pubblico, stesso trattamento di `disponibilita()` (rate limit,
nessuna autenticazione — dato non sensibile).

## Contratto del componente (sito-hotel)

`components/ui/DateRangePicker.tsx` — props: `adulti`, `bambiniEta`,
`value` (range selezionato o vuoto), `onChange`. Internamente: fetch del
mese visibile (e mese successivo, per non far vedere un salto vuoto
scorrendo) all'apertura e a ogni cambio mese/occupazione, con debounce
sui cambi rapidi di occupazione; giorni `false` resi non cliccabili e
visivamente distinti (stile da definire in fase di implementazione con
`lib/theme.ts` — non ancora specificato qui, è dettaglio di
implementazione non di design).

## Gestione errori

Se `disponibilita-mese` fallisce (rete, 500): il calendario degrada a
"nessuna indicazione" — tutti i giorni cliccabili, nessun blocco. Non deve
mai impedire una prenotazione per un guasto di un servizio che è solo un
aiuto visivo. La validazione reale resta quella esistente su
`/disponibilita` al momento della scelta del range.

## Fuori scope di questo design

- Integrazione nella Hero (Punto 6 del piano redesign, sessione separata).
- Visualizzazione prezzo minimo per giorno nel calendario (pattern comune
  nelle OTA, "da 120€") — non richiesto, aggiungerebbe calcolo prezzo al
  nuovo endpoint, in contrasto con la scelta di tenerlo economico.
- Dark mode (escluso dal piano redesign).
- Restrizioni planning-tariffe nel calendario mese (vedi sopra).

## Verifica possibile da questo sandbox

Solo `node -c` sul nuovo endpoint backend ed `esbuild --bundle
--jsx=automatic` sul nuovo componente frontend. Nessun accesso DB, nessuna
verifica visiva reale, nessuna esecuzione di test automatici — il gate di
completamento è il controllo a video del titolare, coerente col piano
redesign.

## Evolutiva da segnalare (richiesta esplicita del titolare)

Il nuovo endpoint `disponibilita-mese` va registrato in
`gestionale-hotel/docs/EVOLUTIVE.md` come intervento non banale sul
backend — non è "solo un componente frontend", tocca inventario/capienza
su un repository diverso da quello del redesign visivo. Da fare quando si
scrive il piano di implementazione (prossimo passo).

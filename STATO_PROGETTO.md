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

## Bloccato su terzi

- Dominio `hoteldelgolfolerici.com`: non ancora collegato a Vercel — il
  titolare non può ancora spostarlo (LivelloUno, `clientTransferProhibited`),
  mail inviata, in attesa di risposta. Blocca in cascata: comunicazione
  pubblica del sito, SEO, GA4, Iubenda. **Non riproporre finché non lo
  riporta il titolare** (vedi memoria di progetto).
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

# To Do List — Hotel del Golfo (sito web)

> Elenco puntato di lettura rapida, versione sintetica di
> `STATO_PROGETTO.md` e `docs/EVOLUTIVE.md` — quelli restano la fonte di
> dettaglio tecnico. Questo file va tenuto aggiornato insieme agli altri
> documenti di progetto ad ogni sessione in cui si chiude o si apre un
> punto.
>
> Ultimo aggiornamento: 30/08/2026.

## Fix e verifiche da chiudere (piccole, non nuovo sviluppo)

- Sito in pausa: fermo ogni ulteriore lavoro sul redesign finché Marco
  non carica contenuti reali su Sanity (0 documenti tipo `escursione`
  oggi, la sezione Esperienze gira su placeholder hardcoded).
- Checkpoint dell'audit accessibilità (27/08) da verificare a video:
  anello di focus visibile navigando a Tab e che sparisce al click
  mouse; `accentDeep`/`textLight` visivamente accettabili; nel
  date-picker il focus torna al bottone giusto dopo Escape o una
  selezione completata; Lighthouse/axe (serve un browser reale).
- Residuo minore del piano redesign: Punto 6 (hero video, opzionale,
  dipende dalle foto reali) e Punto 7 (filtri istantanei, esplicitamente
  da non pianificare ora).
- Bloccato su terzi: trasferimento dominio `hoteldelgolfolerici.com`
  (codice di migrazione già ricevuto, resta da eseguire); GA4 manca il
  Measurement ID; privacy/cookie policy ancora testo placeholder, mai
  passato da un legale o da Iubenda.

## Evolutive da sviluppare (feature nuove, serve brainstorming dedicato)

- Pagina vera di prenotazione/richiesta info per la degustazione pesto —
  oggi solo un `mailto:` (sia in home in `EsperienzeInEvidenza.tsx` sia
  su `/esperienze`).
- Punto 2 del piano redesign: audit palette/tipografia/bottoni/card per
  coerenza tra tutte le pagine — da ri-scopare con brainstorming
  dedicato quando si riprende (non partire da un piano diretto).
- Integrazione Nexi XPay Pro: raccogliere paese/residenza dell'ospite in
  `components/booking/BookingWidget.tsx` — parte del brainstorming
  cross-repo con gestionale-hotel (vedi `to do list.md` di quel repo).

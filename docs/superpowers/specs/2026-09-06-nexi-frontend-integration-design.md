# Integrazione frontend Nexi XPay Build nel Booking Engine Diretto — Design Spec

## Contesto

Il backend (`gestionale-hotel`) supporta da settembre 2026 uno switch tra Stripe e Nexi XPay Build come provider di pagamento attivo per la caparra del 30% (`PAYMENT_PROVIDER`, vedi `gestionale-hotel/docs/superpowers/specs/2026-09-02-payment-provider-switch-design.md`). Il frontend (`sito-hotel`) è rimasto esplicitamente fuori da quel piano: oggi `BookingWidget.tsx`/`PaymentStep.tsx` sanno parlare solo con la forma di risposta Stripe (`client_secret`) — se il backend avesse `PAYMENT_PROVIDER=nexi` attivo, il campo `pagamento_nexi` restituito da `POST /prenota` non verrebbe mai letto e il pagamento non potrebbe essere completato dal sito.

Esiste già, non linkata dal sito pubblico, una pagina di test completa e verificata dell'integrazione client-side XPay Build: `app/[locale]/xpay-test/page.tsx` (riscritta il 31/08/2026, testata con successo in sandbox il 01-02/09/2026). Copre: caricamento dinamico dello script SDK, `XPay.init()`/`setConfig()`/`create()`/mount, doppio canale di ricezione del nonce (evento `XPay_Nonce` + `postMessage` con controllo origin, necessario perché Nexi consegna l'esito via `postMessage` nonostante la documentazione descriva solo l'evento), guardia anti-doppio-caricamento per React Strict Mode. Questo piano generalizza quella logica per il flusso di prenotazione reale, non la riscrive da zero.

## Scope

**Dentro:**
- Nuovo componente `NexiPaymentStep.tsx`, parallelo a `PaymentStep.tsx` esistente, che adatta la logica di `xpay-test/page.tsx` per consumare `POST /prenota` (campo `pagamento_nexi`) e `POST /completa-pagamento-nexi` invece degli endpoint di test.
- `BookingWidget.tsx`: il tipo `PrenotazioneCreata` diventa un'unione (`client_secret` | `pagamento_nexi`); la scelta di quale step di pagamento montare si fa guardando quale campo è presente nella risposta di `/prenota`, non leggendo `provider` da `/configurazione` a parte.
- Nuovo componente condiviso `ConfermaPrenotazione.tsx`: schermata di chiusura (non una pagina/URL nuova — uno stato dentro lo stesso flusso, come oggi con Stripe) con numero prenotazione, riepilogo (camera/date/trattamento, già noti a `BookingWidget` prima della chiamata a `/prenota`, nessuna nuova fetch), importo pagato e saldo da pagare in hotel. Usata da entrambi i provider, con testo diverso in base a cosa il client sa per certo in quel momento (vedi sotto).
- Setup e verifica del test in locale: `sito-hotel` che punta al backend `gestionale-hotel` in esecuzione locale, per entrambi i provider.

**Fuori scope, esplicito:**
- Preautorizzazione vs addebito 30% e la logica di scelta tra i due (piano separato, precedente a questo nella sequenza ma non bloccante).
- Retry del pagamento Nexi sulla stessa prenotazione dopo un rifiuto (KO) — **evoluzione futura**, segnata esplicitamente: oggi su KO non c'è modo di riusare lo stesso `pagamento`/`transactionId` per un secondo tentativo (il backend richiede uno stato `pending`, che dopo un KO diventa `fallito`). Se in pratica i rifiuti si rivelano frequenti, si valuterà un endpoint dedicato per rigenerare l'avvio pagamento sulla stessa prenotazione finché l'hold non scade.
- Tutto ciò che riguarda la produzione (credenziali Nexi di produzione, deploy, configurazione ambiente) — vedi la roadmap generale già condivisa.

## Architettura

### Scelta del provider lato client

`BookingWidget.tsx` non decide a priori quale componente di pagamento montare leggendo un campo `provider` — decide guardando la risposta di `POST /prenota`: se contiene `client_secret` monta `PaymentStep`, se contiene `pagamento_nexi` monta `NexiPaymentStep`. Questo evita di duplicare la logica di selezione provider già presente lato backend (`lib/payments/index.js`) e resta corretto anche se il campo `provider` di `/configurazione` e la risposta di `/prenota` fossero letti in momenti diversi (cutover a metà flusso).

```
type PrenotazioneCreata =
  | { prenotazione_id: number; importo_caparra: number; client_secret: string; scadenza_hold: string }
  | { prenotazione_id: number; importo_caparra: number; pagamento_nexi: DatiPagamentoNexi; scadenza_hold: string };
```

### `NexiPaymentStep.tsx`

Stessa struttura a due livelli di `xpay-test/page.tsx`: un componente esterno che riceve `pagamento_nexi` (alias, environment, scriptSrc, transactionId, timeStamp, mac, amount, currency — stessa forma già consumata dalla pagina di test) più `prenotazioneId` e i dati di riepilogo; carica lo script SDK, registra i listener (`XPay_Ready`, `XPay_Card_Error`, `XPay_Nonce`, `message` con controllo origin) una sola volta al mount, monta l'elemento carta. Al nonce ricevuto chiama `POST /completa-pagamento-nexi` con `{ prenotazione_id, xpay_nonce }` invece di `/xpay-test/paga-nonce`.

Le URL richieste da `XPay.setConfig` (`url`/`url_back`/`urlPost`) — ignorate dall'SDK per il tipo carta, obbligatorie solo per validazione di formato — puntano alla pagina di prenotazione reale invece che a `xpay-test`, per correttezza anche se non hanno effetto funzionale oggi.

Gestione esiti di `/completa-pagamento-nexi`:
- `{ confermato: true }` → monta `ConfermaPrenotazione` con esito "confermata" (risposta sincrona, si può dichiarare la conferma con certezza).
- `{ confermato: false, esito }` (KO) → messaggio di rifiuto inline, nessun retry (vedi Scope), il form resta chiuso.
- `{ confermato: false, richiede_intervento_manuale: true }` → messaggio distinto e onesto: pagamento avvenuto ma conferma non automatica, contatto da parte dell'hotel — mai presentato come un generico errore, perché qui i soldi sono davvero passati.

### `ConfermaPrenotazione.tsx`

Componente presentazionale puro, nessuna chiamata API propria. Riceve via props: `prenotazioneId`, riepilogo soggiorno (camera, date, trattamento — dallo stato già presente in `BookingWidget` prima della chiamata a `/prenota`), `importoPagato`, `saldoDaPagare` (prezzo totale del soggiorno, già noto a `BookingWidget` dalla ricerca disponibilità, meno `importoPagato`), ed `esito`: `'confermata' | 'in_attesa_conferma' | 'richiede_intervento_manuale'`.

Testo per esito:
- `confermata` (solo Nexi, risposta sincrona) → "Prenotazione confermata."
- `in_attesa_conferma` (Stripe, sempre — la conferma reale arriva dal webhook lato server, non dalla risposta del browser) → "Pagamento ricevuto, confermiamo a breve via email." — stesso principio già in `PaymentStep.tsx` oggi, nessun cambiamento di sostanza.
- `richiede_intervento_manuale` (solo Nexi) → messaggio dedicato come sopra.

Il riepilogo dettagliato (importi, condizioni) resta comunque nell'email di conferma già esistente — questa schermata non deve essere esaustiva, solo rassicurante e con i numeri essenziali.

### `PaymentStep.tsx` esistente

Nessuna modifica alla logica di pagamento Stripe. Cambia solo cosa succede a `stripe.confirmPayment` riuscito: invece del paragrafo statico attuale, monta `ConfermaPrenotazione` con `esito='in_attesa_conferma'` — stesso comportamento percepito, presentazione unificata con il percorso Nexi.

## Test in locale

- `sito-hotel` in locale: `NEXT_PUBLIC_GESTIONALE_API_URL=http://localhost:7001` (o la porta reale del backend locale) in `.env.local` — stesso fallback già presente in `xpay-test/page.tsx`.
- `gestionale-hotel` in locale: nessuna modifica CORS necessaria, `routes/bookingPubblico.js` consente già qualunque origine fuori produzione. `PAYMENT_PROVIDER=stripe` o `nexi` in `backend/.env` sceglie quale percorso si sta testando; le credenziali Nexi di test (`XPAY_BUILD_ALIAS`, `XPAY_BUILD_MAC_KEY`) sono già presenti.
- Verifica manuale prevista (parte del piano di implementazione, non automatizzabile): una prenotazione reale end-to-end per ciascun provider, controllando che la riga arrivi nel gestionale (planning, stato prenotazione, riga `pagamenti`) esattamente come già verificato lato backend con Stripe.
- **Da verificare per primo, non assunto:** se l'SDK XPay Build richiede HTTPS per completare davvero un pagamento anche in ambiente di test, o se `http://localhost` è sufficiente. Se richiede HTTPS, serve un tunnel locale (es. un proxy TLS di sviluppo) prima di poter testare Nexi end-to-end in locale — la pagina `xpay-test` esistente non ha ancora chiarito questo punto perché finora è stata usata su un dominio già HTTPS.

## Decisioni rimandate

- **Retry pagamento Nexi su rifiuto**: evoluzione futura esplicita (vedi Scope), non in questo piano.
- **Pagina di conferma come URL dedicato** (es. `/prenota/conferma/:id`, linkabile da un'email): scartata per ora — resta uno stato dentro lo stesso flusso, perché il riepilogo completo viaggia comunque via email.

## Nota sul processo di questa sessione

Scritta da una sessione Cowork, che non esegue operazioni git mutanti (vedi vincolo generale già in uso su `gestionale-hotel`) — il commit di questo file va fatto da Marco o dalla sessione parallela "Code tab".

# Welcome Book digitale — redesign (modulo 4.2)

Data: 16/08/2026 (aggiornato: farmacie/emergenza, orariColazione, redesign
LuogoCard con categoria/icona/indirizzo/bottone maps esterno)
Repo: `sito-hotel`
Stato: design approvato dal titolare in sessione di brainstorming. Contenuti
reali per alcune sezioni (Emergenza, Trasporti, Attività, Informazioni) in
arrivo dal titolare via documento Word, in due parti — **piano di
implementazione in attesa della seconda parte** prima di essere chiuso in
via definitiva.

## 1. Contesto

Il modulo 4.2 (Welcome Book digitale) esiste già in produzione, non parte
da zero: hub `/[locale]/benvenuto` con griglia di pulsanti e 6 sottopagine
(Orari, Wifi, Regole, Ristorante, Contatti, Lerici), contenuti pilotati da
Sanity CMS con fallback multilingua (it/en/de/fr). Il titolare ha chiesto
di espanderlo a 15 sezioni e di dargli una navigazione dedicata, pensata
per l'uso da smartphone di un ospite in struttura — oggi eredita l'header/
footer del sito pubblico (menu completo, CTA "Prenota ora"), pensati per
un visitatore che deve ancora decidere se prenotare, non per chi è già
ospite.

Obiettivo: un link unico (via SMS/WhatsApp/email o QR in camera — il
cartellino fisico esiste già, `gestionale-hotel/docs/welcome-book-
cartellino.pdf`, punta a `/it/benvenuto`) che porta a un "libretto"
digitale con 15 sezioni, navigabile a pulsanti anche da chi non conosce il
sito, con suggerimenti locali corredati di numero di telefono reale e
mappa geolocalizzata reale — non testo generico.

## 2. Le 15 sezioni (decise in sessione)

1. **Benvenuto** — hub (esiste, da ristrutturare nel layout)
2. **Check-in** (split da "Orari", esiste come parte di quella pagina)
3. **Wifi** (esiste)
4. **Regole** (esiste)
5. **Posizione** — sostituisce "Lerici": indirizzo hotel + mappa +
   indicazioni per arrivare + breve presentazione del borgo. I consigli
   che oggi vivono in "Lerici" si distribuiscono nelle sezioni nuove sotto
   (Attività/Ristoranti/Shopping), dove hanno più senso specifico.
6. **Trasporti** (nuova)
7. **Servizi** (nuova — servizi/comfort dell'hotel: parcheggio, noleggio
   bici, lavanderia, ecc.)
8. **Attività** (nuova — cose da fare: spiaggia, escursioni, Cinque Terre,
   noleggio barche)
9. **Ristoranti** — fonde l'attuale "Ristorante" (quello dell'hotel, in
   evidenza in cima con link al menu, dati già letti da
   `getSezioneRistorante`) con nuovi consigli esterni curati dal titolare
10. **Bar** (nuova)
11. **Shopping** (nuova)
12. **Informazioni** (nuova — pratiche: banca/bancomat, supermercati con
    orari, chiese con orari funzioni, stazione di servizio, raccolta
    rifiuti — catch-all pratico, non regole della casa. Diventa
    `array of luogo` come le altre sezioni, non più lista di testo: vedi
    4.1/4.2)
13. **Emergenza** (nuova, separata da Contatti — numeri di vera urgenza:
    112, 1530, pronto soccorso, forze dell'ordine, guardia costiera,
    ciascuno con indirizzo reale. Le farmacie **non** sono un "di turno"
    calcolato: il titolare ha materiale con 4 farmacie fisse a orario
    stagionale/settimanale proprio, senza calendario dei turni — si
    elencano tutte e 4, ciascuna col proprio orario in `nota`. Il modello
    `luogo` già previsto regge così com'è, nessuna modifica di schema)
14. **Check-out** (split da "Orari")
15. **Contatti** (esiste — reception + numeri utili non urgenti, invariata)

## 3. Architettura

### 3.1 Route group (decisione presa in sessione, motivata da
sicurezza/accessibilità, non solo dimensione del diff)

```
app/[locale]/
  layout.tsx                    ← ridotto: solo <html><body>, font,
                                   NextIntlClientProvider, GoogleAnalytics,
                                   CookieConsentInit (resta qui: MapEmbed,
                                   usato anche nel welcome book, dipende dal
                                   consenso cookie funzionale — deve restare
                                   disponibile ovunque)
  (public)/
    layout.tsx                  ← NUOVO: Header, Footer, WhatsAppButton
                                   (spostati qui dal layout radice)
    page.tsx                    ← home, spostata da app/[locale]/page.tsx
    camere/, contatti/, cookie-policy/, esperienze/, galleria/, lavoro/,
    lerici/, offerte/, privacy-policy/, ristorante/
                                 ← spostate qui, contenuto invariato
  (benvenuto)/
    benvenuto/
      layout.tsx                 ← NUOVO: <BenvenutoTopBar>, niente Header/
                                    Footer/WhatsAppButton pubblici
      page.tsx                   ← hub, ristrutturato (vedi 3.3)
      checkin/page.tsx            ← NUOVA (split da orari/)
      checkout/page.tsx           ← NUOVA (split da orari/)
      wifi/page.tsx                ← invariata (solo la barra di navigazione cambia, via layout)
      regole/page.tsx              ← invariata
      posizione/page.tsx           ← NUOVA (sostituisce lerici/)
      trasporti/page.tsx           ← NUOVA
      servizi/page.tsx             ← NUOVA
      attivita/page.tsx            ← NUOVA
      ristoranti/page.tsx          ← rinominata da ristorante/, estesa (vedi 2.9)
      bar/page.tsx                 ← NUOVA
      shopping/page.tsx            ← NUOVA
      informazioni/page.tsx        ← NUOVA
      emergenza/page.tsx           ← NUOVA
      contatti/page.tsx            ← invariata
    (orari/ e lerici/ rimosse — contenuto assorbito da checkin+checkout e posizione)
```

I route group (`(public)`, `(benvenuto)`) sono invisibili nell'URL — `/it/
camere` e `/it/benvenuto/wifi` restano identici a oggi, zero impatto SEO/
QR già stampato. Il sito non è ancora live/indicizzato: momento giusto per
questo spostamento, molto più economico ora che con storico reale.

Route rinominate (`ristorante`→`ristoranti`, `lerici`→`posizione`,
`orari`→`checkin`+`checkout`): gli URL cambiano. Essendo tutte pagine
`noindex`/fuori sitemap, non c'è impatto SEO; l'unico link esterno reale è
il QR del cartellino, che punta a `/it/benvenuto` (l'hub, invariato) — le
sottopagine non sono linkate da nessuna parte fuori dal sito stesso.

### 3.2 Componenti nuovi

- **`BenvenutoTopBar`** (`components/layout/BenvenutoTopBar.tsx`, client
  component): barra sticky, tre zone — sinistra pulsante "← Menu" (Link a
  `/benvenuto`), centro titolo pagina corrente (prop `titolo`, passato da
  ogni `generateMetadata`/pagina), destra `LinguaSelector` (riuso diretto,
  nessuna modifica). Sull'hub stesso (`/benvenuto`), niente "← Menu" (non
  c'è dove tornare) — la riga superiore lì è invece il banner di benvenuto
  + `LinguaSelector`, non la topbar delle sottopagine. Styling: solo
  classi Tailwind già in uso nel resto del repo (`bg-background`,
  `text-primary`, `border-border`, ecc.), niente colori hardcoded — coerente
  con la convenzione `lib/theme.ts` di CLAUDE.md Sezione 3.
- **`LuogoCard`** (`components/ui/LuogoCard.tsx`, **redesign 16/08/2026**):
  scheda per un singolo "luogo" (vedi 4.1), layout a righe:
  1. riga icona (mappata da `categoria`, vedi sotto) + `nome`
  2. riga `indirizzo` (se presente)
  3. riga `nota` (se presente) — es. "a 7 minuti a piedi"
  4. riga pulsanti: telefono (icona cliccabile, se `telefono` presente) +
     "Apri in Google Maps" (icona/pulsante a destra, se lat/lon presenti —
     link `https://www.google.com/maps/search/?api=1&query={lat},{lon}`,
     fallback su `indirizzo` se lat/lon assenti ma indirizzo presente)
  Niente `MapEmbed` incorporato in questa card (vedi motivazione sotto) —
  solo link esterno, apre l'app Google Maps del telefono con navigazione
  vera. Il tap sull'icona telefono apre un piccolo dialog di conferma
  ("Chiamare {nome}, {telefono}?" / Annulla / Chiama) prima di innescare
  `tel:` — evita chiamate accidentali da un tap impreciso su mobile. Ogni
  campo assente non renderizza nulla (stesso pattern `infoNonDisponibile`
  già in uso), mai una scheda con un buco visivo.

  **Perché bottone esterno e non `MapEmbed` incorporato in questa card**:
  `MapEmbed` è dietro il consenso cookie funzionale — un ospite che apre il
  link appena ricevuto e non ha ancora accettato i cookie vedrebbe un
  placeholder "accetta i cookie" proprio mentre cerca indicazioni, l'attrito
  peggiore possibile in quel momento. Un link esterno non richiede consenso
  e apre navigazione vera (l'iframe incorporato non naviga). Con 15 sezioni
  piene di card, evitare un iframe per card evita anche di appesantire il
  caricamento su rete mobile d'albergo. `MapEmbed` resta comunque in uso
  altrove: la pagina **Posizione** (2.5) mostra un'unica mappa incorporata
  per l'hotel stesso, dove ha senso vederla subito senza uscire dal sito.

  **Icone per categoria**: set fisso, non immagini caricate dal titolare —
  coerenza visiva garantita, nessun rischio di stile disomogeneo tra
  card. In Sanity il titolare sceglie `categoria` da una tendina; il codice
  mappa ogni valore a un'icona `lucide-react` (già in uso nel repo, nessuna
  nuova dipendenza):

  | categoria           | icona lucide-react |
  |----------------------|---------------------|
  | farmacia             | `Pill`              |
  | banca-bancomat       | `Landmark`          |
  | supermercato         | `ShoppingCart`      |
  | chiesa                | `Church`           |
  | benzina               | `Fuel`             |
  | taxi                  | `Car`              |
  | bus                   | `Bus`              |
  | traghetto              | `Ship`            |
  | navetta                | `Bus`             |
  | ascensore               | `ArrowUpDown`    |
  | ristorante               | `UtensilsCrossed` |
  | bar                       | `Coffee`        |
  | negozio                    | `ShoppingBag`  |
  | spiaggia                    | `Umbrella`    |
  | noleggio-attivita             | `Compass`   |
  | soccorso                       | `Siren`    |
  | forze-ordine                    | `Shield`  |
  | guardia-costiera                 | `Anchor` |
  | comune-turismo                    | `Info` |
  | altro (fallback)                   | `MapPin` |

  Elenco iniziale, coerente coi contenuti già noti (docx del titolare +
  sezioni previste); estendibile in futuro aggiungendo un valore alla
  tendina Sanity e la riga corrispondente nella mappa icone — non è un
  cambio di schema che rompe nulla, solo un'aggiunta.
- **`BenvenutoTile`** (esiste, `components/ui/BenvenutoTile.tsx`): solo
  restyling per stare in 3 colonne fisse anche su mobile con 15 voci
  invece di 6 (icona e testo più compatti).

### 3.3 Hub (`/benvenuto`)

Riga superiore: messaggio di benvenuto (Sanity, invariato) +
`LinguaSelector` nello stesso banner. Sotto: griglia `grid-cols-3` fissa
(oggi è `grid-cols-2 sm:grid-cols-3`), 15 `BenvenutoTile`.

## 4. Modello dati Sanity

### 4.1 Nuovo tipo oggetto riusabile `luogo`

```ts
// sanity/schemaTypes/objects/luogo.ts
defineType({
  name: "luogo",
  title: "Luogo / consiglio",
  type: "object",
  fields: [
    defineField({ name: "nome", title: "Nome", type: "localeString" }),
    defineField({
      name: "categoria",
      title: "Categoria (icona)",
      type: "string",
      options: {
        list: [
          { title: "Farmacia", value: "farmacia" },
          { title: "Banca / Bancomat", value: "banca-bancomat" },
          { title: "Supermercato", value: "supermercato" },
          { title: "Chiesa", value: "chiesa" },
          { title: "Stazione di servizio", value: "benzina" },
          { title: "Taxi", value: "taxi" },
          { title: "Bus", value: "bus" },
          { title: "Traghetto", value: "traghetto" },
          { title: "Navetta", value: "navetta" },
          { title: "Ascensore pubblico", value: "ascensore" },
          { title: "Ristorante", value: "ristorante" },
          { title: "Bar", value: "bar" },
          { title: "Negozio", value: "negozio" },
          { title: "Spiaggia", value: "spiaggia" },
          { title: "Attività / Noleggio", value: "noleggio-attivita" },
          { title: "Soccorso / Emergenza", value: "soccorso" },
          { title: "Forze dell'ordine", value: "forze-ordine" },
          { title: "Guardia costiera", value: "guardia-costiera" },
          { title: "Comune / Turismo", value: "comune-turismo" },
          { title: "Altro", value: "altro" },
        ],
      },
    }),
    defineField({ name: "indirizzo", title: "Indirizzo", type: "string" }),
    defineField({ name: "nota", title: "Nota breve", type: "localeText" }),
    defineField({ name: "telefono", title: "Telefono", type: "string" }),
    defineField({ name: "lat", title: "Latitudine", type: "number" }),
    defineField({ name: "lon", title: "Longitudine", type: "number" }),
    defineField({ name: "link", title: "Link (sito o Google Maps)", type: "url" }),
  ],
})
```

Tutti i campi opzionali tranne `nome`. `lat`/`lon` vanno insieme (validazione
Sanity: se uno è valorizzato, richiedere anche l'altro) o niente — mai una
mappa con una sola coordinata. `categoria` senza valore → icona fallback
`MapPin` (`altro`), mai una card senza icona.

### 4.2 Nuovi campi su `welcomeBook`

- `posizioneLat` / `posizioneLon` (number) — coordinate dell'hotel, punto
  fisso, non un array di luoghi.
- `posizioneTesto` (localeText) — presentazione breve del borgo (sostituisce
  il ruolo che oggi ha `consigliLerici`/`consigliLericiTitolo`, che vengono
  rimossi dallo schema — contenuto da ricreare in Sanity dal titolare, non
  migrato automaticamente: erano solo 3-4 frasi generiche, non dati
  strutturati da preservare).
- `trasporti`, `servizi`, `attivita`, `ristorantiEsterni`, `bar`,
  `shopping`, `emergenza` — ciascuno `array of luogo`.
- `informazioni` — **corretto 16/08/2026**: `array of luogo` (non più
  `array of localeString`) — banca/bancomat, supermercati con orari,
  chiese con orari funzioni, benzinai hanno indirizzo/nota/mappa come
  gli altri "luoghi", non sono testo semplice. Una nota pratica senza
  luogo fisico (es. "la raccolta rifiuti passa il martedì") resta comunque
  rappresentabile: basta un `luogo` con solo `nome`/`nota` valorizzati,
  tutti gli altri campi assenti — la card non renderizza le righe vuote.

Campi lasciati invariati: `titoloBenvenuto`, `messaggioBenvenuto`,
`wifiNome`, `wifiPassword`, `orariCheckin`, `orariCheckout`,
`orariColazione`, `regoleCasa`, `numeriUtili`.

**Confermato dal titolare**: `orariColazione` si mostra nella pagina
Servizi (non Check-in), insieme a parcheggio/bici/lavanderia — nessuno
spostamento di dato, solo la pagina che lo legge cambia.

## 5. i18n

Nuove chiavi nel namespace `BenvenutoPage` (in tutti e 4 i file
`messages/*.json`): titoli delle 9 sezioni nuove + "Check-in"/"Check-out"
separati, più eventuali default (`*Default`) per le sezioni a lista
semplice (`informazioniDefault`), sul modello di `regoleDefault` già
esistente. Le sezioni con `luogo[]` non hanno default testuali — se vuote,
mostrano `infoNonDisponibile` (stesso pattern già in uso).

## 6. Fuori scope (esplicitamente escluso da questo giro)

- Scrivere i contenuti reali direttamente nei documenti Sanity — resta
  compito del titolare, in Sanity Studio, dopo la consegna tecnica.
  **Aggiornamento 16/08/2026**: il titolare sta fornendo materiale reale
  (numeri, indirizzi, coordinate, PDF ufficiali) per Emergenza, Trasporti,
  Attività e Informazioni, in due parti via documento Word — resta comunque
  fuori dallo scope tecnico *l'inserimento* in Sanity, ma rientra nello
  scope la **preparazione di un content-brief pronto da incollare**
  (testi puliti, link corretti, coordinate quando disponibili) consegnato
  insieme al lavoro tecnico. Nessun contenuto viene inventato: solo
  riorganizzato/ripulito da quanto fornito (es. link `chrome-extension://`
  ripuliti nell'URL reale che contenevano).
- Cambiare il dominio/QR fisico (resta il cartellino provvisorio Vercel,
  già segnalato come "da rifare" nel PDF stesso — non responsabilità di
  questo lavoro).
- Una sezione impostazioni per configurare quali sezioni mostrare/
  nascondere — oggi fisse a 15, se in futuro serve renderle
  attivabili/disattivabili è un'evolutiva a parte.

## 7. Verifica prevista

Nessun framework di test automatico in questo repo (`package.json`: solo
`build`/`lint`, niente Jest/Vitest/Playwright). Verifica prima della
consegna:
- `npm run build` (Next.js, include type-check) pulito
- `npm run lint` pulito
- verifica visiva di ogni sezione su viewport 375px (iPhone SE) — 3
  colonne leggibili con 15 tile, `BenvenutoTopBar` non tronca titoli lunghi
- verifica che nessuna pagina sotto `(benvenuto)` erediti Header/Footer
  pubblici (conferma strutturale della separazione dei route group)
- verifica `robots: noindex/nofollow` preservato su ogni sottopagina dopo
  lo spostamento (si perde facilmente se si copia `generateMetadata` senza
  attenzione)

## 8. Rischi noti (chiariti col titolare, 16/08/2026)

- Rinominare `ristorante`→`ristoranti` e `lerici`→`posizione` cambia gli
  URL di quelle due sottopagine. **Confermato dal titolare**: solo il
  link/QR dell'hub (`/benvenuto`, invariato) è mai stato condiviso, nessun
  link diretto alle sottopagine è in circolazione — nessun redirect
  necessario.
- Rimuovere `consigliLerici`/`consigliLericiTitolo` dallo schema Sanity.
  **Confermato dal titolare**: il campo è ancora vuoto/bozza, nessun
  contenuto reale da esportare prima della rimozione.

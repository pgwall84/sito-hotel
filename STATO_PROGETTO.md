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

**Punto 2 (coerenza visiva) — in corso, primo piano (Button) CHIUSO
(26/08/2026).** Spec:
`docs/superpowers/specs/2026-08-26-coerenza-visiva-design.md` (approvata
dal titolare dopo audit di tutte le 24 pagine e i 34 componenti del sito).
Primo piano di implementazione: `docs/superpowers/plans/
2026-08-26-button-condiviso.md`, eseguito il 26/08/2026:

- **Nuovo componente** `components/ui/Button.tsx` — 5 varianti
  (`primary`, `accent`, `outline-primary`, `outline-white`,
  `solid-white-accent`, dedotte da usi reali già presenti nel sito, non
  inventate) e 2 taglie (`grande` px-7/py-3, `compatta` px-5/py-2.5).
  Espone anche `buttonClasses(variant, size)` per i call site che
  passano già da `BookingButton` (che ha una propria logica di
  routing/fallback TeamSystem — non va innestata dentro un secondo
  componente polimorfo).
- **9 call site migrati**: `Header.tsx` (CTA "Prenota" desktop e
  mobile — eliminata la divergenza: la mobile non aveva
  `hover:bg-primaryLight`/`transition-colors`, ora identica alla
  desktop; entrambe unificate su `py-2.5`, la maggioranza tra le 3
  varianti trovate dall'audit), `Hero.tsx` (CTA primaria accent + CTA
  secondaria outline bianco), i 3 form (`ContattoForm`,
  `ConvenzioneForm`, `PrenotazioneTavoloForm`, bottone di invio),
  `LavoroBanner.tsx` (outline navy), `PestoHighlight.tsx` (bianco pieno
  su sfondo accent), `OffertaCard.tsx` (**cambio colore da primary ad
  accent** — nuova regola CTA approvata dal titolare: primary/navy per
  azioni funzionali, accent/terracotta per azioni calde/promozionali
  come le offerte).
- **Nota per il titolare**: il cambio colore su `OffertaCard` non è
  verificabile a video finché non viene aggiunta un'offerta di prova in
  Sanity — oggi `/offerte` mostra lo stato vuoto (zero offerte
  configurate).
- **Deviazione dichiarata dalla spec**: questo piano non include
  l'estensione di `lib/theme.ts` (colore `error`, scala titoli) che la
  spec raggruppava nella stessa fase — nessun consumatore in questo
  piano, rimandata ai piani successivi che li useranno davvero (colore
  errore nel piano booking/pagamento, scala titoli nello sweep finale).
- **Verificato da questa sessione Cowork**: `npx tsc --noEmit` reale sui
  9 file toccati (zero errori nuovi — solo gli errori pre-esistenti
  attesi per moduli non installati nel mirror parziale di Cowork:
  `next-intl`, `next/image`, `@/lib/i18n/*`) ed `esbuild --bundle
  --jsx=automatic` con quei moduli esternalizzati (zero errori, bundle
  prodotto per tutti e 9 i file). **Nessuna verifica visiva reale
  possibile da qui** (nessun browser): resta da fare `npm run dev` in
  locale — controllare Header (desktop e mobile, hover uniforme), Hero
  (due bottoni), le 3 pagine con i form, la sezione "Lavoro con noi" e
  quella "Pesto" in home. Il fix su `OffertaCard` richiede prima
  un'offerta di prova in Sanity, come sopra.
- **Bug trovato dal titolare eseguendo per davvero `npm run dev`
  (26/08/2026, stesso giorno)**: errore runtime `Attempted to call
  buttonClasses() from the server but buttonClasses is on the client`.
  Causa: `buttonClasses` viveva dentro `Button.tsx`, che ha
  `"use client"` per il componente `<Button>` vero e proprio (routing
  interattivo) — questo rendeva l'intero modulo un confine client per
  il bundler RSC di Next.js, e `Hero.tsx` (Server Component) la
  chiamava come funzione pura in fase di render server. Diagnosi
  precisa fatta dal titolare, non da questa sessione. Verificato anche
  `OffertaCard.tsx`: stesso bug latente (Server Component, stessa
  chiamata diretta a `buttonClasses`), non ancora manifestato solo
  perché `/offerte` è vuota e quel codice non viene mai eseguito.
  **Fix**: `buttonClasses` estratta in un nuovo modulo puro
  `components/ui/buttonClasses.ts`, senza `"use client"`. `Button.tsx`
  la importa da lì per uso interno; `Hero.tsx`, `Header.tsx`,
  `OffertaCard.tsx` aggiornati per importarla direttamente dal nuovo
  modulo (mai più da `Button.tsx`, che essendo `"use client"` resta un
  confine client anche per i suoi re-export). Verificato di nuovo:
  `tsc --noEmit` + `esbuild --bundle` su tutti i file coinvolti, zero
  errori nuovi. **Nessuna verifica runtime reale possibile da qui** —
  resta da confermare con un nuovo `npm run dev` che l'errore non si
  ripresenti.
- **Checkpoint chiuso (26/08/2026)**: titolare ha confermato via
  `npm run dev` reale — nessun errore RSC dopo il fix, cambiamenti
  visivi minimi come atteso (l'obiettivo era uniformare stili già
  esistenti, non un redesign — poco visibile è il segnale che ha
  funzionato, non che sia stato fatto poco). Resta non verificato solo
  il colore di `OffertaCard` (serve un'offerta di prova in Sanity).
**Secondo piano (Card) CHIUSO (26/08/2026).** Piano di implementazione:
`docs/superpowers/plans/2026-08-26-card-condivisa.md`, eseguito lo stesso
giorno:

- **Nuovo componente** `components/ui/Card.tsx` — guscio fisico condiviso
  con 2 prop esplicite: `conFoto` (obbligatoria, nessun default — vero per
  card con foto/fallback a gradiente in testa: niente bordo,
  `overflow-hidden` per ritagliare l'immagine; falso per card senza foto:
  `border border-border`, niente `overflow-hidden`) e `hover` (opzionale,
  default falso — `hover:shadow-cardHover` solo se la card, o il suo
  contenuto principale, è cliccabile/link). Radius `rounded-lg` e
  `bg-background`/`shadow-card` sempre presenti. Dispatch polimorfo
  `div`/`Link` (next-intl) identico nel principio a `Button.tsx` — con
  `href !== undefined` per la narrowing, stesso fix già imparato nel piano
  Button. **Niente `"use client"` e niente modulo `cardClasses.ts`
  separato**, a differenza di `buttonClasses.ts`: `Card` non ha hook né
  logica invocata come funzione pura fuori da JSX (ogni call site la usa
  sempre come `<Card>`), quindi il rischio RSC incontrato con
  `buttonClasses` qui non si pone.
- **6 migrazioni**: `CameraCard.tsx` e `OffertaCard.tsx` (`conFoto hover`,
  nessun cambio visivo atteso — il bottone interno di `OffertaCard`,
  già migrato al piano precedente, non è stato toccato), `LuogoCard.tsx`
  e `BenvenutoTile.tsx` (`conFoto={false}`, **radius normalizzato da
  `rounded-xl` a `rounded-lg`** — 16px→12px, differenza sottile ma reale,
  non un effetto collaterale nascosto), `LericiDintorni.tsx` (card-link
  del blocco "dintorni" in home, `bg-background` aggiunto — coincide col
  bianco già presente via `SectionWrapper bg="white"`, zero impatto
  visivo), e il contenitore della card-risultato camera in
  `BookingWidget.tsx` (**cambio di comportamento reale**: il bordo grigio
  sempre presente prima — `border rounded overflow-hidden`, nessun token
  tema — è stato rimosso secondo la regola "niente bordo se la card ha
  foto in testa", e l'hover è stato aggiunto, prima assente; il bottone
  "seleziona camera" dentro la card non è stato toccato, resta riservato
  alla Fase 4 booking/pagamento).
- **Fix lessicale fuori scope Card**: il popover del calendario in
  `DateRangePicker.tsx` (`bg-white` → `bg-background`, stesso colore
  `#FFFFFF`, solo il nome del token corretto) — dichiarato esplicitamente
  fuori scope per l'adozione del componente Card (è chrome di overlay, non
  una card di contenuto). La modale di conferma chiamata in
  `LuogoCard.tsx` non ha richiesto alcuna modifica: era già `bg-background`
  verificato leggendo il file fresh.
- **Verificato da questa sessione Cowork**: `npx tsc --noEmit` reale sugli
  8 file toccati (zero errori) ed `esbuild --bundle --jsx=automatic` sugli
  stessi 8 file (zero errori, bundle prodotto per tutti). **Limite di
  verifica più marcato di quello dei piani precedenti**: il mirror locale
  visto da questa sessione Cowork contiene solo i file esplicitamente
  caricati nel corso della conversazione, non l'intero repository — moduli
  come `@/lib/i18n/navigation`, `@/lib/queries`, `@/lib/servizi`,
  `@/lib/sanity`, `@/lib/sanity-i18n`, `next-intl`, `next-sanity`,
  `next/image`, `@stripe/*` e i componenti `BookingButton`/
  `SectionWrapper` non erano mai stati caricati come file — la verifica
  `tsc` ha usato dichiarazioni di tipo scritte a mano per questi moduli
  (shape ragionevoli, non i tipi reali) solo per permettere il controllo
  del codice scritto in questa sessione, non un compile end-to-end
  dell'app; il file delle dichiarazioni e il `tsconfig.verify.json` sono
  scratch, eliminati prima della consegna, mai committati. **Nessuna
  verifica visiva reale possibile da qui** (nessun browser): resta da fare
  `npm run dev` in locale — controllare `/camere` (CameraCard), `/offerte`
  (OffertaCard — **serve prima un'offerta di prova in Sanity**, stesso
  limite già noto dal piano Button), le pagine categoria del Welcome Book
  come `/benvenuto/servizi` e la griglia hub `/benvenuto` (LuogoCard e
  BenvenutoTile — **area riservata, verificabile solo se raggiungibile
  senza una prenotazione reale attiva**), la sezione "dintorni" in home
  (LericiDintorni), e una ricerca disponibilità con almeno un risultato
  nel widget di booking (BookingWidget — **serve una data con
  disponibilità reale**).
**Fase 4 (flusso booking/pagamento) CHIUSA (26/08/2026).** Piano di
implementazione: `docs/superpowers/plans/2026-08-26-flusso-booking-pagamento.md`,
eseguito lo stesso giorno — `components/booking/BookingWidget.tsx` e
`components/booking/PaymentStep.tsx`, priorità alta della spec (più difetti
concentrati, è il flusso che genera fatturato):

- **Nuovo token** `error: '#B23B2E'` in `lib/theme.ts` (rosso mattone
  smorzato, coerente con la palette calda) — genera automaticamente
  `text-error`/`bg-error`/`border-error` via lo spread diretto già presente
  in `tailwind.config.ts`, nessuna modifica separata a quel file.
- **3 occorrenze `text-red-600` → `text-error`**: il bottone × di rimozione
  bambino, il messaggio di errore della ricerca disponibilità (entrambi in
  `BookingWidget.tsx`), il messaggio di errore del pagamento
  (`PaymentStep.tsx`).
- **4 bottoni migrati al componente `Button`** (`variant="primary"`,
  `size="compatta"`): "cerca" disponibilità, "seleziona camera" (dentro
  ogni card risultato — lasciato intenzionalmente intatto nel piano Card
  precedente, migrato solo ora), "continua" verso i dati ospite, "Paga €X"
  in `PaymentStep.tsx`. Erano tutti `px-4 py-2`, taglia che non corrisponde
  a nessuna delle 2 taglie esistenti di `Button` — standardizzati su
  `compatta` (px-5/py-2.5), la più vicina: aumento visibile di qualche
  pixel, stessa logica già usata per il bottone Header desktop nel piano
  Button.
- **8 elementi `border`/`rounded` tematizzati in `BookingWidget.tsx`**: la
  chip età bambino, il bottone "+ aggiungi bambino" (resta un bottone
  semplice con bordo tratteggiato, non migrato a `Button` — nessuna delle 5
  varianti esistenti ha un bordo tratteggiato, inventarne una sesta
  avrebbe violato il principio "dedotto da usi reali"), i 4 input dati
  ospite, il box termini di cancellazione. **Bug reale corretto sulla
  label di selezione trattamento** (B&B/mezza pensione/pensione completa):
  il bordo non selezionato era generico (`border`, non tematizzato) mentre
  quello selezionato aggiungeva `border-primary` sopra — aggiungere
  semplicemente `border-border` sempre presente, come fatto per gli altri
  7 elementi, avrebbe messo due utility Tailwind in competizione sulla
  stessa proprietà CSS con specificità identica, rischiando di rompere lo
  stato "selezionato" in un modo che `tsc`/`esbuild` non possono rilevare
  (è un conflitto CSS, non un errore di tipo). Corretto rendendo le due
  classi colore mutuamente esclusive (`border-primary` quando selezionato,
  `border-border` altrimenti, mai entrambe) — stessa identica famiglia di
  bug del fix "campo adulti" del 25/08/2026 in questo stesso file, mai
  corretta qui fino a questo audit.
- **1 elemento tematizzato in `PaymentStep.tsx`**: l'input nome titolare
  carta.
- **2 titoli corretti in `BookingWidget.tsx`**: l'h3 del nome camera nella
  card-risultato (mancava `text-primary`, ora allineato a
  `CameraCard`/`OffertaCard`) e l'h4 "Termini di cancellazione" (mancava
  `font-heading`, ora usa Playfair Display come tutti gli altri titoli del
  sito, `font-semibold` resta perché è un peso indipendente dalla
  famiglia).
- **Verificato da questa sessione Cowork**: `npx tsc --noEmit` reale sui 3
  file toccati (zero errori, incluso il controllo di tipo reale contro
  `Button.tsx`/`Card.tsx`/`buttonClasses.ts` — file reali nel mirror,
  risolti prima di qualunque stub) ed `esbuild --bundle --jsx=automatic`
  (zero errori, bundle prodotto per tutti e 3). Stesso limite di
  verifica già dichiarato nel piano Card: il mirror parziale di Cowork non
  contiene `@/lib/i18n/navigation`, `@/lib/queries`, `@/lib/servizi`,
  `@/lib/sanity`, `@/lib/sanity-i18n`, `next-intl`, `next-sanity`,
  `next/image`, `@stripe/*` — dichiarazioni di tipo scritte a mano usate
  solo per non bloccare la verifica del codice scritto qui, scratch,
  eliminate prima della consegna. **Nessuna verifica visiva reale
  possibile da qui**: l'intero flusso booking (ricerca disponibilità →
  selezione camera → dati ospite → pagamento Stripe) richiede dati reali
  (una data con disponibilità, una prenotazione di prova, un pagamento
  Stripe di test) — nessuna sessione Cowork può generarli. Il colore
  `error` in particolare è verificabile solo forzando un errore reale nel
  flusso. **Controllo particolare richiesto**: verificare che l'opzione di
  trattamento selezionata mantenga il bordo navy dopo il fix di mutua
  esclusività sopra descritto.
- **Checkpoint chiuso (26/08/2026)**: titolare ha confermato via
  `npm run dev` reale — "visivamente tutto a posto", nessuna segnalazione
  aggiuntiva.

**Fase 5 (`LinguaSelector`) CHIUSA (26/08/2026).** Piano di
implementazione: `docs/superpowers/plans/2026-08-26-linguaselector-bandiere.md`,
eseguito lo stesso giorno — riscrittura completa di
`components/ui/LinguaSelector.tsx` (33 righe):

- **4 bandiere SVG disegnate a mano** (IT verde/bianco/rosso, FR blu/
  bianco/rosso, DE nero/rosso/oro, EN Union Jack semplificato — sfondo
  navy, croci diagonali e dritte bianche/rosse costruite con `<line>`/
  `<rect>` primitivi, nessun path complesso), ciascuna un rettangolo 3:2
  (`viewBox="0 0 60 40"`) ritagliato in cerchio dal bottone contenitore
  (`overflow-hidden rounded-full` sul `<button>`,
  `preserveAspectRatio="xMidYMid slice"` sull'`<svg>`) — molto più
  semplice da disegnare a mano di una bandiera davvero circolare. Stesso
  principio dell'icona WhatsApp in `WhatsAppButton.tsx`: SVG inline,
  nessuna nuova dipendenza.
- **Chip circolare `h-5 w-5`** (20px — vedi correzione sotto; inizialmente
  consegnato a `h-7 w-7`/28px). Stato attivo: `border-accent`; inattivo:
  `border-border hover:border-primary` — un solo bordo da 1px che cambia
  colore, nessun `ring` aggiuntivo, nessun cambio di spessore tra stati
  per evitare un micro-scatto di layout.
- **Divider "·" rimosso** (decisione dichiarata): aveva senso tra sigle di
  testo ravvicinate, non tra chip circolari già distinte dal proprio
  bordo — sostituito da `gap-2` nel contenitore flex.
- **`aria-label` aggiunto** con il nome della lingua per esteso nella
  lingua stessa (Italiano/English/Deutsch/Français) — correzione di
  accessibilità necessaria, non opzionale: la bandiera è `aria-hidden`
  (decorativa), senza `aria-label` il bottone avrebbe perso il nome
  accessibile per chi usa uno screen reader, che prima veniva dal testo
  visibile.
- **Nessuna modifica** a `Header.tsx` (i 2 punti di utilizzo restano
  `<LinguaSelector />` invariato), `lib/i18n/routing.ts`, nessuna nuova
  dipendenza npm.
- **Verificato da questa sessione Cowork**: `npx tsc --noEmit` (zero
  errori — nota tecnica: la sandbox scratch inizialmente falliva con
  "Cannot find namespace 'React'" perché il file non importa nulla da
  `"react"` esplicitamente [usa solo il tipo globale `React.ReactNode` e
  JSX], e la configurazione di verifica restringeva i tipi automatici al
  solo `@types/node` — corretto includendo anche `@types/react`
  nell'opzione `types` della sandbox, un artefatto della configurazione
  di verifica di Cowork, non un problema del codice reale) ed
  `esbuild --bundle --jsx=automatic` (zero errori, bundle prodotto).
  **Nessuna verifica visiva reale possibile da qui**: da controllare in
  `npm run dev` locale, sia nell'header desktop sia nel menu mobile — le
  4 bandiere devono essere riconoscibili a 20px (vedi correzione sotto),
  il cerchio della lingua corrente deve avere il bordo accent, l'hover
  sugli altri deve mostrare il bordo navy, il cambio lingua deve
  funzionare come prima.
- **Correzione (26/08/2026, dopo checkpoint)**: il titolare ha segnalato
  che le chip da 28px mandavano a capo parte dei menu orizzontali (nav
  desktop + pulsante "Prenota ora") in header, e ha proposto ~20px.
  Ridotto `h-7 w-7`→`h-5 w-5` in
  `components/ui/LinguaSelector.tsx:77` (nessun'altra modifica — `gap-2`
  tra le chip lasciato invariato). Verificato solo con `tsc`/`esbuild`
  (zero errori, nessuna modifica di tipo — cambio di una sola classe
  Tailwind); **nessuna verifica visiva possibile da qui**: se 20px non
  basta ancora a evitare l'a-capo (il vincolo potrebbe essere la
  larghezza totale della nav, non solo le bandiere), la prossima leva è
  `gap-2`→`gap-1` o `gap-1.5` tra le chip — da confermare dopo aver
  controllato in locale. Nota di accessibilità non richiesta ma da
  tenere presente: 20px è già sotto ai 24px minimi WCAG 2.2 (target size,
  livello AA) e sotto il target consigliato di 44px — accettabile per una
  riga di 4 chip ravvicinate in un selettore secondario, ma non riducibile
  ulteriormente senza intaccare l'usabilità touch.
**Fase 6 (sweep finale) CHIUSA (26/08/2026) — ULTIMA fase.** Piano di
implementazione: `docs/superpowers/plans/2026-08-26-sweep-finale-coerenza.md`,
eseguito lo stesso giorno in modalità Inline:

- **`components/home/LavoroBanner.tsx:10`** — h2 `text-2xl`→`text-3xl`.
  Era l'unico outlier tra le 7 sezioni impilate sulla home page
  (`CamereInEvidenza`, `FAQ`, `GalleriaPreview`, `LericiDintorni`,
  `PestoHighlight`, `RistorantePreview`, tutte già `text-3xl`). Non
  toccati gli altri `<h2>` del sito (pagine interne, `text-2xl`/`text-xl`/
  `text-lg`): appartengono a un ruolo diverso — sottotitolo dentro una
  pagina, non titolo di sezione home page — e sono già coerenti nel loro
  gruppo.
- **`app/[locale]/(public)/contatti/page.tsx`** — 2 titoli `<p>`→`<h2>`:
  riga 48 (`orariTitle`, nominato dalla spec) e riga 53
  (`comeArrivareTitle`, **trovato oltre l'elenco della spec** in un audit
  fresh di questa fase — stesso bug, stesso file, l'audit originale ne
  aveva colto solo uno su due). className invariato in entrambi i casi.
- **`app/[locale]/(benvenuto)/benvenuto/posizione/page.tsx:47`** — titolo
  `<p>`→`<h2>` (`comeArrivareTitle`, nominato dalla spec). className
  invariato.
- **`app/[locale]/(benvenuto)/benvenuto/wifi/page.tsx:30`** — box
  credenziali WiFi, radius `rounded-lg`→`rounded-md`. Confermato con audit
  fresh (`grep -rn "bg-surface.*rounded"` su tutto il repo): 3 file con
  ruolo "box informativo/callout", 2 già `rounded-md`
  (`cookie-policy/page.tsx`, `privacy-policy/page.tsx`), questo era
  l'unico isolato.
- **Deviazione dichiarata dal testo letterale della spec —
  `app/[locale]/(public)/lerici/page.tsx:41` NON modificato.** La spec
  chiedeva testualmente di allineare quella riga a `rounded-lg` (gruppo
  "cornici immagine/mappa", 5 file). Verificato che l'elemento non
  appartiene a quel gruppo: è una griglia di miniature quadrate
  (`aspect-square`), pattern identico carattere per carattere a
  `components/ui/GalleriaGrid.tsx:53` e `components/home/GalleriaPreview.tsx:23`
  (entrambe già `rounded-md`) — un ruolo diverso da "cornice foto/mappa
  singola" (`aspect-[4/3]`/`aspect-[16/10]`, 5 file, tutte `rounded-lg`:
  `posizione/page.tsx`, `contatti/page.tsx`, `esperienze/page.tsx`,
  `ristorante/page.tsx`, `RistorantePreview.tsx`). Applicare la modifica
  letterale avrebbe risolto un'incoerenza inesistente creandone una vera
  contro le sue 2 sorelle di ruolo. Deviazione presentata al titolare nel
  checkpoint del piano — confermata d'accordo prima dell'esecuzione.
- **Sweep di verifica finale** (grep riproducibili sull'intero repo,
  eseguiti prima e dopo i Task 1-4, stesso risultato in entrambi i casi):
  zero colori hardcoded fuori da `lib/theme.ts`/bandiere, zero
  `text-red`/`bg-red` residui, zero `rounded`/`border` non tematizzati
  residui (i 3 risultati del grep — `border-collapse` su una tabella, 2
  `border-0` su input/iframe nativi — sono legittimi), e zero `<p
  className="...font-heading...">` residui da correggere (i 3 rimasti —
  2 numeri statistici decorativi in `text-6xl` su `esperienze/page.tsx` e
  `PestoHighlight.tsx`, 1 titolo della modale di conferma chiamata in
  `LuogoCard.tsx`, esplicitamente fuori scope dichiarato dalla spec del
  componente Card — sono tutti corretti così come sono).
- **Verificato da questa sessione Cowork**: `npx tsc --noEmit` (zero
  errori sui 4 file toccati, dopo aver esteso gli stub della sandbox con
  i campi `wifiNome`/`wifiPassword` di `getWelcomeBook` e i moduli
  `next`/`vanilla-cookieconsent`/`@/lib/consent` pull-in transitivi da
  `MapEmbed.tsx`) ed `esbuild --bundle --jsx=automatic` (zero errori,
  bundle prodotto per tutti e 4). **Nessuna verifica visiva reale
  possibile da qui**: da controllare in `npm run dev` locale — home page
  (banner "Lavora con noi"), `/contatti` (colonna orari/come arrivare,
  nessun cambio visivo atteso, solo struttura DOM), Welcome Book
  `/benvenuto/posizione` e `/benvenuto/wifi` (area riservata post-
  prenotazione, stesso limite di accesso già segnalato nei piani
  precedenti).
- **Fine del piano di migrazione a 6 fasi** della spec
  `docs/superpowers/specs/2026-08-26-coerenza-visiva-design.md`. A
  checkpoint confermato dal titolare su questa fase, l'intero Punto 2 del
  redesign visivo (`docs/superpowers/plans/2026-08-24-redesign-visivo-sito.md`)
  risulta chiuso — nessun'altra fase pianificata su questo fronte.

**Punto 3a (bento camere in home) CHIUSO (26/08/2026).** Punto 3 del piano
(`docs/superpowers/plans/2026-08-24-redesign-visivo-sito.md`, "bento grid
per camere/esperienze") scisso in due durante il brainstorming di questa
stessa giornata: **3a — sezione camere in home** (questo piano) e
**3b — sezione esperienze in home**, rimandato (oggi quella sezione non è
una griglia di card, solo il banner `PestoHighlight.tsx` — un bento lì
richiede prima costruire la griglia stessa, sotto-progetto separato non
ancora brainstormato). Spec:
`docs/superpowers/specs/2026-08-26-bento-camere-home-design.md`
(approvata dal titolare senza richieste di modifica). Piano di
implementazione:
`docs/superpowers/plans/2026-08-26-bento-camere-home.md`, eseguito lo
stesso giorno in modalità Inline:

- **Nuovo campo Sanity** `evidenziata` (boolean, `initialValue: false`)
  su `sanity/schemaTypes/documents/camera.ts` — stesso pattern esatto già
  esistente su `offerta.ts`, inserito dopo `disponibile` prima di
  `ordine`. **Nessuna camera reale ha ancora questo campo popolato**: il
  titolare dovrà impostarlo lui da Sanity Studio sulla camera
  "Matrimoniale" (decisione presa esplicitamente durante il
  brainstorming — non è una scelta che il codice deduce da nome/prezzo/
  capienza).
- **`lib/queries.ts`** — `CAMERE_LIST_QUERY` ora proietta anche
  `evidenziata`; l'interfaccia `CameraListItem` e il mapping in
  `getCamere` lo portano fino al chiamante (`evidenziata: c.evidenziata
  ?? false`).
- **`components/ui/CameraCard.tsx`** — 3 nuove prop opzionali: `grande`
  (default `false`, cambia solo il titolo da `text-xl` a `text-2xl` — la
  foto resta sempre `aspect-[4/3]` in entrambe le taglie, nessun nuovo
  rapporto d'aspetto introdotto), `evidenziata` e `badgeLabel` (badge
  assoluto in alto a sinistra sulla foto, stesso identico markup/classi
  già presenti in `OffertaCard.tsx` — `absolute left-3 top-3 z-10
  rounded-full bg-accent px-3 py-1 text-xs font-semibold text-white`).
  Tutte e 3 opzionali con default, i call site esistenti (`/camere`, le 2
  card piccole in home) restano validi senza modifiche.
- **`components/home/CamereInEvidenza.tsx`** — riscritta la selezione
  della camera "grande": la prima con `evidenziata === true` tra le
  (massimo 3) mostrate, nell'ordine già restituito dalla query (`ordine
  asc`); se nessuna è flaggata, la prima in ordine — mai un layout
  "tutto piccolo" degradato; se più di una è flaggata per errore, vince
  la prima incontrata. Placeholder (`CAMERE_PLACEHOLDER`, usato solo a
  Sanity vuoto) aggiornato con lo stesso campo, "Camera Vista Mare"
  marcata `evidenziata: true`. Griglia sostituita: card grande a piena
  larghezza sopra (`flex flex-col gap-6`), le altre due sotto in
  `grid grid-cols-1 gap-6 sm:grid-cols-2` — su schermi sotto i 640px
  (breakpoint `sm` di Tailwind, default del progetto, nessuna
  configurazione personalizzata trovata in `tailwind.config.ts`) tutte e
  3 le card si impilano in colonna, decisione esplicita del titolare
  durante il brainstorming ("per dare più spazio alle informazioni") —
  da 640px in su le 2 piccole tornano affiancate.
- **Copy** — nuova chiave `badgeEvidenziata` nel namespace `Home.camere`
  di tutti e 4 i file `messages/*.json`, riusata letteralmente
  dall'esistente `OffertePage.badgeEvidenziata` per lo stesso concetto
  (non un testo nuovo): it "In evidenza", en "Featured", de "Empfohlen",
  fr "En vedette".
- **Processo di scelta del layout**: confronto visivo di 3 opzioni bento
  (A "a L", B "grande sopra, due sotto", C "doppia larghezza") mostrato
  al titolare tramite un Artifact pubblicato su claude.ai (non il server
  locale del visual-companion della skill brainstorming — quel server si
  lega a questo sandbox cloud, irraggiungibile dal browser del titolare
  su una macchina diversa; annotazione utile per futuri usi del visual
  companion in questo tipo di sessione). Il titolare ha scelto l'Opzione
  B.
- **Verificato da questa sessione Cowork**: per il campo Sanity, `npx
  tsc --noEmit` reale sul file `camera.ts` intero (unici errori residui:
  5 `implicit any` preesistenti su `Rule`/`prepare`, dovuti alla
  semplicità dello stub del pacchetto `sanity` nella sandbox scratch —
  non toccati dalla modifica di una riga aggiunta da questo piano, che è
  un oggetto letterale senza funzioni). Per `lib/queries.ts`, verificato
  isolatamente solo il blocco modificato (non l'intero file da 13KB, che
  avrebbe richiesto stub aggiuntivi per query non toccate da questo
  piano) con un controllo esplicito di forma del tipo di ritorno di
  `getCamere` — zero errori. Per `CameraCard.tsx` e
  `CamereInEvidenza.tsx`, `tsc --noEmit` reale contro le dipendenze
  interne vere (`Card.tsx`, `SectionWrapper.tsx`, `lib/servizi.ts`,
  `lib/i18n/navigation.ts`) e stub solo per i pacchetti npm esterni
  (`sanity`, `next-sanity`, `next-intl`, `next-intl/server`,
  `next/image`) — zero errori — ed `esbuild --bundle --jsx=automatic` su
  tutti e 4 i file toccati (zero errori, bundle prodotto). Sandbox
  scratch eliminata prima della consegna, mai committata.
- **Nessuna verifica possibile da questa sessione Cowork sul campo
  Sanity**: aprire Sanity Studio dopo il deploy/aggiornamento dello
  schema e controllare che sul documento "Camera" compaia un nuovo campo
  booleano "In evidenza" (default disattivato) vicino a "Disponibile"/
  "Ordine" — poi impostarlo `true` sulla camera "Matrimoniale".
- **Nessuna verifica visiva reale possibile da qui** (nessun browser):
  da controllare in `npm run dev` locale — home page, sezione "Camere in
  evidenza": un riquadro grande a piena larghezza con badge "In
  evidenza" sulla foto (oggi mostrerà "Camera Vista Mare" dal
  placeholder, o la prima camera reale per `ordine` se già ne esistono
  ma nessuna è ancora flaggata — finché il titolare non imposta il flag
  su Sanity Studio sulla Matrimoniale), due riquadri più piccoli sotto
  affiancati da tablet in su. Restringere la finestra sotto i 640px (o
  strumenti sviluppatore in modalità mobile): tutte e 3 le card devono
  impilarsi in colonna.
- **Fuori scope, dichiarato dalla spec**: il listato completo `/camere`
  (resta la griglia a 3 colonne identiche, nessuna modifica) e il Punto
  3b (sezione esperienze in home), rimandato come sopra.
- **Fix (26/08/2026, dopo checkpoint) — foto sgranata sulla card
  grande.** Il titolare ha segnalato che la foto della camera in
  evidenza risultava sgranata dopo il checkpoint visivo. Causa reale,
  non (solo) qualità della foto sorgente: `getCamere` chiedeva a Sanity
  un crop fisso `600×450` per **tutte** le camere, card grande inclusa —
  ma la card grande del bento è renderizzata fino a ~1100px di
  larghezza reale (piena larghezza del contenitore `max-w-6xl`), quindi
  quel raster da 600px veniva stirato quasi al doppio, sgranato per
  costruzione indipendentemente da quanto fosse buona la foto caricata.
  **Fix**: nuovo campo `fotoUrlGrande` in `lib/queries.ts`
  (`imgUrl(c.fotoPrincipale, 1200, 900)`, stesso rapporto 4:3, doppia
  risoluzione) accanto al `fotoUrl` esistente (`600×450`, invariato,
  resta usato dalle 2 card piccole e dal listato `/camere`).
  `components/home/CamereInEvidenza.tsx` passa `fotoUrlGrande` (non più
  `fotoUrl`) alla card grande; `CAMERE_PLACEHOLDER` aggiornato con lo
  stesso campo (sempre `null`, nessuna foto reale nel fallback). Nessuna
  modifica a `CameraCard.tsx` (la prop si chiama sempre `fotoUrl`, cambia
  solo quale URL le viene passato dal chiamante) né allo schema Sanity.
  **Non risolve da solo se la foto sorgente caricata su Sanity è essa
  stessa a bassa risoluzione** — resta possibile che serva comunque
  ricaricarla più grande, verificabile solo dal titolare aprendo il file
  originale su Sanity Studio.
  **Verificato da questa sessione Cowork**: `npx tsc --noEmit` reale sul
  blocco `getCamere` modificato (controllo esplicito di forma del tipo
  di ritorno, incluso il nuovo campo `fotoUrlGrande`) e su
  `CamereInEvidenza.tsx` con le dipendenze interne vere e stub solo per i
  pacchetti npm esterni — zero errori in entrambi i casi — ed `esbuild
  --bundle --jsx=automatic` su entrambi i file, zero errori, bundle
  prodotto. Sandbox scratch eliminata prima della consegna, mai
  committata. **Nessuna verifica visiva reale possibile da qui**: da
  controllare in `npm run dev` locale sulla camera attualmente
  flaggata `evidenziata` — la foto deve risultare visibilmente più
  nitida rispetto a prima del fix.
  **Checkpoint chiuso (26/08/2026)**: titolare ha confermato via
  `npm run dev` reale — "ora molto meglio". Punto 3a
  (bento camere in home) risulta interamente chiuso, fix foto incluso.


**Punto 3b (esperienze in home) CHIUSO (27/08/2026).** Sostituisce
`PestoHighlight.tsx` + `LericiDintorni.tsx` in home con un'unica sezione
bento "Esperienze" (pesto grande + 2 escursioni piccole), e aggiorna
`/esperienze` per usare la stessa fonte dati. Spec:
`docs/superpowers/specs/2026-08-27-esperienze-home-design.md`. Piano:
`docs/superpowers/plans/2026-08-27-esperienze-home.md`, eseguito lo
stesso giorno in modalità Inline:

- **Nuovo document type Sanity** `escursione` (`sanity/schemaTypes/
  documents/escursione.ts`, registrato in `sanity/schemaTypes/index.ts`)
  — solo per le voci di territorio (Cinque Terre, Portovenere, ecc.). Il
  singleton `esperienzaPesto` resta invariato: non incluso nello stesso
  tipo (i suoi campi — visitatori/stagione, durata, prezzo, come
  prenotare — non hanno senso su una card "Cinque Terre"), e non serve un
  flag `evidenziata` per scegliere la card grande, il pesto lo è per
  definizione. **Nessuna voce `escursione` esiste ancora su Sanity**: il
  titolare dovrà pubblicarne almeno 2 (per la home) con foto reali,
  altrimenti home e `/esperienze` mostrano solo il placeholder
  (`ESCURSIONI_PLACEHOLDER` in `EsperienzeInEvidenza.tsx`, nessun
  fallback invece su `/esperienze` che mostra semplicemente una griglia
  vuota a Sanity vuoto — accettato dalla spec, pagina meno visibile della
  home).
- **`lib/queries.ts`** — nuova `getEscursioni(locale)` (query
  `*[_type == "escursione"] | order(ordine asc)`), stesso pattern delle
  altre funzioni del file.
- **Nuovo componente** `components/ui/EscursioneCard.tsx`: guscio
  proprio, non `Card.tsx` — quel componente instrada sempre il suo `href`
  tramite il `Link` interno di next-intl (rotte del sito), mentre il
  campo `link` di `escursione` è testo libero da Sanity e può essere un
  URL esterno. Replica invece il pattern già usato da `Button.tsx` in
  questo repo (interno via `Link` se inizia per "/", altrimenti `<a>`
  semplice) — scoperto durante la review del piano, non nella spec
  originale.
- **Nuovo componente home** `components/home/EsperienzeInEvidenza.tsx`,
  sostituisce sia `PestoHighlight.tsx` che `LericiDintorni.tsx`
  (entrambi eliminati, permesso di cancellazione richiesto ed esplicito
  del titolare durante l'esecuzione). Bento: pesto sempre come riquadro
  grande (ora un riquadro `bg-accent` dentro la sezione, non più un
  banner a piena larghezza separato — **cambiamento visivo reale
  segnalato esplicitamente nel piano, da confermare dal titolare al primo
  `npm run dev`**), le prime 2 `escursione` per `ordine` come riquadri
  piccoli sotto (`sm:grid-cols-2`, si impilano sotto i 640px, stesso
  comportamento del bento camere del Punto 3a).
- **`app/[locale]/(public)/esperienze/page.tsx`** — il banner pesto in
  alto resta identico; la griglia sotto passa dall'array `ESCURSIONI`
  hardcoded (4 voci fisse, testo da `messages/*.json`) a
  `getEscursioni(locale)` (tutte le voci pubblicate, non solo 2) via lo
  stesso `EscursioneCard`.
- **Copy** — nuovo namespace `Home.esperienze` (`title`/`subtitle`) in
  tutti e 4 i `messages/*.json`, rimosso `Home.dintorni` (assorbito) e
  `EsperienzePage.escursioni.*` (assorbito da Sanity) — **mantenuto**
  invece `EsperienzePage.escursioniTitle` (intestazione di sezione,
  serve comunque anche col contenuto da Sanity): correzione fatta in
  fase di piano rispetto alla spec, che lo dava per rimosso insieme al
  resto.
- **Verificato da questa sessione Cowork**: `npx tsc --noEmit` reale
  (non stub — `node_modules` del progetto già installato con i pacchetti
  veri, incluso `sanity`/`next-sanity`/`next-intl`) su ciascun file
  toccato, con un tsconfig di scratch temporaneo (`extends` del
  tsconfig reale, `files` limitato ai file del task, sempre includendo
  `next-env.d.ts` — necessario per l'augmentation globale del `fetch`
  con l'opzione `next: {revalidate}` di Next.js, altrimenti falso
  positivo su OGNI chiamata `client.fetch` del file, non solo quelle
  nuove) — creato e cancellato ad ogni task, mai lasciato nel repo. Zero
  errori su tutti i file toccati. `esbuild --bundle --jsx=automatic`
  anch'esso con il tool reale del progetto: il binario installato nel
  repo è per Windows (`@esbuild/win32-x64`), incompatibile con la VM
  Linux di questa sessione Cowork — installata una copia scratch
  linux-x64 in una cartella fuori dal repo (`$HOME/verify`, mai
  copiata dentro `sito-hotel`) per poter comunque bundlare. Zero errori
  su tutti i file toccati.
- **Nessuna verifica possibile da questa sessione Cowork sul tipo
  Sanity**: da controllare in Sanity Studio dopo il deploy — deve
  comparire "Escursione / dintorno" tra i tipi di contenuto, poi
  pubblicare almeno 2 voci con foto per vedere la home popolata
  davvero.
- **Nessuna verifica visiva reale possibile da qui**: da controllare in
  `npm run dev` locale — home page, sezione "Esperienze" (conferma
  esplicita richiesta sul nuovo trattamento del riquadro pesto, vedi
  sopra) e pagina `/esperienze` (banner invariato, griglia sotto vuota o
  con placeholder finché non pubblichi voci reali).
- **Fix (27/08/2026, dopo checkpoint) — `comePrenot` mai mostrato.**
  Il titolare ha segnalato che il CTA "Prenota la degustazione" (sia in
  home sia su `/esperienze`) non offre nessuna vera gestione della
  prenotazione — solo un `mailto:`. Verificato: comportamento
  preesistente al Punto 3b, non introdotto da questo piano (stesso
  `href`/CTA già presenti in `PestoHighlight.tsx` prima della sua
  rimozione). Trovato però un gap concreto: lo schema `esperienzaPesto`
  ha già un campo `comePrenot` ("Come prenotare", testo libero) letto da
  `getEsperienzaPesto` ma mai renderizzato da nessuna interfaccia. Fix
  minimo scelto dal titolare (non il flusso di prenotazione vero, quello
  resta backlog separato da brainstormare): mostrato `pesto.comePrenot`
  su `/esperienze/page.tsx`, subito sopra il CTA mailto, solo se
  valorizzato — nessuna modifica alla card home (resta teaser, il
  dettaglio vive dove c'è l'azione). **Il campo è vuoto su Sanity**:
  finché il titolare non lo compila da Studio, non cambia nulla a video.
  Verificato con `tsc --noEmit` reale (stesso metodo del resto di questa
  sessione, `next-env.d.ts` incluso) — zero errori.

## Punto 4 (micro-interazioni hover) CHIUSO (27/08/2026)

Brainstorming ha rivelato che gran parte del Punto 4 del piano master era già
fatta dai punti precedenti: l'hover-ombra su `Card.tsx` (quindi `CameraCard`,
`OffertaCard`) e la replica manuale in `EscursioneCard.tsx` erano già attivi
(`transition-shadow hover:shadow-cardHover`); i bottoni avevano già
`transition-colors` + cambio colore per variante in `buttonClasses.ts`.
Scelta esplicita: niente scale/ingrandimento su card o bottoni, il
trattamento esistente basta. "Filtri" citati dal piano master: nessuna UI di
filtro esiste nel codice, punto non applicabile per ora.

Restava solo:
- `app/globals.css`: aggiunto blocco `@media (prefers-reduced-motion: reduce)`
  (kill-switch globale su `animation-duration`/`transition-duration`) — prima
  assente ovunque nel progetto.
- `components/ui/LuogoCard.tsx`: aggiunto `transition-colors` ai due hover
  esistenti (bottone "chiama", link "apri mappa") — prima cambiavano colore
  di scatto.

Spec: `docs/superpowers/specs/2026-08-27-hover-microinterazioni-design.md`.
Piano: `docs/superpowers/plans/2026-08-27-hover-microinterazioni.md`.
Verifica: `tsc` mirato su `LuogoCard.tsx` pulito (nessun errore); CSS
verificato a mano (sintassi semplice, nessun compilatore coinvolto).

**Checkpoint visivo non verificabile da questa sessione** (da fare dal
titolare via `npm run dev`): attivare "riduci movimento" nel sistema
operativo/browser e controllare che le transizioni hover (ombra su card,
colore su bottoni e su `LuogoCard`) spariscano o diventino istantanee;
controllare che i due hover di `LuogoCard` ora sfumino invece di cambiare
colore di scatto (es. in una pagina del Welcome Book dove è renderizzato).

## Punto 5 (audit accessibilità) CHIUSO (27/08/2026)

Audit basato su calcolo reale dei rapporti di contrasto WCAG (formula
relative luminance, non uno strumento esterno) sui colori di `lib/theme.ts`
e su verifica del codice esistente — non su Lighthouse/axe (nessun browser
reale in questa sessione). 16 file toccati in 3 blocchi:

**Focus states**: nuovo `lib/a11y.ts` (`focusRingClasses`, meccanismo
`focus-visible` + `outline` per non collidere con anelli di stato
esistenti) applicato a `buttonClasses.ts` (tutti i bottoni del sito),
`Card.tsx`/`EscursioneCard.tsx` (card cliccabili), `LuogoCard.tsx` (bottone
"chiama", link mappa), `Header.tsx` (nav desktop/mobile, toggle menu),
`DateRangePicker.tsx` (due bottoni trigger). Prima di questo solo un
elemento nel sito aveva un focus-visible intenzionale (campo "adulti" del
`BookingWidget`).

**Contrasto colori**: `textLight` scurito `#9A9A9A`→`#767676` (2.81:1→
4.54:1 su bianco, corregge 4 usi in `BookingWidget`/`OffertaCard` senza
toccare quei file); nuovo `accentDeep: '#A65F31'` (4.88:1 sia come testo
su chiaro sia come sfondo con testo bianco sopra) al posto di `accent` in:
varianti "accent"/"solid-white-accent" di `buttonClasses.ts`, badge
"evidenziata" di `OffertaCard`/`CameraCard`, box pesto di
`EsperienzeInEvidenza.tsx` e variante `bg="accent"` di `SectionWrapper.tsx`,
messaggi di errore di `ContattoForm`, sottotitolo di `EscursioneCard`, link
di navigazione attivo dell'`Header`, e i 3 CTA scritti a mano (non passano
da `buttonClasses`) in `esperienze/page.tsx`, `camere/[slug]/page.tsx`,
`ristorante/page.tsx`.

**Date-picker**: `aria-expanded`/`aria-haspopup="dialog"` sui due bottoni
trigger, `role="dialog"` + `aria-label` sul popup, focus riportato al
bottone corretto alla chiusura (Escape o selezione completata) — nessuna
modifica alla logica `gestisciClick`/`apriCampo` già approvata in
precedenza.

Spec: `docs/superpowers/specs/2026-08-27-audit-accessibilita-design.md`.
Piano: `docs/superpowers/plans/2026-08-27-audit-accessibilita.md`.
Verifica: `tsc` mirato su tutti e 16 i file (4 gruppi da 4-5 file, il
tsconfig di scratch pieno con tutti insieme superava il timeout di 45s
dell'ambiente) — nessun errore.

**Esplicitamente fuori scope**: Lighthouse/axe (serve un browser reale —
da fare dal titolare via tab Code o in locale); overlay navy della Hero
(dipende dalle foto reali su Sanity, per scelta esplicita del titolare
resta un controllo visivo suo); stato hover dei colori (`accentLight`,
momentaneo/mouse-only); refactor dei 3 CTA scritti a mano per farli
passare da `buttonClasses()` (non necessario per il fix, evitato per
restare aderenti allo scope); skip-link e altri miglioramenti WCAG non
citati dal piano master.

**Checkpoint non verificabile da questa sessione** (da fare dal titolare
via `npm run dev`): (a) l'anello di focus è visibile navigando a Tab su
bottoni/card/nav/date-picker e SPARISCE al click del mouse; (b)
`accentDeep`/`textLight` risultano visivamente accettabili (cambio
sottile, non un colore percepito come "sbagliato"); (c) aprendo il
date-picker da tastiera, chiudendolo con Escape o completando una
selezione, il focus torna visibilmente sul bottone corretto; (d)
Lighthouse/axe per qualunque problema non individuabile da codice.

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

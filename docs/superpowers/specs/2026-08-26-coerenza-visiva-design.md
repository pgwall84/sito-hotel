# Coerenza visiva del sito (Punto 2 del redesign) — Design

> Spec per il Punto 2 di `docs/superpowers/plans/2026-08-24-redesign-visivo-sito.md`.
> Punto 1 (date-range picker) è chiuso. Scritta dopo un audit read-only di
> tutte le 24 pagine pubbliche/Welcome Book e i 34 componenti del repo
> (agenti dedicati, nessun file toccato) — i numeri citati qui sotto vengono
> da quell'audit, non da stime.

## Obiettivo

Portare a coerenza visiva l'intero sito (pagine pubbliche + area Welcome
Book) rispetto ai token già definiti in `lib/theme.ts`, ed eliminare la
causa strutturale dell'incoerenza — la duplicazione manuale di bottoni e
card in ogni file — sostituendola con componenti condivisi. Decisione del
titolare: sistemare bene, non solo allineare i valori esistenti (opzione
"estrarre componenti riutilizzabili", non "patch dei valori sul posto").

## Cosa ha trovato l'audit (sintesi)

- **Bottoni**: almeno 4 varianti visive per il ruolo "CTA primaria" in 9
  file, nessuna regola su quando usare il colore primary o accent.
- **Card**: 4 componenti "gemelli" (`CameraCard`, `OffertaCard`,
  `LuogoCard`, `BenvenutoTile`) — stesso concetto, nessuno identico a un
  altro (2 valori di radius, bordo presente solo in 2/4, hover-shadow
  assente in 1/4, 4 tipi di CTA diversi) — più altri pattern-card
  improvvisati altrove.
- **Tipografia**: H1 in 2 dimensioni, H2 in 4 dimensioni senza gerarchia
  coerente, 2 titoli scritti come `<p>` invece di `<h2>`.
- **Colori**: zero colori fuori tema sulle pagine pubbliche; nei
  componenti, `text-red-600` per gli errori (nessun token "errore" nel
  tema, 3 occorrenze in 2 file) e overlay `bg-black/*` non tematizzati.
- **Radius/bordo non tematizzato**: 14 occorrenze di `rounded`/`border`
  senza i token del tema, concentrate quasi tutte in
  `BookingWidget.tsx`/`PaymentStep.tsx` — il flusso di prenotazione e
  pagamento è la parte più recente e più fuori standard di tutto il sito.

Report completi dei due agenti di audit disponibili nella cronologia della
sessione Cowork del 26/08/2026 (non salvati come file separati — questa
spec ne è la sintesi operativa).

## Estensioni a `lib/theme.ts`

Due aggiunte, nessuna rimozione:

1. **Colore errore**: `error: '#B23B2E'` — rosso mattone smorzato,
   coerente con la palette calda (terracotta/sabbia) invece del rosso
   Tailwind di default oggi usato (`text-red-600`, stonato). Sostituisce
   `text-red-600`/`hover:text-red-600` ovunque compaia (booking,
   pagamento).
2. **Scala titoli** (dedotta dal pattern maggioritario già in uso, non
   inventata): da esporre come riferimento in `lib/theme.ts` (es.
   `theme.headings`) o semplicemente da applicare come convenzione
   documentata qui — decisione implementativa lasciata al piano.
   - Titolo di pagina (h1 standard): `text-4xl font-heading text-primary`.
     Eccezioni dichiarate, NON da correggere: Hero della home (foto piena,
     `text-4xl md:text-5xl`) e h1 compatto della topbar Welcome Book
     (barra funzionale, non un titolo vero).
   - Titolo di sezione (h2): `text-3xl font-heading text-primary`, eccetto
     quando il colore è ereditato da uno sfondo scuro/accent (resta
     bianco per contrasto, comportamento esistente da mantenere).
   - Titolo di card fotografica (h3 su `CameraCard`/`OffertaCard`, quelle
     con immagine): `text-xl font-heading text-primary`.
   - Titolo di card compatta/icona (`LuogoCard`, `BenvenutoTile`, domande
     FAQ): `text-lg font-heading text-primary`.

## Componente `Button` (nuovo, `components/ui/Button.tsx`)

Tre ruoli, dedotti da usi reali già presenti nel codice (non inventati):

1. **Piena (solid)** — prop colore a due valori:
   - `primary` (navy): azioni funzionali/transazionali — form di
     contatto/convenzione/tavolo, ricerca disponibilità, selezione
     camera, pagamento, CTA prenotazione nell'Header.
   - `accent` (terracotta): azioni calde/promozionali — CTA su
     `OffertaCard` (oggi `bg-primary`, da correggere a `bg-accent` per la
     nuova regola — vale da subito nel codice anche se `/offerte` mostra
     lo stato vuoto finché non ci sono offerte reali in Sanity, quindi
     questo pezzo non sarà verificabile a video finché il titolare non
     aggiunge almeno un'offerta di prova), CTA pesto in `esperienze`, e
     qualunque futura CTA su pacchetti/promozioni.
2. **Outline** — bordo pieno, sfondo trasparente. Due contesti reali già
   in uso: outline navy su sfondo chiaro (oggi in `LavoroBanner`) e
   outline bianco su foto/sfondo scuro (oggi la CTA secondaria di
   `Hero`).
3. **Link testuale** — `text-sm font-semibold text-primary
   hover:text-accent`, con freccia. Già il pattern più coerente del sito
   (8 occorrenze quasi identiche in 8 file) — si formalizza com'è, nessun
   cambiamento visivo.

Due taglie da preservare (non unificare, sono contesti legittimi diversi):
grande (`px-7 py-3`, Hero/form/PestoHighlight) e compatta (`px-5 py-2`,
Header). Il bottone dell'Header mobile oggi manca `hover:bg-primaryLight`
e `transition-colors` rispetto alla versione desktop dello stesso
bottone — va allineato, è un bug di distrazione, non una terza taglia
voluta.

## Componente `Card` (nuovo, `components/ui/Card.tsx`)

Un solo guscio fisico condiviso, comportamento guidato dal contenuto (non
4 copie mantenute a mano):

- **Radius**: `rounded-lg` (12px) — già maggioritario nel sito (3 pattern
  su 4 lo usano), diventa lo standard unico.
- **Bordo**: presente (`border border-border`) solo se la card non ha una
  foto (perché senza foto non c'è altro elemento che ne definisca il
  bordo visivo); assente se la card ha una foto in testa.
- **Ombra**: `shadow-card` sempre; `hover:shadow-cardHover` solo se la
  card (o il suo contenuto principale) è un link/elemento cliccabile.

**Migrano a questo componente** (stesso concetto — "card di contenuto in
un elenco/griglia"): `CameraCard`, `OffertaCard`, `LuogoCard`,
`BenvenutoTile`, la card-link di `LericiDintorni`, e la card-risultato
camera dentro `BookingWidget.tsx` (oggi `border rounded overflow-hidden`
senza nessun token — stesso concetto di `CameraCard` con uno stile
completamente slegato).

**Restano fuori scope, deliberatamente**: il popover del calendario in
`DateRangePicker.tsx` e la modale di conferma chiamata in `LuogoCard.tsx`
— sono chrome di overlay/dialogo, un ruolo UI diverso da "card di
contenuto in una lista", forzarli nello stesso componente confonderebbe
due concetti distinti. Ricevono solo una correzione lessicale minima
(`bg-white` → `bg-background`, stesso colore, nome del token corretto),
non l'adozione del componente Card.

## `LinguaSelector` — bandiere al posto delle sigle

Sostituzione completa (non affiancamento) delle sigle testuali "IT/EN/
DE/FR" con 4 bandiere SVG disegnate a mano, dentro un chip circolare
(`rounded-full`, coerente con l'estetica a pillola già usata nel resto
del sito per badge/CTA), con un anello `border-border` sottile. Nessuna
nuova dipendenza — stesso principio già usato per l'icona WhatsApp
disegnata a mano in `WhatsAppButton.tsx`. La lingua attiva resta
evidenziata (oggi con `text-accent` sul testo; con le sole bandiere,
l'evidenza diventa un bordo/anello colorato accent sul chip attivo,
stesso ruolo — dettaglio esatto da rifinire in fase di implementazione).

Nota dichiarata: le bandiere rappresentano paesi, non lingue (semplificazione
nota e comune nel settore alberghiero per un set fisso di 4 lingue rivolte
a turisti europei — non è una scelta neutra ma è accettata per questo
contesto).

## Altre correzioni puntuali emerse dall'audit

- 2 titoli scritti come `<p>` invece di `<h2>` (`contatti/page.tsx:48`,
  `benvenuto/posizione/page.tsx:47`) — stesso stile visivo, tag sbagliato:
  correggere il tag, non lo stile.
- `LavoroBanner.tsx` h2 a `text-2xl` invece di `text-3xl` standard —
  allineare alla scala titoli sopra.
- Box informativo/callout: 2 varianti di radius (`rounded-md` vs
  `rounded-lg`) per lo stesso ruolo, in 3 file — unificare su
  `rounded-md` (maggioritario, 2 file su 3).
- Cornici immagine/mappa: `rounded-lg` maggioritario (5 file), `rounded-md`
  in `lerici/page.tsx` (1 file, isolato) — allineare a `rounded-lg`.
- Tutte le 14 occorrenze di `rounded`/`border` non tematizzati in
  `BookingWidget.tsx`/`PaymentStep.tsx` (input, bottoni, box) — sostituire
  con i token (`rounded-md border border-border`), stesso fix già fatto
  sul campo "adulti" il 25/08/2026, esteso a tutto il resto dei due file.
- `text-red-600` (3 occorrenze, booking + pagamento) → nuovo token
  `error`.
- Footer: i link social (`Facebook`/`Instagram`) sono `href="#"`
  segnaposto, resi come testo semplice — fuori scope per questa spec
  (è un problema di contenuto/funzionalità, non di coerenza visiva),
  segnalato solo per completezza.

## Fuori scope (dichiarato)

- Contenuto reale delle offerte in Sanity (compito del titolare).
- Link social del Footer (segnalati sopra, non è un problema di stile).
- Qualunque nuova funzionalità non menzionata qui (filtri, nuove pagine,
  nuove sezioni).

## Piano di migrazione (fasi, ognuna con il proprio piano di
implementazione e checkpoint visivo — stesso principio già usato per il
Punto 1)

1. **Token**: estendere `lib/theme.ts` (colore `error`, scala titoli).
   Nessun impatto visivo da solo, verificabile solo a codice.
2. **Componente `Button`**: crearlo, poi migrare le CTA esistenti una
   famiglia alla volta (Header, Hero, i 3 form, `LavoroBanner`,
   `PestoHighlight`, `OffertaCard`).
3. **Componente `Card`**: crearlo, poi migrare `CameraCard`, `OffertaCard`,
   `LuogoCard`, `BenvenutoTile`, `LericiDintorni`, card-risultato di
   `BookingWidget`.
4. **Flusso booking/pagamento**: `BookingWidget.tsx`/`PaymentStep.tsx` —
   priorità alta (più difetti concentrati, è il flusso che genera
   fatturato) — applica Button/Card dove pertinente, corregge tutti i
   `rounded`/`border` non tematizzati, il colore errore, i titoli fuori
   standard (h3 senza `text-primary`, h4 senza `font-heading`).
5. **`LinguaSelector`**: bandiere SVG.
6. **Sweep finale**: titoli isolati (`<p>`→`<h2>`, `LavoroBanner`),
   radius di box/immagini rimasti, verifica finale di coerenza su tutte
   le pagine non ancora toccate dalle fasi precedenti.

## Verifica disponibile da questa sessione Cowork

Nessun accesso a browser: verifica solo tramite `tsc --noEmit` ed
`esbuild --bundle --jsx=automatic` per ogni file toccato, come già fatto
per il date-range picker. Il controllo visivo reale resta sempre e solo
del titolare, `npm run dev` in locale, un checkpoint per fase come da
piano sopra.

# Design: audit accessibilità WCAG (Punto 5, piano redesign visivo)

Data: 27/08/2026
Riferimento: `docs/superpowers/plans/2026-08-24-redesign-visivo-sito.md`, sezione "5. Audit accessibilità"

## Obiettivo

Correggere i problemi di accessibilità individuabili da codice (senza un browser
reale): assenza di stati di focus visibili, contrasto colore insufficiente su
testo realmente usato, navigabilità/semantica ARIA del date-picker. Fuori
scope tutto ciò che richiede Lighthouse/axe o la verifica visiva delle foto
reali caricate su Sanity — non eseguibile da questa sessione.

## Stato di partenza verificato

- Nessun componente ha uno stile di focus (`:focus`) esplicito nel codice,
  tranne il campo "adulti" di `BookingWidget.tsx` (`focus-within:ring-1
  ring-primary` sul `<label>` wrapper, `focus:outline-none focus:ring-0`
  sull'`<input>` interno per evitare un doppio anello — pattern
  intenzionale e corretto, non un bug). Ovunque altrove il sito si
  affida solo all'outline nativo di default del browser.
- `app/globals.css` non rimuove l'outline nativo altrove (verificato,
  nessun `outline: none`/`outline-none` globale trovato).
- Rapporti di contrasto reali calcolati (formula WCAG relative luminance)
  sui colori di `lib/theme.ts`:
  - `textLight` (`#9A9A9A`) su bianco: **2.81:1** — sotto la soglia AA
    anche per testo grande (min. 3:1). Usato come testo leggibile (non
    decorativo) in `BookingWidget.tsx:353,356` e `OffertaCard.tsx:44,49`.
  - `accent` (`#C4703A`) su bianco (o bianco su `accent`, il rapporto è
    simmetrico): **3.67:1** — sotto la soglia AA per testo normale
    (4.5:1), sopra la soglia per testo grande (3:1). Fallisce ovunque
    compaia come testo/sfondo a dimensione normale o piccola; passa dove
    il testo è già grande (es. prezzi in `text-2xl`/`text-lg` con
    `<strong>`).
  - Righe di codice con `accent` a dimensione non "grande" (quindi in
    fallimento AA), verificate una per una:
    - `components/ui/buttonClasses.ts`: variante `accent` (`bg-accent
      text-white`, sempre `text-sm` per via della classe base) — usata da
      Hero (CTA primario), `OffertaCard` (CTA prenotazione); variante
      `solid-white-accent` (`bg-white text-accent`, sempre `text-sm`) —
      usata da `EsperienzeInEvidenza.tsx` (CTA pesto in home).
    - `components/ui/OffertaCard.tsx:36-38` e `components/ui/CameraCard.tsx`
      (badge "evidenziata"): `bg-accent ... text-xs font-semibold
      text-white`.
    - `components/home/EsperienzeInEvidenza.tsx`: intero box pesto
      (`bg-accent`) contiene testo `text-white/85`/`text-white/90` a
      dimensione normale (numberLabel, descrizione, prezzo, comePrenot).
    - `components/layout/SectionWrapper.tsx`: variante `bg="accent"`
      (`bg-accent text-white`), unico uso in `esperienze/page.tsx` — stesso
      identico contenuto/problema del box pesto sopra.
    - `components/forms/ContattoForm.tsx:98-99`: messaggi di errore,
      `text-sm text-accent`.
    - `components/ui/EscursioneCard.tsx:39`: sottotitolo, `text-sm
      text-accent`.
    - `components/layout/Header.tsx`: link di navigazione attivo (desktop
      e mobile), `text-sm ... text-accent`.
    - `app/[locale]/(public)/esperienze/page.tsx:59`,
      `app/[locale]/(public)/camere/[slug]/page.tsx:118`,
      `app/[locale]/(public)/ristorante/page.tsx:83`: tre CTA scritti a
      mano (non passano da `buttonClasses`) che replicano esattamente le
      varianti `solid-white-accent`/`accent` sopra, stesso fallimento.
  - `gold` (`#C4A882`) su `primary`/navy solido: **5.13:1**, passa AA
    anche per testo normale. Uso reale in `Hero.tsx`: eyebrow e parte del
    titolo su un overlay `rgba(27, 58, 92, 0.55)` (navy al 55% di opacità)
    sopra una foto, non su navy solido — il rapporto reale dipende dalla
    foto caricata su Sanity, **non verificabile da qui**. Per scelta
    esplicita del titolare (27/08/2026) non si tocca l'overlay ora:
    verifica visiva rimandata a lui con le foto reali.
- Date-picker (`components/ui/DateRangePicker.tsx`): usa `react-day-picker`
  (`DayPicker mode="single"`), che fornisce di suo la navigazione da
  tastiera nella griglia dei giorni (frecce, invio/spazio) — non
  ricostruita a mano, nessuna modifica a quella parte. Mancano invece:
  `aria-expanded`/`aria-haspopup` sui due bottoni trigger ("Check-in"/
  "Check-out"), un ruolo/etichetta accessibile sul popup del calendario, e
  il ripristino del focus sul bottone corretto quando il popup si chiude
  (oggi il focus resta dov'era — perso — sia su Escape sia sulla chiusura
  automatica a selezione completata).

## Decisioni di brainstorming

1. **Focus states**: applicare uno stile coerente a tutti gli elementi
   interattivi del sito pubblico (non solo al date-picker), tramite una
   singola costante Tailwind riusabile — non un nuovo prop su ogni
   componente, solo l'aggiunta della stringa di classi dove serve.
2. **Meccanismo**: `focus-visible` (non `focus`) — l'anello appare solo
   da tastiera, non al click del mouse. Uso `outline` (proprietà CSS
   nativa) ovunque, non `ring` (box-shadow Tailwind), per evitare
   collisioni con anelli di stato già esistenti (es. il `ring-1
   ring-primary` che il `DateRangePicker` mostra già sul campo attivo).
3. **Contrasto**: correggere tutti i fallimenti trovati, non solo quelli
   sui componenti nuovi di questo redesign. Approccio a token, non per
   singolo elemento:
   - `textLight` scurito da `#9A9A9A` a `#767676` (4.54:1 su bianco) —
     stesso token, nessun nuovo nome, corregge tutti e 4 gli usi senza
     toccare i file che lo consumano.
   - Nuovo token `accentDeep: '#A65F31'` (4.88:1 sia come testo su
     sfondo chiaro sia come sfondo con testo bianco sopra) — sostituisce
     `accent` ovunque compaia come testo o sfondo a dimensione non
     "grande" (elenco file sopra). Non tocca gli usi di `accent` che
     restano su testo grande (prezzi), né lo stato hover (`accentLight`,
     momentaneo, mouse-only — fuori scope).
4. **Overlay Hero**: nessuna modifica ora (scelta esplicita del
   titolare) — resta un controllo visivo suo con le foto reali.
5. **Date-picker**: aggiungere `aria-expanded`, `aria-haspopup="dialog"`
   sui trigger, `role="dialog"` + `aria-label` sul popup, e riportare il
   focus al bottone corretto alla chiusura — senza toccare
   `gestisciClick`/`apriCampo` (logica già approvata dal titolare in una
   sessione precedente).

## Modifiche

### A. Focus states

**Nuovo `lib/a11y.ts`**:
```ts
export const focusRingClasses =
  "focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";
```

**`components/ui/buttonClasses.ts`**: aggiungere `focusRingClasses` alla
stringa restituita da `buttonClasses()` (base, si applica a tutte le
varianti/dimensioni).

**`components/ui/Card.tsx`**: aggiungere `focusRingClasses` a `classi`
quando `hover` è vero (stesso segnale già usato per "questa card è
cliccabile").

**`components/ui/EscursioneCard.tsx`**: aggiungere `focusRingClasses` a
`CLASSI_CARD` (variante link/cliccabile), non a `CLASSI_CARD_STATICA`.

**`components/ui/LuogoCard.tsx`**: aggiungere `focusRingClasses` al
bottone "chiama" e al link "apri mappa" (stessi due elementi toccati nel
Punto 4 per `transition-colors`).

**`components/layout/Header.tsx`**: aggiungere `focusRingClasses` ai
link di navigazione desktop, al bottone toggle del menu mobile, e ai
link di navigazione mobile (3 punti nello stesso file).

**`components/ui/DateRangePicker.tsx`**: aggiungere `focusRingClasses`
ai due bottoni trigger "Check-in"/"Check-out" (non alla `<div>` del
popup, non al bottone "×" di chiusura — già ha solo hover, valutabile ma
fuori scope stretto: bottone piccolo secondario, non un elemento di
navigazione primario).

### B. Contrasto colori

**`lib/theme.ts`**: nell'oggetto `colors`,
- cambiare `textLight: '#9A9A9A'` in `textLight: '#767676'`;
- aggiungere `accentDeep: '#A65F31'` (subito dopo `accentLight`).

**`components/ui/buttonClasses.ts`**, in `VARIANT_CLASSES`:
- `accent: "bg-accent text-white hover:bg-accentLight"` →
  `accent: "bg-accentDeep text-white hover:bg-accentLight"`;
- `"solid-white-accent": "bg-white text-accent hover:bg-surface"` →
  `"solid-white-accent": "bg-white text-accentDeep hover:bg-surface"`.

**`components/ui/OffertaCard.tsx`** e **`components/ui/CameraCard.tsx`**:
nel badge "evidenziata", `bg-accent` → `bg-accentDeep` (resto della
classe invariato).

**`components/home/EsperienzeInEvidenza.tsx`**: nel contenitore del box
pesto, `bg-accent` → `bg-accentDeep`.

**`components/layout/SectionWrapper.tsx`**: in `BG_CLASS`, `accent:
"bg-accent text-white"` → `accent: "bg-accentDeep text-white"`.

**`components/forms/ContattoForm.tsx`**: nei due paragrafi di
errore/rate-limit, `text-accent` → `text-accentDeep`.

**`components/ui/EscursioneCard.tsx`**: nel sottotitolo, `text-accent` →
`text-accentDeep`.

**`components/layout/Header.tsx`**: nei due link di navigazione
(desktop e mobile), nel ramo `pathname === item.href` del ternario,
`"text-accent"` → `"text-accentDeep"`.

**`app/[locale]/(public)/esperienze/page.tsx`**: nel CTA mailto,
`text-accent` → `text-accentDeep` (resta un `<a>` scritto a mano, non si
refactora a `buttonClasses` — fuori scope, non necessario per il fix).

**`app/[locale]/(public)/camere/[slug]/page.tsx`** e
**`app/[locale]/(public)/ristorante/page.tsx`**: nei rispettivi CTA,
`bg-accent` → `bg-accentDeep`.

### C. Date-picker ARIA e gestione focus

**`components/ui/DateRangePicker.tsx`**:
- sui due bottoni trigger: aggiungere `aria-expanded={aperto &&
  campoAttivo === "arrivo"}` (risp. `"partenza"`) e
  `aria-haspopup="dialog"`.
- sulla `<div>` del popup (quando `aperto`): aggiungere `role="dialog"`
  e `aria-label` (testo: label del campo attivo, già disponibile come
  variabile nel componente).
- alla chiusura (dentro `chiudiSuEscape`, e nel ramo finale di
  `gestisciClick` che chiude dopo la selezione completa): richiamare
  `.focus()` sul bottone trigger corrispondente — servono due `ref`
  (uno per il bottone arrivo, uno per il bottone partenza) al posto
  dell'attuale assenza di ref su quei bottoni.

## Fuori scope (esplicito)

- Lighthouse/axe e qualunque verifica che richieda un browser reale —
  da fare dal titolare via tab Code o in locale.
- Overlay della Hero — per scelta esplicita del titolare, resta un
  controllo visivo suo con le foto reali caricate su Sanity.
- Stato hover dei colori (`accentLight`) — momentaneo, mouse-only, non
  rilevante per screen reader, non toccato.
- Bottone "×" di chiusura del popup calendario — ha già un hover
  esplicito, il focus-visible lì è un miglioramento minore rimandabile,
  non un elemento di navigazione primario.
- Refactoring dei 3 CTA scritti a mano per farli passare da
  `buttonClasses()` — non necessario per il fix di contrasto, evitato
  per restare aderenti allo scope (solo accessibilità, non pulizia
  strutturale).
- Logica `gestisciClick`/`apriCampo` del date-picker — già approvata dal
  titolare in una sessione precedente, non toccata.
- Skip-link "vai al contenuto" e altri miglioramenti WCAG non citati dal
  piano master — non nell'ambito di questo spec, possibile item futuro.

## Verifica prevista

- `tsc` mirato sui file `.tsx`/`.ts` toccati (via tsconfig di scratch
  nella root del repo, con `next-env.d.ts` incluso — metodologia in
  memoria di progetto `sito_hotel_verifica_tsc_reale.md`).
- Calcolo di contrasto già eseguito e riportato sopra (formula WCAG
  relative luminance, non uno strumento esterno) — non ripetuto in fase
  di esecuzione, i valori sono già quelli definitivi.
- Verifica NON eseguibile da questa sessione, a carico del titolare via
  `npm run dev`: (a) l'anello di focus è visibile navigando a Tab su
  bottoni/card/nav/date-picker e SPARISCE al click del mouse; (b) i
  colori `accentDeep`/`textLight` risultano visivamente accettabili
  (cambio sottile, non un nuovo colore percepito come "sbagliato"); (c)
  aprendo il date-picker da tastiera, chiudendolo con Escape o
  completando una selezione, il focus torna visibilmente sul bottone
  corretto; (d) Lighthouse/axe per qualunque problema non individuabile
  da codice.

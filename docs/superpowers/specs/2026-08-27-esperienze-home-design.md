# Sezione "Esperienze" in home — unificazione con /esperienze (Punto 3b) — Design

> Spec per la seconda metà del Punto 3 di
> `docs/superpowers/plans/2026-08-24-redesign-visivo-sito.md` ("bento grid
> per camere/esperienze"). Punto 3a (camere in home) chiuso il 26/08/2026,
> spec in `docs/superpowers/specs/2026-08-26-bento-camere-home-design.md`.
> Questa è la 3b, rimandata in quella sede perché "oggi quella sezione non
> è una griglia di card, solo il banner PestoHighlight.tsx".

## Obiettivo

Sostituire due sezioni home oggi separate e in parte ridondanti —
`PestoHighlight.tsx` (banner pesto) e `LericiDintorni.tsx` (griglia di 3
card "dintorni" per distanza: Cinque Terre, Portovenere, Tellaro) — con
un'unica sezione "Esperienze" in home, in stile bento coerente col Punto
3a: una card grande (pesto, sempre) + 2 card piccole (voci di territorio,
le prime per ordine). La pagina `/esperienze` viene aggiornata in
coerenza: banner pesto invariato, griglia sotto con TUTTE le voci di
territorio (non solo 2), alimentata dalla stessa fonte dati della home
invece dell'array hardcoded attuale.

## Stato di partenza verificato

Letti fresh dal repo del titolare il 27/08/2026:
`components/home/PestoHighlight.tsx`, `components/home/LericiDintorni.tsx`,
`components/home/CamereInEvidenza.tsx` (pattern 3a da riusare),
`components/ui/Card.tsx`, `app/[locale]/(public)/page.tsx`,
`app/[locale]/(public)/esperienze/page.tsx`,
`sanity/schemaTypes/documents/esperienzaPesto.ts`,
`sanity/schemaTypes/documents/offerta.ts`,
`sanity/schemaTypes/objects/luogo.ts`, `sanity/schemaTypes/index.ts`,
`lib/queries.ts` (blocco Esperienza Pesto), `messages/it.json`
(namespace `Home.pesto`, `Home.dintorni`, `EsperienzePage`).

- Oggi "esperienze" plurali non esistono come contenuto: un solo
  singleton reale (`esperienzaPesto`), e 4 card "escursioni consigliate"
  su `/esperienze` (Cinque Terre, Portovenere, kayak, trekking) hardcoded
  in `messages/*.json`, senza foto né link reale (tutte puntano a
  `/lerici`).
- `LericiDintorni.tsx` (home) mostra 3 card testo-only (Cinque Terre,
  Portovenere, Tellaro) con un campo "distanza", anch'esse hardcoded,
  anch'esse verso `/lerici`.
- Sovrapposizione reale: Cinque Terre e Portovenere compaiono in entrambe
  le sezioni con framing diverso ("20 min in treno" vs "escursione
  consigliata").
- Esiste già un object type Sanity chiamato `luogo`
  (`sanity/schemaTypes/objects/luogo.ts`) — è del Welcome Book (farmacia,
  taxi, bus, con lat/lon e categoria a icone), per l'ospite già in hotel.
  Non riusabile né rinominabile per questo scopo: nome già occupato,
  scopo diverso.
- Pattern 3a riusabile as-is: campo `ordine` per l'ordinamento, componente
  `Card` condiviso, struttura "1 grande + 2 piccole" con
  `flex flex-col gap-6` / `grid grid-cols-1 gap-6 sm:grid-cols-2`,
  placeholder fallback quando Sanity è vuoto.

## Decisioni prese durante il brainstorming (27/08/2026)

1. **Scope**: la nuova sezione SOSTITUISCE `LericiDintorni.tsx` (non
   resta una sezione parallela) — decisione esplicita del titolare per
   eliminare la doppia menzione delle stesse mete con framing diverso.
2. **Content model**: nuovo document type Sanity `escursione` (solo per
   le voci di territorio). Il pesto resta il singleton `esperienzaPesto`
   esistente, invariato — non viene incluso nello stesso tipo (i suoi
   campi — visitatori/stagione, durata, prezzo, come prenotare — non
   hanno senso su una card "Cinque Terre", e non serve un flag
   `evidenziata` per scegliere la card grande: il pesto lo è per
   definizione, unico candidato).
3. **`/esperienze` aggiornata in coerenza**: la griglia escursioni della
   pagina passa dall'array hardcoded `ESCURSIONI` alla stessa fonte
   Sanity (tutte le `escursione`, non solo le 2 mostrate in home) — una
   sola fonte di verità invece di due contenuti che potrebbero
   disallinearsi.
4. **Gerarchia visiva**: pesto sempre la card grande (bento, foto + stat
   "1.500+ ospiti", stesso trattamento del Punto 3a), le `escursione`
   sempre le card piccole — nessuna selezione dinamica di "quale" è
   grande, a differenza delle camere.
5. **Card piccole in home**: 2 (simmetria con il bento camere del 3a),
   selezionate come le prime 2 `escursione` per campo `ordine`.
6. **Foto sulle card `escursione`**: sì, nuovo campo `foto` — scelta
   esplicita nonostante oggi né `LericiDintorni` né le escursioni di
   `/esperienze` abbiano foto, per coerenza visiva con la card pesto
   (fotografica) accanto altrimenti a card testo-only.
7. **Link per card**: campo `link` (url) libero e opzionale sul nuovo
   tipo — il titolare decide dove punta ciascuna voce (`/lerici`, sito
   esterno, o vuoto = card non cliccabile), non un comportamento fisso
   nel codice.

## Modifiche

### 1. Sanity — nuovo `sanity/schemaTypes/documents/escursione.ts`

```ts
import { defineField, defineType } from "sanity";

export const escursione = defineType({
  name: "escursione",
  title: "Escursione / dintorno",
  type: "document",
  fields: [
    defineField({ name: "titolo", title: "Titolo", type: "localeString", validation: (Rule) => Rule.required() }),
    defineField({ name: "sottotitolo", title: "Sottotitolo (es. distanza o tipo)", type: "localeString" }),
    defineField({ name: "descrizione", title: "Descrizione breve", type: "localeText" }),
    defineField({ name: "foto", title: "Foto", type: "image" }),
    defineField({ name: "link", title: "Link (opzionale)", type: "url" }),
    defineField({ name: "ordine", title: "Ordine", type: "number" }),
  ],
  preview: {
    select: { title: "titolo.it", media: "foto" },
  },
});
```

Registrare in `sanity/schemaTypes/index.ts`: import + aggiunta
all'array `types` (stesso pattern di `camera`/`offerta`).

### 2. Query — `lib/queries.ts`

Nuovo blocco accanto a "Esperienza Pesto", nuova funzione
`getEscursioni`:

```ts
const ESCURSIONI_LIST_QUERY = groq`
  *[_type == "escursione"] | order(ordine asc) {
    titolo,
    sottotitolo,
    descrizione,
    foto,
    link
  }
`;

interface EscursioneListItem {
  titolo: LocaleString;
  sottotitolo?: LocaleString;
  descrizione?: LocaleText;
  foto?: SanityImage;
  link?: string;
}

export const getEscursioni = cache(async (locale: Locale) => {
  const raw = await client.fetch<EscursioneListItem[]>(ESCURSIONI_LIST_QUERY, {}, REVALIDATE);
  return raw.map((e) => ({
    titolo: pickLocale(e.titolo, locale) ?? "",
    sottotitolo: e.sottotitolo ? pickLocale(e.sottotitolo, locale) : undefined,
    descrizione: e.descrizione ? pickLocale(e.descrizione, locale) : undefined,
    fotoUrl: imgUrl(e.foto, 600, 450),
    link: e.link,
  }));
});
```

(Tipi esatti — `LocaleString`/`LocaleText`/`SanityImage`/`pickLocale`/
`imgUrl` — da allineare a quelli già usati nel resto del file, non
reinventarli.)

### 3. Componente home — nuovo `components/home/EsperienzeInEvidenza.tsx`

Sostituisce sia `PestoHighlight.tsx` che `LericiDintorni.tsx` nella home.
Struttura bento identica al pattern 3a:

- Card grande: contenuto pesto (foto, stat "1.500+ ospiti", titolo,
  descrizione, CTA "Prenota la degustazione") — stesso markup oggi in
  `PestoHighlight.tsx`, portato dentro il nuovo componente.
- Card piccole (2): le prime 2 `escursione` da `getEscursioni(locale)`,
  via nuovo componente `components/ui/EscursioneCard.tsx` (guscio `Card`
  condiviso, `conFoto` in base alla presenza di `fotoUrl`, `hover` se c'è
  `link`).
- Placeholder fallback (come `CAMERE_PLACEHOLDER`) se Sanity non ha
  ancora nessuna `escursione`: 2 voci finte senza foto (fallback a
  gradiente già gestito da `Card`/pattern esistente), per non lasciare un
  bento con un solo riquadro al primo deploy.

### 4. Pagina `/esperienze` — `app/[locale]/(public)/esperienze/page.tsx`

Banner pesto in alto invariato (stesso codice attuale,
`getEsperienzaPesto`). Sezione sotto: sostituire il map su `ESCURSIONI`
(array hardcoded + `t(\`escursioni.${key}.titolo\`)`) con un map su
`getEscursioni(locale)` (TUTTE le voci, non solo 2), stesso stile di card
border/hover già presente nella pagina (o il nuovo `EscursioneCard` per
coerenza — dettaglio implementativo lasciato al piano).

### 5. Rimozione file

`components/home/PestoHighlight.tsx` e `components/home/LericiDintorni.tsx`
eliminati (contenuto assorbito nel nuovo componente), non lasciati morti
nel repo. `app/[locale]/(public)/page.tsx` aggiornata: rimossi i due
import, aggiunto `EsperienzeInEvidenza`.

### 6. Copy — `messages/it.json`, `en.json`, `de.json`, `fr.json`

- Nuovo namespace `Home.esperienze` (`title`, `subtitle`) — header della
  sezione, stesso pattern di `Home.camere.title`/`subtitle` — decisione
  esplicita per non forzare il titolo pesto a fare doppio servizio da
  titolo di sezione.
- `Home.pesto` resta invariato — copre solo il contenuto della card
  grande (numero, label, titolo, descrizione, cta).
- Rimuovere namespace `Home.dintorni` (assorbito dal nuovo contenuto
  Sanity).
- Rimuovere `EsperienzePage.escursioniTitle` e
  `EsperienzePage.escursioni.*` (assorbiti da Sanity) — resta
  `EsperienzePage.title` e `pestoCta`.

## Migrazione contenuti (a carico del titolare)

Oggi zero documenti `escursione` esistono su Sanity. Dopo il deploy, il
titolare dovrà creare almeno le voci che vuole mostrare (es. Cinque
Terre, Portovenere, Tellaro, kayak, trekking, o un sottoinsieme a sua
scelta — il nuovo tipo non vincola a quei 5 nomi) con foto reali,
altrimenti home e `/esperienze` mostrano solo il placeholder fallback.
Stesso tipo di passo manuale già segnalato per il campo `evidenziata` su
`camera` nel Punto 3a.

## Fuori scope (dichiarato)

- Nessuna pagina di dettaglio per singola `escursione` (niente
  `/esperienze/[slug]`) — solo card con link libero opzionale.
- Nessuna modifica allo schema/contenuto di `esperienzaPesto`.
- Nessun cambiamento a `LuogoCard.tsx`/oggetto `luogo` del Welcome Book —
  omonimia solo scampata in fase di naming, nessuna relazione di codice.

## Verifica disponibile da questa sessione Cowork

Nessun accesso a browser: `tsc --noEmit` ed `esbuild --bundle
--jsx=automatic` per ogni file toccato, sandbox scratch temporanea come
nei piani precedenti, eliminata prima della consegna. Verifica visiva
reale (bento corretto, foto nitide, card piccole coerenti con la grande,
comportamento mobile) resta del titolare via `npm run dev` in locale —
inclusa la creazione di almeno 2 documenti `escursione` su Sanity Studio
per vedere la sezione popolata davvero, non solo il placeholder.

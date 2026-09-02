# Bento per "Le nostre camere" in home (Punto 3a) — Design

> Spec per la prima metà del Punto 3 di
> `docs/superpowers/plans/2026-08-24-redesign-visivo-sito.md` ("bento grid
> per camere/esperienze"). Punto scisso in due durante il brainstorming
> del 26/08/2026: **3a — sezione camere in home** (questa spec) e
> **3b — sezione esperienze in home** (non pianificata, vedi §"Fuori
> scope"). Punti 1 (date-range picker) e 2 (coerenza visiva) già chiusi.

## Obiettivo

Trasformare la griglia a 3 colonne identiche di `CamereInEvidenza.tsx`
(sezione home, sempre 3 camere) in una disposizione bento: un riquadro
grande a piena larghezza per la camera "in evidenza", due riquadri più
piccoli sotto. Nessun'altra pagina è coinvolta — il listato completo
`/camere` resta invariato, decisione esplicita del titolare durante il
brainstorming.

## Stato di partenza verificato

Letti fresh dal repo del titolare il 26/08/2026:
`components/home/CamereInEvidenza.tsx`, `components/ui/CameraCard.tsx`,
`app/[locale]/(public)/camere/page.tsx`, `sanity/schemaTypes/documents/
camera.ts`, `sanity/schemaTypes/documents/offerta.ts`, `lib/queries.ts`
(funzione `getCamere`), `messages/it.json`/`en.json`/`de.json`/`fr.json`
(namespace `Home.camere` e `OffertePage.badgeEvidenziata`).

- `CamereInEvidenza.tsx` mostra sempre esattamente 3 camere: le prime 3
  reali da Sanity (`getCamere(locale).slice(0, 3)`), o 3 placeholder
  hardcoded se Sanity non ne ha ancora nessuna pubblicata. Nessun problema
  di "N variabile" da gestire nel layout.
- `CameraCard.tsx` è già sul componente `Card` condiviso (`conFoto hover`,
  Fase 3 della coerenza visiva), foto `aspect-[4/3]`, nessuna variante di
  dimensione oggi.
- Lo schema Sanity `camera` ha già un campo `ordine` (numero) con un
  ordinamento dedicato (`ordineAsc`), già usato da `CAMERE_LIST_QUERY`
  (`order(ordine asc)`) — non serve aggiungere alcun meccanismo di
  ordinamento, esiste già.
- Lo schema `offerta` ha già un campo `evidenziata` (boolean,
  `initialValue: false`) e `OffertaCard`/`offerte/page.tsx` già
  implementano un badge "In evidenza" pilotato da quel flag — stesso
  pattern esatto da riusare qui, non da reinventare.

## Decisioni prese durante il brainstorming (26/08/2026)

1. **Scope**: solo la sezione camere in home. Il listato `/camere` non
   cambia.
2. **Selezione del riquadro grande**: un nuovo campo `evidenziata`
   (boolean) sullo schema Sanity `camera`, identico a quello già esistente
   su `offerta`. Il titolare lo imposterà lui da Sanity Studio sulla
   camera "Matrimoniale" — non è una scelta che il codice deduce da nome/
   prezzo/capienza.
3. **Badge**: sì, riusa esattamente il badge "In evidenza" già esistente
   su `OffertaCard` (stesso posizionamento, stesso concetto) — non un
   testo nuovo inventato in fase di mockup ("Più richiesta" era solo un
   placeholder del mockup visivo, scartato).
4. **Layout**: card grande sopra a piena larghezza, le altre due sotto in
   una riga a 2 colonne (Opzione B del confronto visivo — scelta esplicita
   del titolare tra 3 alternative mostrate in un Artifact). Foto sempre
   `aspect-[4/3]` in entrambe le taglie — niente nuovo rapporto
   d'aspetto introdotto solo per la card grande.
5. **Mobile**: le due card piccole si impilano (una sopra l'altra), non
   restano affiancate — scelta esplicita del titolare, priorità alla
   leggibilità di nome/servizi/prezzo su schermo stretto rispetto alla
   compattezza.
6. **Punto 3b (esperienze in home) rimandato**: oggi la sezione home
   dedicata alle esperienze non è una griglia di card ma un singolo
   banner (`PestoHighlight.tsx`, foto + testo + numero statistico) — un
   bento lì richiede prima costruire la sezione stessa (quali esperienze
   mostrare, quanti contenuti reali esistono in Sanity), non è un
   riordino di card già esistenti come per le camere. Va brainstormato a
   parte, come suo proprio sotto-progetto.

## Modifiche

### 1. Sanity — `sanity/schemaTypes/documents/camera.ts`

Aggiungere un campo, stesso pattern esatto di `offerta.ts:22`:

```ts
defineField({ name: "evidenziata", title: "In evidenza", type: "boolean", initialValue: false }),
```

Posizione: dopo il campo `disponibile` (riga 46 del file attuale), prima
di `ordine` — accanto agli altri flag booleani dello schema, non in mezzo
ai campi di contenuto (foto/servizi/prezzo).

### 2. Query — `lib/queries.ts`

`CAMERE_LIST_QUERY` (righe 87-95 attuali) deve proiettare anche
`evidenziata`; l'interfaccia `CameraListItem` e il mapping in `getCamere`
devono portarlo fino al chiamante:

```ts
const CAMERE_LIST_QUERY = groq`
  *[_type == "camera" && disponibile == true] | order(ordine asc) {
    "slug": slug.current,
    nome,
    fotoPrincipale,
    servizi,
    prezzoBase,
    evidenziata
  }
`;

interface CameraListItem {
  slug: string;
  nome: LocaleString;
  fotoPrincipale: SanityImage;
  servizi: string[];
  prezzoBase: number;
  evidenziata?: boolean;
}

export const getCamere = cache(async (locale: Locale) => {
  const raw = await client.fetch<CameraListItem[]>(CAMERE_LIST_QUERY, {}, REVALIDATE);
  return raw.map((c) => ({
    slug: c.slug,
    nome: pickLocale(c.nome, locale) ?? c.slug,
    fotoUrl: imgUrl(c.fotoPrincipale, 600, 450),
    servizi: c.servizi ?? [],
    prezzoBase: c.prezzoBase,
    evidenziata: c.evidenziata ?? false,
  }));
});
```

### 3. Selezione del riquadro grande — `components/home/CamereInEvidenza.tsx`

Tra le (massimo 3) camere mostrate, il riquadro grande è:

1. La prima con `evidenziata === true`, nell'ordine già restituito dalla
   query (che è già per `ordine asc`).
2. Se nessuna delle 3 è flaggata (es. il titolare non ha ancora impostato
   il campo): la prima in ordine — **mai** un layout "tutto piccolo"
   degradato, il bento resta sempre 1 grande + 2 piccole.
3. Se più di una delle 3 è flaggata per errore: vince comunque la prima
   incontrata nell'ordine — nessun avviso o gestione speciale, è un caso
   limite senza conseguenze visive gravi.

Il placeholder (`CAMERE_PLACEHOLDER`, usato solo se Sanity non ha ancora
nessuna camera pubblicata) deve avere lo stesso campo, con una camera
marcata `evidenziata: true` (proposta: "Camera Vista Mare", la più
rappresentativa delle 3 finte), così anche lo stato vuoto mostra un bento
corretto e non una griglia piatta.

### 4. Componente — `components/ui/CameraCard.tsx`

Nuova prop opzionale, stesso stile di `conFoto`/`hover` su `Card`:

```ts
{
  // ...props esistenti,
  grande?: boolean; // default false
  evidenziata?: boolean; // per il badge "In evidenza"
  badgeLabel?: string; // testo del badge, passato dal chiamante (stesso pattern di OffertaCard)
}
```

- `grande` NON cambia l'`aspect-[4/3]` della foto — cambia solo cosa fa il
  chiamante con la card nella griglia (larghezza) e la dimensione del
  titolo: `text-xl` (default, invariato) → `text-2xl` quando `grande`.
- `evidenziata` + `badgeLabel` pilotano un badge assoluto in alto a
  sinistra sulla foto, stesso markup/posizionamento già presente in
  `OffertaCard.tsx:29-33` (`absolute left-3 top-3 z-10 rounded-full
  bg-accent px-3 py-1 text-xs font-semibold text-white`) — non un nuovo
  stile di badge.

### 5. Griglia — `components/home/CamereInEvidenza.tsx`

Sostituire `<div className="mt-10 grid gap-6 md:grid-cols-3">` con una
struttura a due livelli: la card grande sopra a piena larghezza, le altre
due sotto. Confermato esplicitamente dal titolare durante il
brainstorming: su mobile le tre card si impilano **tutte** in colonna
(grande, poi piccola, poi piccola) — "per dare più spazio alle
informazioni". Le due piccole affiancate sono quindi un comportamento
da tablet/desktop in su, non lo stato di default:

```tsx
<div className="mt-10 flex flex-col gap-6">
  {grandeCamera && (
    <CameraCard
      key={grandeCamera.slug}
      grande
      evidenziata
      badgeLabel={t("badgeEvidenziata")}
      nome={grandeCamera.nome}
      servizi={grandeCamera.servizi}
      prezzoBase={grandeCamera.prezzoBase}
      slug={grandeCamera.slug}
      fotoUrl={grandeCamera.fotoUrl}
      priceFromLabel={t("priceFrom")}
      ctaLabel={t("cta")}
    />
  )}
  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
    {piccole.map((camera) => (
      <CameraCard
        key={camera.slug}
        nome={camera.nome}
        servizi={camera.servizi}
        prezzoBase={camera.prezzoBase}
        slug={camera.slug}
        fotoUrl={camera.fotoUrl}
        priceFromLabel={t("priceFrom")}
        ctaLabel={t("cta")}
      />
    ))}
  </div>
</div>
```

`sm:` è il primo breakpoint Tailwind (640px, invariato dal default del
progetto — nessuna configurazione personalizzata trovata in
`tailwind.config.ts` per gli breakpoint) — sotto i 640px le due piccole
sono una sopra l'altra, da 640px in su tornano affiancate.

(`grandeCamera`/`piccole` sono derivati dall'array `camere` con la logica
del §3 sopra — dettaglio implementativo lasciato al piano.)

### 6. Copy — `messages/it.json`, `en.json`, `de.json`, `fr.json`

Aggiungere `badgeEvidenziata` al namespace `Home.camere` (righe 45-51,
identiche in struttura nei 4 file) — riuso letterale del testo già
esistente nel namespace `OffertePage` per lo stesso concetto, non un
testo nuovo:

- it: `"badgeEvidenziata": "In evidenza"`
- en: `"badgeEvidenziata": "Featured"`
- de: `"badgeEvidenziata": "Empfohlen"`
- fr: `"badgeEvidenziata": "En vedette"`

## Fuori scope (dichiarato)

- **Punto 3b — sezione esperienze in home**: richiede prima la
  costruzione di una vera griglia di card (oggi non esiste), poi
  eventualmente un bento — sotto-progetto separato, proprio
  brainstorming quando si torna a questo fronte.
- **`/camere` (listato completo)**: resta la griglia a 3 colonne
  identiche, nessuna modifica.
- **Foto della camera "Matrimoniale"**: se non ha ancora una foto
  principale su Sanity, il riquadro grande mostra comunque il fallback a
  gradiente già esistente (`bg-gradient-to-br from-primary/10 to-
  surfaceDark`) — nessuna nuova gestione per questo caso, il componente
  `Card`/`CameraCard` già lo copre.

## Verifica disponibile da questa sessione Cowork

Nessun accesso a browser: `tsc --noEmit` ed `esbuild --bundle
--jsx=automatic` per ogni file toccato, sandbox scratch temporanea come
nei piani precedenti. Il controllo visivo reale (bento corretto a
schermo intero e su mobile, badge leggibile, camera Matrimoniale
effettivamente nel riquadro grande una volta impostato il flag su
Sanity) resta del titolare, `npm run dev` in locale — un solo checkpoint
per l'intera Fase 3a, non spezzato ulteriormente vista la dimensione
contenuta del cambiamento.

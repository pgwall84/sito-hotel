# Esperienze in home (Punto 3b) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sostituire `PestoHighlight.tsx` + `LericiDintorni.tsx` in home con un'unica sezione bento "Esperienze" (pesto grande + 2 escursioni piccole da Sanity), e aggiornare `/esperienze` per usare la stessa fonte dati al posto dell'array `ESCURSIONI` hardcoded.

**Architecture:** Nuovo document type Sanity `escursione` (solo voci di territorio — Cinque Terre, Portovenere, ecc.), il singleton `esperienzaPesto` resta invariato. Nuova funzione `getEscursioni` in `lib/queries.ts`. Nuovo componente `EscursioneCard` (guscio proprio, non `Card.tsx` — vedi nota Task 3) e nuovo componente home `EsperienzeInEvidenza` che sostituisce i due componenti attuali. `/esperienze/page.tsx` consuma la stessa `getEscursioni`. Nessuna nuova dipendenza npm.

**Tech Stack:** Next.js App Router, TypeScript, Tailwind (token da `lib/theme.ts`), Sanity v3 (schema), next-intl (4 lingue).

## Global Constraints

- Mai eseguire `git` da questa sessione Cowork — commit reali fatti dal titolare dal tab Code.
- Nessun accesso a database/VPS né al progetto Sanity reale da questa sessione — impossibile verificare da qui che il tipo `escursione` compaia davvero in Sanity Studio. Va dichiarato esplicitamente nel task che lo introduce.
- Verifica disponibile solo tramite `npx tsc --noEmit` ed `esbuild --bundle --jsx=automatic` in una sandbox scratch temporanea (react/react-dom/typescript/esbuild installati a parte, mai committati) — nessun `npm run dev`/build reale, nessun accesso a browser. Sandbox sempre eliminata prima della consegna finale.
- **Eliminazione file** (Task 6): `device_bash` non può cancellare file per default in questa sessione (`rm` fallisce con "Operation not permitted") — prima di eseguire quel task serve chiamare `device_request_delete_permission` sulla cartella connessa e attendere l'approvazione del titolare. Se rifiutata o senza risposta: spostare `PestoHighlight.tsx`/`LericiDintorni.tsx` in una sottocartella `_to_delete/` invece di cancellarli, e segnalarlo al titolare.
- **Nota di design da confermare a video (Task 5)**: la card pesto passa da sezione a piena larghezza (`SectionWrapper bg="accent"`, trattamento attuale di `PestoHighlight.tsx`) a riquadro grande dentro un'unica sezione bianca condivisa con le 2 card piccole (stesso contenitore, stesso pattern del Punto 3a) — è un cambiamento visivo reale, non solo l'aggiunta delle 2 card piccole. Deliberato per rispettare la decisione presa in brainstorming ("stesso pattern bento del 3a"), ma va confermato dal titolare al primo `npm run dev`: se preferisce il vecchio banner a piena larghezza pesto separato dalle card sotto, è una modifica piccola e localizzata al solo Task 5.
- Spec di riferimento: `docs/superpowers/specs/2026-08-27-esperienze-home-design.md`, approvata dal titolare.
- Consegna finale in un solo batch (`SendUserFile` + `device_commit_files`) con tutti i file toccati dall'intero piano — nessuna consegna sparsa per task.

---

### Task 1: Sanity — nuovo document type `escursione` e registrazione

**Files:**
- Create: `sanity/schemaTypes/documents/escursione.ts`
- Modify: `sanity/schemaTypes/index.ts` (file intero, 26 righe)

**Interfaces:**
- Produces: document type Sanity `escursione` (campi `titolo`, `sottotitolo`, `descrizione`, `foto`, `link`, `ordine`) — consumato dal Task 2 (query).

- [ ] **Step 1: Creare `sanity/schemaTypes/documents/escursione.ts`**

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

- [ ] **Step 2: Registrare il nuovo tipo in `sanity/schemaTypes/index.ts`**

Contenuto attuale di riferimento (file intero, 26 righe, letto fresh il 27/08/2026):

```ts
import { type SchemaTypeDefinition } from "sanity";

import { localeString } from "./objects/localeString";
import { localeText } from "./objects/localeText";
import { localePortableText } from "./objects/localePortableText";
import { luogo } from "./objects/luogo";

import { infoHotel } from "./documents/infoHotel";
import { camera } from "./documents/camera";
import { offerta } from "./documents/offerta";
import { esperienzaPesto } from "./documents/esperienzaPesto";
import { paginaGenerica } from "./documents/paginaGenerica";
import { fotoGalleria } from "./documents/fotoGalleria";
import { sezioneRistorante } from "./documents/sezioneRistorante";
import { convenzioniAziendali } from "./documents/convenzioniAziendali";
import { welcomeBook } from "./documents/welcomeBook";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    // oggetti multilingua riutilizzabili
    localeString,
    localeText,
    localePortableText,
    luogo,
    // documenti
    infoHotel,
    camera,
    offerta,
    esperienzaPesto,
    paginaGenerica,
    fotoGalleria,
    sezioneRistorante,
    convenzioniAziendali,
    welcomeBook,
  ],
};
```

Sostituire con:

```ts
import { type SchemaTypeDefinition } from "sanity";

import { localeString } from "./objects/localeString";
import { localeText } from "./objects/localeText";
import { localePortableText } from "./objects/localePortableText";
import { luogo } from "./objects/luogo";

import { infoHotel } from "./documents/infoHotel";
import { camera } from "./documents/camera";
import { offerta } from "./documents/offerta";
import { esperienzaPesto } from "./documents/esperienzaPesto";
import { escursione } from "./documents/escursione";
import { paginaGenerica } from "./documents/paginaGenerica";
import { fotoGalleria } from "./documents/fotoGalleria";
import { sezioneRistorante } from "./documents/sezioneRistorante";
import { convenzioniAziendali } from "./documents/convenzioniAziendali";
import { welcomeBook } from "./documents/welcomeBook";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    // oggetti multilingua riutilizzabili
    localeString,
    localeText,
    localePortableText,
    luogo,
    // documenti
    infoHotel,
    camera,
    offerta,
    esperienzaPesto,
    escursione,
    paginaGenerica,
    fotoGalleria,
    sezioneRistorante,
    convenzioniAziendali,
    welcomeBook,
  ],
};
```

- [ ] **Step 3: Verificare con tsc in sandbox scratch**

Creare/riusare una sandbox temporanea (`/tmp/esperienze-home-verify`), stesso setup delle sessioni precedenti (symlink `node_modules` react/react-dom/typescript/esbuild/@types, `tsconfig.verify.json` con `"paths": {"@/*": ["./*"]}`), stub minimo per `sanity`:

```ts
declare module "sanity" {
  export function defineField<T>(config: T): T;
  export function defineType<T>(config: T): T;
}
```

Run: `npx tsc --noEmit -p tsconfig.verify.json` (includendo `sanity/schemaTypes/documents/escursione.ts` e `sanity/schemaTypes/index.ts`)
Expected: nessun errore nuovo introdotto da questo task (eventuali `implicit any` preesistenti su `Rule`/`prepare` in altri schemi, già noti dalle sessioni precedenti, non sono responsabilità di questo task).

- [ ] **Step 4: Nota di verifica per il titolare**

**Nessuna verifica possibile da questa sessione Cowork**: il tipo esiste solo nello schema TypeScript finché non viene pubblicato/deployato su Sanity Studio. Da controllare: aprire Sanity Studio, deve comparire una nuova voce "Escursione / dintorno" nel menu dei tipi di contenuto, con i campi Titolo (obbligatorio), Sottotitolo, Descrizione breve, Foto, Link, Ordine.

---

### Task 2: `lib/queries.ts` — nuova funzione `getEscursioni`

**Files:**
- Modify: `lib/queries.ts:227` (inserimento dopo il blocco "Esperienza Pesto", righe 196-226)

**Interfaces:**
- Consumes: document type Sanity `escursione` (Task 1).
- Produces: `getEscursioni(locale: Locale): Promise<{ titolo: string; sottotitolo?: string; descrizione?: string; fotoUrl: string | null; link?: string }[]>` — consumato dal Task 5 e dal Task 7.

Contenuto attuale di riferimento (righe 196-227, letto fresh il 27/08/2026 — la riga 227 è la riga vuota subito dopo la chiusura di `getEsperienzaPesto`, la riga 228 è il commento del blocco successivo):

```ts
// ---------- Esperienza Pesto ----------

const ESPERIENZA_PESTO_QUERY = groq`
  *[_type == "esperienzaPesto"][0] {
    titolo, descrizione, foto, visitatoriStagione, durata, prezzo, comePrenot
  }
`;

interface EsperienzaPestoRaw {
  titolo: LocaleString;
  descrizione: LocaleString;
  foto?: SanityImage[];
  visitatoriStagione?: number;
  durata: LocaleString;
  prezzo?: number;
  comePrenot: LocaleString;
}

export const getEsperienzaPesto = cache(async (locale: Locale) => {
  const e = await client.fetch<EsperienzaPestoRaw | null>(ESPERIENZA_PESTO_QUERY, {}, REVALIDATE);
  if (!e) return null;
  return {
    titolo: pickLocale(e.titolo, locale) ?? "",
    descrizione: pickLocale(e.descrizione, locale) ?? "",
    fotoUrl: imgUrl(e.foto?.[0], 1200, 800),
    visitatoriStagione: e.visitatoriStagione,
    durata: pickLocale(e.durata, locale) ?? "",
    prezzo: e.prezzo,
    comePrenot: pickLocale(e.comePrenot, locale) ?? "",
  };
});

// ---------- Convenzioni Aziendali ----------
```

- [ ] **Step 1: Inserire il nuovo blocco subito dopo la chiusura di `getEsperienzaPesto` (dopo `});` di riga 226), prima della riga vuota che precede `// ---------- Convenzioni Aziendali ----------`**

```ts

// ---------- Escursioni / dintorni ----------

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
  descrizione?: LocaleString;
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

Nota: `descrizione` sullo schema Sanity è di tipo `localeText` (multi-riga), non `localeString` — ma nel resto di questo file (vedi `EsperienzaPestoRaw.descrizione` sopra) i campi `localeText` sono comunque tipizzati lato TypeScript come `LocaleString`: non esiste un tipo `LocaleText` separato in questo file. Riusare `LocaleString` anche qui, non crearne uno nuovo.

- [ ] **Step 2: Verificare con tsc in sandbox scratch**

`lib/queries.ts` è un file grande (444 righe) — verificarlo per intero con `tsc` richiede gli stessi stub già usati nelle sessioni precedenti per `@/lib/sanity`, `@/lib/sanity-i18n`, `next-sanity`. Run: `npx tsc --noEmit -p tsconfig.verify.json` (includendo `lib/queries.ts`); per ogni errore su un modulo mancante, allargare lo stub (stesso metodo iterativo delle sessioni precedenti).
Expected: nessun errore di tipo sul blocco appena inserito (`ESCURSIONI_LIST_QUERY`, `EscursioneListItem`, `getEscursioni`); eventuali errori preesistenti su parti del file non toccate da questo task non sono responsabilità di questo task.

- [ ] **Step 3: Nessun checkpoint visivo per questo task**

Modifica non ancora consumata da nessun componente — il checkpoint comincia dal Task 5.

---

### Task 3: Copy — namespace `Home.esperienze` (nuovo), rimozione `Home.dintorni` e `EsperienzePage.escursioni`

**Files:**
- Modify: `messages/it.json:66-72` e `:143-153`
- Modify: `messages/en.json:66-72` e `:143-153`
- Modify: `messages/de.json:66-72` e `:143-153`
- Modify: `messages/fr.json:66-72` e `:143-153`

**Interfaces:**
- Produces: `Home.esperienze.title`/`subtitle` — consumato dal Task 5. `EsperienzePage.escursioniTitle` resta (testo di intestazione griglia, non contenuto per-voce) — consumato dal Task 7.

Fatto prima dei task che consumano le nuove chiavi (Task 5 e 7), non dopo, per non lasciare temporaneamente componenti che referenziano chiavi i18n inesistenti.

- [ ] **Step 1: `messages/it.json`**

Sostituire (righe 66-72):

```json
    "dintorni": {
      "title": "Lerici e dintorni",
      "cinqueTerre": { "name": "Cinque Terre", "distanza": "20 min in treno" },
      "portovenere": { "name": "Portovenere", "distanza": "10 min in battello" },
      "tellaro": { "name": "Tellaro", "distanza": "10 min in auto" },
      "cta": "Scopri il territorio"
    },
```

con:

```json
    "esperienze": {
      "title": "Esperienze",
      "subtitle": "Dalla degustazione del pesto alle gite nel golfo dei poeti."
    },
```

Sostituire (righe 143-153):

```json
  "EsperienzePage": {
    "title": "Esperienze",
    "pestoCta": "Prenota la degustazione",
    "escursioniTitle": "Escursioni consigliate",
    "escursioni": {
      "cinqueTerre": { "titolo": "Cinque Terre", "descrizione": "Le celebri terrazze colorate a picco sul mare, raggiungibili in treno o battello." },
      "portovenere": { "titolo": "Portovenere", "descrizione": "Borgo marinaro Patrimonio UNESCO, con la chiesa di San Pietro sullo scoglio." },
      "kayak": { "titolo": "Escursioni in kayak", "descrizione": "Il golfo esplorato dal mare, tra insenature e piccole spiagge nascoste." },
      "trekking": { "titolo": "Trekking sui sentieri liguri", "descrizione": "Percorsi panoramici tra Lerici, Tellaro e il Parco di Montemarcello." }
    }
  },
```

con:

```json
  "EsperienzePage": {
    "title": "Esperienze",
    "pestoCta": "Prenota la degustazione",
    "escursioniTitle": "Escursioni consigliate"
  },
```

- [ ] **Step 2: `messages/en.json`**

Sostituire (righe 66-72):

```json
    "dintorni": {
      "title": "Lerici and beyond",
      "cinqueTerre": { "name": "Cinque Terre", "distanza": "20 min by train" },
      "portovenere": { "name": "Portovenere", "distanza": "10 min by boat" },
      "tellaro": { "name": "Tellaro", "distanza": "10 min by car" },
      "cta": "Discover the area"
    },
```

con:

```json
    "esperienze": {
      "title": "Experiences",
      "subtitle": "From the pesto tasting to trips around the Gulf of Poets."
    },
```

Sostituire (righe 143-153):

```json
  "EsperienzePage": {
    "title": "Experiences",
    "pestoCta": "Book the tasting",
    "escursioniTitle": "Recommended excursions",
    "escursioni": {
      "cinqueTerre": { "titolo": "Cinque Terre", "descrizione": "The famous colourful terraces overlooking the sea, reachable by train or boat." },
      "portovenere": { "titolo": "Portovenere", "descrizione": "A UNESCO World Heritage fishing village, with the church of San Pietro on the rock." },
      "kayak": { "titolo": "Kayak excursions", "descrizione": "Explore the gulf from the sea, among coves and hidden little beaches." },
      "trekking": { "titolo": "Hiking on Ligurian trails", "descrizione": "Scenic routes between Lerici, Tellaro and the Montemarcello Park." }
    }
  },
```

con:

```json
  "EsperienzePage": {
    "title": "Experiences",
    "pestoCta": "Book the tasting",
    "escursioniTitle": "Recommended excursions"
  },
```

- [ ] **Step 3: `messages/de.json`**

Sostituire (righe 66-72):

```json
    "dintorni": {
      "title": "Lerici und Umgebung",
      "cinqueTerre": { "name": "Cinque Terre", "distanza": "20 Min. mit dem Zug" },
      "portovenere": { "name": "Portovenere", "distanza": "10 Min. mit dem Boot" },
      "tellaro": { "name": "Tellaro", "distanza": "10 Min. mit dem Auto" },
      "cta": "Die Umgebung entdecken"
    },
```

con:

```json
    "esperienze": {
      "title": "Erlebnisse",
      "subtitle": "Von der Pesto-Verkostung bis zu Ausflügen im Golf der Dichter."
    },
```

Sostituire (righe 143-153):

```json
  "EsperienzePage": {
    "title": "Erlebnisse",
    "pestoCta": "Verkostung buchen",
    "escursioniTitle": "Empfohlene Ausflüge",
    "escursioni": {
      "cinqueTerre": { "titolo": "Cinque Terre", "descrizione": "Die berühmten bunten Terrassen über dem Meer, erreichbar mit Zug oder Boot." },
      "portovenere": { "titolo": "Portovenere", "descrizione": "UNESCO-Weltkulturerbe-Fischerdorf mit der Kirche San Pietro auf dem Felsen." },
      "kayak": { "titolo": "Kajak-Ausflüge", "descrizione": "Den Golf vom Meer aus entdecken, zwischen Buchten und versteckten Stränden." },
      "trekking": { "titolo": "Wandern auf ligurischen Pfaden", "descrizione": "Panoramawege zwischen Lerici, Tellaro und dem Naturpark Montemarcello." }
    }
  },
```

con:

```json
  "EsperienzePage": {
    "title": "Erlebnisse",
    "pestoCta": "Verkostung buchen",
    "escursioniTitle": "Empfohlene Ausflüge"
  },
```

- [ ] **Step 4: `messages/fr.json`**

Sostituire (righe 66-72):

```json
    "dintorni": {
      "title": "Lerici et ses environs",
      "cinqueTerre": { "name": "Cinque Terre", "distanza": "20 min en train" },
      "portovenere": { "name": "Portovenere", "distanza": "10 min en bateau" },
      "tellaro": { "name": "Tellaro", "distanza": "10 min en voiture" },
      "cta": "Découvrir la région"
    },
```

con:

```json
    "esperienze": {
      "title": "Expériences",
      "subtitle": "De la dégustation du pesto aux excursions dans le golfe des poètes."
    },
```

Sostituire (righe 143-153):

```json
  "EsperienzePage": {
    "title": "Expériences",
    "pestoCta": "Réserver la dégustation",
    "escursioniTitle": "Excursions recommandées",
    "escursioni": {
      "cinqueTerre": { "titolo": "Cinque Terre", "descrizione": "Les célèbres terrasses colorées surplombant la mer, accessibles en train ou en bateau." },
      "portovenere": { "titolo": "Portovenere", "descrizione": "Village de pêcheurs classé UNESCO, avec l'église San Pietro sur le rocher." },
      "kayak": { "titolo": "Excursions en kayak", "descrizione": "Explorez le golfe depuis la mer, entre criques et petites plages cachées." },
      "trekking": { "titolo": "Randonnée sur les sentiers ligures", "descrizione": "Itinéraires panoramiques entre Lerici, Tellaro et le parc de Montemarcello." }
    }
  },
```

con:

```json
  "EsperienzePage": {
    "title": "Expériences",
    "pestoCta": "Réserver la dégustation",
    "escursioniTitle": "Excursions recommandées"
  },
```

- [ ] **Step 5: Verificare che i 4 file restino JSON valido**

Run (per ciascuno dei 4 file, sostituendo il nome): `node -e "JSON.parse(require('fs').readFileSync('messages/it.json', 'utf8')); console.log('OK')"`
Expected: `OK` per tutti e 4, nessun `SyntaxError`.

- [ ] **Step 6: Nessun checkpoint visivo separato**

Il testo si vede nei checkpoint dei Task 5 e 7.

---

### Task 4: `components/ui/EscursioneCard.tsx` — nuovo componente

**Files:**
- Create: `components/ui/EscursioneCard.tsx`

**Interfaces:**
- Consumes: nessuna dipendenza da task precedenti (componente puro).
- Produces: `EscursioneCard(props: { titolo: string; sottotitolo?: string; descrizione?: string; fotoUrl?: string | null; link?: string })` — consumato dal Task 5 e dal Task 7.

**Nota di design**: non riusa `components/ui/Card.tsx` per il rendering cliccabile. `Card.tsx` (visto nella sessione di brainstorming) supporta un `href` ma lo rende sempre con il `Link` interno di next-intl (`@/lib/i18n/navigation`), pensato per rotte interne — tutti i suoi chiamanti attuali (`LericiDintorni.tsx`, oggi da rimuovere; le card camere/offerte) passano solo percorsi interni (`/lerici`, `/camere/...`). Il campo `link` di `escursione` è invece testo libero da Sanity: può essere un URL esterno (es. il sito del Parco delle Cinque Terre). `components/ui/Button.tsx` nello stesso repo gestisce già esplicitamente questo doppio caso (interno via `Link`, esterno via `<a>`, scegliendo in base a `href.startsWith("/")`) — `EscursioneCard` replica lo stesso pattern invece di allargare il contratto di `Card.tsz` per un solo chiamante con questo bisogno specifico.

- [ ] **Step 1: Creare il file**

```tsx
import Image from "next/image";
import { Link } from "@/lib/i18n/navigation";

const CLASSI_CARD =
  "block overflow-hidden rounded-lg bg-background shadow-card transition-shadow hover:shadow-cardHover";
const CLASSI_CARD_STATICA = "overflow-hidden rounded-lg bg-background shadow-card";

export default function EscursioneCard({
  titolo,
  sottotitolo,
  descrizione,
  fotoUrl,
  link,
}: {
  titolo: string;
  sottotitolo?: string;
  descrizione?: string;
  fotoUrl?: string | null;
  link?: string;
}) {
  const contenuto = (
    <>
      {fotoUrl ? (
        <div className="relative aspect-[4/3]">
          <Image src={fotoUrl} alt={titolo} fill className="object-cover" />
        </div>
      ) : (
        <div className="aspect-[4/3] bg-gradient-to-br from-primary/10 to-surfaceDark" />
      )}
      <div className="p-5">
        <h3 className="font-heading text-xl text-primary">{titolo}</h3>
        {sottotitolo && <p className="mt-1 text-sm text-accent">{sottotitolo}</p>}
        {descrizione && <p className="mt-2 text-sm text-textMuted">{descrizione}</p>}
      </div>
    </>
  );

  if (link && link.startsWith("/")) {
    return (
      <Link href={link} className={CLASSI_CARD}>
        {contenuto}
      </Link>
    );
  }

  if (link) {
    return (
      <a href={link} target="_blank" rel="noopener noreferrer" className={CLASSI_CARD}>
        {contenuto}
      </a>
    );
  }

  return <div className={CLASSI_CARD_STATICA}>{contenuto}</div>;
}
```

- [ ] **Step 2: Verificare con tsc ed esbuild**

Stessa sandbox dei task precedenti. Run: `npx tsc --noEmit -p tsconfig.verify.json` (includendo `components/ui/EscursioneCard.tsx`) ed `npx esbuild components/ui/EscursioneCard.tsx --bundle --jsx=automatic --tsconfig=tsconfig.verify.json --external:next/image --external:@/lib/i18n/navigation --external:react --external:react-dom --outdir=/tmp/esperienze-home-verify/out`
Expected: nessun errore, bundle prodotto.

- [ ] **Step 3: Nessun checkpoint visivo per questo task**

Componente non ancora usato da nessuna pagina — il checkpoint comincia dal Task 5.

---

### Task 5: `components/home/EsperienzeInEvidenza.tsx` — nuovo componente bento home

**Files:**
- Create: `components/home/EsperienzeInEvidenza.tsx`

**Interfaces:**
- Consumes: `getEsperienzaPesto` (esistente, invariato), `getEscursioni` (Task 2), `EscursioneCard` (Task 4), traduzioni `Home.esperienze`/`Home.pesto` (Task 3).
- Produces: `EsperienzeInEvidenza({ locale }: { locale: string })` — consumato dal Task 6.

- [ ] **Step 1: Creare il file**

```tsx
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import Button from "@/components/ui/Button";
import SectionWrapper from "@/components/layout/SectionWrapper";
import EscursioneCard from "@/components/ui/EscursioneCard";
import { getEsperienzaPesto, getEscursioni } from "@/lib/queries";

// fallback solo se non c'è ancora nessuna escursione pubblicata su Sanity
// (27/08/2026, Punto 3b) — 2 voci finte senza foto, così il bento resta
// "1 grande + 2 piccole" anche a Sanity vuoto, mai un solo riquadro.
const ESCURSIONI_PLACEHOLDER = [
  { titolo: "Cinque Terre", sottotitolo: "20 min in treno", descrizione: undefined, fotoUrl: null, link: "/lerici" },
  { titolo: "Portovenere", sottotitolo: "10 min in battello", descrizione: undefined, fotoUrl: null, link: "/lerici" },
];

export default async function EsperienzeInEvidenza({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "Home.esperienze" });
  const tPesto = await getTranslations({ locale, namespace: "Home.pesto" });
  const pesto = await getEsperienzaPesto(locale);
  const escursioniReali = await getEscursioni(locale);
  const escursioni = escursioniReali.length > 0 ? escursioniReali.slice(0, 2) : ESCURSIONI_PLACEHOLDER;

  const numero = pesto?.visitatoriStagione ? `${pesto.visitatoriStagione}+` : tPesto("number");
  const titoloPesto = pesto?.titolo || tPesto("title");
  const descrizionePesto = pesto?.descrizione || tPesto("description");

  return (
    <SectionWrapper bg="white">
      <h2 className="font-heading text-3xl text-primary">{t("title")}</h2>
      <p className="mt-2 text-textMuted">{t("subtitle")}</p>

      <div className="mt-10 flex flex-col gap-6">
        <div className="grid items-center gap-10 overflow-hidden rounded-lg bg-accent p-8 md:grid-cols-2 md:p-10">
          <div>
            <p className="font-heading text-6xl text-white">{numero}</p>
            <p className="mt-1 text-white/85">{tPesto("numberLabel")}</p>
            <h3 className="mt-6 font-heading text-2xl text-white">{titoloPesto}</h3>
            <p className="mt-4 text-white/90">{descrizionePesto}</p>
            <Button href="/esperienze" variant="solid-white-accent" className="mt-6 inline-block">
              {tPesto("cta")}
            </Button>
          </div>
          {pesto?.fotoUrl ? (
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
              <Image src={pesto.fotoUrl} alt={titoloPesto} fill className="object-cover" />
            </div>
          ) : (
            <div className="aspect-[4/3] rounded-lg bg-white/10" />
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {escursioni.map((e, i) => (
            <EscursioneCard
              key={`${e.titolo}-${i}`}
              titolo={e.titolo}
              sottotitolo={e.sottotitolo}
              descrizione={e.descrizione}
              fotoUrl={e.fotoUrl}
              link={e.link}
            />
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
```

Verificare che `buttonClasses.ts` esponga davvero la variante `"solid-white-accent"` (usata oggi da `PestoHighlight.tsx`, quindi già esistente) prima di considerare completo questo step — se il nome variante fosse diverso, allinearlo a quello reale del file, non inventarne uno nuovo.

- [ ] **Step 2: Verificare con tsc ed esbuild**

Stessa sandbox dei task precedenti (stub `next-intl`/`next-intl/server` già usati nelle sessioni precedenti, verificare che accettino chiavi di traduzione arbitrarie come stringa). Run: `npx tsc --noEmit -p tsconfig.verify.json` (includendo `components/home/EsperienzeInEvidenza.tsx`) ed `npx esbuild components/home/EsperienzeInEvidenza.tsx --bundle --jsx=automatic --tsconfig=tsconfig.verify.json --external:next-intl/server --external:next/image --external:react --external:react-dom --external:@/components/ui/Button --external:@/components/layout/SectionWrapper --external:@/components/ui/EscursioneCard --external:@/lib/queries --outdir=/tmp/esperienze-home-verify/out`
Expected: nessun errore, bundle prodotto.

- [ ] **Step 3: Nota di verifica per il titolare**

Da controllare in `npm run dev` locale: home page, sezione "Esperienze" — un riquadro grande color accent (terracotta) con la foto/statistica del pesto, due riquadri più piccoli sotto (foto se il titolare ha già pubblicato almeno 2 `escursione` su Sanity, altrimenti il placeholder senza foto). Confermare esplicitamente se il nuovo trattamento "pesto come riquadro dentro la sezione" (invece del vecchio banner a piena larghezza) va bene così — vedi nota in cima al piano. Restringere la finestra sotto i 640px: le 3 card (pesto + 2 piccole) devono impilarsi in colonna, stesso comportamento del bento camere del Punto 3a.

---

### Task 6: `app/[locale]/(public)/page.tsx` — wiring, eliminazione componenti vecchi

**Files:**
- Modify: `app/[locale]/(public)/page.tsx:7-8` e `:82-83`
- Delete: `components/home/PestoHighlight.tsx`
- Delete: `components/home/LericiDintorni.tsx`

**Interfaces:**
- Consumes: `EsperienzeInEvidenza` (Task 5).

Contenuto attuale di riferimento (righe 1-15, letto fresh il 27/08/2026):

```tsx
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import JsonLd from "@/components/seo/JsonLd";
import Hero from "@/components/home/Hero";
import CamereInEvidenza from "@/components/home/CamereInEvidenza";
import RistorantePreview from "@/components/home/RistorantePreview";
import PestoHighlight from "@/components/home/PestoHighlight";
import LericiDintorni from "@/components/home/LericiDintorni";
import LavoroBanner from "@/components/home/LavoroBanner";
import GalleriaPreview from "@/components/home/GalleriaPreview";
import TripAdvisorWidget from "@/components/home/TripAdvisorWidget";
import FAQ from "@/components/home/FAQ";
import SectionWrapper from "@/components/layout/SectionWrapper";
import { getInfoHotel } from "@/lib/queries";
import { pageMetadata, SITE_URL, SITE_NAME } from "@/lib/seo";
```

Contenuto attuale di riferimento (righe 79-86):

```tsx
      <Hero fotoUrl={info.heroUrl} />
      <CamereInEvidenza locale={locale} />
      <RistorantePreview locale={locale} />
      <PestoHighlight />
      <LericiDintorni />
      <LavoroBanner />
      <GalleriaPreview locale={locale} />
```

- [ ] **Step 1: Sostituire le righe 7-8 (import)**

Sostituire:

```tsx
import PestoHighlight from "@/components/home/PestoHighlight";
import LericiDintorni from "@/components/home/LericiDintorni";
```

con:

```tsx
import EsperienzeInEvidenza from "@/components/home/EsperienzeInEvidenza";
```

- [ ] **Step 2: Sostituire le righe 82-83 (JSX)**

Sostituire:

```tsx
      <PestoHighlight />
      <LericiDintorni />
```

con:

```tsx
      <EsperienzeInEvidenza locale={locale} />
```

- [ ] **Step 3: Verificare con tsc ed esbuild**

Stessa sandbox dei task precedenti. Run: `npx tsc --noEmit -p tsconfig.verify.json` (includendo `app/[locale]/(public)/page.tsx`) ed `npx esbuild "app/[locale]/(public)/page.tsx" --bundle --jsx=automatic --tsconfig=tsconfig.verify.json --external:next --external:next-intl/server --external:react --external:react-dom --external:@/components/seo/JsonLd --external:@/components/home/* --external:@/components/layout/SectionWrapper --external:@/lib/queries --external:@/lib/seo --outdir=/tmp/esperienze-home-verify/out`
Expected: nessun errore, bundle prodotto.

- [ ] **Step 4: Chiedere il permesso di cancellazione prima di eliminare i due file**

Chiamare `device_request_delete_permission` sulla cartella connessa `sito-hotel`, motivo: "rimuovere PestoHighlight.tsx e LericiDintorni.tsx, sostituiti da EsperienzeInEvidenza.tsx (Punto 3b)". Attendere l'approvazione del titolare prima di procedere allo Step 5. Se rifiutata o senza risposta entro la sessione: spostare i due file in `components/home/_to_delete/` invece di cancellarli, e segnalarlo esplicitamente nella consegna finale.

- [ ] **Step 5: Eliminare i due file (solo se il permesso è stato concesso)**

Eliminare `components/home/PestoHighlight.tsx` e `components/home/LericiDintorni.tsx` — nessun altro file del repo li importa (verificato durante il brainstorming con un grep su `app`/`components`/`lib`).

- [ ] **Step 6: Nota di verifica per il titolare**

Da controllare in `npm run dev` locale: la home non deve più mostrare due sezioni separate per pesto e dintorni, solo la nuova sezione "Esperienze" (Task 5) al loro posto, nello stesso punto della pagina (dopo "Il Ristorante", prima del banner "Soggiorni di lavoro").

---

### Task 7: `app/[locale]/(public)/esperienze/page.tsx` — griglia da Sanity al posto di `ESCURSIONI`

**Files:**
- Modify: `app/[locale]/(public)/esperienze/page.tsx` (file intero, 92 righe)

**Interfaces:**
- Consumes: `getEscursioni` (Task 2), `EscursioneCard` (Task 4).

Contenuto attuale di riferimento (file intero, 92 righe, letto fresh il 27/08/2026):

```tsx
import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";
import SectionWrapper from "@/components/layout/SectionWrapper";
import { getEsperienzaPesto } from "@/lib/queries";
import { pageMetadata } from "@/lib/seo";

const ESCURSIONI = ["cinqueTerre", "portovenere", "kayak", "trekking"] as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "EsperienzePage" });
  const tHome = await getTranslations({ locale, namespace: "Home.pesto" });
  const pesto = await getEsperienzaPesto(locale);
  return pageMetadata({
    title: t("title"),
    description: pesto?.descrizione || tHome("description"),
    path: "/esperienze",
    locale,
    image: pesto?.fotoUrl,
  });
}

export default async function EsperienzePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "EsperienzePage" });
  const tHome = await getTranslations({ locale, namespace: "Home.pesto" });
  const pesto = await getEsperienzaPesto(locale);

  const titolo = pesto?.titolo || tHome("title");
  const descrizione = pesto?.descrizione || tHome("description");
  const numero = pesto?.visitatoriStagione ? `${pesto.visitatoriStagione}+` : tHome("number");

  return (
    <>
      <SectionWrapper bg="accent">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <p className="font-heading text-6xl text-white">{numero}</p>
            <p className="mt-1 text-white/85">{tHome("numberLabel")}</p>
            <h1 className="mt-6 font-heading text-3xl text-white">{titolo}</h1>
            <p className="mt-4 text-white/90">{descrizione}</p>
            {pesto?.prezzo && (
              <p className="mt-4 text-white/90">
                {pesto.durata} · €{pesto.prezzo}
              </p>
            )}
            <a
              href="mailto:info@hoteldelgolfo.com?subject=Prenotazione degustazione pesto"
              className="mt-6 inline-block rounded-full bg-white px-7 py-3 text-sm font-semibold text-accent transition-colors hover:bg-surface"
            >
              {t("pestoCta")}
            </a>
          </div>
          {pesto?.fotoUrl ? (
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
              <Image src={pesto.fotoUrl} alt={titolo} fill className="object-cover" />
            </div>
          ) : (
            <div className="aspect-[4/3] rounded-lg bg-white/10" />
          )}
        </div>
      </SectionWrapper>

      <SectionWrapper bg="white">
        <h2 className="font-heading text-3xl text-primary">{t("escursioniTitle")}</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {ESCURSIONI.map((key) => (
            <Link
              key={key}
              href="/lerici"
              className="rounded-lg border border-border p-6 shadow-card transition-shadow hover:shadow-cardHover"
            >
              <h3 className="font-heading text-xl text-primary">{t(`escursioni.${key}.titolo`)}</h3>
              <p className="mt-2 text-sm text-textMuted">{t(`escursioni.${key}.descrizione`)}</p>
            </Link>
          ))}
        </div>
      </SectionWrapper>
    </>
  );
}
```

- [ ] **Step 1: Sostituire l'intero contenuto del file**

```tsx
import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import SectionWrapper from "@/components/layout/SectionWrapper";
import EscursioneCard from "@/components/ui/EscursioneCard";
import { getEsperienzaPesto, getEscursioni } from "@/lib/queries";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "EsperienzePage" });
  const tHome = await getTranslations({ locale, namespace: "Home.pesto" });
  const pesto = await getEsperienzaPesto(locale);
  return pageMetadata({
    title: t("title"),
    description: pesto?.descrizione || tHome("description"),
    path: "/esperienze",
    locale,
    image: pesto?.fotoUrl,
  });
}

export default async function EsperienzePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "EsperienzePage" });
  const tHome = await getTranslations({ locale, namespace: "Home.pesto" });
  const pesto = await getEsperienzaPesto(locale);
  const escursioni = await getEscursioni(locale);

  const titolo = pesto?.titolo || tHome("title");
  const descrizione = pesto?.descrizione || tHome("description");
  const numero = pesto?.visitatoriStagione ? `${pesto.visitatoriStagione}+` : tHome("number");

  return (
    <>
      <SectionWrapper bg="accent">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <p className="font-heading text-6xl text-white">{numero}</p>
            <p className="mt-1 text-white/85">{tHome("numberLabel")}</p>
            <h1 className="mt-6 font-heading text-3xl text-white">{titolo}</h1>
            <p className="mt-4 text-white/90">{descrizione}</p>
            {pesto?.prezzo && (
              <p className="mt-4 text-white/90">
                {pesto.durata} · €{pesto.prezzo}
              </p>
            )}
            <a
              href="mailto:info@hoteldelgolfo.com?subject=Prenotazione degustazione pesto"
              className="mt-6 inline-block rounded-full bg-white px-7 py-3 text-sm font-semibold text-accent transition-colors hover:bg-surface"
            >
              {t("pestoCta")}
            </a>
          </div>
          {pesto?.fotoUrl ? (
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
              <Image src={pesto.fotoUrl} alt={titolo} fill className="object-cover" />
            </div>
          ) : (
            <div className="aspect-[4/3] rounded-lg bg-white/10" />
          )}
        </div>
      </SectionWrapper>

      <SectionWrapper bg="white">
        <h2 className="font-heading text-3xl text-primary">{t("escursioniTitle")}</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {escursioni.map((e, i) => (
            <EscursioneCard
              key={`${e.titolo}-${i}`}
              titolo={e.titolo}
              sottotitolo={e.sottotitolo}
              descrizione={e.descrizione}
              fotoUrl={e.fotoUrl}
              link={e.link}
            />
          ))}
        </div>
      </SectionWrapper>
    </>
  );
}
```

Nota: rimosso l'import di `Link` da `@/lib/i18n/navigation` — era usato solo dal blocco `ESCURSIONI.map` ora sostituito; nessun altro punto del file lo usa (verificato sul contenuto integrale letto sopra).

- [ ] **Step 2: Verificare con tsc ed esbuild**

Stessa sandbox dei task precedenti. Run: `npx tsc --noEmit -p tsconfig.verify.json` (includendo `app/[locale]/(public)/esperienze/page.tsx`) ed `npx esbuild "app/[locale]/(public)/esperienze/page.tsx" --bundle --jsx=automatic --tsconfig=tsconfig.verify.json --external:next --external:next/image --external:next-intl/server --external:react --external:react-dom --external:@/components/layout/SectionWrapper --external:@/components/ui/EscursioneCard --external:@/lib/queries --external:@/lib/seo --outdir=/tmp/esperienze-home-verify/out`
Expected: nessun errore, bundle prodotto.

- [ ] **Step 3: Nota di verifica per il titolare**

Da controllare in `npm run dev` locale: pagina `/esperienze` — il banner pesto in alto resta identico a prima; sotto, la griglia mostra TUTTE le `escursione` pubblicate su Sanity (non solo 2 come in home), o resta vuota se non ne hai ancora pubblicata nessuna (nessun placeholder qui, a differenza della home — comportamento accettato dalla spec, questa pagina non ha un fallback dedicato).

---

### Task 8: Aggiornare `STATO_PROGETTO.md`

**Files:**
- Modify: `STATO_PROGETTO.md`

**Interfaces:** Nessuna — solo documentazione.

- [ ] **Step 1: Aggiungere la voce di chiusura**

Aggiungere, subito dopo la voce "Punto 3a (bento camere in home) CHIUSO" già presente, una nuova voce "Punto 3b (esperienze in home) CHIUSO" che copre:
- Il nuovo document type Sanity `escursione` e la nota che il titolare deve popolarlo lui (zero voci reali al momento della consegna — placeholder attivo finché non ne pubblica almeno una).
- La sostituzione di `PestoHighlight.tsx` + `LericiDintorni.tsx` con `EsperienzeInEvidenza.tsx`, e l'aggiornamento di `/esperienze` per usare la stessa fonte dati.
- La decisione di design esplicita: pesto passa da banner a piena larghezza a riquadro dentro la stessa sezione bento (da confermare a video dal titolare, vedi Task 5).
- I file toccati/creati/eliminati (schema, query, 2 componenti nuovi, 2 pagine, 4 file `messages/*.json`, 2 file eliminati).
- I limiti di verifica di questa sessione Cowork (solo `tsc --noEmit`/`esbuild --bundle`, nessun accesso a Sanity Studio/browser reale, nessuna cancellazione file senza permesso esplicito).

- [ ] **Step 2: Nessun checkpoint visivo per questo task**

Documentazione pura, nessun impatto sul sito.

---

## Note di esecuzione

- Ordine consigliato: Task 1 → 2 → 3 (indipendenti tra loro, propedeutici ai successivi) → 4 (indipendente, può girare in parallelo a 1-3) → 5 (consuma 2, 3, 4) → 6 (consuma 5) → 7 (consuma 2 e 4, può girare in parallelo a 5/6) → 8 sempre ultimo.
- Consegna: un solo `SendUserFile` con tutti i file toccati dall'intero piano (schema, query, 2 componenti nuovi, `page.tsx` home, `esperienze/page.tsx`, i 4 file `messages/*.json`, `STATO_PROGETTO.md`, questo file di piano) + un solo `device_commit_files` — mai consegne sparse per task. I due file eliminati (Task 6) vanno segnalati esplicitamente nel messaggio di consegna, non solo impliciti nell'assenza dalla lista.

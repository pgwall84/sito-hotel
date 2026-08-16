# Welcome Book digitale (modulo 4.2) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Espandere il Welcome Book digitale da 6 a 15 sezioni, con navigazione dedicata (route group isolato dal sito pubblico), card `LuogoCard` riusabile (icona per categoria, indirizzo, nota, telefono con conferma, bottone Google Maps esterno), e schema Sanity esteso.

**Architecture:** Route group Next.js App Router `(public)`/`(benvenuto)` sotto `app/[locale]/`, completamente isolati (layout separati, nessuna logica condizionale nel layout radice). Nuovo tipo oggetto Sanity riusabile `luogo` (con `categoria` a icona fissa) per le 8 sezioni a elenco di luoghi. Dati letti via `getWelcomeBook` esteso in `lib/queries.ts`.

**Tech Stack:** Next.js 16.3.0 (App Router), React 19.2.4, next-intl 4.x, Sanity v5, Tailwind v4, lucide-react (icone, già presente — nessuna nuova dipendenza).

**Riferimento spec:** `docs/superpowers/specs/2026-08-16-welcome-book-design.md` (approvata dal titolare, incluse le revisioni del 16/08/2026 su farmacie/categoria/indirizzo/bottone maps).

## Global Constraints

- Nessuna nuova dipendenza — `lucide-react` è già in `package.json`, tutte le icone scelte esistono nel set standard.
- Design: solo classi Tailwind/token già in uso in `lib/theme.ts` — mai colori o font hardcoded (CLAUDE.md Sezione 3).
- Ogni sottopagina `(benvenuto)` deve avere `generateMetadata` con `robots: { index: false, follow: false }` — pattern già in uso in tutte le pagine `benvenuto/*` esistenti, non opzionale (contiene la password WiFi).
- Nessun framework di test automatico in questo repo (`package.json`: solo `build`/`lint`). I passi "test" di questo piano sono `npm run lint` (veloce, dopo ogni task) e `npm run build` (dopo i task di ristrutturazione route e a fine piano) eseguiti via `device_bash` nella cartella montata dell'utente — non pytest/vitest.
- **Meccanica di consegna** (adattamento a questo ambiente, non standard): il repo vive sul PC dell'utente (`C:\Users\pgwal\Cloude\sito-hotel`), non è clonato nel sandbox cloud. Ogni file creato/modificato va scritto qui con Write/Edit, poi consegnato con `SendUserFile` + `mcp__remote-devices__device_commit_files` verso il path reale sul dispositivo, poi verificato/committato con `mcp__remote-devices__device_bash` (che opera sulla cartella montata, con `node_modules`/git reali). I passi "Consegna e verifica" di ogni task usano questo meccanismo, non `pytest`/`git commit` locali diretti.
- Route group (`(public)`, `(benvenuto)`) sono invisibili nell'URL — zero impatto SEO, sito non ancora indicizzato.

---

### Task 1: Schema Sanity — tipo `luogo` e campi `welcomeBook`

**Files:**
- Create: `sanity/schemaTypes/objects/luogo.ts`
- Modify: `sanity/schemaTypes/documents/welcomeBook.ts`
- Modify: `sanity/schemaTypes/index.ts`

**Interfaces:**
- Produces: tipo Sanity `luogo` (campi: `nome` localeString richiesto, `categoria` string enum, `indirizzo` string, `nota` localeText, `telefono` string, `lat`/`lon` number, `link` url) — consumato da Task 2 (query GROQ) e implicitamente da tutte le pagine che leggono `wb.trasporti`/`wb.servizi`/ecc.

- [ ] **Step 1: Crea `sanity/schemaTypes/objects/luogo.ts`**

```ts
import { defineField, defineType } from "sanity";

// Oggetto riusabile per ogni "luogo/consiglio" del Welcome Book digitale
// (Trasporti, Servizi, Attività, Ristoranti esterni, Bar, Shopping,
// Informazioni, Emergenza — vedi docs/superpowers/specs/2026-08-16-
// welcome-book-design.md). Tutti i campi opzionali tranne "nome".
// "categoria" pilota l'icona mostrata da LuogoCard (components/ui/
// LuogoCard.tsx) — se si aggiunge un valore qui, aggiungere anche la riga
// corrispondente nella mappa icone di quel componente.
export const luogo = defineType({
  name: "luogo",
  title: "Luogo / consiglio",
  type: "object",
  fields: [
    defineField({
      name: "nome",
      title: "Nome",
      type: "localeString",
      validation: (Rule) => Rule.required(),
    }),
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
    defineField({
      name: "lat",
      title: "Latitudine",
      type: "number",
      validation: (Rule) =>
        Rule.custom((lat, ctx) => {
          const lon = (ctx.parent as { lon?: number })?.lon;
          if ((lat != null) !== (lon != null)) return "Lat e lon vanno inserite insieme";
          return true;
        }),
    }),
    defineField({
      name: "lon",
      title: "Longitudine",
      type: "number",
      validation: (Rule) =>
        Rule.custom((lon, ctx) => {
          const lat = (ctx.parent as { lat?: number })?.lat;
          if ((lon != null) !== (lat != null)) return "Lat e lon vanno inserite insieme";
          return true;
        }),
    }),
    defineField({ name: "link", title: "Link (sito o Google Maps)", type: "url" }),
  ],
  preview: {
    select: { title: "nome.it", subtitle: "indirizzo" },
  },
});
```

- [ ] **Step 2: Registra `luogo` in `sanity/schemaTypes/index.ts`**

Modifica `sanity/schemaTypes/index.ts:1-34` aggiungendo l'import e la voce nell'array:

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

- [ ] **Step 3: Sostituisci `sanity/schemaTypes/documents/welcomeBook.ts`**

```ts
import { defineField, defineType } from "sanity";

// Welcome Book digitale (modulo 4.2) — pagina raggiungibile solo da QR in
// camera o link diretto, MAI dal menu pubblico del sito (contiene la
// password WiFi, non deve comparire in navigazione né essere indicizzata —
// vedi app/[locale]/(benvenuto)/benvenuto/page.tsx, robots noindex e
// assente da sitemap.ts). Contatti reception e link al menu ristorante sono
// già in infoHotel/sezioneRistorante — non duplicati qui.
//
// Redesign 16/08/2026: da 6 a 15 sezioni. Le 8 sezioni a elenco di luoghi
// (Trasporti, Servizi, Attività, Ristoranti esterni, Bar, Shopping,
// Informazioni, Emergenza) usano il tipo riusabile "luogo" (vedi
// objects/luogo.ts). "consigliLerici"/"consigliLericiTitolo" sono stati
// rimossi (contenuto vuoto/bozza, confermato dal titolare) — sostituiti da
// "posizioneTesto".
export const welcomeBook = defineType({
  name: "welcomeBook",
  title: "Welcome Book (QR camere)",
  type: "document",
  fields: [
    defineField({ name: "titoloBenvenuto", title: "Titolo di benvenuto", type: "localeString" }),
    defineField({ name: "messaggioBenvenuto", title: "Messaggio di benvenuto", type: "localeText" }),

    defineField({ name: "wifiNome", title: "Nome rete WiFi (SSID)", type: "string" }),
    defineField({ name: "wifiPassword", title: "Password WiFi", type: "string" }),

    defineField({ name: "orariCheckin", title: "Orario check-in", type: "string" }),
    defineField({ name: "orariCheckout", title: "Orario check-out", type: "string" }),
    defineField({
      name: "orariColazione",
      title: "Orario colazione",
      description: "Mostrato nella pagina Servizi del Welcome Book.",
      type: "string",
    }),

    defineField({
      name: "regoleCasa",
      title: "Regole della casa",
      type: "array",
      of: [{ type: "localeString" }],
    }),

    defineField({
      name: "numeriUtili",
      title: "Numeri utili",
      description: "Es. Farmacia, Guardia medica, Taxi — reception e telefono hotel sono già in Info Hotel, non ripeterli qui.",
      type: "array",
      of: [
        {
          type: "object",
          name: "numeroUtile",
          fields: [
            defineField({ name: "etichetta", title: "Etichetta", type: "localeString" }),
            defineField({ name: "valore", title: "Numero / valore", type: "string" }),
          ],
          preview: {
            select: { title: "etichetta.it", subtitle: "valore" },
          },
        },
      ],
    }),

    defineField({ name: "posizioneLat", title: "Posizione — Latitudine hotel", type: "number" }),
    defineField({ name: "posizioneLon", title: "Posizione — Longitudine hotel", type: "number" }),
    defineField({
      name: "posizioneTesto",
      title: "Posizione — presentazione breve del borgo",
      type: "localeText",
    }),

    defineField({ name: "trasporti", title: "Trasporti", type: "array", of: [{ type: "luogo" }] }),
    defineField({ name: "servizi", title: "Servizi", type: "array", of: [{ type: "luogo" }] }),
    defineField({ name: "attivita", title: "Attività", type: "array", of: [{ type: "luogo" }] }),
    defineField({
      name: "ristorantiEsterni",
      title: "Ristoranti — altri consigli",
      description: "Consigli esterni oltre al ristorante dell'hotel (letto da Sezione Ristorante).",
      type: "array",
      of: [{ type: "luogo" }],
    }),
    defineField({ name: "bar", title: "Bar", type: "array", of: [{ type: "luogo" }] }),
    defineField({ name: "shopping", title: "Shopping", type: "array", of: [{ type: "luogo" }] }),
    defineField({
      name: "informazioni",
      title: "Informazioni",
      description: "Banca/bancomat, supermercati, chiese, benzinai, raccolta rifiuti, ecc.",
      type: "array",
      of: [{ type: "luogo" }],
    }),
    defineField({
      name: "emergenza",
      title: "Emergenza",
      description: "112, pronto soccorso, farmacie (elenco fisso, non calcolato), forze dell'ordine, guardia costiera.",
      type: "array",
      of: [{ type: "luogo" }],
    }),
  ],
  preview: {
    prepare: () => ({ title: "Welcome Book" }),
  },
});
```

- [ ] **Step 4: Consegna e verifica**

Consegna i 3 file con `SendUserFile` + `mcp__remote-devices__device_commit_files` verso:
`C:\Users\pgwal\Cloude\sito-hotel\sanity\schemaTypes\objects\luogo.ts`,
`C:\Users\pgwal\Cloude\sito-hotel\sanity\schemaTypes\documents\welcomeBook.ts`,
`C:\Users\pgwal\Cloude\sito-hotel\sanity\schemaTypes\index.ts`.

Poi via `mcp__remote-devices__device_bash`:
```bash
cd ~/mnt/sito-hotel && npm run lint
```
Atteso: nessun errore. Poi commit:
```bash
cd ~/mnt/sito-hotel && git add sanity/schemaTypes && git commit -m "feat(sanity): tipo luogo riusabile, estensione schema welcomeBook a 15 sezioni"
```

---

### Task 2: `lib/queries.ts` — estensione `getWelcomeBook`

**Files:**
- Modify: `lib/queries.ts:250-304` (blocco "Welcome Book")

**Interfaces:**
- Consumes: tipo Sanity `luogo` (Task 1).
- Produces: `export type Luogo` (campi: `nome: string`, `categoria?: string`, `indirizzo?: string`, `nota?: string`, `telefono?: string`, `lat?: number`, `lon?: number`, `link?: string`) e i nuovi campi del ritorno di `getWelcomeBook`: `posizioneLat?: number`, `posizioneLon?: number`, `posizioneTesto: string`, `trasporti: Luogo[]`, `servizi: Luogo[]`, `attivita: Luogo[]`, `ristorantiEsterni: Luogo[]`, `bar: Luogo[]`, `shopping: Luogo[]`, `informazioni: Luogo[]`, `emergenza: Luogo[]` — consumati da Task 3 (LuogoCard/LuogoGrid) e da tutte le pagine sezione (Task 9-12).

- [ ] **Step 1: Sostituisci il blocco "Welcome Book" (righe 250-304) con:**

```ts
// ---------- Welcome Book (modulo 4.2 — QR in camera) ----------
// Nota: niente REVALIDATE lungo qui non serve — usa lo stesso ISR 60s di
// tutto il resto. Contatti reception e link menu ristorante NON sono in
// questo documento: si leggono da getInfoHotel/getSezioneRistorante nella
// pagina, per non duplicare dati già gestiti altrove in Sanity.

const WELCOME_BOOK_QUERY = groq`
  *[_type == "welcomeBook"][0] {
    titoloBenvenuto, messaggioBenvenuto,
    wifiNome, wifiPassword,
    orariCheckin, orariCheckout, orariColazione,
    regoleCasa,
    numeriUtili,
    posizioneLat, posizioneLon, posizioneTesto,
    trasporti, servizi, attivita, ristorantiEsterni, bar, shopping,
    informazioni, emergenza
  }
`;

interface NumeroUtileRaw {
  etichetta?: LocaleString;
  valore?: string;
}

interface LuogoRaw {
  nome?: LocaleString;
  categoria?: string;
  indirizzo?: string;
  nota?: LocaleString;
  telefono?: string;
  lat?: number;
  lon?: number;
  link?: string;
}

export type Luogo = {
  nome: string;
  categoria?: string;
  indirizzo?: string;
  nota?: string;
  telefono?: string;
  lat?: number;
  lon?: number;
  link?: string;
};

function mapLuogo(raw: LuogoRaw, locale: Locale): Luogo {
  return {
    nome: pickLocale(raw.nome, locale) ?? "",
    categoria: raw.categoria,
    indirizzo: raw.indirizzo,
    nota: pickLocale(raw.nota, locale),
    telefono: raw.telefono,
    lat: raw.lat,
    lon: raw.lon,
    link: raw.link,
  };
}

function mapLuoghi(raw: LuogoRaw[] | undefined, locale: Locale): Luogo[] {
  return (raw ?? []).map((l) => mapLuogo(l, locale)).filter((l) => l.nome);
}

interface WelcomeBookRaw {
  titoloBenvenuto?: LocaleString;
  messaggioBenvenuto?: LocaleString;
  wifiNome?: string;
  wifiPassword?: string;
  orariCheckin?: string;
  orariCheckout?: string;
  orariColazione?: string;
  regoleCasa?: LocaleString[];
  numeriUtili?: NumeroUtileRaw[];
  posizioneLat?: number;
  posizioneLon?: number;
  posizioneTesto?: LocaleString;
  trasporti?: LuogoRaw[];
  servizi?: LuogoRaw[];
  attivita?: LuogoRaw[];
  ristorantiEsterni?: LuogoRaw[];
  bar?: LuogoRaw[];
  shopping?: LuogoRaw[];
  informazioni?: LuogoRaw[];
  emergenza?: LuogoRaw[];
}

export const getWelcomeBook = cache(async (locale: Locale) => {
  const w = await client.fetch<WelcomeBookRaw | null>(WELCOME_BOOK_QUERY, {}, REVALIDATE);
  if (!w) return null;
  return {
    titoloBenvenuto: pickLocale(w.titoloBenvenuto, locale) ?? "",
    messaggioBenvenuto: pickLocale(w.messaggioBenvenuto, locale) ?? "",
    wifiNome: w.wifiNome ?? "",
    wifiPassword: w.wifiPassword ?? "",
    orariCheckin: w.orariCheckin ?? "",
    orariCheckout: w.orariCheckout ?? "",
    orariColazione: w.orariColazione ?? "",
    regoleCasa: (w.regoleCasa ?? []).map((r) => pickLocale(r, locale)).filter(Boolean) as string[],
    numeriUtili: (w.numeriUtili ?? [])
      .map((n) => ({ etichetta: pickLocale(n.etichetta, locale) ?? "", valore: n.valore ?? "" }))
      .filter((n) => n.etichetta && n.valore),
    posizioneLat: w.posizioneLat,
    posizioneLon: w.posizioneLon,
    posizioneTesto: pickLocale(w.posizioneTesto, locale) ?? "",
    trasporti: mapLuoghi(w.trasporti, locale),
    servizi: mapLuoghi(w.servizi, locale),
    attivita: mapLuoghi(w.attivita, locale),
    ristorantiEsterni: mapLuoghi(w.ristorantiEsterni, locale),
    bar: mapLuoghi(w.bar, locale),
    shopping: mapLuoghi(w.shopping, locale),
    informazioni: mapLuoghi(w.informazioni, locale),
    emergenza: mapLuoghi(w.emergenza, locale),
  };
});
```

Nota: `LocaleString` qui è l'alias TS già esistente in cima al file (`type LocaleString = Partial<Record<"it"|"en"|"de"|"fr", string>>`), riusato per `nota`/`posizioneTesto` esattamente come il codice esistente lo riusa già per campi `localeText` (es. `descrizione` in `InfoHotelRaw`) — non serve un alias separato.

- [ ] **Step 2: Consegna e verifica**

Consegna `lib/queries.ts` verso `C:\Users\pgwal\Cloude\sito-hotel\lib\queries.ts`. Poi:
```bash
cd ~/mnt/sito-hotel && npm run lint && npx tsc --noEmit
```
Atteso: nessun errore (il `tsc --noEmit` qui è l'unico modo di verificare i tipi senza un framework di test — non toccare se non presente come script, va bene lanciarlo diretto). Poi commit:
```bash
cd ~/mnt/sito-hotel && git add lib/queries.ts && git commit -m "feat(queries): estende getWelcomeBook a posizione e 8 sezioni luogo[]"
```

---

### Task 3: `LuogoCard` e `LuogoGrid`

**Files:**
- Create: `components/ui/LuogoCard.tsx`
- Create: `components/ui/LuogoGrid.tsx`

**Interfaces:**
- Consumes: `Luogo` type da `lib/queries.ts` (Task 2).
- Produces: `export default function LuogoCard({ luogo }: { luogo: Luogo })`, `export default function LuogoGrid({ luoghi, infoNonDisponibile }: { luoghi: Luogo[]; infoNonDisponibile: string })` — consumati da tutte le pagine sezione luogo[] (Task 11, 12).

- [ ] **Step 1: Crea `components/ui/LuogoCard.tsx`**

```tsx
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Pill, Landmark, ShoppingCart, Church, Fuel, Car, Bus, Ship,
  ArrowUpDown, UtensilsCrossed, Coffee, ShoppingBag, Umbrella, Compass,
  Siren, Shield, Anchor, Info, MapPin, Phone, type LucideIcon,
} from "lucide-react";
import type { Luogo } from "@/lib/queries";

// Card per un singolo "luogo" (Trasporti, Servizi, Attività, Ristoranti
// esterni, Bar, Shopping, Informazioni, Emergenza — vedi docs/superpowers/
// specs/2026-08-16-welcome-book-design.md §3.2). Niente MapEmbed incorporato
// qui di proposito: dietro consenso cookie funzionale, attrito nel momento
// sbagliato per un ospite che cerca indicazioni — solo link esterno a
// Google Maps, che apre navigazione vera. MapEmbed resta in uso nella sola
// pagina Posizione (mappa unica, non in un elenco di card).
const CATEGORIA_ICONS: Record<string, LucideIcon> = {
  farmacia: Pill,
  "banca-bancomat": Landmark,
  supermercato: ShoppingCart,
  chiesa: Church,
  benzina: Fuel,
  taxi: Car,
  bus: Bus,
  traghetto: Ship,
  navetta: Bus,
  ascensore: ArrowUpDown,
  ristorante: UtensilsCrossed,
  bar: Coffee,
  negozio: ShoppingBag,
  spiaggia: Umbrella,
  "noleggio-attivita": Compass,
  soccorso: Siren,
  "forze-ordine": Shield,
  "guardia-costiera": Anchor,
  "comune-turismo": Info,
  altro: MapPin,
};

export default function LuogoCard({ luogo }: { luogo: Luogo }) {
  const t = useTranslations("LuogoCard");
  const [confermaChiamata, setConfermaChiamata] = useState(false);
  const Icon = CATEGORIA_ICONS[luogo.categoria ?? "altro"] ?? MapPin;

  const mapsHref =
    luogo.lat != null && luogo.lon != null
      ? `https://www.google.com/maps/search/?api=1&query=${luogo.lat},${luogo.lon}`
      : luogo.indirizzo
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(luogo.indirizzo)}`
        : null;

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border bg-background p-5 shadow-card">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface text-primary">
          <Icon size={20} />
        </span>
        <h3 className="font-heading text-lg text-primary">{luogo.nome}</h3>
      </div>

      {luogo.indirizzo && <p className="text-sm text-textMuted">{luogo.indirizzo}</p>}
      {luogo.nota && <p className="text-sm text-text">{luogo.nota}</p>}

      {(luogo.telefono || mapsHref) && (
        <div className="mt-2 flex items-center gap-3">
          {luogo.telefono && (
            <button
              type="button"
              aria-label={t("chiamaConferma")}
              onClick={() => setConfermaChiamata(true)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-surface text-primary hover:bg-surfaceDark"
            >
              <Phone size={16} />
            </button>
          )}
          {mapsHref && (
            <a
              href={mapsHref}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto text-sm font-semibold text-primary hover:text-accent"
            >
              {t("apriMappa")} →
            </a>
          )}
        </div>
      )}

      {confermaChiamata && luogo.telefono && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setConfermaChiamata(false)}
        >
          <div
            className="w-full max-w-xs rounded-xl bg-background p-6 text-center shadow-cardHover"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="font-heading text-lg text-primary">
              {t("chiamaConfirmTitle", { nome: luogo.nome })}
            </p>
            <p className="mt-1 text-sm text-textMuted">
              {t("chiamaConfirmNumero", { telefono: luogo.telefono })}
            </p>
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setConfermaChiamata(false)}
                className="flex-1 rounded-full border border-border py-2 text-sm font-semibold text-text"
              >
                {t("chiamaAnnulla")}
              </button>
              <a
                href={`tel:${luogo.telefono}`}
                className="flex-1 rounded-full bg-primary py-2 text-center text-sm font-semibold text-white"
              >
                {t("chiamaConferma")}
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Crea `components/ui/LuogoGrid.tsx`**

```tsx
import LuogoCard from "@/components/ui/LuogoCard";
import type { Luogo } from "@/lib/queries";

// Wrapper DRY per ogni pagina sezione che mostra un elenco di luoghi —
// stesso pattern "infoNonDisponibile" già in uso altrove nel Welcome Book:
// mai una sezione vuota senza spiegazione.
export default function LuogoGrid({
  luoghi,
  infoNonDisponibile,
}: {
  luoghi: Luogo[];
  infoNonDisponibile: string;
}) {
  if (luoghi.length === 0) {
    return <p className="mt-4 text-sm text-textMuted">{infoNonDisponibile}</p>;
  }

  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2">
      {luoghi.map((l, i) => (
        <LuogoCard key={`${l.nome}-${i}`} luogo={l} />
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Consegna e verifica**

Consegna verso `C:\Users\pgwal\Cloude\sito-hotel\components\ui\LuogoCard.tsx` e `...\components\ui\LuogoGrid.tsx`. Poi `npm run lint` via `device_bash` (atteso: nessun errore — noterà `t("LuogoCard"...)` come mancante finché non fai Task 13, è normale, i18n arriva dopo; se il linter la segnala come errore bloccante invece che warning, sposta la verifica finale di questo task dopo Task 13). Commit:
```bash
cd ~/mnt/sito-hotel && git add components/ui/LuogoCard.tsx components/ui/LuogoGrid.tsx && git commit -m "feat(ui): componente LuogoCard (icona categoria, indirizzo, telefono con conferma, bottone maps) e LuogoGrid"
```

---

### Task 4: `BenvenutoTopBar`

**Files:**
- Create: `components/layout/BenvenutoTopBar.tsx`

**Interfaces:**
- Produces: `export default function BenvenutoTopBar()` (nessuna prop — legge il pathname da sé) — consumato dal layout `(benvenuto)` (Task 7).

- [ ] **Step 1: Crea `components/layout/BenvenutoTopBar.tsx`**

Nota tecnica rispetto alla spec: invece di passare `titolo` come prop da ogni pagina (difficile in App Router, un layout non riceve prop dalle pagine figlie), il componente deduce la sezione corrente dal pathname (via `usePathname` di next-intl, che non include il locale) e risolve il titolo da una mappa fissa segmento→chiave di traduzione. Stesso risultato, meno codice duplicato per pagina.

```tsx
"use client";

import { usePathname } from "@/lib/i18n/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { ArrowLeft } from "lucide-react";
import LinguaSelector from "@/components/ui/LinguaSelector";

const SEGMENT_TITLE_KEYS: Record<string, string> = {
  checkin: "checkinTitle",
  checkout: "checkoutTitle",
  wifi: "wifiTitle",
  regole: "regoleTitle",
  posizione: "posizioneTitle",
  trasporti: "trasportiTitle",
  servizi: "serviziTitle",
  attivita: "attivitaTitle",
  ristoranti: "ristorantiTitle",
  bar: "barTitle",
  shopping: "shoppingTitle",
  informazioni: "informazioniTitle",
  emergenza: "emergenzaTitle",
  contatti: "contattiTitle",
};

export default function BenvenutoTopBar() {
  const pathname = usePathname();
  const t = useTranslations("BenvenutoPage");

  // Sull'hub (/benvenuto) niente topbar: la riga superiore lì è il banner
  // di benvenuto + LinguaSelector, non questa barra (vedi hub page.tsx).
  if (pathname === "/benvenuto") return null;

  const segment = pathname.split("/").pop() ?? "";
  const titleKey = SEGMENT_TITLE_KEYS[segment];
  const titolo = titleKey ? t(titleKey as Parameters<typeof t>[0]) : "";

  return (
    <div className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link
          href="/benvenuto"
          className="flex items-center gap-1 text-sm font-semibold text-primary hover:text-accent"
        >
          <ArrowLeft size={16} /> {t("menuBackCta")}
        </Link>
        <h1 className="font-heading text-base text-text">{titolo}</h1>
        <LinguaSelector />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Consegna e verifica**

Consegna verso `C:\Users\pgwal\Cloude\sito-hotel\components\layout\BenvenutoTopBar.tsx`. `npm run lint` via `device_bash` (stesso avviso i18n del Task 3 — normale finché Task 13 non è fatto). Commit:
```bash
cd ~/mnt/sito-hotel && git add components/layout/BenvenutoTopBar.tsx && git commit -m "feat(layout): BenvenutoTopBar (Menu / titolo pagina / lingua), nascosta sull'hub"
```

---

### Task 5: Restyle `BenvenutoTile` per 15 tile su 3 colonne mobile

**Files:**
- Modify: `components/ui/BenvenutoTile.tsx`

- [ ] **Step 1: Sostituisci `components/ui/BenvenutoTile.tsx`**

```tsx
import type { LucideIcon } from "lucide-react";
import { Link } from "@/lib/i18n/navigation";

// Pulsante a icona della griglia hub del Welcome Book digitale (modulo 4.2).
// Restyle 16/08/2026: da 6 a 15 tile, sempre 3 colonne anche su mobile
// (vedi app/[locale]/(benvenuto)/benvenuto/page.tsx) — icona/testo più
// compatti per stare leggibili in uno spazio più piccolo.
export default function BenvenutoTile({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-1.5 rounded-xl border border-border bg-background p-3 text-center shadow-card transition-shadow hover:shadow-cardHover"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-surface text-primary">
        <Icon size={20} />
      </span>
      <span className="text-xs font-semibold leading-tight text-text">{label}</span>
    </Link>
  );
}
```

- [ ] **Step 2: Consegna e verifica**

Consegna verso `C:\Users\pgwal\Cloude\sito-hotel\components\ui\BenvenutoTile.tsx`. `npm run lint`. Commit:
```bash
cd ~/mnt/sito-hotel && git add components/ui/BenvenutoTile.tsx && git commit -m "style(ui): BenvenutoTile compatto per griglia 3 colonne con 15 sezioni"
```

---

### Task 6: Route group `(public)` — isola Header/Footer/WhatsApp dal sito pubblico

**Files:**
- Create: `app/[locale]/(public)/layout.tsx`
- Modify: `app/[locale]/layout.tsx` (rimuove Header/Footer/WhatsAppButton/getInfoHotel)
- Move (contenuto invariato, via `git mv`): `app/[locale]/page.tsx`, `camere/`, `contatti/`, `cookie-policy/`, `esperienze/`, `galleria/`, `lavoro/`, `lerici/`, `offerte/`, `privacy-policy/`, `ristorante/` → sotto `app/[locale]/(public)/`

**Interfaces:**
- Consumes: `getInfoHotel` da `lib/queries.ts` (invariato).
- Produces: nessuna nuova interfaccia — isolamento strutturale, le 12 pagine pubbliche continuano a funzionare identiche a prima (stessi URL, route group invisibile).

Verificato: tutte le pagine pubbliche importano solo via alias `@/...` o pacchetti npm, nessun import relativo (`../`) — lo spostamento con `git mv` non rompe nulla, zero modifiche di contenuto necessarie.

- [ ] **Step 1: Crea `app/[locale]/(public)/layout.tsx`**

```tsx
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/ui/WhatsAppButton";
import { getInfoHotel } from "@/lib/queries";

export default async function PublicLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const info = await getInfoHotel(locale);

  return (
    <>
      <Header logoUrl={info.logoUrl} nome={info.nome} />
      <main className="flex-1">{children}</main>
      <Footer logoBiancoUrl={info.logoBiancoUrl} nome={info.nome} />
      <WhatsAppButton telefono={info.telefonoMobile} />
    </>
  );
}
```

Consegna verso `C:\Users\pgwal\Cloude\sito-hotel\app\[locale]\(public)\layout.tsx`.

- [ ] **Step 2: Sostituisci `app/[locale]/layout.tsx` (radice)**

```tsx
import type { Metadata } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";
import { Playfair_Display, Inter } from "next/font/google";
import { routing } from "@/lib/i18n/routing";
import { SITE_URL, SITE_NAME } from "@/lib/seo";
import CookieConsentInit from "@/components/cookie/CookieConsentInit";
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";
import "./globals.css";

const playfairDisplay = Playfair_Display({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Hotel familiare a Lerici, 150 metri dal mare — gateway per Cinque Terre e Portovenere.",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

// Ridotto 16/08/2026 (redesign Welcome Book): Header/Footer/WhatsAppButton
// spostati in (public)/layout.tsx — questo layout radice è condiviso da
// TUTTO il sito, incluso (benvenuto), che non deve ereditare la chrome
// pubblica. CookieConsentInit resta qui: MapEmbed (usato anche nel Welcome
// Book, pagina Posizione) dipende dal consenso cookie funzionale, deve
// restare disponibile ovunque.
export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return (
    <html
      lang={locale}
      className={`${playfairDisplay.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <NextIntlClientProvider>
          {children}
          <CookieConsentInit />
          <GoogleAnalytics />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

Consegna verso `C:\Users\pgwal\Cloude\sito-hotel\app\[locale]\layout.tsx`.

- [ ] **Step 3: Sposta le 11 pagine pubbliche con `git mv` (contenuto invariato)**

Via `mcp__remote-devices__device_bash`:

```bash
cd ~/mnt/sito-hotel/app/\[locale\]
mkdir -p "(public)"
git mv page.tsx "(public)/page.tsx"
git mv camere "(public)/camere"
git mv contatti "(public)/contatti"
git mv cookie-policy "(public)/cookie-policy"
git mv esperienze "(public)/esperienze"
git mv galleria "(public)/galleria"
git mv lavoro "(public)/lavoro"
git mv lerici "(public)/lerici"
git mv offerte "(public)/offerte"
git mv privacy-policy "(public)/privacy-policy"
git mv ristorante "(public)/ristorante"
```

- [ ] **Step 4: Verifica**

```bash
cd ~/mnt/sito-hotel && npm run lint && npm run build
```
Atteso: build pulita. Verifica manuale rapida (elenco, non richiede browser): `find "app/[locale]/(public)" -name "page.tsx"` deve elencare 12 file (home + 10 sezioni + `camere/[slug]`), `app/[locale]/benvenuto` deve ancora esistere invariata per ora (la spostiamo nel Task 7).

- [ ] **Step 5: Commit**

```bash
cd ~/mnt/sito-hotel && git add -A app/\[locale\] && git commit -m "refactor(routing): isola il sito pubblico nel route group (public), root layout ridotto"
```

---

### Task 7: Route group `(benvenuto)` — layout dedicato e hub a 15 sezioni

**Files:**
- Create: `app/[locale]/(benvenuto)/benvenuto/layout.tsx`
- Move + riscrivi: `app/[locale]/benvenuto/page.tsx` → `app/[locale]/(benvenuto)/benvenuto/page.tsx`

**Interfaces:**
- Consumes: `BenvenutoTopBar` (Task 4), `BenvenutoTile` (Task 5), `getWelcomeBook` (Task 2), `LinguaSelector` (invariato).
- Produces: hub `/benvenuto` con 15 tile — consumato visivamente da tutte le sottopagine (Task 8-12) come punto di ritorno.

- [ ] **Step 1: Crea `app/[locale]/(benvenuto)/benvenuto/layout.tsx`**

```tsx
import BenvenutoTopBar from "@/components/layout/BenvenutoTopBar";

// Chrome dedicata al Welcome Book digitale — NIENTE Header/Footer/
// WhatsAppButton pubblici (vedi (public)/layout.tsx, isolato da questo
// tramite route group). BenvenutoTopBar decide da sé se mostrarsi (si
// nasconde sull'hub, vedi components/layout/BenvenutoTopBar.tsx).
export default function BenvenutoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <BenvenutoTopBar />
      <main className="flex-1">{children}</main>
    </>
  );
}
```

Consegna verso `C:\Users\pgwal\Cloude\sito-hotel\app\[locale]\(benvenuto)\benvenuto\layout.tsx`.

- [ ] **Step 2: Crea `app/[locale]/(benvenuto)/benvenuto/page.tsx` (hub, 15 tile)**

```tsx
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import {
  LogIn, LogOut, Wifi, ScrollText, MapPin, Bus, ConciergeBell, Compass,
  UtensilsCrossed, Coffee, ShoppingBag, Info, Siren, Phone,
} from "lucide-react";
import SectionWrapper from "@/components/layout/SectionWrapper";
import BenvenutoTile from "@/components/ui/BenvenutoTile";
import LinguaSelector from "@/components/ui/LinguaSelector";
import { getWelcomeBook } from "@/lib/queries";
import { pageMetadata } from "@/lib/seo";

// Welcome Book digitale (modulo 4.2) — hub raggiungibile SOLO da QR in
// camera o link diretto, mai dal menu pubblico né dalla sitemap. Contiene
// la password WiFi (sottopagina /benvenuto/wifi): robots noindex/nofollow
// qui e su ogni sottopagina, non è un dettaglio opzionale.
//
// Redesign 16/08/2026: da 6 a 15 sezioni, griglia fissa 3 colonne anche su
// mobile (vedi components/ui/BenvenutoTile.tsx). Per aggiungere una nuova
// sezione: aggiungere qui una voce a TILES + la sottopagina corrispondente
// sotto (benvenuto)/benvenuto/[sezione]/page.tsx, stesso pattern.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "BenvenutoPage" });
  const wb = await getWelcomeBook(locale);
  const meta = pageMetadata({
    title: wb?.titoloBenvenuto || t("title"),
    description: wb?.messaggioBenvenuto || t("subtitle"),
    path: "/benvenuto",
    locale,
  });
  return { ...meta, robots: { index: false, follow: false } };
}

export default async function BenvenutoPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "BenvenutoPage" });
  const wb = await getWelcomeBook(locale);

  const titolo = wb?.titoloBenvenuto || t("title");
  const messaggio = wb?.messaggioBenvenuto || t("subtitle");

  const TILES = [
    { href: "/benvenuto/checkin", icon: LogIn, label: t("checkinTitle") },
    { href: "/benvenuto/wifi", icon: Wifi, label: t("wifiTitle") },
    { href: "/benvenuto/regole", icon: ScrollText, label: t("regoleTitle") },
    { href: "/benvenuto/posizione", icon: MapPin, label: t("posizioneTitle") },
    { href: "/benvenuto/trasporti", icon: Bus, label: t("trasportiTitle") },
    { href: "/benvenuto/servizi", icon: ConciergeBell, label: t("serviziTitle") },
    { href: "/benvenuto/attivita", icon: Compass, label: t("attivitaTitle") },
    { href: "/benvenuto/ristoranti", icon: UtensilsCrossed, label: t("ristorantiTitle") },
    { href: "/benvenuto/bar", icon: Coffee, label: t("barTitle") },
    { href: "/benvenuto/shopping", icon: ShoppingBag, label: t("shoppingTitle") },
    { href: "/benvenuto/informazioni", icon: Info, label: t("informazioniTitle") },
    { href: "/benvenuto/emergenza", icon: Siren, label: t("emergenzaTitle") },
    { href: "/benvenuto/checkout", icon: LogOut, label: t("checkoutTitle") },
    { href: "/benvenuto/contatti", icon: Phone, label: t("contattiTitle") },
  ] as const;

  return (
    <>
      <SectionWrapper bg="primary">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-heading text-3xl text-white">{titolo}</h1>
            <p className="mt-3 max-w-2xl text-white/85">{messaggio}</p>
          </div>
          <LinguaSelector />
        </div>
      </SectionWrapper>

      <SectionWrapper bg="white">
        <div className="grid grid-cols-3 gap-3">
          {TILES.map((tile) => (
            <BenvenutoTile key={tile.href} href={tile.href} icon={tile.icon} label={tile.label} />
          ))}
        </div>
      </SectionWrapper>
    </>
  );
}
```

Nota: 14 tile elencate, non 15 — "Benvenuto" (voce 1 della spec) è l'hub stesso, non una tile di sé stesso; le altre 14 sono le sottopagine. Coerente con la spec (§2: "Benvenuto — hub").

Consegna verso `C:\Users\pgwal\Cloude\sito-hotel\app\[locale]\(benvenuto)\benvenuto\page.tsx`.

- [ ] **Step 3: Rimuovi il vecchio `app/[locale]/benvenuto/page.tsx`**

```bash
cd ~/mnt/sito-hotel/app/\[locale\]/benvenuto && git rm page.tsx
```

- [ ] **Step 4: Verifica**

```bash
cd ~/mnt/sito-hotel && npm run lint
```
(il build completo si verifica a fine Task 12, quando tutte le 14 sottopagine esistono — prima darebbe errore per i link a pagine non ancora create, atteso a questo punto del piano).

- [ ] **Step 5: Commit**

```bash
cd ~/mnt/sito-hotel && git add -A "app/[locale]/(benvenuto)" "app/[locale]/benvenuto" && git commit -m "feat(benvenuto): route group (benvenuto) con layout dedicato, hub ricostruito a 14 tile"
```

---

### Task 8: Sposta Wifi/Regole/Contatti (rimuove il vecchio link "← Torna al Welcome Book", ora gestito da `BenvenutoTopBar`)

**Files:**
- Create: `app/[locale]/(benvenuto)/benvenuto/wifi/page.tsx`, `.../regole/page.tsx`, `.../contatti/page.tsx`
- Delete: `app/[locale]/benvenuto/wifi/`, `.../regole/`, `.../contatti/`

**Interfaces:**
- Consumes: `getWelcomeBook`, `getInfoHotel` (invariati).

- [ ] **Step 1: Crea `app/[locale]/(benvenuto)/benvenuto/wifi/page.tsx`**

```tsx
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import SectionWrapper from "@/components/layout/SectionWrapper";
import { getWelcomeBook } from "@/lib/queries";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "BenvenutoPage" });
  const meta = pageMetadata({ title: t("wifiTitle"), description: t("subtitle"), path: "/benvenuto/wifi", locale });
  return { ...meta, robots: { index: false, follow: false } };
}

export default async function BenvenutoWifiPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "BenvenutoPage" });
  const wb = await getWelcomeBook(locale);

  return (
    <SectionWrapper bg="white">
      {wb?.wifiNome ? (
        <div className="inline-flex flex-col gap-2 rounded-lg border border-border bg-surface px-6 py-5 text-sm">
          <p>
            <span className="text-textMuted">{t("wifiNomeLabel")}: </span>
            <span className="text-lg font-semibold text-text">{wb.wifiNome}</span>
          </p>
          {wb.wifiPassword && (
            <p>
              <span className="text-textMuted">{t("wifiPasswordLabel")}: </span>
              <span className="text-lg font-semibold text-text">{wb.wifiPassword}</span>
            </p>
          )}
        </div>
      ) : (
        <p className="text-sm text-textMuted">{t("infoNonDisponibile")}</p>
      )}
    </SectionWrapper>
  );
}
```

- [ ] **Step 2: Crea `app/[locale]/(benvenuto)/benvenuto/regole/page.tsx`**

```tsx
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import SectionWrapper from "@/components/layout/SectionWrapper";
import { getWelcomeBook } from "@/lib/queries";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "BenvenutoPage" });
  const meta = pageMetadata({ title: t("regoleTitle"), description: t("subtitle"), path: "/benvenuto/regole", locale });
  return { ...meta, robots: { index: false, follow: false } };
}

export default async function BenvenutoRegolePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "BenvenutoPage" });
  const wb = await getWelcomeBook(locale);
  const regoleCasa = wb && wb.regoleCasa.length > 0 ? wb.regoleCasa : (t.raw("regoleDefault") as string[]);

  return (
    <SectionWrapper bg="white">
      <ul className="space-y-3">
        {regoleCasa.map((r) => (
          <li key={r} className="flex gap-2 text-sm text-text">
            <span className="text-accent">•</span>
            {r}
          </li>
        ))}
      </ul>
    </SectionWrapper>
  );
}
```

- [ ] **Step 3: Crea `app/[locale]/(benvenuto)/benvenuto/contatti/page.tsx`**

```tsx
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import SectionWrapper from "@/components/layout/SectionWrapper";
import { getWelcomeBook, getInfoHotel } from "@/lib/queries";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "BenvenutoPage" });
  const meta = pageMetadata({ title: t("contattiTitle"), description: t("subtitle"), path: "/benvenuto/contatti", locale });
  return { ...meta, robots: { index: false, follow: false } };
}

export default async function BenvenutoContattiPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "BenvenutoPage" });
  const wb = await getWelcomeBook(locale);
  const info = await getInfoHotel(locale);

  return (
    <SectionWrapper bg="white">
      <div className="grid gap-10 sm:grid-cols-2">
        <div className="text-sm text-textMuted">
          <p className="text-lg font-semibold text-text">{info.telefono}</p>
          {info.telefonoMobile && <p className="mt-1">{info.telefonoMobile}</p>}
          {info.orariReception && <p className="mt-2">{info.orariReception}</p>}
        </div>

        {wb && wb.numeriUtili.length > 0 && (
          <div>
            <h2 className="font-heading text-lg text-primary">{t("numeriUtiliTitle")}</h2>
            <ul className="mt-3 space-y-1.5">
              {wb.numeriUtili.map((n) => (
                <li key={n.etichetta} className="flex justify-between gap-4 text-sm text-textMuted">
                  <span>{n.etichetta}</span>
                  <span className="font-semibold text-text">{n.valore}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </SectionWrapper>
  );
}
```

- [ ] **Step 4: Consegna e rimozione vecchie cartelle**

Consegna i 3 file nuovi verso `C:\Users\pgwal\Cloude\sito-hotel\app\[locale]\(benvenuto)\benvenuto\{wifi,regole,contatti}\page.tsx`. Poi via `device_bash`:
```bash
cd ~/mnt/sito-hotel/app/\[locale\]/benvenuto && git rm -r wifi regole contatti
```

- [ ] **Step 5: Verifica e commit**

```bash
cd ~/mnt/sito-hotel && npm run lint && git add -A "app/[locale]/(benvenuto)" "app/[locale]/benvenuto" && git commit -m "refactor(benvenuto): sposta Wifi/Regole/Contatti nel route group dedicato, rimuove il vecchio link back (ora nella topbar)"
```

---

### Task 9: Split Orari → Check-in + Check-out

**Files:**
- Create: `app/[locale]/(benvenuto)/benvenuto/checkin/page.tsx`, `.../checkout/page.tsx`
- Delete: `app/[locale]/benvenuto/orari/`

**Interfaces:**
- Consumes: `getWelcomeBook` (campi `orariCheckin`, `orariCheckout` — invariati, `orariColazione` NON più letto qui, si sposta alla pagina Servizi, Task 12).

- [ ] **Step 1: Crea `app/[locale]/(benvenuto)/benvenuto/checkin/page.tsx`**

```tsx
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import SectionWrapper from "@/components/layout/SectionWrapper";
import { getWelcomeBook } from "@/lib/queries";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "BenvenutoPage" });
  const meta = pageMetadata({ title: t("checkinTitle"), description: t("subtitle"), path: "/benvenuto/checkin", locale });
  return { ...meta, robots: { index: false, follow: false } };
}

export default async function BenvenutoCheckinPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "BenvenutoPage" });
  const wb = await getWelcomeBook(locale);

  return (
    <SectionWrapper bg="white">
      {wb?.orariCheckin ? (
        <p className="text-lg font-semibold text-text">{wb.orariCheckin}</p>
      ) : (
        <p className="text-sm text-textMuted">{t("infoNonDisponibile")}</p>
      )}
    </SectionWrapper>
  );
}
```

- [ ] **Step 2: Crea `app/[locale]/(benvenuto)/benvenuto/checkout/page.tsx`**

```tsx
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import SectionWrapper from "@/components/layout/SectionWrapper";
import { getWelcomeBook } from "@/lib/queries";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "BenvenutoPage" });
  const meta = pageMetadata({ title: t("checkoutTitle"), description: t("subtitle"), path: "/benvenuto/checkout", locale });
  return { ...meta, robots: { index: false, follow: false } };
}

export default async function BenvenutoCheckoutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "BenvenutoPage" });
  const wb = await getWelcomeBook(locale);

  return (
    <SectionWrapper bg="white">
      {wb?.orariCheckout ? (
        <p className="text-lg font-semibold text-text">{wb.orariCheckout}</p>
      ) : (
        <p className="text-sm text-textMuted">{t("infoNonDisponibile")}</p>
      )}
    </SectionWrapper>
  );
}
```

- [ ] **Step 3: Consegna, rimozione vecchia cartella, verifica, commit**

Consegna verso `C:\Users\pgwal\Cloude\sito-hotel\app\[locale]\(benvenuto)\benvenuto\{checkin,checkout}\page.tsx`.

```bash
cd ~/mnt/sito-hotel/app/\[locale\]/benvenuto && git rm -r orari
cd ~/mnt/sito-hotel && npm run lint
git add -A "app/[locale]/(benvenuto)" "app/[locale]/benvenuto" && git commit -m "feat(benvenuto): split Orari in Check-in/Check-out"
```

---

### Task 10: Posizione (rinomina + estende Lerici)

**Files:**
- Create: `app/[locale]/(benvenuto)/benvenuto/posizione/page.tsx`
- Delete: `app/[locale]/benvenuto/lerici/`

**Interfaces:**
- Consumes: `getWelcomeBook` (nuovi campi `posizioneLat`, `posizioneLon`, `posizioneTesto`), `getTranslations("ContattiPage")` (riuso di `comeArrivareTitle`/`auto`/`treno`/`battello`, già esistenti e usati identicamente nella pagina pubblica `/lerici`), `MapEmbed` (riuso diretto, invariato).

- [ ] **Step 1: Crea `app/[locale]/(benvenuto)/benvenuto/posizione/page.tsx`**

```tsx
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";
import SectionWrapper from "@/components/layout/SectionWrapper";
import MapEmbed from "@/components/ui/MapEmbed";
import { getWelcomeBook, getInfoHotel } from "@/lib/queries";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "BenvenutoPage" });
  const meta = pageMetadata({ title: t("posizioneTitle"), description: t("subtitle"), path: "/benvenuto/posizione", locale });
  return { ...meta, robots: { index: false, follow: false } };
}

export default async function BenvenutoPosizionePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "BenvenutoPage" });
  const tContatti = await getTranslations({ locale, namespace: "ContattiPage" });
  const wb = await getWelcomeBook(locale);
  const info = await getInfoHotel(locale);

  const lat = wb?.posizioneLat ?? info.latitudine;
  const lon = wb?.posizioneLon ?? info.longitudine;

  return (
    <SectionWrapper bg="white">
      <p className="text-sm text-textMuted">
        {info.indirizzo}, {info.cap} {info.citta} ({info.provincia})
      </p>

      {wb?.posizioneTesto && <p className="mt-4 max-w-2xl text-text">{wb.posizioneTesto}</p>}

      <div className="mt-6 aspect-[4/3] overflow-hidden rounded-lg border border-border">
        <MapEmbed lat={lat} lon={lon} />
      </div>

      <div className="mt-6">
        <p className="font-heading text-lg text-primary">{tContatti("comeArrivareTitle")}</p>
        <ul className="mt-2 space-y-1 text-sm text-textMuted">
          <li>{tContatti("auto")}</li>
          <li>{tContatti("treno")}</li>
          <li>{tContatti("battello")}</li>
        </ul>
      </div>

      <Link href="/lerici" className="mt-6 inline-block text-sm font-semibold text-primary hover:text-accent">
        {t("posizioneTitle")} →
      </Link>
    </SectionWrapper>
  );
}
```

Nota: il link finale rimanda a `/lerici` (pagina pubblica, invariata, ora sotto `(public)`) per l'approfondimento su cosa vedere/borghi — stesso pattern di cross-link già usato dalla vecchia pagina `benvenuto/lerici`, solo aggiornato all'URL del route group.

- [ ] **Step 2: Consegna, rimozione vecchia cartella, verifica, commit**

Consegna verso `C:\Users\pgwal\Cloude\sito-hotel\app\[locale]\(benvenuto)\benvenuto\posizione\page.tsx`.

```bash
cd ~/mnt/sito-hotel/app/\[locale\]/benvenuto && git rm -r lerici
cd ~/mnt/sito-hotel && npm run lint
git add -A "app/[locale]/(benvenuto)" "app/[locale]/benvenuto" && git commit -m "feat(benvenuto): pagina Posizione (rinomina+estende Lerici) con mappa incorporata e presentazione borgo"
```

---

### Task 11: Ristoranti (rinomina + estende Ristorante)

**Files:**
- Create: `app/[locale]/(benvenuto)/benvenuto/ristoranti/page.tsx`
- Delete: `app/[locale]/benvenuto/ristorante/`

**Interfaces:**
- Consumes: `getSezioneRistorante` (invariato, ristorante dell'hotel), `getWelcomeBook` campo `ristorantiEsterni: Luogo[]` (Task 2), `LuogoGrid` (Task 3).

- [ ] **Step 1: Crea `app/[locale]/(benvenuto)/benvenuto/ristoranti/page.tsx`**

```tsx
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import SectionWrapper from "@/components/layout/SectionWrapper";
import LuogoGrid from "@/components/ui/LuogoGrid";
import { getSezioneRistorante, getWelcomeBook } from "@/lib/queries";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "BenvenutoPage" });
  const meta = pageMetadata({ title: t("ristorantiTitle"), description: t("subtitle"), path: "/benvenuto/ristoranti", locale });
  return { ...meta, robots: { index: false, follow: false } };
}

export default async function BenvenutoRistorantiPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "BenvenutoPage" });
  const ristorante = await getSezioneRistorante(locale);
  const wb = await getWelcomeBook(locale);

  return (
    <SectionWrapper bg="white">
      <p className="max-w-2xl text-textMuted">{t("ristorantiText")}</p>

      {ristorante?.linkMenu ? (
        <a
          href={ristorante.linkMenu}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-block rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primaryLight"
        >
          {t("menuCta")} →
        </a>
      ) : (
        <p className="mt-4 text-sm text-textMuted">{t("infoNonDisponibile")}</p>
      )}

      <h2 className="mt-10 font-heading text-xl text-primary">{t("ristorantiEsterniTitle")}</h2>
      <LuogoGrid luoghi={wb?.ristorantiEsterni ?? []} infoNonDisponibile={t("infoNonDisponibile")} />
    </SectionWrapper>
  );
}
```

- [ ] **Step 2: Consegna, rimozione vecchia cartella, verifica, commit**

Consegna verso `C:\Users\pgwal\Cloude\sito-hotel\app\[locale]\(benvenuto)\benvenuto\ristoranti\page.tsx`.

```bash
cd ~/mnt/sito-hotel/app/\[locale\]/benvenuto && git rm -r ristorante
cd ~/mnt/sito-hotel && npm run lint
git add -A "app/[locale]/(benvenuto)" "app/[locale]/benvenuto" && git commit -m "feat(benvenuto): pagina Ristoranti (rinomina+estende Ristorante) con consigli esterni"
```

---

### Task 12: 7 nuove pagine a elenco di luoghi (Trasporti, Servizi, Attività, Bar, Shopping, Informazioni, Emergenza)

**Files:**
- Create: `app/[locale]/(benvenuto)/benvenuto/{trasporti,servizi,attivita,bar,shopping,informazioni,emergenza}/page.tsx` (7 file)

**Interfaces:**
- Consumes: `getWelcomeBook` campi `trasporti`/`servizi`/`attivita`/`bar`/`shopping`/`informazioni`/`emergenza: Luogo[]` (Task 2), `LuogoGrid` (Task 3). Servizi consuma anche `orariColazione` (campo esistente, confermato dal titolare che vive qui — vedi spec §4.2).

Le 7 pagine condividono esattamente lo stesso schema (fetch `wb`, titolo, `LuogoGrid`) — un solo pattern, applicato 7 volte con il campo giusto, coerente con la convenzione del repo di una pagina per sezione (commento nell'hub originale: "stesso pattern", non una route dinamica `[sezione]`).

- [ ] **Step 1: Crea `app/[locale]/(benvenuto)/benvenuto/trasporti/page.tsx`**

```tsx
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import SectionWrapper from "@/components/layout/SectionWrapper";
import LuogoGrid from "@/components/ui/LuogoGrid";
import { getWelcomeBook } from "@/lib/queries";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "BenvenutoPage" });
  const meta = pageMetadata({ title: t("trasportiTitle"), description: t("subtitle"), path: "/benvenuto/trasporti", locale });
  return { ...meta, robots: { index: false, follow: false } };
}

export default async function BenvenutoTrasportiPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "BenvenutoPage" });
  const wb = await getWelcomeBook(locale);

  return (
    <SectionWrapper bg="white">
      <LuogoGrid luoghi={wb?.trasporti ?? []} infoNonDisponibile={t("infoNonDisponibile")} />
    </SectionWrapper>
  );
}
```

- [ ] **Step 2: Crea `app/[locale]/(benvenuto)/benvenuto/servizi/page.tsx`** (include `orariColazione`)

```tsx
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import SectionWrapper from "@/components/layout/SectionWrapper";
import LuogoGrid from "@/components/ui/LuogoGrid";
import { getWelcomeBook } from "@/lib/queries";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "BenvenutoPage" });
  const meta = pageMetadata({ title: t("serviziTitle"), description: t("subtitle"), path: "/benvenuto/servizi", locale });
  return { ...meta, robots: { index: false, follow: false } };
}

export default async function BenvenutoServiziPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "BenvenutoPage" });
  const wb = await getWelcomeBook(locale);

  return (
    <SectionWrapper bg="white">
      {wb?.orariColazione && (
        <div className="mb-6">
          <p className="text-xs uppercase tracking-wide text-textMuted">{t("colazioneLabel")}</p>
          <p className="mt-1 text-lg font-semibold text-text">{wb.orariColazione}</p>
        </div>
      )}
      <LuogoGrid luoghi={wb?.servizi ?? []} infoNonDisponibile={t("infoNonDisponibile")} />
    </SectionWrapper>
  );
}
```

- [ ] **Step 3: Crea `app/[locale]/(benvenuto)/benvenuto/attivita/page.tsx`**

```tsx
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import SectionWrapper from "@/components/layout/SectionWrapper";
import LuogoGrid from "@/components/ui/LuogoGrid";
import { getWelcomeBook } from "@/lib/queries";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "BenvenutoPage" });
  const meta = pageMetadata({ title: t("attivitaTitle"), description: t("subtitle"), path: "/benvenuto/attivita", locale });
  return { ...meta, robots: { index: false, follow: false } };
}

export default async function BenvenutoAttivitaPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "BenvenutoPage" });
  const wb = await getWelcomeBook(locale);

  return (
    <SectionWrapper bg="white">
      <LuogoGrid luoghi={wb?.attivita ?? []} infoNonDisponibile={t("infoNonDisponibile")} />
    </SectionWrapper>
  );
}
```

- [ ] **Step 4: Crea `app/[locale]/(benvenuto)/benvenuto/bar/page.tsx`**

```tsx
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import SectionWrapper from "@/components/layout/SectionWrapper";
import LuogoGrid from "@/components/ui/LuogoGrid";
import { getWelcomeBook } from "@/lib/queries";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "BenvenutoPage" });
  const meta = pageMetadata({ title: t("barTitle"), description: t("subtitle"), path: "/benvenuto/bar", locale });
  return { ...meta, robots: { index: false, follow: false } };
}

export default async function BenvenutoBarPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "BenvenutoPage" });
  const wb = await getWelcomeBook(locale);

  return (
    <SectionWrapper bg="white">
      <LuogoGrid luoghi={wb?.bar ?? []} infoNonDisponibile={t("infoNonDisponibile")} />
    </SectionWrapper>
  );
}
```

- [ ] **Step 5: Crea `app/[locale]/(benvenuto)/benvenuto/shopping/page.tsx`**

```tsx
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import SectionWrapper from "@/components/layout/SectionWrapper";
import LuogoGrid from "@/components/ui/LuogoGrid";
import { getWelcomeBook } from "@/lib/queries";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "BenvenutoPage" });
  const meta = pageMetadata({ title: t("shoppingTitle"), description: t("subtitle"), path: "/benvenuto/shopping", locale });
  return { ...meta, robots: { index: false, follow: false } };
}

export default async function BenvenutoShoppingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "BenvenutoPage" });
  const wb = await getWelcomeBook(locale);

  return (
    <SectionWrapper bg="white">
      <LuogoGrid luoghi={wb?.shopping ?? []} infoNonDisponibile={t("infoNonDisponibile")} />
    </SectionWrapper>
  );
}
```

- [ ] **Step 6: Crea `app/[locale]/(benvenuto)/benvenuto/informazioni/page.tsx`**

```tsx
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import SectionWrapper from "@/components/layout/SectionWrapper";
import LuogoGrid from "@/components/ui/LuogoGrid";
import { getWelcomeBook } from "@/lib/queries";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "BenvenutoPage" });
  const meta = pageMetadata({ title: t("informazioniTitle"), description: t("subtitle"), path: "/benvenuto/informazioni", locale });
  return { ...meta, robots: { index: false, follow: false } };
}

export default async function BenvenutoInformazioniPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "BenvenutoPage" });
  const wb = await getWelcomeBook(locale);

  return (
    <SectionWrapper bg="white">
      <LuogoGrid luoghi={wb?.informazioni ?? []} infoNonDisponibile={t("infoNonDisponibile")} />
    </SectionWrapper>
  );
}
```

- [ ] **Step 7: Crea `app/[locale]/(benvenuto)/benvenuto/emergenza/page.tsx`**

```tsx
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import SectionWrapper from "@/components/layout/SectionWrapper";
import LuogoGrid from "@/components/ui/LuogoGrid";
import { getWelcomeBook } from "@/lib/queries";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "BenvenutoPage" });
  const meta = pageMetadata({ title: t("emergenzaTitle"), description: t("subtitle"), path: "/benvenuto/emergenza", locale });
  return { ...meta, robots: { index: false, follow: false } };
}

export default async function BenvenutoEmergenzaPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "BenvenutoPage" });
  const wb = await getWelcomeBook(locale);

  return (
    <SectionWrapper bg="white">
      <LuogoGrid luoghi={wb?.emergenza ?? []} infoNonDisponibile={t("infoNonDisponibile")} />
    </SectionWrapper>
  );
}
```

- [ ] **Step 8: Consegna, verifica, commit**

Consegna i 7 file verso `C:\Users\pgwal\Cloude\sito-hotel\app\[locale]\(benvenuto)\benvenuto\{trasporti,servizi,attivita,bar,shopping,informazioni,emergenza}\page.tsx`.

```bash
cd ~/mnt/sito-hotel && npm run lint
git add "app/[locale]/(benvenuto)" && git commit -m "feat(benvenuto): 7 nuove sezioni a elenco luoghi (Trasporti, Servizi, Attività, Bar, Shopping, Informazioni, Emergenza)"
```

A questo punto tutte le 14 sottopagine + hub esistono sotto `(benvenuto)` — il vecchio `app/[locale]/benvenuto/` dovrebbe essere vuota. Verifica:
```bash
find ~/mnt/sito-hotel/app/\[locale\]/benvenuto -type f
```
Atteso: nessun file. Se la cartella è vuota ma ancora presente, la rimuove automaticamente `git add -A` al Task 15 (git non traccia cartelle vuote).

---

### Task 13: Traduzioni — 4 file `messages/*.json`

**Files:**
- Modify: `messages/it.json`, `messages/en.json`, `messages/de.json`, `messages/fr.json`

**Interfaces:**
- Consumes: nessuna.
- Produces: chiavi `BenvenutoPage.*` e nuovo namespace `LuogoCard.*` usate da Task 3, 4, 7-12.

Per ciascuno dei 4 file, nell'oggetto `BenvenutoPage`:
- **Rimuovi**: `orariTitle`, `ristoranteTitle`, `ristoranteText`, `lericiTitle`, `lericiDefault`, `lericiCta`, `backCta`.
- **Aggiungi**: `checkinTitle`, `checkoutTitle`, `posizioneTitle`, `trasportiTitle`, `serviziTitle`, `attivitaTitle`, `ristorantiTitle`, `ristorantiText`, `ristorantiEsterniTitle`, `barTitle`, `shoppingTitle`, `informazioniTitle`, `emergenzaTitle`, `menuBackCta`.
- **Mantieni invariate**: `title`, `subtitle`, `wifiTitle`, `wifiNomeLabel`, `wifiPasswordLabel`, `checkinLabel`, `checkoutLabel`, `colazioneLabel`, `regoleTitle`, `regoleDefault`, `menuCta` (bottone "Vedi il menu" di Ristoranti — nome invariato, solo la pagina che lo usa cambia), `contattiTitle`, `numeriUtiliTitle`, `infoNonDisponibile`.

Aggiungi inoltre un nuovo namespace top-level `LuogoCard` (stesso livello di `BenvenutoPage`, non annidato).

Aggiorna anche `CookieConsent.functionalDescription` (non più vero solo per la pagina Contatti, ora anche Posizione nel Welcome Book).

- [ ] **Step 1: `messages/it.json`**

Nell'oggetto `BenvenutoPage`, rimuovi le 7 chiavi elencate sopra e aggiungi:

```json
"checkinTitle": "Check-in",
"checkoutTitle": "Check-out",
"posizioneTitle": "La nostra posizione",
"trasportiTitle": "Trasporti",
"serviziTitle": "Servizi",
"attivitaTitle": "Attività",
"ristorantiTitle": "Ristoranti",
"ristorantiText": "Scopri i piatti della cucina ligure e di pesce del nostro ristorante.",
"ristorantiEsterniTitle": "Altri consigli",
"barTitle": "Bar",
"shoppingTitle": "Shopping",
"informazioniTitle": "Informazioni",
"emergenzaTitle": "Emergenza",
"menuBackCta": "Menu"
```

Aggiungi il namespace (allo stesso livello di `"BenvenutoPage": { ... }`):

```json
"LuogoCard": {
  "apriMappa": "Apri in Google Maps",
  "chiamaConfirmTitle": "Chiamare {nome}?",
  "chiamaConfirmNumero": "{telefono}",
  "chiamaAnnulla": "Annulla",
  "chiamaConferma": "Chiama"
}
```

In `CookieConsent`, sostituisci `functionalDescription`:
```json
"functionalDescription": "Google Maps — mostra le mappe interattive nel sito e nel Welcome Book."
```

- [ ] **Step 2: `messages/en.json`**

```json
"checkinTitle": "Check-in",
"checkoutTitle": "Check-out",
"posizioneTitle": "Our location",
"trasportiTitle": "Transport",
"serviziTitle": "Services",
"attivitaTitle": "Activities",
"ristorantiTitle": "Restaurants",
"ristorantiText": "Discover the Ligurian and seafood dishes of our restaurant.",
"ristorantiEsterniTitle": "More suggestions",
"barTitle": "Bar",
"shoppingTitle": "Shopping",
"informazioniTitle": "Information",
"emergenzaTitle": "Emergency",
"menuBackCta": "Menu"
```

```json
"LuogoCard": {
  "apriMappa": "Open in Google Maps",
  "chiamaConfirmTitle": "Call {nome}?",
  "chiamaConfirmNumero": "{telefono}",
  "chiamaAnnulla": "Cancel",
  "chiamaConferma": "Call"
}
```

`CookieConsent.functionalDescription`:
```json
"functionalDescription": "Google Maps — shows the interactive maps across the site and the Welcome Book."
```

- [ ] **Step 3: `messages/de.json`**

```json
"checkinTitle": "Check-in",
"checkoutTitle": "Check-out",
"posizioneTitle": "Unsere Lage",
"trasportiTitle": "Transport",
"serviziTitle": "Services",
"attivitaTitle": "Aktivitäten",
"ristorantiTitle": "Restaurants",
"ristorantiText": "Entdecken Sie die ligurischen Gerichte und Fischspezialitäten unseres Restaurants.",
"ristorantiEsterniTitle": "Weitere Tipps",
"barTitle": "Bar",
"shoppingTitle": "Einkaufen",
"informazioniTitle": "Informationen",
"emergenzaTitle": "Notfall",
"menuBackCta": "Menü"
```

```json
"LuogoCard": {
  "apriMappa": "In Google Maps öffnen",
  "chiamaConfirmTitle": "{nome} anrufen?",
  "chiamaConfirmNumero": "{telefono}",
  "chiamaAnnulla": "Abbrechen",
  "chiamaConferma": "Anrufen"
}
```

`CookieConsent.functionalDescription`:
```json
"functionalDescription": "Google Maps — zeigt die interaktiven Karten auf der Website und im Welcome Book an."
```

- [ ] **Step 4: `messages/fr.json`**

```json
"checkinTitle": "Arrivée",
"checkoutTitle": "Départ",
"posizioneTitle": "Notre emplacement",
"trasportiTitle": "Transports",
"serviziTitle": "Services",
"attivitaTitle": "Activités",
"ristorantiTitle": "Restaurants",
"ristorantiText": "Découvrez les plats de la cuisine ligure et de poisson de notre restaurant.",
"ristorantiEsterniTitle": "Autres suggestions",
"barTitle": "Bar",
"shoppingTitle": "Shopping",
"informazioniTitle": "Informations",
"emergenzaTitle": "Urgence",
"menuBackCta": "Menu"
```

```json
"LuogoCard": {
  "apriMappa": "Ouvrir dans Google Maps",
  "chiamaConfirmTitle": "Appeler {nome} ?",
  "chiamaConfirmNumero": "{telefono}",
  "chiamaAnnulla": "Annuler",
  "chiamaConferma": "Appeler"
}
```

`CookieConsent.functionalDescription`:
```json
"functionalDescription": "Google Maps — affiche les cartes interactives sur le site et dans le Welcome Book."
```

- [ ] **Step 5: Consegna e verifica**

Consegna i 4 file verso `C:\Users\pgwal\Cloude\sito-hotel\messages\{it,en,de,fr}.json`. Verifica che siano JSON validi prima di consegnare (`python3 -m json.tool` sul file nel sandbox, o `JSON.parse` — un JSON rotto qui manda in errore l'intero sito su tutte le lingue). Poi:
```bash
cd ~/mnt/sito-hotel && npm run lint && npm run build
```
Atteso: build pulita, **nessun warning next-intl di chiave mancante** (next-intl segnala in console/build le chiavi usate ma non definite — se compare, vuol dire che un nome chiave in una pagina non combacia esattamente con quello aggiunto qui, correggere prima di proseguire).

- [ ] **Step 6: Commit**

```bash
cd ~/mnt/sito-hotel && git add messages && git commit -m "feat(i18n): traduzioni per le 9 nuove sezioni Welcome Book + namespace LuogoCard, 4 lingue"
```

---

### Task 14: Content-brief — contenuti reali pronti da incollare in Sanity Studio

**Files:**
- Create: `docs/content-brief-welcome-book-parte1.md` (documento, non codice — non tocca `app/`/`components/`/`sanity/`)

**Interfaces:** nessuna — deliverable editoriale, non software.

Estratto da `docs/info utili prima parte.docx` (caricato dal titolare) + URL reali verificati via WebFetch/WebSearch (link `chrome-extension://` ripulito nell'URL reale che conteneva). Non è un task di scrittura Sanity (fuori scope tecnico, vedi spec §6) — è il testo pronto perché il titolare lo incolli lui, senza doverlo riorganizzare a mano. **Nota**: banca/bancomat, supermercati (con orari) e chiese (con orari funzioni) — richiesti dal titolare per Informazioni — non sono nel documento caricato finora: sezioni segnate "da integrare" sotto, non inventate.

- [ ] **Step 1: Crea `docs/content-brief-welcome-book-parte1.md`**

```markdown
# Content brief Welcome Book — Parte 1

Pronto da incollare in Sanity Studio → Welcome Book. Struttura: una riga per
voce di `array of luogo`, campi nell'ordine nome/categoria/indirizzo/nota/
telefono/link. Lat/lon non disponibili in questa parte — il titolare può
aggiungerle a mano da Google Maps se vuole abilitare il bottone mappa senza
passare dall'indirizzo testuale (funziona comunque anche senza).

## Emergenza (wb.emergenza)

| Nome | Categoria | Indirizzo | Nota | Telefono |
|---|---|---|---|---|
| Numero Unico di Emergenza | soccorso | — | Ambulanza, Forze dell'Ordine, Vigili del Fuoco — gratuito, 24/24 | 112 |
| Guardia Costiera / Soccorso in Mare | guardia-costiera | — | Sicurezza balneare e navigazione nel Golfo dei Poeti | 1530 |
| Pubblica Assistenza Lerici | soccorso | — | Soccorso in convenzione con il 118 sul territorio comunale | 0187 967136 |
| Presidio Sociosanitario di Prossimità | soccorso | Via Gerini, 22, Lerici | Ambulatorio infermieristico — aperto mercoledì 15-18 e venerdì 9-12 | 0187 534923 |
| Pronto Soccorso — Ospedale Sant'Andrea | soccorso | Via Veneto, 197, La Spezia | Pronto soccorso di riferimento | — |
| Carabinieri — Stazione di Lerici | forze-ordine | Via XX Settembre, 23, Lerici | Aperto tutti i giorni, anche festivi, 8:00-17:00 | 0187 967129 |
| Polizia Locale | forze-ordine | Via Gerini, 1, Lerici | Viabilità, ZTL, sicurezza urbana — lun-sab 8:00-13:00 / 14:00-19:00 | 0187 967326 |
| Ufficio Locale Marittimo (Guardia Costiera) | guardia-costiera | Calata Mazzini, 23, Lerici | Feriali 9:00-12:00 | 0187 964545 |
| Farmacia Giudici | farmacia | Via Pisacane, 13, Lerici | 8:30-12:30 / 15:30-20:00 (invernale) · 16:00-20:00 (estivo, fino 23/10). Riposo: sab pom. (invernale, 1/10-31/3), lun mattina (estivo, 1/4-30/9) | 0187 967148 |
| Farmacia Bello | farmacia | Via Roma, 50, Lerici | 8:30-12:30 / 15:30-19:30 (invernale) · 16:00-20:00 (estivo, fino 23/10). Riposo: lunedì mattina | 0187 967343 |
| Farmacia Ghigliazza | farmacia | Via Paolo Mantegazza, 8, San Terenzo | 8:30-12:30 / 15:30-19:30 (invernale) · 16:00-20:00 (31/3-16/6 e 15/8-26/10) · continuato 8:30-20:00 (17/6-14/8, lun apertura ore 12). Riposo: sab pom. (invernale, 1/10-31/5), lun mattina (estivo, 1/6-30/9) | 0187 942433 |
| Farmacia Padre Pio | farmacia | Via Fiascherino, 4, Tellaro | 8:30-12:30 / 15:30-19:30 (invernale) · 16:00-19:30 (31/3-26/10) · in estate aperta anche domenica mattina 9:30-12:30 | 0187 966705 |

## Trasporti (wb.trasporti)

| Nome | Categoria | Indirizzo | Nota | Telefono | Link |
|---|---|---|---|---|---|
| Radiotaxi Lerici | taxi | Piazza Battisti Cesare, Lerici | — | 0187 967303 | — |
| Radiotaxi San Terenzo | taxi | — | — | 0187 970480 | — |
| Navetta gratuita — Linea Verde | navetta | — | Collega le colline alla zona costiera, ferma nelle principali località | — | https://www.atcesercizio.it/wp-content/uploads/2026/08/Mappa-Linea-Verde-new.pdf |
| Navetta gratuita — Linea Blu | navetta | — | Collega tutto il tratto costiero con i parcheggi principali | — | https://www.atcesercizio.it/wp-content/uploads/2024/06/Mappa-Linea-Blu.pdf |
| Ascensore pubblico Lerici | ascensore | Galleria San Giorgio (valle) — Piazza San Giorgio (monte) | Collega Calata Mazzini al Castello di Lerici, corsa 25m. Tutti i giorni 08:00-01:00, gratuito | — | — |
| Bus ATC (La Spezia — Portovenere — Sarzana — Carrara — Massa) | bus | — | Numero verde e libretto orari estate 2026 (18/7-12/9) sotto | 0187 522511 (numero verde 800 322 322) | https://www.atcesercizio.it/wp-content/uploads/2026/07/Libretto-Estate-2026-agg.18-Luglio.pdf |

Nota sul link ATC: nel documento originale il link al libretto orari era
incollato con un prefisso `chrome-extension://` (artefatto del browser del
titolare, non un URL valido) — l'URL reale che conteneva, verificato e
funzionante, è quello nella tabella sopra.

## Attività (wb.attivita)

| Nome | Categoria | Indirizzo | Nota | Telefono | Link |
|---|---|---|---|---|---|
| Cinema Astoria (Il Nuovo) | noleggio-attivita | — | Luglio: spettacoli 21:30 (biglietteria 20:30). 1-15 agosto: 21:15. 16-28 agosto: 21:00. Intero € 8, ridotti under 12/over 65 € 6,50, Card Il Nuovo € 6/€ 5, Arena Card 10 ingressi € 45. WhatsApp 348 5543921 | 348 5543921 | https://www.ilnuovoastoriagaribaldicinema.it |
| Traghetti — Consorzio Navigazione Golfo dei Poeti | traghetto | Via Don Minzoni, 13, La Spezia | Portovenere, Cinque Terre, giro del Golfo, Palmaria/Tino/Tinetto, Portofino — servizio continuo | 0187 732987 (fax 0187 730336, email info@ngdp.it) | — |

## Informazioni (wb.informazioni)

| Nome | Categoria | Indirizzo | Nota | Telefono |
|---|---|---|---|---|
| Ufficio Informazioni Turistiche IAT | comune-turismo | — | Venere Azzurra | 0187 969164 (cell. 353 4833253) |
| Centralino Comune di Lerici | comune-turismo | — | — | 0187 9601 |

**Da integrare (non nel documento caricato finora)**: banca/bancomat,
supermercati con orari, chiese con orari funzioni, stazione di servizio —
richiesti dal titolare (16/08/2026), in attesa della "seconda parte" del
documento o di un invio separato.
```

- [ ] **Step 2: Consegna**

Consegna con `SendUserFile` (il titolare lo legge/copia da lì, non serve necessariamente scriverlo anche sul device — ma se preferisce averlo anche in `docs/`, consegna anche verso `C:\Users\pgwal\Cloude\sito-hotel\docs\content-brief-welcome-book-parte1.md` con `device_commit_files`). Nessuna verifica di build (è un documento, non tocca il codice). Se scritto anche su disco:
```bash
cd ~/mnt/sito-hotel && git add docs/content-brief-welcome-book-parte1.md && git commit -m "docs: content brief Welcome Book, parte 1 (da info utili prima parte.docx)"
```

---

### Task 15: Verifica finale e pulizia

**Files:** nessuno creato — solo verifica e cleanup.

- [ ] **Step 1: Rimuovi la cartella vuota `app/[locale]/benvenuto` se ancora presente**

```bash
cd ~/mnt/sito-hotel && find "app/[locale]/benvenuto" -type f 2>&1
```
Se non stampa nulla (nessun file), rimuovi la cartella residua:
```bash
rmdir "app/[locale]/benvenuto" 2>&1 || true
git add -A "app/[locale]"
```

- [ ] **Step 2: Build e lint completi**

```bash
cd ~/mnt/sito-hotel && npm run lint && npm run build
```
Atteso: entrambi puliti, zero errori TypeScript, zero warning next-intl di chiavi mancanti.

- [ ] **Step 3: Verifica strutturale — nessuna fuga di chrome pubblica in `(benvenuto)`**

```bash
grep -rl "Header\|Footer\|WhatsAppButton" "app/[locale]/(benvenuto)" 2>&1
```
Atteso: nessun risultato (conferma che il route group `(benvenuto)` non importa mai la chrome pubblica).

- [ ] **Step 4: Verifica `robots: noindex/nofollow` su ogni sottopagina**

```bash
grep -rL "robots: { index: false, follow: false }" "app/[locale]/(benvenuto)/benvenuto" --include=page.tsx 2>&1
```
Atteso: nessun risultato (`-L` stampa i file che NON contengono la stringa — una lista vuota conferma che tutte le pagine ce l'hanno).

- [ ] **Step 5: Verifica visiva 375px (iPhone SE)**

```bash
cd ~/mnt/sito-hotel && npm run dev &
sleep 3
```
Poi con Claude in Chrome (`mcp__claude-in-chrome__*`, da caricare via `ToolSearch` se deferred): apri `http://localhost:3000/it/benvenuto`, ridimensiona finestra/viewport a 375px, controlla che la griglia 3 colonne sia leggibile con 14 tile, poi apri almeno una pagina con `LuogoGrid` popolata (es. `/it/benvenuto/trasporti` dopo che il titolare avrà incollato il content-brief) e una pagina vuota (es. `/it/benvenuto/bar` prima del popolamento, deve mostrare `infoNonDisponibile` senza buchi visivi), verifica che `BenvenutoTopBar` non tronchi i titoli più lunghi (es. "Emergenza" vs "Check-in"). Chiudi il dev server al termine (`kill %1` o l'equivalente nel contesto `device_bash`).

- [ ] **Step 6: Commit finale (se `git status` mostra ancora modifiche non committate da task precedenti)**

```bash
cd ~/mnt/sito-hotel && git status --short
```
Se vuoto, il piano è completo — ogni task precedente ha già committato. Se ci sono residui, un ultimo:
```bash
git add -A && git commit -m "chore: pulizia finale route group Welcome Book"
```

## Self-Review (svolta durante la stesura di questo piano)

**Copertura spec**: ogni sezione §2-§8 della spec ha un task corrispondente —
schema (Task 1), query (Task 2), componenti nuovi (Task 3-5), architettura
route group (Task 6-7), le 14 sottopagine (Task 8-12), i18n (Task 13),
content brief (Task 14, coerente con §6 Fuori scope aggiornato), verifica
(Task 15, rispecchia esattamente §7).

**Placeholder**: nessuno — ogni file ha contenuto completo, inclusi i 4
file di traduzione e le 7 pagine "semplici" del Task 12 (scritte per
intero, non "come Task X").

**Coerenza dei tipi**: `Luogo` (Task 2) → consumato identico in `LuogoCard`/
`LuogoGrid` (Task 3) e in ogni pagina che legge `wb.trasporti`/`wb.servizi`/
ecc. (Task 10-12) — stessi nomi di campo ovunque (`nome`, `categoria`,
`indirizzo`, `nota`, `telefono`, `lat`, `lon`, `link`). `SEGMENT_TITLE_KEYS`
in `BenvenutoTopBar` (Task 4) usa esattamente le stesse chiavi `*Title`
aggiunte in `messages/*.json` (Task 13) e usate nei `TILES`/`generateMetadata`
di ogni pagina (Task 7-12) — verificato incrociando i due elenchi.


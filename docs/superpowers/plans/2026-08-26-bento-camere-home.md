# Bento camere in home (Punto 3a) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Trasformare la griglia a 3 card identiche di `CamereInEvidenza.tsx` (sezione home) in una disposizione bento — un riquadro grande a piena larghezza per la camera flaggata "in evidenza" su Sanity, due riquadri più piccoli sotto, badge "In evidenza" sulla card grande.

**Architecture:** Un nuovo campo boolean su Sanity (`evidenziata`, stesso pattern già esistente su `offerta`), propagato attraverso `getCamere` fino al componente. `CameraCard` guadagna 3 prop opzionali (`grande`, `evidenziata`, `badgeLabel`) — nessun nuovo componente. La logica di selezione del riquadro grande vive in `CamereInEvidenza.tsx`, non nel componente card. Nessuna nuova dipendenza npm.

**Tech Stack:** Next.js App Router, TypeScript, Tailwind (token da `lib/theme.ts`), Sanity v3 (schema), next-intl (4 lingue).

## Global Constraints

- Mai eseguire `git` da questa sessione Cowork — commit reali fatti dal titolare dal tab Code.
- Nessun accesso a database/VPS né al progetto Sanity reale da questa sessione — impossibile verificare da qui che il campo compaia davvero in Sanity Studio. Va dichiarato esplicitamente nel task che lo introduce.
- Verifica disponibile solo tramite `npx tsc --noEmit` ed `esbuild --bundle --jsx=automatic` in una sandbox scratch temporanea (react/react-dom/typescript/esbuild installati a parte, mai committati) — nessun `npm run dev`/build reale, nessun accesso a browser. Sandbox sempre eliminata prima della consegna finale.
- **Fuori scope, dichiarato dalla spec**: il listato completo `/camere` non cambia. La sezione "esperienze" in home (oggi solo `PestoHighlight.tsx`, non una griglia di card) è un sotto-progetto separato (Punto 3b), non pianificato qui.
- Spec di riferimento: `docs/superpowers/specs/2026-08-26-bento-camere-home-design.md`, approvata dal titolare senza richieste di modifica.
- Consegna finale in un solo batch (`SendUserFile` + `device_commit_files`) con tutti i file toccati dall'intero piano — nessuna consegna sparsa per task.

---

### Task 1: Sanity — aggiungere il campo `evidenziata` a `camera.ts`

**Files:**
- Modify: `sanity/schemaTypes/documents/camera.ts:46-47`

**Interfaces:**
- Produces: campo Sanity `evidenziata` (boolean, `initialValue: false`) sul documento `camera` — consumato dal Task 2 (query) e, indirettamente, dal titolare via Sanity Studio.

Contenuto attuale di riferimento (righe 44-48, letto fresh il 26/08/2026):

```ts
    defineField({
      name: "servizi",
      title: "Servizi",
      type: "array",
      of: [{ type: "string" }],
      options: { list: SERVIZI, layout: "grid" },
    }),
    defineField({ name: "disponibile", title: "Disponibile", type: "boolean", initialValue: true }),
    defineField({ name: "ordine", title: "Ordine", type: "number" }),
```

Riferimento esatto già esistente per lo stesso tipo di campo, `sanity/schemaTypes/documents/offerta.ts:22` (non modificare questo file, solo da copiare il pattern):

```ts
    defineField({ name: "evidenziata", title: "In evidenza", type: "boolean", initialValue: false }),
```

- [x] **Step 1: Inserire il nuovo campo**

Sostituire:

```ts
    defineField({ name: "disponibile", title: "Disponibile", type: "boolean", initialValue: true }),
    defineField({ name: "ordine", title: "Ordine", type: "number" }),
```

con:

```ts
    defineField({ name: "disponibile", title: "Disponibile", type: "boolean", initialValue: true }),
    defineField({ name: "evidenziata", title: "In evidenza", type: "boolean", initialValue: false }),
    defineField({ name: "ordine", title: "Ordine", type: "number" }),
```

- [x] **Step 2: Verificare con tsc in sandbox scratch**

Creare una sandbox temporanea (`/tmp/bento-camere-verify`), symlink di `node_modules` (react@19.2.4, react-dom@19.2.4, typescript, esbuild, @types/react, @types/react-dom, @types/node) nel mirror del repo, `tsconfig.verify.json` con `"paths": {"@/*": ["./*"]}` e `"types": ["node", "react"]`. `camera.ts` importa `defineField`/`defineType` dal pacchetto `sanity` (non installato nella sandbox, e installarlo per intero sarebbe pesante/lento per una verifica di 2 righe) — usare invece uno stub minimo:

```ts
declare module "sanity" {
  export function defineField<T>(config: T): T;
  export function defineType<T>(config: T): T;
}
```

Run: `npx tsc --noEmit -p tsconfig.verify.json` (includendo `sanity/schemaTypes/documents/camera.ts` e lo stub)
Expected: nessun errore.

- [x] **Step 3: Nota di verifica per il titolare**

**Nessuna verifica possibile da questa sessione Cowork**: il campo esiste solo nello schema TypeScript, non nel progetto Sanity reale finché il titolare non pubblica/deploya lo schema (`sanity deploy` o l'aggiornamento automatico dello Studio, a seconda di come il progetto è configurato — dettaglio che questa sessione non può verificare). Da controllare in Sanity Studio: aprire un documento "Camera" esistente, deve comparire un nuovo campo booleano "In evidenza" (default disattivato) vicino a "Disponibile"/"Ordine".

---

### Task 2: `lib/queries.ts` — propagare `evidenziata` fino a `getCamere`

**Files:**
- Modify: `lib/queries.ts:87-114`

**Interfaces:**
- Consumes: campo Sanity `evidenziata` (Task 1).
- Produces: `getCamere(locale: Locale): Promise<{ slug: string; nome: string; fotoUrl: string | null; servizi: string[]; prezzoBase: number; evidenziata: boolean }[]>` — consumato dal Task 4.

Contenuto attuale di riferimento (righe 87-114, letto fresh il 26/08/2026):

```ts
const CAMERE_LIST_QUERY = groq`
  *[_type == "camera" && disponibile == true] | order(ordine asc) {
    "slug": slug.current,
    nome,
    fotoPrincipale,
    servizi,
    prezzoBase
  }
`;

interface CameraListItem {
  slug: string;
  nome: LocaleString;
  fotoPrincipale: SanityImage;
  servizi: string[];
  prezzoBase: number;
}

export const getCamere = cache(async (locale: Locale) => {
  const raw = await client.fetch<CameraListItem[]>(CAMERE_LIST_QUERY, {}, REVALIDATE);
  return raw.map((c) => ({
    slug: c.slug,
    nome: pickLocale(c.nome, locale) ?? c.slug,
    fotoUrl: imgUrl(c.fotoPrincipale, 600, 450),
    servizi: c.servizi ?? [],
    prezzoBase: c.prezzoBase,
  }));
});
```

- [x] **Step 1: Sostituire il blocco intero**

Sostituire tutto il blocco sopra con:

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

- [x] **Step 2: Verificare con tsc in sandbox scratch**

`lib/queries.ts` è un file grande (13KB, molte query oltre a quelle delle camere) — verificarlo per intero con `tsc` può richiedere stub aggiuntivi per moduli non presenti nel mirror parziale di Cowork (`@/lib/sanity`, `@/lib/sanity-i18n`, `next-sanity`, ecc.), oltre a quelli già usati nei piani precedenti di questa sessione. Procedimento: eseguire `npx tsc --noEmit -p tsconfig.verify.json` includendo `lib/queries.ts`; per ogni errore su un modulo mancante, aggiungere allo stub la dichiarazione minima necessaria (stesso metodo iterativo già usato nei piani Card e Fase 4 — non provare a indovinare tutti gli stub in anticipo).

Expected: nessun errore di tipo sul blocco appena modificato (`CAMERE_LIST_QUERY`, `CameraListItem`, `getCamere`); eventuali errori preesistenti su parti del file non toccate da questo piano non sono responsabilità di questo task — se ne compaiono, verificare che esistessero già prima della modifica (git diff concettuale: lo stub necessario per farli sparire non dipende dalle righe appena cambiate).

- [x] **Step 3: Nessun checkpoint visivo per questo task**

Modifica non ancora consumata da nessun componente — il checkpoint comincia dal Task 4.

---

### Task 3: `components/ui/CameraCard.tsx` — 3 nuove prop opzionali

**Files:**
- Modify: `components/ui/CameraCard.tsx` (file intero, 52 righe)

**Interfaces:**
- Produces: `CameraCard` accetta ora anche `grande?: boolean` (default `false`), `evidenziata?: boolean` (default `false`), `badgeLabel?: string` — consumato dal Task 4.

Contenuto attuale di riferimento (file intero, 52 righe, letto fresh il 26/08/2026):

```tsx
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { SERVIZI_ICONS } from "@/lib/servizi";
import Card from "@/components/ui/Card";

export default function CameraCard({
  nome,
  servizi,
  prezzoBase,
  slug,
  fotoUrl,
  priceFromLabel,
  ctaLabel,
}: {
  nome: string;
  servizi: string[];
  prezzoBase: number;
  slug: string;
  fotoUrl?: string | null;
  priceFromLabel: string;
  ctaLabel: string;
}) {
  const t = useTranslations("Servizi");

  return (
    <Card conFoto hover>
      {fotoUrl ? (
        <div className="relative aspect-[4/3]">
          <Image src={fotoUrl} alt={nome} fill className="object-cover" />
        </div>
      ) : (
        <div className="aspect-[4/3] bg-gradient-to-br from-primary/10 to-surfaceDark" />
      )}
      <div className="p-5">
        <h3 className="font-heading text-xl text-primary">{nome}</h3>
        <p className="mt-2 text-sm text-textMuted">
          {servizi.map((s) => (t.has(s) ? `${SERVIZI_ICONS[s] ?? ""} ${t(s)}` : s)).join(" · ")}
        </p>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm text-text">
            {priceFromLabel} <strong className="text-lg text-accent">€{prezzoBase}</strong>
          </span>
          <Link href={`/camere/${slug}`} className="text-sm font-semibold text-primary hover:text-accent">
            {ctaLabel} →
          </Link>
        </div>
      </div>
    </Card>
  );
}
```

Riferimento per il badge (`components/ui/OffertaCard.tsx:27-33`, non modificare questo file, solo da copiare il pattern):

```tsx
    <Card conFoto hover className="relative">
      {evidenziata && (
        <span className="absolute left-3 top-3 z-10 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-white">
          {badgeLabel}
        </span>
      )}
```

- [x] **Step 1: Sostituire l'intero contenuto del file**

```tsx
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { SERVIZI_ICONS } from "@/lib/servizi";
import Card from "@/components/ui/Card";

export default function CameraCard({
  nome,
  servizi,
  prezzoBase,
  slug,
  fotoUrl,
  priceFromLabel,
  ctaLabel,
  grande = false,
  evidenziata = false,
  badgeLabel,
}: {
  nome: string;
  servizi: string[];
  prezzoBase: number;
  slug: string;
  fotoUrl?: string | null;
  priceFromLabel: string;
  ctaLabel: string;
  grande?: boolean;
  evidenziata?: boolean;
  badgeLabel?: string;
}) {
  const t = useTranslations("Servizi");

  return (
    <Card conFoto hover className="relative">
      {evidenziata && badgeLabel && (
        <span className="absolute left-3 top-3 z-10 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-white">
          {badgeLabel}
        </span>
      )}
      {fotoUrl ? (
        <div className="relative aspect-[4/3]">
          <Image src={fotoUrl} alt={nome} fill className="object-cover" />
        </div>
      ) : (
        <div className="aspect-[4/3] bg-gradient-to-br from-primary/10 to-surfaceDark" />
      )}
      <div className="p-5">
        <h3 className={`font-heading text-primary ${grande ? "text-2xl" : "text-xl"}`}>{nome}</h3>
        <p className="mt-2 text-sm text-textMuted">
          {servizi.map((s) => (t.has(s) ? `${SERVIZI_ICONS[s] ?? ""} ${t(s)}` : s)).join(" · ")}
        </p>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm text-text">
            {priceFromLabel} <strong className="text-lg text-accent">€{prezzoBase}</strong>
          </span>
          <Link href={`/camere/${slug}`} className="text-sm font-semibold text-primary hover:text-accent">
            {ctaLabel} →
          </Link>
        </div>
      </div>
    </Card>
  );
}
```

Nota di compatibilità: tutte le nuove prop sono opzionali con default — i due call site esistenti che non le passano (`app/[locale]/(public)/camere/page.tsx` e le 2 card piccole in `CamereInEvidenza.tsx`) restano validi senza modifiche.

- [x] **Step 2: Verificare con tsc ed esbuild**

Stessa sandbox del Task 1/2. Run: `npx tsc --noEmit -p tsconfig.verify.json` (includendo `components/ui/CameraCard.tsx`) ed `npx esbuild components/ui/CameraCard.tsx --bundle --jsx=automatic --tsconfig=tsconfig.verify.json --external:next-intl --external:react --external:react-dom --external:@/lib/i18n/navigation --external:@/lib/servizi --external:next/image --outdir=/tmp/bento-camere-verify/out`
Expected: nessun errore, bundle prodotto.

- [x] **Step 3: Nessun checkpoint visivo per questo task**

Nessuna delle nuove prop è ancora usata da un chiamante con `grande`/`evidenziata` — il checkpoint comincia dal Task 4.

---

### Task 4: `components/home/CamereInEvidenza.tsx` — selezione del riquadro grande e nuova griglia

**Files:**
- Modify: `components/home/CamereInEvidenza.tsx` (file intero, 47 righe)

**Interfaces:**
- Consumes: `getCamere` (Task 2, ora con `evidenziata`), `CameraCard` (Task 3, ora con `grande`/`evidenziata`/`badgeLabel`).

Contenuto attuale di riferimento (file intero, 47 righe, letto fresh il 26/08/2026):

```tsx
import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";
import SectionWrapper from "@/components/layout/SectionWrapper";
import CameraCard from "@/components/ui/CameraCard";
import { getCamere } from "@/lib/queries";

// fallback solo se non c'è ancora nessuna camera pubblicata su Sanity
const CAMERE_PLACEHOLDER = [
  { slug: "standard", nome: "Camera Standard", servizi: ["wifi", "tv", "aria-condizionata"], prezzoBase: 85, fotoUrl: null },
  { slug: "vista-mare", nome: "Camera Vista Mare", servizi: ["wifi", "balcone", "vista-mare"], prezzoBase: 110, fotoUrl: null },
  { slug: "family", nome: "Camera Family", servizi: ["wifi", "tv", "bagno-privato"], prezzoBase: 140, fotoUrl: null },
];

export default async function CamereInEvidenza({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "Home.camere" });
  const camereReali = await getCamere(locale);
  const camere = camereReali.length > 0 ? camereReali.slice(0, 3) : CAMERE_PLACEHOLDER;

  return (
    <SectionWrapper bg="white">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h2 className="font-heading text-3xl text-primary">{t("title")}</h2>
          <p className="mt-2 text-textMuted">{t("subtitle")}</p>
        </div>
        <Link href="/camere" className="text-sm font-semibold text-primary hover:text-accent">
          {t("ctaAll")} →
        </Link>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {camere.map((camera) => (
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
    </SectionWrapper>
  );
}
```

- [x] **Step 1: Sostituire l'intero contenuto del file**

```tsx
import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";
import SectionWrapper from "@/components/layout/SectionWrapper";
import CameraCard from "@/components/ui/CameraCard";
import { getCamere } from "@/lib/queries";

// fallback solo se non c'è ancora nessuna camera pubblicata su Sanity —
// "Camera Vista Mare" marcata evidenziata per mantenere un bento corretto
// anche a Sanity vuoto (26/08/2026, Punto 3a coerenza visiva).
const CAMERE_PLACEHOLDER = [
  { slug: "standard", nome: "Camera Standard", servizi: ["wifi", "tv", "aria-condizionata"], prezzoBase: 85, fotoUrl: null, evidenziata: false },
  { slug: "vista-mare", nome: "Camera Vista Mare", servizi: ["wifi", "balcone", "vista-mare"], prezzoBase: 110, fotoUrl: null, evidenziata: true },
  { slug: "family", nome: "Camera Family", servizi: ["wifi", "tv", "bagno-privato"], prezzoBase: 140, fotoUrl: null, evidenziata: false },
];

export default async function CamereInEvidenza({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "Home.camere" });
  const camereReali = await getCamere(locale);
  const camere = camereReali.length > 0 ? camereReali.slice(0, 3) : CAMERE_PLACEHOLDER;

  // Riquadro grande: la prima camera con evidenziata === true (nell'ordine
  // già restituito dalla query, per `ordine asc`); se nessuna è flaggata,
  // la prima in ordine — mai un layout "tutto piccolo". Se più di una è
  // flaggata per errore, vince la prima incontrata (findIndex si ferma
  // alla prima corrispondenza).
  const indiceGrande = Math.max(
    camere.findIndex((c) => c.evidenziata),
    0
  );
  const grandeCamera = camere[indiceGrande];
  const piccole = camere.filter((_, i) => i !== indiceGrande);

  return (
    <SectionWrapper bg="white">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h2 className="font-heading text-3xl text-primary">{t("title")}</h2>
          <p className="mt-2 text-textMuted">{t("subtitle")}</p>
        </div>
        <Link href="/camere" className="text-sm font-semibold text-primary hover:text-accent">
          {t("ctaAll")} →
        </Link>
      </div>

      <div className="mt-10 flex flex-col gap-6">
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
    </SectionWrapper>
  );
}
```

- [x] **Step 2: Verificare con tsc ed esbuild**

Stessa sandbox dei task precedenti (ora con `Home.camere` che richiede anche `badgeEvidenziata` nello stub di `next-intl` se il tipo del `t()` stub è tipizzato per chiave — verificare che lo stub esistente accetti stringhe arbitrarie, altrimenti allargarlo). Run: `npx tsc --noEmit -p tsconfig.verify.json` (includendo `components/home/CamereInEvidenza.tsx`) ed `npx esbuild components/home/CamereInEvidenza.tsx --bundle --jsx=automatic --tsconfig=tsconfig.verify.json --external:next-intl/server --external:react --external:react-dom --external:@/lib/i18n/navigation --external:@/components/layout/SectionWrapper --external:@/components/ui/CameraCard --external:@/lib/queries --outdir=/tmp/bento-camere-verify/out`
Expected: nessun errore, bundle prodotto.

- [x] **Step 3: Nota di verifica per il titolare**

Da controllare in `npm run dev` locale, sia con dati reali (dopo aver impostato `evidenziata` su una camera in Sanity Studio) sia con lo stato attuale (nessuna camera reale ha ancora il campo popolato — vedrai comunque il bento corretto, con "Camera Vista Mare" come riquadro grande se il DB non ha camere reali, o la prima camera per `ordine` se ne hai già pubblicate ma nessuna flaggata): aprire la home page, sezione "Camere in evidenza" — un riquadro grande a piena larghezza con badge "In evidenza" in alto a sinistra sulla foto, due riquadri più piccoli sotto affiancati da tablet in su. Restringere la finestra sotto i 640px (o usare gli strumenti sviluppatore del browser in modalità mobile): le 3 card devono impilarsi tutte in colonna, una sopra l'altra.

---

### Task 5: Copy — chiave `badgeEvidenziata` in 4 lingue

**Files:**
- Modify: `messages/it.json:45-51`
- Modify: `messages/en.json:45-51`
- Modify: `messages/de.json:45-51`
- Modify: `messages/fr.json:45-51`

**Interfaces:**
- Produces: `Home.camere.badgeEvidenziata` — consumato dal Task 4 (`t("badgeEvidenziata")`).

Contenuto attuale di riferimento (identico in struttura nei 4 file, letto fresh il 26/08/2026):

`messages/it.json:45-51`:
```json
    "camere": {
      "title": "Camere in evidenza",
      "subtitle": "Ambienti curati, vista sul golfo o sul borgo.",
      "priceFrom": "da",
      "cta": "Scopri",
      "ctaAll": "Vedi tutte le camere"
    },
```

`messages/en.json:45-51`:
```json
    "camere": {
      "title": "Featured rooms",
      "subtitle": "Carefully furnished rooms, with views of the gulf or the village.",
      "priceFrom": "from",
      "cta": "Discover",
      "ctaAll": "View all rooms"
    },
```

`messages/de.json:45-51`:
```json
    "camere": {
      "title": "Unsere Zimmer",
      "subtitle": "Gepflegte Zimmer mit Blick auf den Golf oder den Ort.",
      "priceFrom": "ab",
      "cta": "Entdecken",
      "ctaAll": "Alle Zimmer ansehen"
    },
```

`messages/fr.json:45-51`:
```json
    "camere": {
      "title": "Chambres en vedette",
      "subtitle": "Des chambres soignées, avec vue sur le golfe ou le village.",
      "priceFrom": "à partir de",
      "cta": "Découvrir",
      "ctaAll": "Voir toutes les chambres"
    },
```

Testo riusato letteralmente dal namespace `OffertePage.badgeEvidenziata` già esistente nei 4 file (`messages/*.json:205`) — stesso concetto, stessa dicitura, non un testo nuovo.

- [x] **Step 1: `messages/it.json`**

Sostituire:

```json
      "ctaAll": "Vedi tutte le camere"
    },
```

con:

```json
      "ctaAll": "Vedi tutte le camere",
      "badgeEvidenziata": "In evidenza"
    },
```

(solo nel blocco `Home.camere`, righe 45-51 — non toccare l'omonima chiave nel blocco `OffertePage`, che resta invariata)

- [x] **Step 2: `messages/en.json`**

Sostituire:

```json
      "ctaAll": "View all rooms"
    },
```

con:

```json
      "ctaAll": "View all rooms",
      "badgeEvidenziata": "Featured"
    },
```

- [x] **Step 3: `messages/de.json`**

Sostituire:

```json
      "ctaAll": "Alle Zimmer ansehen"
    },
```

con:

```json
      "ctaAll": "Alle Zimmer ansehen",
      "badgeEvidenziata": "Empfohlen"
    },
```

- [x] **Step 4: `messages/fr.json`**

Sostituire:

```json
      "ctaAll": "Voir toutes les chambres"
    },
```

con:

```json
      "ctaAll": "Voir toutes les chambres",
      "badgeEvidenziata": "En vedette"
    },
```

- [x] **Step 5: Verificare che i 4 file restino JSON valido**

Run (per ciascuno dei 4 file): `node -e "JSON.parse(require('fs').readFileSync('messages/it.json', 'utf8')); console.log('OK')"` (ripetere sostituendo il nome file per en/de/fr)
Expected: `OK` per tutti e 4, nessun `SyntaxError`.

- [x] **Step 6: Nessun checkpoint visivo separato**

Il testo del badge si vede già nel checkpoint del Task 4 — non serve un controllo a video ulteriore qui.

---

### Task 6: Aggiornare `STATO_PROGETTO.md`

**Files:**
- Modify: `STATO_PROGETTO.md`

**Interfaces:** Nessuna — solo documentazione.

- [x] **Step 1: Aggiungere la voce di chiusura**

Aggiungere, nella sezione "Redesign visivo" (dopo la chiusura della Fase 6/sweep finale già documentata), una nuova voce "Bento camere in home (Punto 3a) CHIUSO" che copre:
- Il nuovo campo Sanity `evidenziata` su `camera.ts` e la nota che il titolare deve impostarlo lui su Sanity Studio (nessuna camera reale ce l'ha ancora al momento della consegna).
- I 6 file toccati (schema, query, `CameraCard.tsx`, `CamereInEvidenza.tsx`, 4 file `messages/*.json` contati come un gruppo).
- Il comportamento di fallback (nessuna camera flaggata → la prima per `ordine` diventa comunque il riquadro grande).
- Lo stacking mobile (<640px, tutte e 3 le card in colonna) confermato esplicitamente dal titolare durante il brainstorming.
- La nota che il Punto 3b (sezione esperienze in home, oggi inesistente come griglia di card) resta un sotto-progetto separato, non pianificato.
- I limiti di verifica di questa sessione Cowork (solo `tsc --noEmit`/`esbuild --bundle`, nessun accesso a Sanity Studio/browser reale).

- [x] **Step 2: Nessun checkpoint visivo per questo task**

Documentazione pura, nessun impatto sul sito.

---

## Note di esecuzione

- Ordine consigliato: Task 1 → 2 → 3 (indipendenti tra loro, ciascuno propedeutico al successivo) → 4 (li consuma tutti) → 5 (indipendente, può girare in parallelo a 1-4) → 6 sempre ultimo.
- Consegna: un solo `SendUserFile` con tutti i file toccati dall'intero piano (i 2 file schema/query, `CameraCard.tsx`, `CamereInEvidenza.tsx`, i 4 file `messages/*.json`, `STATO_PROGETTO.md`, questo file di piano) + un solo `device_commit_files` — mai consegne sparse per task.

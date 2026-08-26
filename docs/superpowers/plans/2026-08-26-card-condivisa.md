# Componente Card condiviso — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sostituire i 6 gusci "card" mantenuti a mano (bordo/ombra/radius ripetuti e divergenti in ogni file) con un unico componente `Card` condiviso, applicando le regole della spec (radius sempre 12px, bordo solo senza foto, hover solo se cliccabile).

**Architecture:** Un componente polimorfo `components/ui/Card.tsx` (nessuna direttiva `"use client"` — non serve, niente hook/API client-only, quindi resta usabile sia da Server che da Client Component senza il rischio RSC incontrato con `buttonClasses`). Due varianti di rendering: `<div>` (default) o `Link` di next-intl se viene passato `href`, stesso pattern di dispatch già stabilito in `Button.tsx`. Due prop esplicite guidano lo stile — `conFoto` (obbligatoria) e `hover` (opzionale, default `false`) — mai dedotte implicitamente dal contenuto.

**Tech Stack:** Next.js App Router, TypeScript, Tailwind (token da `lib/theme.ts`), next-intl (`Link` da `@/lib/i18n/navigation`).

## Global Constraints

- Mai eseguire `git` da questa sessione Cowork — commit reali fatti dal titolare dal tab Code.
- Nessun accesso a database/VPS da questa sessione.
- Verifica disponibile solo tramite `npx tsc --noEmit` ed `esbuild --bundle --jsx=automatic` in una sandbox scratch temporanea (react/react-dom/typescript/esbuild installati a parte, mai committati) — nessun `npm run dev`/build reale possibile da qui. Sandbox sempre eliminata prima della consegna finale.
- Ogni task produce un incremento ispezionabile a occhio dal titolare quando esegue lui stesso `npm run dev` in locale — la nota di cosa controllare va riportata fedelmente in ogni task, incluso quando la verifica visiva reale non è possibile per mancanza di contenuto reale (stesso principio già applicato a OffertaCard/pagina offerte vuota nel piano `2026-08-26-button-condiviso.md`).
- Regole del guscio Card, dalla spec (`docs/superpowers/specs/2026-08-26-coerenza-visiva-design.md`, §"Componente Card"): radius `rounded-lg` (12px) sempre; bordo `border border-border` SOLO se la card non ha una foto in testa; ombra `shadow-card` sempre, `hover:shadow-cardHover` SOLO se la card (o il suo contenuto principale) è cliccabile/link.
- Fuori scope per questo piano: il popover del calendario (`DateRangePicker.tsx`) e la modale di conferma chiamata (`LuogoCard.tsx`, righe 91-125) NON adottano il componente Card — sono chrome di overlay/dialogo, ruolo UI diverso. Il popover riceve solo una correzione lessicale minima (Task 8); la modale non necessita alcuna modifica (già `bg-background`, verificato in fase di lettura fresh del file).
- `components/booking/BookingWidget.tsx` fa parte anche della Fase 4 (flusso booking/pagamento) della spec, piano successivo a priorità alta per il resto del file — in questo piano si tocca SOLO il contenitore della card-risultato camera (Task 7), non i bottoni/input/box termini cancellazione del resto del file.

---

### Task 1: Creare il componente Card

**Files:**
- Create: `components/ui/Card.tsx`

**Interfaces:**
- Produces: `export default function Card(props: CardProps): JSX.Element`, `export type CardProps`. `CardProps` = `{ conFoto: boolean; hover?: boolean; className?: string; children: React.ReactNode } & ({ href: string; ...resto props di Link } | { href?: undefined; ...resto props di div })`.

Nota di design (perché niente `"use client"` e niente modulo `cardClasses.ts` separato, a differenza di `Button.tsx`/`buttonClasses.ts`): il problema RSC incontrato con `buttonClasses` nasceva da una funzione pura invocata *direttamente* da Server Component fuori da JSX (es. `buttonClasses("accent", "grande")` dentro `Hero.tsx`), mentre qui ogni call site userà sempre `<Card>` come JSX — sempre permesso indipendentemente dalla direttiva. Card stessa non ha bisogno di `"use client"` (nessun hook, nessuna interattività propria), quindi resta importabile sia da Server sia da Client Component senza alcun confine da gestire.

- [x] **Step 1: Scrivere il componente**

```tsx
import type { ComponentPropsWithoutRef } from "react";
import { Link } from "@/lib/i18n/navigation";

// Guscio fisico condiviso per tutte le "card" del sito (foto + testo, o
// icona + testo) — vedi docs/superpowers/specs/2026-08-26-coerenza-visiva-design.md,
// §"Componente Card". Nessuna direttiva "use client": Card non usa hook né
// API client-only, quindi resta importabile/renderizzabile sia da Server
// che da Client Component senza il rischio incontrato con buttonClasses
// (vedi components/ui/buttonClasses.ts) — qui non esiste comunque una
// funzione "classi pure" invocata fuori da JSX, quindi il problema non si
// pone.
//
// `conFoto` è OBBLIGATORIA (nessun default): ogni call site deve dichiarare
// esplicitamente se questa istanza è una card con foto (o fallback a
// gradiente, stessa area "foto in testa") in testa — niente bordo, la
// foto/il fallback definisce già il bordo visivo, overflow-hidden per
// ritagliare l'immagine dentro gli angoli arrotondati — oppure senza foto
// (bordo border-border, niente overflow-hidden).
//
// `hover` è opzionale (default false): true SOLO se la card, o il suo
// contenuto principale, è cliccabile/link (regola della spec).

type CardBaseProps = {
  conFoto: boolean;
  hover?: boolean;
  className?: string;
  children: React.ReactNode;
};

type CardAsLink = CardBaseProps & {
  href: string;
} & Omit<ComponentPropsWithoutRef<typeof Link>, "href" | "className" | "children">;

type CardAsDiv = CardBaseProps & {
  href?: undefined;
} & Omit<ComponentPropsWithoutRef<"div">, "className" | "children">;

export type CardProps = CardAsLink | CardAsDiv;

export default function Card(props: CardProps) {
  const { conFoto, hover = false, className = "", children } = props;
  const classi = [
    "rounded-lg",
    "bg-background",
    "shadow-card",
    conFoto ? "overflow-hidden" : "border border-border",
    hover ? "transition-shadow hover:shadow-cardHover" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (props.href !== undefined) {
    const { href, conFoto: _cf, hover: _h, className: _c, children: _ch, ...rest } = props;
    return (
      <Link href={href} {...rest} className={classi}>
        {children}
      </Link>
    );
  }

  const { conFoto: _cf2, hover: _h2, className: _c2, children: _ch2, href: _hh, ...rest } = props;
  return (
    <div {...rest} className={classi}>
      {children}
    </div>
  );
}
```

- [x] **Step 2: Verificare con tsc in sandbox scratch**

Creare una sandbox temporanea (`/tmp/card-verify`), symlink di `node_modules` (react@19.2.4, react-dom@19.2.4, typescript, esbuild, @types/react, @types/react-dom, @types/node) nel mirror del repo, `tsconfig.verify.json` con `"paths": {"@/*": ["./*"]}` (niente `baseUrl`, non supportato dalla versione di TypeScript installata).

Run: `npx tsc --noEmit -p tsconfig.verify.json`
Expected: nessun errore su `components/ui/Card.tsx`.

- [x] **Step 3: Verificare con esbuild**

Run: `npx esbuild components/ui/Card.tsx --bundle --jsx=automatic --tsconfig=tsconfig.verify.json --external:next-intl --external:react --external:react-dom --outdir=/tmp/card-verify/out`
Expected: bundle completato senza errori.

- [x] **Step 4: Nota di verifica per il titolare**

Nessun checkpoint visivo per questo task: `Card` non è ancora usato da nessuna pagina (nessun consumer). Il checkpoint comincia dal Task 2, alla prima migrazione reale.

- [x] **Step 5: Eliminare la sandbox scratch**

Rimuovere `/tmp/card-verify` per intero prima di procedere al task successivo.

---

### Task 2: Migrare CameraCard.tsx

**Files:**
- Modify: `components/ui/CameraCard.tsx:1-4` (import), `components/ui/CameraCard.tsx:25-26` (apertura contenitore), `components/ui/CameraCard.tsx:48` (chiusura contenitore)

**Interfaces:**
- Consumes: `Card` da `@/components/ui/Card` (Task 1) — `conFoto`, `hover`, `className`, `children`.

Contenuto attuale di riferimento (righe 1-4 e 25-49, letto fresh il 26/08/2026):

```tsx
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { SERVIZI_ICONS } from "@/lib/servizi";
```

```tsx
  return (
    <div className="overflow-hidden rounded-lg bg-background shadow-card transition-shadow hover:shadow-cardHover">
      {fotoUrl ? (
```

```tsx
      </div>
    </div>
  );
}
```

- [x] **Step 1: Aggiungere l'import di Card**

In `components/ui/CameraCard.tsx`, sostituire le righe 1-4 con:

```tsx
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { SERVIZI_ICONS } from "@/lib/servizi";
import Card from "@/components/ui/Card";
```

- [x] **Step 2: Sostituire il contenitore esterno**

Sostituire la riga 26 (`<div className="overflow-hidden rounded-lg bg-background shadow-card transition-shadow hover:shadow-cardHover">`) con:

```tsx
    <Card conFoto hover>
```

Sostituire la riga 48 (il `</div>` che chiude questo stesso contenitore — l'ultimo prima di `</div>` interno di `.p-5`, verificare contando le righe dal file fresh) con:

```tsx
    </Card>
```

Tutto il contenuto interno (foto/fallback gradiente, `.p-5` con nome/servizi/prezzo/link CTA) resta identico, non toccarlo.

- [x] **Step 3: Verificare con tsc ed esbuild**

Stessa sandbox scratch del Task 1 (ricrearla se già eliminata). Run: `npx tsc --noEmit -p tsconfig.verify.json` ed `npx esbuild components/ui/CameraCard.tsx --bundle --jsx=automatic --tsconfig=tsconfig.verify.json --external:next-intl --external:next/image --external:react --external:react-dom --outdir=/tmp/card-verify/out`.
Expected: nessun errore.

- [x] **Step 4: Nota di verifica per il titolare**

Aprire `/camere` (elenco camere) in `npm run dev` locale: le card devono avere lo stesso aspetto di prima (foto in testa, niente bordo, ombra che si accentua al passaggio del mouse). Nessuna differenza visibile attesa — è una normalizzazione, non un redesign.

- [x] **Step 5: Eliminare la sandbox scratch**

---

### Task 3: Migrare OffertaCard.tsx

**Files:**
- Modify: `components/ui/OffertaCard.tsx:1-3` (import), `components/ui/OffertaCard.tsx:27` (apertura contenitore), `components/ui/OffertaCard.tsx:58` (chiusura contenitore)

**Interfaces:**
- Consumes: `Card` da `@/components/ui/Card` (Task 1). `BookingButton`/`buttonClasses` (già migrati nel piano precedente) restano invariati — NON toccare la riga 54.

Contenuto attuale di riferimento (righe 1-3 e 27, letto fresh il 26/08/2026):

```tsx
import Image from "next/image";
import BookingButton from "@/components/ui/BookingButton";
import { buttonClasses } from "@/components/ui/buttonClasses";
```

```tsx
    <div className="relative overflow-hidden rounded-lg bg-background shadow-card transition-shadow hover:shadow-cardHover">
```

- [x] **Step 1: Aggiungere l'import di Card**

Sostituire le righe 1-3 con:

```tsx
import Image from "next/image";
import BookingButton from "@/components/ui/BookingButton";
import { buttonClasses } from "@/components/ui/buttonClasses";
import Card from "@/components/ui/Card";
```

- [x] **Step 2: Sostituire il contenitore esterno**

Sostituire la riga 27 con:

```tsx
    <Card conFoto hover className="relative">
```

(la classe `relative` resta necessaria: il badge `evidenziata` alla riga 29 usa `absolute`, ancorato a questo contenitore.)

Sostituire la riga 58 (`</div>` di chiusura di questo stesso contenitore) con `</Card>`. Il resto del file — badge, foto/fallback, `.p-5` con titolo/descrizione/prezzo, e il `<BookingButton>` con `buttonClasses("accent", "compatta")` alla riga 54 — resta identico, non toccarlo.

- [x] **Step 3: Verificare con tsc ed esbuild**

Stessa sandbox scratch. Run su `components/ui/OffertaCard.tsx`.
Expected: nessun errore.

- [x] **Step 4: Nota di verifica per il titolare**

Stesso limite già incontrato nel piano Button: al 26/08/2026 Sanity non ha offerte configurate, quindi `/offerte` mostra lo stato vuoto e questa card non è visivamente verificabile finché il titolare non aggiunge un'offerta di prova in Sanity Studio. Quando lo fa: la card deve avere foto in testa senza bordo, ombra che si accentua al passaggio del mouse, badge (se `evidenziata`) e bottone CTA color accent (già verificato nel piano precedente) invariati.

- [x] **Step 5: Eliminare la sandbox scratch**

---

### Task 4: Migrare LuogoCard.tsx

**Files:**
- Modify: `components/ui/LuogoCard.tsx:55` (apertura contenitore), `components/ui/LuogoCard.tsx:126` (chiusura contenitore) — aggiungere import Card

**Interfaces:**
- Consumes: `Card` da `@/components/ui/Card` (Task 1).

Contenuto attuale di riferimento (righe 42-55 e 124-128, letto fresh il 26/08/2026):

```tsx
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
```

```tsx
      )}
    </div>
  );
}
```

Nota importante: `rounded-xl` (16px) qui, non `rounded-lg` (12px) — è la stessa divergenza di radius trovata anche in `BenvenutoTile.tsx` (Task 5). Migrando a `Card` questa card passa a `rounded-lg`, uniformandosi al resto del sito: è una differenza di 4px, sottile ma reale, da segnalare al titolare (non un effetto collaterale nascosto).

- [x] **Step 1: Aggiungere l'import di Card**

In cima al file, dopo l'import di `Luogo` (riga 10), aggiungere:

```tsx
import Card from "@/components/ui/Card";
```

- [x] **Step 2: Sostituire il contenitore esterno**

Sostituire la riga 55 (`<div className="flex flex-col gap-2 rounded-xl border border-border bg-background p-5 shadow-card">`) con:

```tsx
    <Card conFoto={false} className="flex flex-col gap-2 p-5">
```

(`hover` omesso: default `false`, corretto — questa card non è cliccabile nel suo insieme, solo il bottone telefono e il link mappa interni lo sono, coerente con l'assenza di `hover:shadow-cardHover` già presente nel file originale.)

Sostituire la riga 126 (`</div>` di chiusura di questo stesso contenitore, subito prima di `);`) con `</Card>`. Tutto il contenuto interno — icona, nome, indirizzo/nota, bottone telefono, link mappa, e l'intera modale di conferma chiamata (righe 91-125, fuori scope) — resta identico, non toccarlo.

- [x] **Step 3: Verificare con tsc ed esbuild**

Stessa sandbox scratch. Run su `components/ui/LuogoCard.tsx` (nota: usa `lucide-react`, aggiungere `--external:lucide-react` al comando esbuild).
Expected: nessun errore.

- [x] **Step 4: Nota di verifica per il titolare**

`LuogoCard` vive nel Welcome Book digitale (`/benvenuto/servizi`, `/benvenuto/trasporti`, e le altre 6 pagine categoria) — un'area riservata, verificabile in `npm run dev` locale solo se il titolare ha modo di raggiungerla senza una prenotazione reale attiva (stesso tipo di limite già incontrato con Sanity vuoto per le offerte). Se raggiungibile: le card devono avere angoli leggermente meno arrotondati di prima (rounded-lg 12px invece di rounded-xl 16px, differenza sottile), bordo e assenza di ombra al passaggio del mouse invariati.

- [x] **Step 5: Eliminare la sandbox scratch**

---

### Task 5: Migrare BenvenutoTile.tsx

**Files:**
- Modify: `components/ui/BenvenutoTile.tsx` (import, riga 2; contenitore, righe 18-21 e 26)

**Interfaces:**
- Consumes: `Card` da `@/components/ui/Card` (Task 1), variante `href` (dispatch interno a `Link`).

Contenuto attuale di riferimento (file intero, 29 righe, letto fresh il 26/08/2026):

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

Stessa nota del Task 4: `rounded-xl` → `rounded-lg`, differenza di 4px da segnalare.

- [x] **Step 1: Sostituire l'import di Link con l'import di Card**

`Link` qui serve solo per questo contenitore — dopo la migrazione non resta più usato direttamente nel file (Card lo gestisce internamente), quindi va rimosso per evitare un import inutilizzato. Sostituire la riga 2 (`import { Link } from "@/lib/i18n/navigation";`) con:

```tsx
import Card from "@/components/ui/Card";
```

- [x] **Step 2: Sostituire il contenitore**

Sostituire le righe 18-21:

```tsx
    <Link
      href={href}
      className="flex flex-col items-center gap-1.5 rounded-xl border border-border bg-background p-3 text-center shadow-card transition-shadow hover:shadow-cardHover"
    >
```

con:

```tsx
    <Card conFoto={false} hover href={href} className="flex flex-col items-center gap-1.5 p-3 text-center">
```

Sostituire la riga 26 (`</Link>`) con `</Card>`. Il contenuto interno (icona, label) resta identico.

- [x] **Step 3: Verificare con tsc ed esbuild**

Stessa sandbox scratch. Run su `components/ui/BenvenutoTile.tsx` (`--external:lucide-react`).
Expected: nessun errore, nessun warning di import inutilizzato.

- [x] **Step 4: Nota di verifica per il titolare**

Stesso limite di accesso del Task 4: la griglia hub vive su `/benvenuto`, area riservata. Se raggiungibile: le 15 tile della griglia devono avere angoli leggermente meno arrotondati di prima (rounded-lg invece di rounded-xl), bordo, ombra che si accentua al passaggio del mouse, e l'intera tile resta cliccabile come prima (comportamento invariato, solo lessico visivo).

- [x] **Step 5: Eliminare la sandbox scratch**

---

### Task 6: Migrare LericiDintorni.tsx

**Files:**
- Modify: `components/home/LericiDintorni.tsx:2` (import), `components/home/LericiDintorni.tsx:16-23` (contenitore card-link)

**Interfaces:**
- Consumes: `Card` da `@/components/ui/Card` (Task 1), variante `href`.

Contenuto attuale di riferimento (righe 1-32, letto fresh il 26/08/2026):

```tsx
import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import SectionWrapper from "@/components/layout/SectionWrapper";

const BORGHI = ["cinqueTerre", "portovenere", "tellaro"] as const;

export default function LericiDintorni() {
  const t = useTranslations("Home.dintorni");

  return (
    <SectionWrapper bg="white">
      <h2 className="font-heading text-3xl text-primary">{t("title")}</h2>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {BORGHI.map((key) => (
          <Link
            key={key}
            href="/lerici"
            className="rounded-lg border border-border p-6 shadow-card transition-shadow hover:shadow-cardHover"
          >
            <h3 className="font-heading text-xl text-primary">{t(`${key}.name`)}</h3>
            <p className="mt-2 text-sm text-textMuted">{t(`${key}.distanza`)}</p>
          </Link>
        ))}
      </div>

      <Link href="/lerici" className="mt-8 inline-block text-sm font-semibold text-primary hover:text-accent">
        {t("cta")} →
      </Link>
    </SectionWrapper>
  );
}
```

Nota: qui il radius è già `rounded-lg` (corretto), ma manca `bg-background` — l'unica delle 6 card migrate senza questo token. In pratica `bg-background` vale `#FFFFFF` (bianco) nel tema, e questa sezione ha già `SectionWrapper bg="white"` come sfondo: aggiungerlo con Card non produce alcuna differenza visibile, è solo una correzione del token mancante (coerenza del codice, non dell'aspetto). Da segnalare comunque, per completezza.

Il secondo `<Link href="/lerici">` (riga 27, il CTA testuale "leggi di più") NON è una card — resta un link di testo semplice, fuori scope per questo piano, non toccarlo.

- [x] **Step 1: Aggiungere l'import di Card**

`Link` resta necessario nel file (usato alla riga 27), quindi non va rimosso. Sostituire la riga 2 con:

```tsx
import { Link } from "@/lib/i18n/navigation";
import Card from "@/components/ui/Card";
```

- [x] **Step 2: Sostituire il contenitore della card-link**

Sostituire le righe 16-19:

```tsx
          <Link
            key={key}
            href="/lerici"
            className="rounded-lg border border-border p-6 shadow-card transition-shadow hover:shadow-cardHover"
          >
```

con:

```tsx
          <Card key={key} conFoto={false} hover href="/lerici" className="p-6">
```

Sostituire la riga 23 (`</Link>`) con `</Card>`. Il contenuto interno (h3, p) resta identico. Non toccare le righe 27-29 (il CTA testuale).

- [x] **Step 3: Verificare con tsc ed esbuild**

Stessa sandbox scratch. Run su `components/home/LericiDintorni.tsx`.
Expected: nessun errore.

- [x] **Step 4: Nota di verifica per il titolare**

Aprire la home page, sezione "dintorni" (Cinque Terre / Portovenere / Tellaro): nessuna differenza visibile attesa — radius, bordo, ombra e comportamento hover erano già corretti, l'unica modifica (bg-background) coincide col bianco già presente.

- [x] **Step 5: Eliminare la sandbox scratch**

---

### Task 7: Migrare il contenitore della card-risultato in BookingWidget.tsx

**Files:**
- Modify: `components/booking/BookingWidget.tsx:16-17` (import), `components/booking/BookingWidget.tsx:342` (apertura contenitore), `components/booking/BookingWidget.tsx:382` (chiusura contenitore)

**Interfaces:**
- Consumes: `Card` da `@/components/ui/Card` (Task 1).

Contenuto attuale di riferimento (righe 16-17 e 340-382, letto fresh il 26/08/2026):

```tsx
import DateRangePicker from "@/components/ui/DateRangePicker";
import PaymentStep from "./PaymentStep";
```

```tsx
            const arricchimento = arricchimenti[tipo.id];
            return (
              <div key={tipo.id} className="border rounded overflow-hidden">
                {arricchimento?.fotoUrl && (
```

```tsx
                  <button
                    onClick={() => {
                      setTrattamento("bb");
                      setTipoSelezionato(tipo);
                    }}
                    disabled={capienzaSuperata}
                    className="mt-3 bg-primary text-white rounded px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t("selezionaCamera")}
                  </button>
                </div>
              </div>
            );
          })}
```

Attenzione — questa migrazione cambia un comportamento visivo reale, non solo il nome dei token: oggi il contenitore ha `border rounded overflow-hidden` (bordo SEMPRE presente, anche con foto). La regola della spec vuole "niente bordo se la card ha una foto in testa" — questa card ha sempre foto o fallback a gradiente (stesso pattern di `CameraCard`), quindi con `conFoto` il bordo sparisce, resta solo `overflow-hidden` per ritagliare l'immagine. È una correzione intenzionale di coerenza (bordo ridondante con l'ombra + la foto che già delimita il riquadro), da segnalare esplicitamente al titolare come cambiamento visibile, non un effetto collaterale. Il bottone `selezionaCamera` (bg-primary, non tematizzato con `rounded`/`rounded-md`) resta fuori scope, riservato alla Fase 4 (booking/pagamento).

- [x] **Step 1: Aggiungere l'import di Card**

Sostituire le righe 16-17 con:

```tsx
import DateRangePicker from "@/components/ui/DateRangePicker";
import Card from "@/components/ui/Card";
import PaymentStep from "./PaymentStep";
```

- [x] **Step 2: Sostituire il contenitore della card-risultato**

Sostituire la riga 342 (`<div key={tipo.id} className="border rounded overflow-hidden">`) con:

```tsx
              <Card key={tipo.id} conFoto hover>
```

Sostituire la riga 382 (`</div>` di chiusura di questo stesso contenitore, subito prima di `);`) con `</Card>`. Tutto il contenuto interno (foto/fallback, nome, capienza, m², descrizione, servizi, prezzo, bottone `selezionaCamera`) resta identico, non toccarlo.

- [x] **Step 3: Verificare con tsc ed esbuild**

Stessa sandbox scratch. Run su `components/booking/BookingWidget.tsx` (`--external:next-sanity --external:next/image`).
Expected: nessun errore.

- [x] **Step 4: Nota di verifica per il titolare**

Sulla home o su una pagina con il widget di ricerca booking, eseguire una ricerca disponibilità che restituisca almeno un risultato (serve almeno un tipo camera con disponibilità reale nel periodo cercato — se il gestionale non ne ha in quel momento, la verifica visiva di questo task va rimandata a quando ce ne sono, stesso tipo di limite già incontrato con Sanity/offerte). Quando visibile: le card-risultato non devono più avere un bordo grigio intorno (rimosso di proposito, vedi nota sopra), l'ombra deve accentuarsi al passaggio del mouse (nuovo, prima assente), il resto (foto, testi, bottone "seleziona camera") invariato.

- [x] **Step 5: Eliminare la sandbox scratch**

---

### Task 8: Correzione lessicale del popover di DateRangePicker.tsx

**Files:**
- Modify: `components/ui/DateRangePicker.tsx:243`

Fuori scope per l'adozione del componente Card (è chrome di overlay, non una card di contenuto), ma la spec richiede comunque la correzione del token sbagliato. Contenuto attuale di riferimento (riga 243, letto fresh il 26/08/2026):

```tsx
        <div className="absolute z-10 mt-2 rounded-lg border border-border bg-white p-4 shadow-cardHover">
```

- [x] **Step 1: Sostituire bg-white con bg-background**

Sostituire la riga 243 con:

```tsx
        <div className="absolute z-10 mt-2 rounded-lg border border-border bg-background p-4 shadow-cardHover">
```

`bg-background` vale `#FFFFFF` nel tema — stesso identico colore di `bg-white`, questa è solo la correzione del nome del token (coerenza del codice, zero impatto visivo).

- [x] **Step 2: Verificare con tsc ed esbuild**

Stessa sandbox scratch (con `react-day-picker@^10.0.1` installato, come nei piani precedenti che hanno toccato questo file). Run su `components/ui/DateRangePicker.tsx`.
Expected: nessun errore.

- [x] **Step 3: Nota di verifica per il titolare**

Aprire il calendario del date-range-picker (booking widget o Hero, dove presente): nessuna differenza visibile attesa — è la stessa identica tinta di bianco, solo il nome del token è cambiato nel codice.

- [x] **Step 4: Eliminare la sandbox scratch**

---

### Task 9: Aggiornare la documentazione di progetto

**Files:**
- Modify: `STATO_PROGETTO.md`

- [x] **Step 1: Aggiungere la voce di chiusura del piano Card**

Nella sezione "Redesign visivo", sotto la voce già presente del Punto 2 (coerenza visiva) e del suo primo piano (Button, chiuso il 26/08/2026), aggiungere una sotto-voce per il secondo piano (Card) con: nome del componente e le sue due prop (`conFoto` obbligatoria, `hover` opzionale default `false`); l'elenco dei 6 file migrati (`CameraCard.tsx`, `OffertaCard.tsx`, `LuogoCard.tsx`, `BenvenutoTile.tsx`, `LericiDintorni.tsx`, il contenitore-risultato di `BookingWidget.tsx`) più la correzione lessicale di `DateRangePicker.tsx`; le due normalizzazioni di radius scoperte durante la migrazione (`LuogoCard.tsx` e `BenvenutoTile.tsx`: rounded-xl → rounded-lg, 16px → 12px); il cambio di comportamento reale in `BookingWidget.tsx` (bordo rimosso dalla card-risultato, hover aggiunto); il fatto che `Card` non ha bisogno di `"use client"` né di un modulo `cardClasses.ts` separato (nessun rischio RSC, spiegare perché in una riga, come già fatto per `buttonClasses.ts`); i limiti di verifica di Cowork dichiarati esplicitamente (nessun accesso a browser/`npm run dev`, solo `tsc`/`esbuild`); i due checkpoint visivi non ancora verificabili al momento della consegna (OffertaCard — Sanity senza offerte; LuogoCard/BenvenutoTile — Welcome Book area riservata; BookingWidget — serve una ricerca con risultati disponibili); aggiornare la riga "Prossimo piano" indicandolo come Fase 4 (booking/payment flow, priorità alta per la spec).

- [x] **Step 2: Rileggere la sezione aggiornata**

Verificare che la voce sia coerente con lo stile delle voci precedenti (Punto 1, primo piano di Punto 2) e non contenga placeholder.

---

## Note finali per chi esegue

- Ogni task in questo piano dipende dal Task 1 (il componente `Card` deve esistere prima di qualunque migrazione) ma i Task 2-8 sono indipendenti tra loro — possono essere eseguiti in qualunque ordine dopo il Task 1, l'ordine sopra è solo quello scelto per la stesura.
- Prima di modificare ciascun file, ri-leggerlo fresh da device con `device_stage_files` (non fidarsi della cache di questa conversazione) — stesso principio già seguito nei piani precedenti, per non sovrascrivere eventuali modifiche locali del titolare.
- Consegna finale: un solo `SendUserFile` con tutti i file toccati nell'intero piano (`Card.tsx` nuovo + i file modificati nei Task 2-9) + un solo `device_commit_files`, mai consegne sparse per singolo task.

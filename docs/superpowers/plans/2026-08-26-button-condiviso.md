# Componente Button condiviso — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sostituire le CTA duplicate a mano fuori dal flusso booking (Header, Hero, i 3 form, LavoroBanner, PestoHighlight, OffertaCard) con un unico componente `Button` condiviso, eliminando le divergenze di stile trovate dall'audit (4 varianti visive per lo stesso ruolo "CTA primaria" in 9 file).

**Architecture:** Un componente `Button` polimorfo in `components/ui/Button.tsx`: se riceve `href` che inizia con `/` renderizza un `<Link>` (next-intl, route interne), se `href` inizia con `#`/`mailto:`/altro renderizza un `<a>`, altrimenti renderizza un `<button>` (per i form). Espone anche una funzione `buttonClasses(variant, size)` che restituisce solo la stringa di classi — serve per i 3 call site che passano già per `BookingButton` (Header, Hero primaria, OffertaCard), che ha già la sua propria logica di routing (fallback TeamSystem esterno vs `/prenota` interno) e non va duplicata né innestata dentro un secondo componente polimorfo.

**Tech Stack:** Next.js 16 / React 19 / TypeScript, Tailwind (classi via `lib/theme.ts` → `tailwind.config.ts`), next-intl per `Link`. Nessuna nuova dipendenza.

## Global Constraints

- Mai `git` da questa sessione Cowork — commit reali fatti dal titolare dal tab Code.
- Consegna a fine sessione via `SendUserFile` + `device_commit_files` in un unico batch, mai file singoli sparsi.
- Ogni file toccato: aggiornare `STATO_PROGETTO.md` (sito-hotel) con i limiti di verifica dichiarati (nessun accesso browser da qui).
- Verifica disponibile da qui: `npx tsc --noEmit` ed `esbuild --bundle --jsx=automatic` per ogni file toccato — mai `npm run dev`/build reale, mai supporre un test automatico eseguibile da questa sessione. Ogni task termina con un'istruzione precisa di cosa il titolare deve guardare a video quando esegue lui stesso `npm run dev` in locale.
- Nessun artefatto di scratch (sandbox `node_modules`, `tsconfig.verify.json`) va lasciato nei file consegnati — sempre ripulito prima della consegna.
- Deviazione dichiarata rispetto alla spec (`docs/superpowers/specs/2026-08-26-coerenza-visiva-design.md`): la spec raggruppava "estensione token" + "componente Button" nella stessa fase logica. Questo piano copre SOLO il componente Button e le sue migrazioni — l'estensione di `lib/theme.ts` (colore `error`, scala titoli) non ha alcun consumatore in questo piano (il colore errore serve solo al piano booking/pagamento, la scala titoli serve solo al piano di sweep finale) e viene quindi rimandata al piano che la userà davvero, invece di aggiungere codice morto oggi.
- Variante di colore per `OffertaCard` (accent invece di primary, per la nuova regola CTA calda/promozionale): il cambiamento va fatto comunque nel codice in questo piano, ma **non sarà verificabile a video** finché il titolare non aggiunge almeno un'offerta di prova in Sanity (oggi `/offerte` mostra lo stato vuoto, zero offerte configurate) — dichiarato esplicitamente nel task corrispondente, non da scoprire dopo.

---

### Task 1: Creare il componente Button e migrare LavoroBanner (primo caso, il più semplice)

**Files:**
- Create: `components/ui/Button.tsx`
- Modify: `components/home/LavoroBanner.tsx`

**Interfaces:**
- Produce: `export default function Button(props: ButtonProps)`, `export function buttonClasses(variant: ButtonVariant, size: ButtonSize = "grande"): string`, `export type ButtonVariant = "primary" | "accent" | "outline-primary" | "outline-white" | "solid-white-accent"`, `export type ButtonSize = "grande" | "compatta"`.
- Consuma: `Link` da `@/lib/i18n/navigation` (stesso import già usato da `LavoroBanner.tsx` e da `BookingButton.tsx`).

- [ ] **Step 1: Creare `components/ui/Button.tsx`**

```tsx
"use client";

import { Link } from "@/lib/i18n/navigation";

export type ButtonVariant = "primary" | "accent" | "outline-primary" | "outline-white" | "solid-white-accent";
export type ButtonSize = "grande" | "compatta";

// Le 5 combinazioni reali trovate nell'audit di coerenza visiva del
// 26/08/2026 (docs/superpowers/specs/2026-08-26-coerenza-visiva-design.md):
// primary/accent per le azioni piene (piena navy = funzionale, piena
// accent = calda/promozionale), outline-primary/outline-white per le due
// varianti outline già in uso (LavoroBanner, Hero secondaria),
// solid-white-accent per il bottone bianco su sfondo accent di
// PestoHighlight — non è "outline" (nessun bordo, sfondo pieno bianco).
const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "bg-primary text-white hover:bg-primaryLight",
  accent: "bg-accent text-white hover:bg-accentLight",
  "outline-primary": "border border-primary text-primary hover:bg-primary hover:text-white",
  "outline-white": "border border-white text-white hover:bg-white hover:text-primary",
  "solid-white-accent": "bg-white text-accent hover:bg-surface",
};

// "compatta" a px-5/py-2.5 (non py-2): l'audit ha trovato 3 varianti della
// stessa "pillola media" (Header desktop px-5/py-2, Header mobile e
// OffertaCard px-5/py-2.5) — py-2.5 è la maggioranza (2 su 3), si
// standardizza su quella invece che sulla minoranza.
const SIZE_CLASSES: Record<ButtonSize, string> = {
  grande: "px-7 py-3",
  compatta: "px-5 py-2.5",
};

export function buttonClasses(variant: ButtonVariant, size: ButtonSize = "grande"): string {
  return `rounded-full text-sm font-semibold transition-colors ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]}`;
}

type ButtonBaseProps = {
  variant: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: React.ReactNode;
};

type ButtonAsLink = ButtonBaseProps & {
  href: string;
} & Omit<React.ComponentPropsWithoutRef<"a">, "className" | "children" | "href">;

type ButtonAsButton = ButtonBaseProps & {
  href?: undefined;
} & Omit<React.ComponentPropsWithoutRef<"button">, "className" | "children">;

export type ButtonProps = ButtonAsLink | ButtonAsButton;

// Componente polimorfo: con `href` che inizia per "/" è un link di
// navigazione interna (next-intl Link, gestisce già il prefisso locale);
// con `href` che inizia per "#"/"mailto:"/altro è un <a> semplice (ancora
// in pagina, mailto, esterno); senza `href` è un <button> (per i form).
// Per i call site che passano già da BookingButton (Header, Hero
// primaria, OffertaCard — che hanno una propria logica di routing/
// fallback TeamSystem) si usa `buttonClasses` da solo, non questo
// componente, per non innestare due wrapper di routing diversi.
export default function Button(props: ButtonProps) {
  const { variant, size = "grande", className = "", children } = props;
  const classi = `${buttonClasses(variant, size)} ${className}`.trim();

  if (props.href) {
    const { href, variant: _v, size: _s, className: _c, children: _ch, ...rest } = props;
    if (href.startsWith("/")) {
      return (
        <Link href={href} {...rest} className={classi}>
          {children}
        </Link>
      );
    }
    return (
      <a href={href} {...rest} className={classi}>
        {children}
      </a>
    );
  }

  const { variant: _v2, size: _s2, className: _c2, children: _ch2, href: _h, ...rest } = props;
  return (
    <button type="button" {...rest} className={classi}>
      {children}
    </button>
  );
}
```

- [ ] **Step 2: Verificare con `tsc --noEmit` ed `esbuild` (sandbox scratch temporanea)**

```bash
mkdir -p /tmp/btn-verify && cd /tmp/btn-verify && npm init -y >/dev/null 2>&1 && \
npm install --no-audit --no-fund react@19.2.4 react-dom@19.2.4 typescript esbuild @types/react@^19 @types/react-dom@^19 @types/node@^20
```

Poi, dalla root del repo `sito-hotel` (con `node_modules` linkato temporaneamente da `/tmp/btn-verify/node_modules` e un `tsconfig.verify.json` con `"paths": {"@/*": ["./*"]}`, stesso procedimento già usato per `DateRangePicker.tsx`):

```bash
npx tsc --noEmit -p tsconfig.verify.json
npx esbuild components/ui/Button.tsx --bundle --jsx=automatic --loader:.tsx=tsx --tsconfig=tsconfig.verify.json --outfile=/tmp/btn-verify/out.js
```

Expected: zero errori in entrambi. Poi rimuovere `node_modules` (symlink) e `tsconfig.verify.json` dal repo prima di procedere.

- [ ] **Step 3: Migrare `components/home/LavoroBanner.tsx` al nuovo Button**

Sostituire (riga 12-17 del file attuale):

```tsx
      <Link
        href="/lavoro"
        className="mt-6 inline-block rounded-full border border-primary px-7 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-white"
      >
        {t("cta")}
      </Link>
```

con:

```tsx
      <Button href="/lavoro" variant="outline-primary" className="mt-6 inline-block">
        {t("cta")}
      </Button>
```

E aggiornare gli import in cima al file: sostituire `import { Link } from "@/lib/i18n/navigation";` con `import Button from "@/components/ui/Button";` (il `Link` non serve più direttamente in questo file — lo usa `Button` internamente).

- [ ] **Step 4: Verificare `LavoroBanner.tsx` con `tsc`/`esbuild`**

Stesso procedimento dello Step 2, aggiungendo `components/home/LavoroBanner.tsx` alla verifica. Expected: zero errori.

- [ ] **Step 5: Nota per il controllo visivo del titolare**

Da controllare con `npm run dev`: home page, sezione "Lavoro con noi" (banner su sfondo sabbia) — il bottone con bordo navy e testo navy deve apparire identico a prima (stesso bordo, stesso padding, stesso hover che riempie di navy con testo bianco).

---

### Task 2: Migrare Hero.tsx (CTA primaria accent + CTA secondaria outline bianco)

**Files:**
- Modify: `components/home/Hero.tsx`

**Interfaces:**
- Consuma: `buttonClasses` e `Button` da `components/ui/Button.tsx` (Task 1).

- [ ] **Step 1: Modificare `components/home/Hero.tsx`**

Sostituire (righe 40-48 del file attuale):

```tsx
          <BookingButton className="rounded-full bg-accent px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-accentLight">
            {t("ctaPrimary")}
          </BookingButton>
          <a
            href="#punti-di-forza"
            className="rounded-full border border-white px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-primary"
          >
            {t("ctaSecondary")}
          </a>
```

con:

```tsx
          <BookingButton className={buttonClasses("accent", "grande")}>
            {t("ctaPrimary")}
          </BookingButton>
          <Button href="#punti-di-forza" variant="outline-white">
            {t("ctaSecondary")}
          </Button>
```

Aggiungere in cima al file: `import Button, { buttonClasses } from "@/components/ui/Button";`.

- [ ] **Step 2: Verificare con `tsc`/`esbuild`** (stesso procedimento del Task 1, su `components/home/Hero.tsx`). Expected: zero errori.

- [ ] **Step 3: Nota per il controllo visivo del titolare**

Home page, sezione Hero (foto piena con testo bianco): due bottoni affiancati, quello a sinistra pieno terracotta "prenota ora" (identico a prima — stesso colore, stesso hover più chiaro), quello a destra col solo bordo bianco che si riempie di bianco al passaggio del mouse (identico a prima).

---

### Task 3: Migrare Header.tsx (desktop + mobile, elimina la divergenza)

**Files:**
- Modify: `components/layout/Header.tsx`

**Interfaces:**
- Consuma: `buttonClasses` da `components/ui/Button.tsx` (Task 1).

- [ ] **Step 1: Modificare `components/layout/Header.tsx`**

Sostituire (riga 62-64 del file attuale, CTA desktop):

```tsx
          <BookingButton className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-primaryLight">
            {tHeader("cta")}
          </BookingButton>
```

con:

```tsx
          <BookingButton className={buttonClasses("primary", "compatta")}>
            {tHeader("cta")}
          </BookingButton>
```

Sostituire (riga 100-102 del file attuale, CTA mobile — oggi senza hover/transition, dopo la migrazione li ha, eliminando la divergenza con la desktop):

```tsx
          <BookingButton className="mt-2 rounded-full bg-primary px-5 py-2.5 text-center text-sm font-semibold text-white">
            {tHeader("cta")}
          </BookingButton>
```

con:

```tsx
          <BookingButton className={`mt-2 text-center ${buttonClasses("primary", "compatta")}`}>
            {tHeader("cta")}
          </BookingButton>
```

Aggiungere in cima al file: `import { buttonClasses } from "@/components/ui/Button";`.

- [ ] **Step 2: Verificare con `tsc`/`esbuild`** su `components/layout/Header.tsx`. Expected: zero errori.

- [ ] **Step 3: Nota per il controllo visivo del titolare**

Header desktop (bottone "Prenota" navy accanto al selettore lingua) e header mobile (apri il menu hamburger, stesso bottone in fondo al menu a tutta larghezza) — entrambi ora devono avere lo stesso identico comportamento al passaggio del mouse (schiarimento navy), cosa che prima mancava sulla versione mobile.

---

### Task 4: Migrare i 3 form (ContattoForm, ConvenzioneForm, PrenotazioneTavoloForm)

**Files:**
- Modify: `components/forms/ContattoForm.tsx`
- Modify: `components/forms/ConvenzioneForm.tsx`
- Modify: `components/forms/PrenotazioneTavoloForm.tsx`

**Interfaces:**
- Consuma: `Button` da `components/ui/Button.tsx` (Task 1).

- [ ] **Step 1: Modificare `components/forms/ContattoForm.tsx`**

Sostituire (righe 100-106 del file attuale):

```tsx
      <button
        type="submit"
        disabled={status === "sending"}
        className="rounded-full bg-primary px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-primaryLight disabled:opacity-60 sm:col-span-2"
      >
        {status === "sending" ? t("formSending") : t("formSubmit")}
      </button>
```

con:

```tsx
      <Button type="submit" variant="primary" disabled={status === "sending"} className="disabled:opacity-60 sm:col-span-2">
        {status === "sending" ? t("formSending") : t("formSubmit")}
      </Button>
```

Aggiungere in cima al file: `import Button from "@/components/ui/Button";`.

- [ ] **Step 2: Modificare `components/forms/ConvenzioneForm.tsx`**

Sostituire (righe 83-88 del file attuale):

```tsx
      <button
        type="submit"
        className="rounded-full bg-primary px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-primaryLight sm:col-span-2"
      >
        {t("formSubmit")}
      </button>
```

con:

```tsx
      <Button type="submit" variant="primary" className="sm:col-span-2">
        {t("formSubmit")}
      </Button>
```

Aggiungere in cima al file: `import Button from "@/components/ui/Button";`.

- [ ] **Step 3: Modificare `components/forms/PrenotazioneTavoloForm.tsx`**

Sostituire (righe 63-68 del file attuale):

```tsx
      <button
        type="submit"
        className="rounded-full bg-primary px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-primaryLight sm:col-span-2"
      >
        {t("formSubmit")}
      </button>
```

con:

```tsx
      <Button type="submit" variant="primary" className="sm:col-span-2">
        {t("formSubmit")}
      </Button>
```

Aggiungere in cima al file: `import Button from "@/components/ui/Button";`.

- [ ] **Step 4: Verificare con `tsc`/`esbuild`** sui 3 file. Expected: zero errori.

- [ ] **Step 5: Nota per il controllo visivo del titolare**

Tre pagine: `/contatti` (form contatto), `/lavoro` (form convenzione aziendale), `/ristorante` (form prenotazione tavolo) — il bottone di invio in fondo a ciascun form deve apparire identico a prima (pillola navy piena, stesso hover). Su `/contatti`, verificare anche che il bottone si veda "spento" (opacità ridotta) durante l'invio, come prima.

---

### Task 5: Migrare PestoHighlight.tsx

**Files:**
- Modify: `components/home/PestoHighlight.tsx`

**Interfaces:**
- Consuma: `Button` da `components/ui/Button.tsx` (Task 1).

- [ ] **Step 1: Modificare `components/home/PestoHighlight.tsx`**

Sostituire (righe 16-21 del file attuale):

```tsx
          <Link
            href="/esperienze"
            className="mt-6 inline-block rounded-full bg-white px-7 py-3 text-sm font-semibold text-accent transition-colors hover:bg-surface"
          >
            {t("cta")}
          </Link>
```

con:

```tsx
          <Button href="/esperienze" variant="solid-white-accent" className="mt-6 inline-block">
            {t("cta")}
          </Button>
```

Sostituire l'import in cima al file: `import { Link } from "@/lib/i18n/navigation";` diventa `import Button from "@/components/ui/Button";`.

- [ ] **Step 2: Verificare con `tsc`/`esbuild`** su `components/home/PestoHighlight.tsx`. Expected: zero errori.

- [ ] **Step 3: Nota per il controllo visivo del titolare**

Home page, sezione "Pesto" (sfondo terracotta pieno) — il bottone bianco con testo terracotta deve apparire identico a prima (stesso bianco pieno, stesso hover verso il colore sabbia).

---

### Task 6: Migrare OffertaCard.tsx (cambio colore da primary ad accent)

**Files:**
- Modify: `components/ui/OffertaCard.tsx`

**Interfaces:**
- Consuma: `buttonClasses` da `components/ui/Button.tsx` (Task 1).

- [ ] **Step 1: Modificare `components/ui/OffertaCard.tsx`**

Sostituire (riga 53-55 del file attuale):

```tsx
        <BookingButton className="mt-4 inline-block w-full rounded-full bg-primary px-5 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-primaryLight">
          {ctaLabel}
        </BookingButton>
```

con:

```tsx
        <BookingButton className={`mt-4 inline-block w-full text-center ${buttonClasses("accent", "compatta")}`}>
          {ctaLabel}
        </BookingButton>
```

Aggiungere in cima al file: `import { buttonClasses } from "@/components/ui/Button";`.

- [ ] **Step 2: Verificare con `tsc`/`esbuild`** su `components/ui/OffertaCard.tsx`. Expected: zero errori.

- [ ] **Step 3: Nota per il controllo visivo del titolare — ATTENZIONE, richiede un'offerta di prova**

La pagina `/offerte` oggi mostra lo stato vuoto (nessuna offerta configurata in Sanity) — questo cambiamento non è verificabile a video finché non aggiungi almeno un'offerta di prova in Sanity Studio. Una volta aggiunta: il bottone della card offerta deve essere terracotta pieno (prima era navy), stesso padding/hover di prima ma con il nuovo colore.

---

### Task 7: Aggiornare la documentazione

**Files:**
- Modify: `STATO_PROGETTO.md` (sito-hotel)

**Interfaces:** Nessuna (solo documentazione).

- [ ] **Step 1: Aggiungere una voce in `STATO_PROGETTO.md`, sezione "Redesign visivo"**

Documentare: nuovo componente `components/ui/Button.tsx` (5 varianti, 2 taglie) e `buttonClasses()`, i 9 call site migrati (Header ×2, Hero ×2, i 3 form, LavoroBanner, PestoHighlight, OffertaCard), la correzione del colore di `OffertaCard` (primary→accent) e la nota che non è verificabile senza un'offerta di prova in Sanity, l'eliminazione della divergenza hover Header desktop/mobile, la deviazione dichiarata sui token di tema rimandati ai piani successivi, e i limiti di verifica di questa sessione Cowork (`tsc --noEmit` + `esbuild --bundle`, nessun accesso browser).

- [ ] **Step 2: Consegna finale**

Un solo `SendUserFile` con tutti i file toccati in questo piano (`components/ui/Button.tsx`, `components/home/LavoroBanner.tsx`, `components/home/Hero.tsx`, `components/layout/Header.tsx`, `components/forms/ContattoForm.tsx`, `components/forms/ConvenzioneForm.tsx`, `components/forms/PrenotazioneTavoloForm.tsx`, `components/home/PestoHighlight.tsx`, `components/ui/OffertaCard.tsx`, `STATO_PROGETTO.md`), seguito da un solo `device_commit_files` per scriverli tutti sul PC del titolare. Nessun commit git da questa sessione — lo fa il titolare dal tab Code dopo aver verificato a video.

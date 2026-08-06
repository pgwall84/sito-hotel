# CLAUDE.md — Hotel del Golfo — Sito Web

> Leggi questo file e poi `SPEC_SITO_HOTEL.md` integralmente prima di fare
> qualsiasi cosa.

**Nota**: `AGENTS.md` in questa cartella non è documentazione di progetto —
è un file generato automaticamente da Next.js 16.2+ (`create-next-app`)
che punta alla documentazione bundlata in `node_modules/next/dist/docs/`,
per evitare pattern di codice obsoleti. Non contiene nulla sull'hotel.
Verificato e chiarito nel gestionale (repo `gestionale-hotel`,
`docs/DIARIO_SESSIONI.md`, voce "Falso allarme AGENTS.md").

---

## 1. IDENTITÀ E FONTE DI VERITÀ

Sito vetrina + booking per Hotel del Golfo, hotel 3 stelle a Lerici (SP).
Repository separato dal gestionale interno (`gestionale-hotel`) — **non
mescolare i due progetti**, anche se condividono lo stesso titolare come
utente finale.

**`SPEC_SITO_HOTEL.md` in questa cartella è la fonte di verità unica** per:
identità/posizionamento, stack tecnico, design system (`lib/theme.ts`),
internazionalizzazione, struttura pagine, schema Sanity, componenti
principali, SEO/AEO, performance, booking engine dual-mode, struttura file,
sequenza di sviluppo, variabili d'ambiente. Non duplicare quel contenuto
qui — se serve aggiornarlo, si modifica solo `SPEC_SITO_HOTEL.md`.

Non esiste più una copia di questo file nel repo `gestionale-hotel` (era
una copia stale, rimossa il 26/07/2026 — vedi il diario di quel repo).

---

## 2. STACK IN BREVE

Next.js 15 + TypeScript, App Router, Tailwind + design tokens in
`lib/theme.ts`, Sanity v3 come CMS (Studio in italiano), next-intl per
IT/EN/DE/FR, deploy Vercel con ISR 60s sui contenuti Sanity. Dettaglio
completo in `SPEC_SITO_HOTEL.md` Sezione 2.

Booking engine dual-mode: Fase 1 usa il widget TeamSystem Hospitality
(iframe/link esterno), Fase 2 lo sostituirà con un calendario custom su
API WuBook — vedi `SPEC_SITO_HOTEL.md` Sezione 10 e `BookingButton.tsx`.

---

## 3. CONVENZIONI

- **Lingua**: tutto il contenuto editabile dal titolare vive in Sanity, in
  italiano nei nomi campo/interfaccia Studio. Testi statici di codice
  (commenti, nomi variabili) in italiano dove possibile, coerente con il
  gestionale.
- **Design**: ogni modifica grafica passa da `lib/theme.ts` — mai colori o
  font hardcoded nei componenti.
- **Plan-then-execute**: per task che toccano più di 3 file o aggiungono
  una pagina/sezione completa, scrivi un piano breve (file da creare/
  modificare, dipendenze nuove con motivo, rischi) e attendi conferma
  prima di scrivere codice — stessa convenzione del gestionale, per
  coerenza tra i due repo.
- **Non installare nuove dipendenze** senza descriverne il motivo nel piano.

---

## 4. SICUREZZA — GIÀ IMPLEMENTATO

Security headers (CSP, X-Frame-Options, X-Content-Type-Options,
Referrer-Policy, HSTS) in `next.config.ts`; cookie banner GDPR
(vanilla-cookieconsent) con Google Analytics gated su consenso; Sanity
Studio protetto in produzione con HTTP Basic Auth (`proxy.ts`); Dependabot
attivo. Dettaglio e cronologia: chiedere al titolare o consultare la
cronologia git di `next.config.ts`/`proxy.ts` (questo repo non ha ancora
un diario sessioni separato come il gestionale — se la cronologia diventa
densa, valutare di crearne uno analogo a `docs/DIARIO_SESSIONI.md`).

**Evolutiva aperta**: `app/api/contact/route.ts` valida e sanitizza il
form contatti ma non invia ancora email a nessun provider reale (Resend
proposto, non configurato) — il messaggio finisce solo nei log Vercel.

---

## 5. RIFERIMENTI

- Spec completa: `SPEC_SITO_HOTEL.md` (questa cartella)
- Backlog/evolutive (gap noti, contenuti mancanti, miglioramenti
  rimandati): `docs/EVOLUTIVE.md` (questa cartella, creato 06/08/2026)
- Gestionale interno (progetto collegato ma separato): repo
  `gestionale-hotel`, `CLAUDE.md` di quel repo
- Booking engine Fase 1: widget TeamSystem, URL in `lib/theme.ts`
- CITR hotel, coordinate GPS, contatti: `SPEC_SITO_HOTEL.md` Sezione 14

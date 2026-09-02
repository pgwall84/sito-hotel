# Design: micro-interazioni su hover (Punto 4, piano redesign visivo)

Data: 27/08/2026
Riferimento: `docs/superpowers/plans/2026-08-24-redesign-visivo-sito.md`, sezione "4. Micro-interazioni su hover"

## Obiettivo

Completare il Punto 4 del piano master. In fase di brainstorming è emerso che gran
parte del lavoro previsto dal piano è **già stato fatto** in punti precedenti (in
particolare il Punto 2, coerenza visiva). Questo spec copre solo ciò che manca
davvero.

## Stato di partenza verificato

- `components/ui/Card.tsx`: quando riceve `hover` (vero per `CameraCard` e
  `OffertaCard`), applica già `transition-shadow hover:shadow-cardHover`.
- `components/ui/EscursioneCard.tsx`: replica a mano lo stesso trattamento
  (`transition-shadow hover:shadow-cardHover`), non passa da `Card.tsx` (vedi
  commento nel file, motivi di link interno/esterno).
- `components/ui/buttonClasses.ts`: la funzione `buttonClasses()` include già la
  classe base `transition-colors`; ogni variante ha già un proprio `hover:`
  di cambio colore (es. `primary: "bg-primary text-white hover:bg-primaryLight"`).
- `components/ui/LuogoCard.tsx` (Welcome Book): la card stessa non ha hover (non
  passa `hover` a `Card`, coerente — non è cliccabile). Ha però due elementi
  interattivi con `hover:` ma **senza** `transition-colors`: il bottone
  "chiama" (`hover:bg-surfaceDark`) e il link "apri mappa"
  (`hover:text-accent`) — il colore cambia di scatto invece che in dissolvenza.
- `app/globals.css`: 5 righe, nessuna gestione di `prefers-reduced-motion` in
  tutto il progetto (verificato via grep, nessun risultato).
- Nessuna UI di filtro esiste nel codice (`grep -ri filtro app/`, zero
  risultati) — il riferimento ai "filtri" nel piano master non ha oggi nulla
  su cui applicarsi.

## Decisioni di brainstorming

1. **Card**: nessuna modifica. L'ombra hover già presente basta (scelta
   esplicita: niente `hover:scale`).
2. **Bottoni**: nessuna modifica. Il cambio colore già presente basta (scelta
   esplicita: niente sollevamento/scale).
3. **`prefers-reduced-motion`**: da gestire ora, non rimandato al Punto 5
   (audit accessibilità) — approccio kill-switch globale in `app/globals.css`
   (vedi sotto), non variante Tailwind `motion-reduce:` per-classe: un solo
   file, copre ombre/colori esistenti e qualunque transizione futura, senza
   dover toccare ogni componente che oggi o in futuro usa `transition-*`.
4. **`LuogoCard.tsx`**: dentro lo scope. Aggiungere `transition-colors` ai due
   hover esistenti (bottone telefono, link mappa) — nessun nuovo hover,
   nessuna modifica visiva, solo la dissolvenza mancante.
5. **Filtri**: fuori scope, non applicabile — nessuna UI esiste. Se in futuro
   verrà introdotto un filtro (es. per numero di persone in `/camere`,
   citato in `SPEC_SITO_HOTEL.md` ma mai implementato), l'hover andrà
   affrontato in quella sede, non qui.

## Modifiche

### `app/globals.css`

Aggiungere in coda al file:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

Tecnica standard ("kill-switch"): per chi ha impostato "riduci animazioni" a
livello di sistema operativo, azzera la durata di qualunque `transition`/
`animation` sul sito, comprese quelle già esistenti (ombra su Card/
EscursioneCard, colore su bottoni/LuogoCard) e quelle future, senza dover
mantenere un elenco di classi da escludere.

### `components/ui/LuogoCard.tsx`

Due modifiche puntuali, solo aggiunta della classe `transition-colors`:

- Bottone "chiama" (riga con `hover:bg-surfaceDark`): aggiungere
  `transition-colors` alle classi esistenti.
- Link "apri mappa" (riga con `hover:text-accent`): aggiungere
  `transition-colors` alle classi esistenti.

Nessun'altra riga del file cambia.

## Fuori scope (esplicito)

- Scale/ingrandimento su card o bottoni.
- Sollevamento (shadow aggiuntiva) sui bottoni.
- Qualunque UI di filtro (non esiste).
- Framer Motion o altre librerie di animazione — solo transizioni Tailwind
  pure, come da piano master.
- Modifiche a `Card.tsx`, `CameraCard.tsx`, `OffertaCard.tsx`,
  `EscursioneCard.tsx`, `buttonClasses.ts` — già a posto, nessuna riga
  toccata.

## Verifica prevista

- Controllo `tsc` mirato sui due file toccati (via tsconfig di scratch nella
  root del repo, con `next-env.d.ts` incluso — vedi memoria di progetto
  `sito_hotel_verifica_tsc_reale.md`).
- Verifica visiva NON automatizzabile da questa sessione: il titolare dovrà
  confermare via `npm run dev` che (a) nulla è visivamente cambiato dove non
  previsto, (b) attivando "riduci movimento" nel sistema operativo le
  transizioni spariscono.

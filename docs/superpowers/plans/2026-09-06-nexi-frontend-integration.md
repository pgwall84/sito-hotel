# Integrazione frontend Nexi XPay Build nel Booking Engine Diretto — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rendere `sito-hotel` capace di completare il pagamento della caparra con entrambi i provider già supportati dal backend (`gestionale-hotel`) — Stripe (esistente) e Nexi XPay Build (nuovo) — mostrando al termine una schermata di conferma unica, nello stesso flusso, per entrambi.

**Architettura:** Due nuovi componenti — `NexiPaymentStep.tsx` (generalizza la logica client-side già verificata in `app/[locale]/xpay-test/page.tsx`) e `ConfermaPrenotazione.tsx` (presentazionale, condiviso). `BookingWidget.tsx` sceglie quale step di pagamento montare guardando quale campo arriva nella risposta di `POST /prenota` (`client_secret` vs `pagamento_nexi`), non un flag letto a parte. Ogni step di pagamento (`PaymentStep`/`NexiPaymentStep`) decide da solo, internamente, quando passare dal form alla schermata di conferma — nessuno stato di "esito pagamento" sollevato fino a `BookingWidget`.

**Tech Stack:** Next.js 16 (App Router, React 19), TypeScript, `@stripe/react-stripe-js` (esistente), SDK esterno XPay Build (script caricato a runtime, nessun pacchetto npm).

## Global Constraints

- Nessuna operazione git mutante (`commit`, `checkout`, `merge`, `push`) va eseguita da una sessione Cowork — chi esegue questo piano in una sessione Cowork deve fermarsi prima di ogni commit e chiedere all'utente di eseguirlo, o lavorare da una sessione/ambiente senza questa restrizione.
- `sito-hotel` non ha un test runner configurato (nessun jest/vitest/playwright in `package.json`) — la verifica automatica per ogni task è `npx tsc --noEmit` (0 errori, baseline attuale pulita), la verifica funzionale è manuale via `npm run dev` + browser, stesso pattern già in uso per `PaymentStep.tsx`/`BookingWidget.tsx`.
- Niente nuova pagina/URL per la schermata di conferma — resta uno stato dentro lo stesso flusso React, mai un redirect.
- Nessun retry per un pagamento Nexi rifiutato (KO) — fuori scope, vedi design doc sezione "Decisioni rimandate". Dopo un KO l'utente vede solo un messaggio, nessun bottone per riprovare.
- Preautorizzazione vs addebito 30% è un piano separato — non toccare la logica di importo/percentuale caparra qui.
- Il prezzo/importo mostrato resta sempre quello restituito dal backend, mai ricalcolato lato client — stesso principio già in vigore nel resto di `BookingWidget.tsx`.
- Testi in italiano hardcoded nei componenti di pagamento (stesso pattern già in uso in `PaymentStep.tsx` esistente) — nessuna nuova chiave di traduzione next-intl introdotta da questo piano.
- Riferimento di design completo: `docs/superpowers/specs/2026-09-06-nexi-frontend-integration-design.md`.

---

### Task 1: `ConfermaPrenotazione.tsx` — schermata di conferma condivisa

**Files:**
- Create: `components/booking/ConfermaPrenotazione.tsx`

**Interfaces:**
- Produces: `export type RiepilogoPrenotazione = { prenotazioneId: number; nomeCamera: string; dataArrivo: string; dataPartenza: string; trattamentoLabel: string; saldoDaPagare: number }`; `export type EsitoConferma = "confermata" | "in_attesa_conferma" | "richiede_intervento_manuale"`; `export default function ConfermaPrenotazione({ riepilogo: RiepilogoPrenotazione, importoPagato: number, esito: EsitoConferma })`.

- [ ] **Step 1: Creare il file**

```tsx
// components/booking/ConfermaPrenotazione.tsx — schermata di chiusura del
// Booking Engine Diretto, condivisa tra Stripe (PaymentStep) e Nexi
// (NexiPaymentStep). Nessuna chiamata API propria: riceve tutto ciò che
// serve da chi la monta, che lo sa già da prima della chiamata a /prenota.
// Resta nello stesso flusso (stesso stato React del componente che la
// monta), non una pagina/URL dedicata — il riepilogo completo viaggia
// comunque via email. Vedi
// docs/superpowers/specs/2026-09-06-nexi-frontend-integration-design.md.

export type RiepilogoPrenotazione = {
  prenotazioneId: number;
  nomeCamera: string;
  dataArrivo: string;
  dataPartenza: string;
  trattamentoLabel: string;
  saldoDaPagare: number;
};

export type EsitoConferma = "confermata" | "in_attesa_conferma" | "richiede_intervento_manuale";

const TESTO_ESITO: Record<EsitoConferma, { titolo: string; corpo: string; classeTitolo: string }> = {
  confermata: {
    titolo: "Prenotazione confermata",
    corpo: "Riceverai a breve una email di conferma con tutti i dettagli.",
    classeTitolo: "text-primary",
  },
  in_attesa_conferma: {
    titolo: "Pagamento ricevuto",
    corpo: "La conferma definitiva della prenotazione arriverà a breve via email.",
    classeTitolo: "text-primary",
  },
  richiede_intervento_manuale: {
    titolo: "Pagamento in verifica",
    corpo:
      "Il pagamento è stato registrato, ma la conferma richiede un controllo da parte nostra. Ti contatteremo al più presto per completare la prenotazione.",
    classeTitolo: "text-textMuted",
  },
};

function formattaData(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("it-IT", { day: "2-digit", month: "long", year: "numeric" });
}

export default function ConfermaPrenotazione({
  riepilogo,
  importoPagato,
  esito,
}: {
  riepilogo: RiepilogoPrenotazione;
  importoPagato: number;
  esito: EsitoConferma;
}) {
  const testo = TESTO_ESITO[esito];

  return (
    <div className="mt-6 max-w-lg rounded-md border border-border p-4">
      <h3 className={`font-heading text-xl ${testo.classeTitolo}`}>{testo.titolo}</h3>
      <p className="mt-2 text-textMuted">{testo.corpo}</p>

      <dl className="mt-4 grid grid-cols-2 gap-y-2 text-sm">
        <dt className="text-textMuted">Numero prenotazione</dt>
        <dd className="text-right font-semibold">{riepilogo.prenotazioneId}</dd>

        <dt className="text-textMuted">Camera</dt>
        <dd className="text-right">
          {riepilogo.nomeCamera} — {riepilogo.trattamentoLabel}
        </dd>

        <dt className="text-textMuted">Soggiorno</dt>
        <dd className="text-right">
          {formattaData(riepilogo.dataArrivo)} → {formattaData(riepilogo.dataPartenza)}
        </dd>

        <dt className="text-textMuted">Pagato ora</dt>
        <dd className="text-right font-semibold">€{importoPagato}</dd>

        <dt className="text-textMuted">Saldo da pagare in hotel</dt>
        <dd className="text-right">€{riepilogo.saldoDaPagare}</dd>
      </dl>
    </div>
  );
}
```

- [ ] **Step 2: Verificare che compili**

Run: `cd sito-hotel && npx tsc --noEmit`
Expected: nessun output (0 errori) — baseline del progetto già pulita, verificata prima di scrivere questo piano.

- [ ] **Step 3: Verifica visiva manuale**

Non c'è ancora nessun punto del sito che monta questo componente (arriverà nei Task 3-4). Rimandare la verifica visiva al Task 5/6 (verifica end-to-end), dove la schermata sarà effettivamente raggiungibile completando una prenotazione.

- [ ] **Step 4: Commit**

```bash
git add components/booking/ConfermaPrenotazione.tsx
git commit -m "feat(booking): componente ConfermaPrenotazione condiviso Stripe/Nexi"
```

---

### Task 2: `NexiPaymentStep.tsx` — integrazione client Nexi XPay Build per il flusso reale

**Files:**
- Create: `components/booking/NexiPaymentStep.tsx`
- Reference (non modificato): `app/[locale]/xpay-test/page.tsx` — origine della logica SDK generalizzata qui.

**Interfaces:**
- Consumes: `ConfermaPrenotazione`, `RiepilogoPrenotazione`, `EsitoConferma` (Task 1) — usa solo `"confermata"` e `"richiede_intervento_manuale"` di `EsitoConferma`.
- Produces: `export type DatiPagamentoNexi = { alias: string; environment: string; scriptSrc: string; transactionId: string; timeStamp: number; mac: string; amount: number; currency: string }` (stessa forma di `datiCliente` restituita da `gestionale-hotel/backend/lib/payments/nexiProvider.js` → `avviaPagamento()`); `export default function NexiPaymentStep({ datiPagamento: DatiPagamentoNexi; importoCaparra: number; riepilogo: RiepilogoPrenotazione })`.

- [ ] **Step 1: Creare il file**

```tsx
// components/booking/NexiPaymentStep.tsx — completamento pagamento Nexi
// XPay Build per il Booking Engine Diretto reale. Generalizza la logica
// SDK già verificata in isolamento in app/[locale]/xpay-test/page.tsx
// (non toccata da questo file — resta il riferimento di test) per
// consumare POST /prenota (campo pagamento_nexi) e
// POST /completa-pagamento-nexi invece degli endpoint di test. Vedi
// docs/superpowers/specs/2026-09-06-nexi-frontend-integration-design.md.

"use client";

import { useEffect, useRef, useState } from "react";
import Button from "@/components/ui/Button";
import ConfermaPrenotazione, { type RiepilogoPrenotazione } from "./ConfermaPrenotazione";

// Stessi tipi minimali per l'SDK esterno XPay Build (window.XPay) di
// app/[locale]/xpay-test/page.tsx — la sua vera definizione vive nello
// script caricato a runtime da int-ecommerce.nexi.it, non in un pacchetto
// npm. Duplicati qui (invece di condividerli da un modulo comune) per non
// modificare la pagina di test, che resta un riferimento isolato.
type XPayCardElement = {
  mount: (idDiv: string) => void;
};

type XPaySdk = {
  init: () => void;
  setConfig: (config: Record<string, unknown>) => void;
  create: (tipo: unknown, style: Record<string, unknown>) => XPayCardElement;
  createNonce: (idForm: string, card: XPayCardElement) => void;
  OPERATION_TYPES: { CARD: unknown };
  Environments: Record<string, unknown>;
  LANGUAGE: { ITA: unknown };
};

declare global {
  // eslint-disable-next-line no-var
  var XPay: XPaySdk | undefined;
}

export type DatiPagamentoNexi = {
  alias: string;
  environment: string;
  scriptSrc: string;
  transactionId: string;
  timeStamp: number;
  mac: string;
  amount: number;
  currency: string;
};

type NonceDetail = {
  nonce?: string;
};

type StatoNexi =
  | "caricamento_sdk"
  | "sdk_pronto"
  | "invio_in_corso"
  | "pagamento_in_corso"
  | "rifiutato"
  | "errore";

const API_BASE = process.env.NEXT_PUBLIC_GESTIONALE_API_URL;

export default function NexiPaymentStep({
  datiPagamento,
  importoCaparra,
  riepilogo,
}: {
  datiPagamento: DatiPagamentoNexi;
  importoCaparra: number;
  riepilogo: RiepilogoPrenotazione;
}) {
  const [stato, setStato] = useState<StatoNexi>("caricamento_sdk");
  const [messaggio, setMessaggio] = useState<string | null>(null);
  const [esitoFinale, setEsitoFinale] = useState<"confermata" | "richiede_intervento_manuale" | null>(null);
  const cardRef = useRef<XPayCardElement | null>(null);
  // Specchio sempre aggiornato di riepilogo/datiPagamento, letto dai
  // listener SDK registrati una sola volta al mount — stessa necessità e
  // stesso bug storico documentati in app/[locale]/xpay-test/page.tsx
  // (01/09/2026): una variabile catturata in un effetto a dipendenze vuote
  // resterebbe congelata al valore del primo render.
  const contestoRef = useRef({ prenotazioneId: riepilogo.prenotazioneId, datiPagamento });
  useEffect(() => {
    contestoRef.current = { prenotazioneId: riepilogo.prenotazioneId, datiPagamento };
  }, [riepilogo.prenotazioneId, datiPagamento]);

  // Ascoltatori globali degli eventi XPay — registrati UNA SOLA VOLTA al
  // mount (dipendenze vuote). Vedi il commento esteso in
  // app/[locale]/xpay-test/page.tsx (01/09/2026) per il bug storico che
  // questa scelta evita: registrare i listener con [stato] come
  // dipendenza li fa rimuovere a metà del flusso 3D Secure/GDI, prima che
  // XPay_Nonce possa arrivare (non è sincrono).
  useEffect(() => {
    function onXPayReady() {
      setStato("sdk_pronto");
    }
    function onXPayCardError(evt: Event) {
      const dettaglio = (evt as CustomEvent).detail;
      console.error("XPay_Card_Error:", dettaglio);
      setMessaggio("Campo carta non valido. Controlla i dati inseriti e riprova.");
      setStato("sdk_pronto");
    }
    function onXPayNonce(evt: Event) {
      const dettaglio = (evt as CustomEvent).detail as NonceDetail;
      if (!dettaglio?.nonce) {
        setStato("errore");
        setMessaggio("Risposta inattesa da Nexi. Riprova o contatta l'hotel.");
        return;
      }
      pagaConNonce(dettaglio.nonce);
    }
    // Controllo origin: stesso motivo di app/[locale]/xpay-test/page.tsx —
    // Nexi consegna l'esito anche via postMessage, non solo via CustomEvent
    // XPay_Nonce, quindi va verificato che il messaggio arrivi davvero
    // dallo script XPay Build caricato (stesso dominio di
    // datiPagamento.scriptSrc) e non da un altro script sulla pagina.
    function onMessage(e: MessageEvent) {
      const originAtteso = new URL(contestoRef.current.datiPagamento.scriptSrc).origin;
      if (e.origin !== originAtteso) return;
      try {
        const data = typeof e.data === "string" ? JSON.parse(e.data) : e.data;
        const nonce = data?.message?.payload?.xpayNonce || data?.message?.payload?.nonce;
        if (nonce) pagaConNonce(nonce);
      } catch {
        // Messaggio non nel formato atteso: ignorato, non è un errore per
        // l'utente (può arrivare da altri script della pagina).
      }
    }

    window.addEventListener("XPay_Ready", onXPayReady);
    window.addEventListener("XPay_Card_Error", onXPayCardError);
    window.addEventListener("XPay_Nonce", onXPayNonce);
    window.addEventListener("message", onMessage);
    return () => {
      window.removeEventListener("XPay_Ready", onXPayReady);
      window.removeEventListener("XPay_Card_Error", onXPayCardError);
      window.removeEventListener("XPay_Nonce", onXPayNonce);
      window.removeEventListener("message", onMessage);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Carica lo script SDK e monta l'elemento carta. Guardia anti-doppio-
  // caricamento per React 18/19 Strict Mode, stesso pattern di
  // app/[locale]/xpay-test/page.tsx. A differenza di quella pagina, qui
  // datiPagamento arriva già pronto come prop (da POST /prenota, campo
  // pagamento_nexi) — nessuno step "prepara" separato, si carica lo
  // script direttamente al mount.
  useEffect(() => {
    let annullato = false;

    function configuraXPay() {
      if (annullato) return;
      XPay!.init();
      XPay!.setConfig({
        baseConfig: {
          apiKey: datiPagamento.alias,
          environment: XPay!.Environments[datiPagamento.environment],
        },
        paymentParams: {
          amount: datiPagamento.amount,
          transactionId: datiPagamento.transactionId,
          currency: datiPagamento.currency,
          timeStamp: datiPagamento.timeStamp,
          mac: datiPagamento.mac,
          // Obbligatori per XPay.setConfig ma ignorati per le carte (solo
          // per metodi di pagamento alternativi, non usati qui) — devono
          // solo iniziare con http:// o https://.
          url: `${window.location.origin}/it/prenota`,
          url_back: `${window.location.origin}/it/prenota`,
          urlPost: `${window.location.origin}/it/prenota`,
        },
        customParams: {},
        language: XPay!.LANGUAGE.ITA,
      });
      const card = XPay!.create(XPay!.OPERATION_TYPES.CARD, { common: { fontSize: "16px" } });
      cardRef.current = card;
      card.mount("xpay-card-prenotazione");
    }

    const scriptEsistente = document.querySelector<HTMLScriptElement>(`script[src="${datiPagamento.scriptSrc}"]`);
    if (typeof XPay !== "undefined") {
      configuraXPay();
    } else if (scriptEsistente) {
      scriptEsistente.addEventListener("load", configuraXPay, { once: true });
    } else {
      const script = document.createElement("script");
      script.src = datiPagamento.scriptSrc;
      script.async = true;
      script.onload = configuraXPay;
      script.onerror = () => {
        if (annullato) return;
        setStato("errore");
        setMessaggio("Impossibile caricare il modulo di pagamento Nexi. Riprova tra qualche minuto.");
      };
      document.body.appendChild(script);
    }

    return () => {
      annullato = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function avviaPagamento() {
    if (!cardRef.current || typeof XPay === "undefined") {
      setMessaggio("Modulo di pagamento non ancora pronto. Attendi qualche secondo e riprova.");
      return;
    }
    setStato("invio_in_corso");
    setMessaggio(null);
    XPay.createNonce("nexi-payment-form", cardRef.current);
  }

  async function pagaConNonce(xpayNonce: string) {
    const { prenotazioneId } = contestoRef.current;
    setStato("pagamento_in_corso");
    try {
      const res = await fetch(`${API_BASE}/api/booking-pubblico/completa-pagamento-nexi`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prenotazione_id: prenotazioneId, xpay_nonce: xpayNonce }),
      });
      const body = await res.json();
      if (!res.ok) {
        setStato("errore");
        setMessaggio(body.error || "Errore imprevisto nella conferma del pagamento.");
        return;
      }
      if (body.confermato) {
        setEsitoFinale("confermata");
        return;
      }
      if (body.richiede_intervento_manuale) {
        setEsitoFinale("richiede_intervento_manuale");
        return;
      }
      // confermato:false senza richiede_intervento_manuale: carta rifiutata
      // da Nexi (esito KO). Nessun retry — vedi design doc, sezione Scope:
      // il pagamento pending diventa 'fallito' lato backend, un secondo
      // tentativo con lo stesso xpay_nonce non è possibile.
      setStato("rifiutato");
    } catch (err) {
      setStato("errore");
      setMessaggio(err instanceof Error ? err.message : "Errore di rete.");
    }
  }

  if (esitoFinale) {
    return <ConfermaPrenotazione riepilogo={riepilogo} importoPagato={importoCaparra} esito={esitoFinale} />;
  }

  if (stato === "rifiutato") {
    return (
      <p className="mt-6 text-error">
        Il pagamento è stato rifiutato dalla banca. Contatta l&apos;hotel per completare la prenotazione con un altro
        metodo di pagamento.
      </p>
    );
  }

  return (
    <div className="mt-6 max-w-lg">
      <p className="mb-4 text-textMuted">Caparra da pagare ora: €{importoCaparra}</p>
      <form id="nexi-payment-form" onSubmit={(e) => e.preventDefault()}>
        <div id="xpay-card-prenotazione" className="rounded-md border border-border p-3" style={{ minHeight: 40 }} />
        {stato === "caricamento_sdk" && <p className="mt-2 text-sm text-textMuted">Caricamento modulo di pagamento…</p>}
        {messaggio && <p className="mt-4 text-error">{messaggio}</p>}
        <Button
          variant="primary"
          size="compatta"
          className="mt-4"
          onClick={avviaPagamento}
          disabled={stato !== "sdk_pronto"}
        >
          {stato === "invio_in_corso" || stato === "pagamento_in_corso" ? "Elaborazione..." : `Paga €${importoCaparra}`}
        </Button>
      </form>
    </div>
  );
}
```

- [ ] **Step 2: Verificare che compili**

Run: `cd sito-hotel && npx tsc --noEmit`
Expected: nessun output (0 errori).

- [ ] **Step 3: Commit**

```bash
git add components/booking/NexiPaymentStep.tsx
git commit -m "feat(booking): NexiPaymentStep, integrazione client XPay Build per il flusso reale"
```

---

### Task 3: `PaymentStep.tsx` — usare `ConfermaPrenotazione` invece del messaggio statico

**Files:**
- Modify: `components/booking/PaymentStep.tsx` (intero file, 115 righe attuali)

**Interfaces:**
- Consumes: `ConfermaPrenotazione`, `RiepilogoPrenotazione` (Task 1).
- Produces: `PaymentStep` acquisisce un nuovo prop obbligatorio `riepilogo: RiepilogoPrenotazione` — Task 4 dovrà passarlo.

- [ ] **Step 1: Sostituire l'intero file**

```tsx
// Booking Engine Diretto (modulo 19/08/2026) — Payment Element Stripe
// embedded: il numero di carta non tocca mai il nostro server, passa solo
// da Stripe.js (PCI scope minimo). La conferma reale della prenotazione
// avviene lato server via webhook (backend/controllers/stripeWebhookController.js),
// MAI da questo componente — la pagina di ritorno mostra solo lo stato,
// non decide nulla.
//
// Schermata di chiusura unificata con Nexi (06/09/2026): al posto del
// paragrafo statico usa ConfermaPrenotazione, condiviso con
// NexiPaymentStep.tsx — vedi
// docs/superpowers/specs/2026-09-06-nexi-frontend-integration-design.md.

"use client";

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import Button from "@/components/ui/Button";
import ConfermaPrenotazione, { type RiepilogoPrenotazione } from "./ConfermaPrenotazione";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// Nome titolare carta: campo NOSTRO, non del PaymentElement — segnalato da
// Marco il 19/08/2026 durante il primo test reale, "il form Stripe non
// chiede nome e cognome del titolare carta". Il PaymentElement, con
// fields.billingDetails di default ('auto'), decide da solo se mostrare il
// campo nome in base a cosa richiede il metodo di pagamento selezionato —
// per una carta semplice può non richiederlo affatto, quindi non è
// affidabile lasciarlo decidere a Stripe. Campo esplicito qui, sempre
// obbligatorio, precompilato con nome+cognome ospite (il caso comune è la
// stessa persona) ma modificabile — il titolare della carta può essere
// diverso da chi soggiorna (es. un genitore che prenota per la famiglia con
// la propria carta). Passato a confirmPayment via payment_method_data,
// MAI lasciato al solo PaymentElement.
function FormPagamento({
  importoCaparra,
  nomeOspite,
  riepilogo,
}: {
  importoCaparra: number;
  nomeOspite: string;
  riepilogo: RiepilogoPrenotazione;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [nomeTitolareCarta, setNomeTitolareCarta] = useState(nomeOspite);
  const [errore, setErrore] = useState<string | null>(null);
  const [elaborazione, setElaborazione] = useState(false);
  const [completato, setCompletato] = useState(false);

  async function gestisciSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    if (!nomeTitolareCarta.trim()) {
      setErrore("Indica il nome e cognome del titolare della carta.");
      return;
    }
    setElaborazione(true);
    setErrore(null);

    const { error } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
      confirmParams: {
        payment_method_data: {
          billing_details: { name: nomeTitolareCarta.trim() },
        },
      },
    });

    if (error) {
      setErrore(error.message || "Pagamento non riuscito. Riprova.");
      setElaborazione(false);
      return;
    }

    // Nessun redirect necessario: il pagamento è confermato lato Stripe,
    // la conferma DEFINITIVA della prenotazione arriva dal webhook lato
    // server (può richiedere qualche secondo) — qui mostriamo solo la
    // schermata di attesa, mai uno stato "confermata" deciso dal client.
    setCompletato(true);
    setElaborazione(false);
  }

  if (completato) {
    return <ConfermaPrenotazione riepilogo={riepilogo} importoPagato={importoCaparra} esito="in_attesa_conferma" />;
  }

  return (
    <form onSubmit={gestisciSubmit} className="mt-6 max-w-lg">
      <p className="mb-4 text-textMuted">Caparra da pagare ora: €{importoCaparra}</p>
      <label className="flex flex-col gap-1 mb-4">
        <span className="text-sm text-textMuted">Nome e cognome del titolare della carta</span>
        <input
          required
          value={nomeTitolareCarta}
          onChange={(e) => setNomeTitolareCarta(e.target.value)}
          className="rounded-md border border-border px-3 py-2"
        />
      </label>
      <PaymentElement />
      {errore && <p className="mt-4 text-error">{errore}</p>}
      <Button type="submit" variant="primary" size="compatta" className="mt-4" disabled={!stripe || elaborazione}>
        {elaborazione ? "Elaborazione..." : `Paga €${importoCaparra}`}
      </Button>
    </form>
  );
}

export default function PaymentStep({
  clientSecret,
  importoCaparra,
  nomeOspite,
  riepilogo,
}: {
  clientSecret: string;
  importoCaparra: number;
  locale: string;
  nomeOspite: string;
  riepilogo: RiepilogoPrenotazione;
}) {
  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <FormPagamento importoCaparra={importoCaparra} nomeOspite={nomeOspite} riepilogo={riepilogo} />
    </Elements>
  );
}
```

Nota: il prop `locale` resta dichiarato ma non usato dentro il componente — comportamento invariato rispetto al file originale (non è nello scope di questo piano rimuoverlo).

- [ ] **Step 2: Verificare che compili**

Run: `cd sito-hotel && npx tsc --noEmit`
Expected: 1 errore atteso a questo punto — `BookingWidget.tsx` chiama ancora `<PaymentStep>` senza il nuovo prop `riepilogo` (verrà risolto nel Task 4). Verificare che l'UNICO errore riportato sia su quella chiamata, in `components/booking/BookingWidget.tsx`, non altrove.

- [ ] **Step 3: Commit**

```bash
git add components/booking/PaymentStep.tsx
git commit -m "feat(booking): PaymentStep usa ConfermaPrenotazione condiviso"
```

---

### Task 4: `BookingWidget.tsx` — scelta del provider e passaggio del riepilogo

**Files:**
- Modify: `components/booking/BookingWidget.tsx:19` (import), `components/booking/BookingWidget.tsx:86-90` (tipo `PrenotazioneCreata`), `components/booking/BookingWidget.tsx:239-248` (blocco di rendering post-prenotazione)

**Interfaces:**
- Consumes: `NexiPaymentStep`, `DatiPagamentoNexi` (Task 2); `RiepilogoPrenotazione` (Task 1); `PaymentStep` col nuovo prop `riepilogo` (Task 3).

- [ ] **Step 1: Aggiornare l'import di `PaymentStep` per includere `NexiPaymentStep` e i tipi condivisi**

In `components/booking/BookingWidget.tsx`, sostituire:

```tsx
import PaymentStep from "./PaymentStep";
```

con:

```tsx
import PaymentStep from "./PaymentStep";
import NexiPaymentStep, { type DatiPagamentoNexi } from "./NexiPaymentStep";
import { type RiepilogoPrenotazione } from "./ConfermaPrenotazione";
```

- [ ] **Step 2: Sostituire il tipo `PrenotazioneCreata` con un'unione discriminata**

Sostituire:

```tsx
type PrenotazioneCreata = {
  prenotazione_id: number;
  importo_caparra: number;
  client_secret: string;
};
```

con:

```tsx
// Unione discriminata (06/09/2026, integrazione frontend Nexi): il backend
// restituisce client_secret quando PAYMENT_PROVIDER=stripe, pagamento_nexi
// quando =nexi — mai entrambi. La chiave presente decide quale step di
// pagamento montare, non un flag letto a parte da /configurazione (resta
// corretto anche se le due chiamate leggessero valori di provider diversi
// a cavallo di un cutover). Vedi
// docs/superpowers/specs/2026-09-06-nexi-frontend-integration-design.md.
type PrenotazioneCreata =
  | { prenotazione_id: number; importo_caparra: number; client_secret: string; scadenza_hold: string }
  | { prenotazione_id: number; importo_caparra: number; pagamento_nexi: DatiPagamentoNexi; scadenza_hold: string };
```

- [ ] **Step 3: Sostituire il blocco di rendering post-prenotazione**

Sostituire:

```tsx
  if (prenotazioneCreata) {
    return (
      <PaymentStep
        clientSecret={prenotazioneCreata.client_secret}
        importoCaparra={prenotazioneCreata.importo_caparra}
        locale={locale}
        nomeOspite={`${datiOspite.nome} ${datiOspite.cognome}`.trim()}
      />
    );
  }
```

con:

```tsx
  if (prenotazioneCreata && tipoSelezionato) {
    const prezzoTotale = tipoSelezionato.prezzi[trattamento] as number;
    const trattamentoLabel =
      trattamento === "bb" ? t("bb") : trattamento === "mezza_pensione" ? t("mezzaPensione") : t("pensioneCompleta");
    const riepilogo: RiepilogoPrenotazione = {
      prenotazioneId: prenotazioneCreata.prenotazione_id,
      nomeCamera: tipoSelezionato.nome,
      dataArrivo,
      dataPartenza,
      trattamentoLabel,
      saldoDaPagare: prezzoTotale - prenotazioneCreata.importo_caparra,
    };

    if ("client_secret" in prenotazioneCreata) {
      return (
        <PaymentStep
          clientSecret={prenotazioneCreata.client_secret}
          importoCaparra={prenotazioneCreata.importo_caparra}
          locale={locale}
          nomeOspite={`${datiOspite.nome} ${datiOspite.cognome}`.trim()}
          riepilogo={riepilogo}
        />
      );
    }

    return (
      <NexiPaymentStep
        datiPagamento={prenotazioneCreata.pagamento_nexi}
        importoCaparra={prenotazioneCreata.importo_caparra}
        riepilogo={riepilogo}
      />
    );
  }
```

Nota: la guardia `tipoSelezionato` è già sempre vera in questo punto del flusso (non si arriva a `prenotazioneCreata` senza essere passati da `tipoSelezionato` selezionato) — aggiunta solo per soddisfare il narrowing di TypeScript su `tipoSelezionato.prezzi[trattamento]`, nessun cambio di comportamento.

- [ ] **Step 4: Verificare che compili**

Run: `cd sito-hotel && npx tsc --noEmit`
Expected: nessun output (0 errori) — anche l'errore atteso al Task 3 è ora risolto.

- [ ] **Step 5: Verificare lint**

Run: `cd sito-hotel && npm run lint`
Expected: nessun nuovo errore/warning sui 4 file toccati da questo piano (`ConfermaPrenotazione.tsx`, `NexiPaymentStep.tsx`, `PaymentStep.tsx`, `BookingWidget.tsx`). Warning preesistenti su altri file, se presenti, non sono nello scope di questo piano.

- [ ] **Step 6: Commit**

```bash
git add components/booking/BookingWidget.tsx
git commit -m "feat(booking): BookingWidget sceglie Stripe/Nexi in base alla risposta di /prenota"
```

---

### Task 5: Verifica manuale end-to-end — Stripe (regressione)

**Files:** nessuno (solo verifica manuale — nessuna modifica di codice attesa; se emerge un bug, aprire un task correttivo separato prima di proseguire).

- [x] **Step 1: Avviare backend e frontend in locale**

Nel repo `gestionale-hotel`: verificare in `backend/.env` che `PAYMENT_PROVIDER` sia assente o `stripe`, poi avviare il backend (`npm start` o comando equivalente già in uso).
Nel repo `sito-hotel`: verificare in `.env.local` che `NEXT_PUBLIC_GESTIONALE_API_URL` punti al backend locale (es. `http://localhost:7001`), poi `npm run dev`.

- [x] **Step 2: Completare una prenotazione reale con una carta di test Stripe**

Aprire `http://localhost:3000/it/prenota` (o l'URL locale della pagina che monta `BookingWidget`), cercare disponibilità, selezionare una camera e un trattamento, compilare i dati ospite, arrivare al pagamento, pagare con una carta di test Stripe (es. `4242 4242 4242 4242`, qualsiasi data futura/CVC).
Expected: dopo il pagamento compare la schermata `ConfermaPrenotazione` con `esito="in_attesa_conferma"` — titolo "Pagamento ricevuto", numero prenotazione, camera, date, importo pagato e saldo corretti (saldo = prezzo totale trattamento − caparra pagata).

- [x] **Step 3: Verificare che il webhook confermi la prenotazione nel gestionale**

Nel gestionale (planning o lista prenotazioni), verificare che la prenotazione appena creata risulti confermata (non più "in attesa") entro pochi secondi, con una riga in `pagamenti` corrispondente all'importo pagato — stesso comportamento già verificato in precedenza per il flusso Stripe lato backend, qui si verifica solo che il frontend non abbia introdotto una regressione.

Expected: nessuna differenza di comportamento rispetto a prima di questo piano, a parte la nuova schermata di conferma.

**Esito (07/09/2026):** verificato, confermato funzionante — con 3 correzioni emerse durante il test, fuori dallo scope originale del piano ma necessarie per chiudere: (1) bug ambientale Windows, `stripe listen --forward-to localhost` risolve in IPv6 e il webhook non arrivava mai — fix: usare `127.0.0.1` esplicito, nota lasciata in `gestionale-hotel/backend/.env.example`; (2) invio prematuro dell'invito pre-checkin alla conferma pagamento invece che a 3 giorni dall'arrivo — rimosso da `stripeWebhookController.js` e `bookingPagamentoNexiController.js`, aggiunta colonna `pre_checkin_origine` per tracciare invii manuali/automatici (richiede `node scripts/aggiungiColonnaOrigineCheckin.js` una tantum sul DB); (3) branch `race`/`scaduta` di `stripeWebhookController.js` senza try/catch attorno a rimborso Stripe/update DB — aggiunto.

---

### Task 6: Verifica manuale end-to-end — Nexi (nuovo)

**Files:** nessuno (solo verifica manuale; se emerge un bug nei componenti creati nei Task 1-4, tornare a correggerli lì prima di considerare questo piano concluso).

- [x] **Step 1: Verificare se XPay Build richiede HTTPS anche in test — usando la pagina di test già esistente**

Con backend e frontend avviati in locale (`npm run dev` in `sito-hotel`, su `http://localhost:3000`), aprire `http://localhost:3000/it/xpay-test`, creare un ordine di test e tentare un pagamento con una carta di test Nexi.

Expected A — funziona su `http://localhost` semplice: procedere direttamente allo Step 2 sotto, nessuna azione aggiuntiva necessaria.

Expected B — l'SDK si blocca, non spara `XPay_Ready`, o la console mostra un errore relativo a un contesto non sicuro (mixed content, "insecure context", o simile): serve HTTPS anche in locale. Due opzioni concrete, in ordine di preferenza:
  1. `cd sito-hotel && npx next dev --experimental-https` (Next.js genera un certificato locale autofirmato; disponibile da Next 14.1, da verificare su questa versione — Next 16.3.0 — lanciando il comando e controllando che il server parta su `https://localhost:3000`). Aggiornare di conseguenza `NEXT_PUBLIC_SITE_URL` in `.env.local` e l'URL aperto nel browser.
  2. Se il flag non è disponibile/non funziona: un proxy TLS locale davanti al dev server, es. `npx local-ssl-proxy --source 3001 --target 3000` (mantenendo `next dev` normale sulla 3000), poi navigare su `https://localhost:3001`.

- [x] **Step 2: Completare una prenotazione reale con una carta di test Nexi**

Nel backend (`gestionale-hotel/backend/.env`), impostare `PAYMENT_PROVIDER=nexi` e riavviare il backend (richiede restart, non è letto a runtime).
Sul sito (con HTTPS se necessario per lo Step 1), ripetere lo stesso percorso del Task 5 — ricerca disponibilità, camera, trattamento, dati ospite — fino al pagamento. Questa volta deve montarsi `NexiPaymentStep` invece di `PaymentStep`: verificare che il campo carta XPay Build appaia (non il Payment Element di Stripe) e completare il pagamento con una carta di test Nexi.

Expected: dopo il pagamento compare `ConfermaPrenotazione` con `esito="confermata"` (non "in_attesa_conferma" — la risposta di `/completa-pagamento-nexi` è sincrona, non serve attendere un webhook).

- [x] **Step 3: Verificare che la prenotazione sia arrivata nel gestionale**

Stesso controllo del Task 5 Step 3: la prenotazione deve risultare confermata nel planning/lista prenotazioni, con una riga in `pagamenti` con `metodo='nexi'` e l'importo corretto.

- [x] **Step 4: (opzionale, se il tempo lo consente) Verificare il percorso di rifiuto**

Ripetere la prenotazione usando una carta di test Nexi che produce un esito KO (rifiuto), se disponibile tra le carte di test fornite da Nexi.
Expected: `NexiPaymentStep` mostra il messaggio "Il pagamento è stato rifiutato dalla banca..." senza alcun bottone di retry — comportamento intenzionale, vedi Global Constraints.

Verificato (07/09/2026) con esito atteso. Nota corretta rispetto a una mia ipotesi precedente: le carte di test trovate su developer.nexi.it erano quelle giuste fin dall'inizio — i "rifiutato" osservati durante il debug erano tutti causati dai tre bug nostri elencati sotto, mai dalla fonte delle carte.

- [x] **Step 5: Riportare l'esito**

Se tutti gli step precedenti hanno l'esito atteso, il piano è completo. Se qualcosa non corrisponde, aprire un task correttivo mirato (quale file, quale comportamento atteso vs osservato) prima di considerare la feature pronta — non lasciare il gap solo annotato qui.

**Esito (07/09/2026):** Prenotazione Nexi reale completata con successo — confermata nel gestionale, mail di conferma inviata, riga `pagamenti` con `metodo='nexi'`. Il percorso non era diretto: tre bug distinti trovati e corretti durante la verifica, tutti nello stesso ambito (`nexiProvider.js` / `NexiPaymentStep.tsx`), nessuno nei componenti dei Task 1-4 in sé:
1. **Valuta**: `divisa`/`currency` inviato come stringa `'EUR'` invece del valore numerico `978` (ISO 4217) richiesto da Nexi in tre punti (`avviaPagamento`, `completaPagamento`, config XPay lato client) — causava "Dati non validi" sistematico. Fonte: pag. 175/179 specifiche tecniche Nexi.
2. **Doppio invio del nonce**: `pagaConNonce` poteva partire due volte per lo stesso tentativo (evento `XPay_Nonce` + `postMessage` grezzo) — la seconda chiamata non trovava più il pagamento `pending` (già consumato dalla prima) e restituiva un 404 applicativo. Aggiunta una guardia (`nonceGiaInviatoRef`).
3. **Nonce sbagliato durante il 3D Secure**: il `CustomEvent XPay_Nonce` arriva con `detail.xpayNonce`, non `detail.nonce` (bug di nome campo, corretto) — e durante una sfida 3DS Nexi consegna DUE nonce diversi in sequenza (uno pre-3DS via un `postMessage` interno intercettato per errore dal nostro listener, uno post-3DS, quello vero, via il `CustomEvent`). Usare il primo dava di nuovo "Dati non validi". Il `postMessage` grezzo è stato disattivato come canale di invio (resta solo per log): solo il `CustomEvent XPay_Nonce` avvia `pagaConNonce` ora.

Aperto, non bloccante: lo Step 4 (percorso di rifiuto) resta da verificare con una carta di test vera — vedi nota sopra — e `xpayTestController.js`/`xpay-test/page.tsx` (riferimento isolato) condividono probabilmente lo stesso bug #1 (costante `CURRENCY = 'EUR'`), non corretti perché quel file è un riferimento volutamente non toccato.


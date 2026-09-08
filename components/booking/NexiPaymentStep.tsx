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
  Environments: { INTEG: unknown; PROD: unknown };
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
  // Numero (es. 978 = EUR ISO 4217), non stringa 'EUR' — vedi commento nel
  // backend (lib/payments/nexiProvider.js) sul formato richiesto da XPay.
  currency: number;
};

type NonceDetail = {
  // Corretto 07/09/2026: il campo nel detail del CustomEvent XPay_Nonce
  // (e nell'equivalente payload del postMessage grezzo) si chiama
  // xpayNonce, non nonce — verificato sul payload reale ricevuto in test
  // (creaNonce3DS): {timeStamp, xpayNonce, esito, dettaglioCarta,
  // idOperazione, mac}. Con il nome sbagliato questo branch considerava
  // SEMPRE il detail "vuoto", anche quando conteneva l'esito vero.
  xpayNonce?: string;
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
  // Guardia anti-doppio-invio (07/09/2026): Nexi consegna l'esito del nonce
  // sia come CustomEvent XPay_Nonce sia come window.postMessage (vedi i due
  // listener più sotto) — nei test reali arrivano ENTRAMBI per lo stesso
  // nonce, quindi senza questa guardia pagaConNonce partiva due volte. La
  // prima chiamata consuma la riga 'pending' in pagamenti (la aggiorna a
  // 'completato'/'fallito'/'richiede_rimborso_manuale' — vedi
  // bookingPagamentoNexiController.js), la seconda non trova più nessuna
  // riga 'pending' e riceve il 404 applicativo "Nessun pagamento Nexi in
  // attesa" — anche quando il primo tentativo è andato a buon fine. Root
  // cause del 404 riscontrato più volte di fila su prenotazioni fresche
  // (non uno stato residuo del browser, come ipotizzato inizialmente): un
  // doppio invio strutturale. Stesso difetto presente, non corretto, in
  // app/[locale]/xpay-test/page.tsx (riferimento isolato non toccato).
  const nonceGiaInviatoRef = useRef(false);
  // Specchio sempre aggiornato di riepilogo/datiPagamento, letto dai
  // listener SDK registrati una sola volta al mount — stessa necessità e
  // stesso bug storico documentati in app/[locale]/xpay-test/page.tsx
  // (01/09/2026): una variabile catturata in un effetto a dipendenze vuote
  // resterebbe congelata al valore del primo render.
  const contestoRef = useRef({ prenotazioneId: riepilogo.prenotazioneId, datiPagamento });
  useEffect(() => {
    contestoRef.current = { prenotazioneId: riepilogo.prenotazioneId, datiPagamento };
  }, [riepilogo.prenotazioneId, datiPagamento]);

  // Dichiarata PRIMA dei listener sottostanti (spostata qui il 06/09/2026,
  // fix lint react-hooks/immutability "accessed before it is declared") —
  // stesso identico contenuto/comportamento, solo l'ordine testuale cambia:
  // onXPayNonce/onMessage la chiamano, e serve una dichiarazione visibile
  // prima del loro punto d'uso. app/[locale]/xpay-test/page.tsx ha ancora
  // l'ordine originale (stesso warning lì, non toccato per restare un
  // riferimento isolato) — vedi design doc.
  async function pagaConNonce(xpayNonce: string) {
    if (nonceGiaInviatoRef.current) return;
    nonceGiaInviatoRef.current = true;
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
      if (!dettaglio?.xpayNonce) {
        // Il detail può ancora mancare in casi limite (evento generico
        // senza payload) — non fatale: il postMessage grezzo (onMessage
        // qui sotto) è un secondo canale che consegna lo stesso payload,
        // pagaConNonce ha una guardia anti-doppio-invio quindi va bene
        // se arrivano entrambi.
        console.warn("XPay_Nonce ricevuto senza xpayNonce nel detail, in attesa del postMessage:", dettaglio);
        return;
      }
      pagaConNonce(dettaglio.xpayNonce);
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
        // Solo log diagnostico (07/09/2026) — NON più il canale che avvia
        // pagaConNonce. Scoperto in test reale (07/09/2026): questo
        // postMessage grezzo cattura anche i messaggi INTERNI che Nexi si
        // scambia tra pagina e iframe carta durante il 3D Secure — su una
        // carta con sfida 3DS arrivano DUE payload con xpayNonce diversi
        // (uno "creaNonce" prima della sfida, uno "creaNonce3DS" dopo, con
        // idOperazione diversi), e usare quello sbagliato (il primo) dà
        // "Dati non validi" da Nexi perché non è più il nonce valido per
        // quella transazione. Il CustomEvent XPay_Nonce (onXPayNonce sopra)
        // è invece dispatchato da Nexi stessa una sola volta, con l'esito
        // finale — è l'unico canale da cui partire. Log tenuto solo per
        // diagnosi futura, non aggiungere qui una seconda chiamata a
        // pagaConNonce senza aver capito come distinguere in modo
        // affidabile un payload "intermedio" da uno finale.
        console.log("XPay postMessage ricevuto (solo log):", JSON.stringify(data));
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
          // Cast locale solo per l'indicizzazione: datiPagamento.environment arriva
          // dal backend come stringa qualsiasi (XPAY_BUILD_ENVIRONMENT), il tipo
          // ambient di Environments resta { INTEG; PROD } identico a
          // app/[locale]/xpay-test/page.tsx per non rompere il merge dichiarativo
          // di `declare global { var XPay }` tra i due file.
          environment: (XPay!.Environments as Record<string, unknown>)[datiPagamento.environment],
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

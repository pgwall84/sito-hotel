// app/[locale]/xpay-test/page.tsx — pagina di TEST per l'integrazione Nexi
// XPay Build, NON linkata dal sito pubblico. Vive fuori dal gruppo
// (public) per non ereditare Header/Footer/WhatsAppButton, ma dentro
// [locale] perché questo repo non ha un app/layout.tsx alla radice — ogni
// pagina deve stare sotto [locale] per avere un layout valido.
//
// RISCRITTA DA ZERO il 31/08/2026. La versione precedente (order/build +
// confirmData, libreria hfsdk.js, dominio xpaysandbox.nexigroup.com) era
// costruita sulle specifiche di developer.nexi.it — che, confermato da
// Nexi stessa (email tech.ecommerce@nexi.it del 31/08/2026), è il
// portale del prodotto Intesa Sanpaolo, DIVERSO dal terminale reale del
// titolare (00103562, XPay Only, autenticazione Alias + Chiave MAC, non
// apiKey/secret). Ogni tentativo di pagamento con quel flusso falliva con
// HF0003 "Session expired" in modo sistematico e riproducibile al 100%,
// a prescindere da carta/velocità/estensioni — perché la sessione non
// apparteneva mai all'ambiente giusto fin dalla prima chiamata.
//
// FLUSSO CORRETTO (da ecommerce.nexi.it/specifiche-tecniche/build/, letto
// per intero il 31/08/2026, con conferma incrociata del meccanismo eventi
// tramite il sorgente di un wrapper di terze parti — vedi
// docs/superpowers/specs/2026-08-29-integrazione-nexi-xpay-design.md):
//   1. POST /api/xpay-test/prepara (nostro backend) calcola MAC con la
//      chiave segreta (mai esposta al browser) e restituisce i dati per
//      configurare l'SDK.
//   2. Carichiamo lo script XPay Build dal dominio di test
//      (int-ecommerce.nexi.it), inizializziamo con XPay.init() +
//      XPay.setConfig(config), creiamo l'elemento carta con XPay.create()
//      e lo montiamo con card.mount("xpay-card").
//   3. L'SDK spara un CustomEvent 'XPay_Ready' su window quando il form è
//      pronto — solo allora mostriamo il bottone "Paga".
//   4. Al click chiamiamo XPay.createNonce("payment-form", card). L'SDK
//      gestisce da solo l'eventuale popup 3D Secure, poi spara
//      'XPay_Nonce' (payload in event.detail) con il nonce da usare.
//      Un campo non valido produce invece 'XPay_Card_Error'.
//   5. Mandiamo il nonce a POST /api/xpay-test/paga-nonce (nostro
//      backend), che chiama server-to-server l'API pagaNonce di Nexi e
//      restituisce l'esito.
//
// NOTA DI VERIFICA (primo test reale in sandbox):
//   - Due incongruenze reali trovate tra tabella e codice di esempio nella
//     documentazione Nexi: "environment" (tabella) vs "enviroment" (refuso
//     nell'esempio) dentro baseConfig, e "url_back" (tabella) vs "urlBack"
//     (esempio). Qui sotto uso la grafia della TABELLA come primo
//     tentativo (baseConfig.environment, paymentParams.url_back) — se
//     XPay.setConfig() ignora silenziosamente questi campi, aprire la
//     console e controllare l'evento 'XPay_Ready'/eventuali errori: potrebbe
//     essere necessario passare a "enviroment"/"urlBack".

"use client";

import { useEffect, useRef, useState } from "react";

const GESTIONALE_API_URL = process.env.NEXT_PUBLIC_GESTIONALE_API_URL || "http://localhost:7001";

// Tipo minimale, volutamente permissivo, per l'SDK esterno XPay Build
// (window.XPay) — la sua vera definizione vive nello script caricato a
// runtime da int-ecommerce.nexi.it, non in un pacchetto npm.
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

type DatiPreparazione = {
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
  dettaglioCarta?: Record<string, unknown>;
};

type StatoTest =
  | "inattivo"
  | "preparato"
  | "sdk_pronto"
  | "invio_in_corso"
  | "pagamento_in_corso"
  | "completato"
  | "fallito"
  | "errore";

export default function PaginaTestXPay() {
  console.log("XPAY PAGE LOADED");
  const [importo, setImporto] = useState("10.00");
  const [dati, setDati] = useState<DatiPreparazione | null>(null);
  const [stato, setStato] = useState<StatoTest>("inattivo");
  const [messaggio, setMessaggio] = useState<string | null>(null);
  const cardRef = useRef<XPayCardElement | null>(null);
  // Specchio di `dati` sempre aggiornato, letto dai listener SDK registrati
  // una sola volta al mount (vedi sotto) — una `dati` catturata in un
  // effetto con dipendenze vuote resterebbe permanentemente a `null`.
  const datiRef = useRef<DatiPreparazione | null>(null);
  useEffect(() => {
    datiRef.current = dati;
  }, [dati]);

  // Ascoltatori globali degli eventi XPay — registrati UNA SOLA VOLTA al
  // mount (dipendenze vuote), non agganciati a `stato`. BUG TROVATO E
  // CORRETTO IL 01/09/2026: prima stavano dentro l'effetto sotto, con
  // [stato, dati] come dipendenze. La primissima volta che l'SDK sparava
  // XPay_Ready, il nostro handler chiamava setStato("sdk_pronto"): cambiare
  // `stato` faceva rieseguire quello stesso effetto, la cui cleanup
  // rimuoveva TUTTI i listener — compreso quello per XPay_Nonce — prima
  // ancora che l'evento potesse arrivare (3D Secure/GDI richiedono secondi,
  // non sono sincroni). La guardia `stato !== "preparato"` impediva poi di
  // riaggiungerli. Risultato osservato in test: GDI e 3DS completavano
  // correttamente lato Nexi (gestiti internamente dall'SDK, indipendenti da
  // React), ma XPay_Nonce veniva sparato nel vuoto — nessun listener ad
  // ascoltarlo, console silenziosa dopo "GDI Completa, riparto col
  // pagamento". Per questo pagaConNonce ora legge da datiRef.current
  // (sempre fresco) invece che da `dati` chiuso nella closure al momento
  // della registrazione. Tenuto anche il listener "message" grezzo (era già
  // presente — verosimilmente un tentativo di verificare se Nexi consegna
  // l'esito via postMessage invece che via CustomEvent XPay_Nonce): stesso
  // difetto lo affliggeva, corretto allo stesso modo.
  useEffect(() => {
    function onXPayReady() {
      setStato("sdk_pronto");
    }
    function onXPayCardError(evt: Event) {
      const dettaglio = (evt as CustomEvent).detail;
      console.log("XPay_Card_Error:", dettaglio);
      setMessaggio(`Campo carta non valido: ${JSON.stringify(dettaglio)}`);
    }
    function onXPayNonce(evt: Event) {
      console.log("XPay_Nonce RICEVUTO");
      console.log(evt);
      const dettaglio = (evt as CustomEvent).detail as NonceDetail;
      console.log("XPay_Nonce:", dettaglio);
      if (!dettaglio?.nonce) {
        setStato("errore");
        setMessaggio("Evento XPay_Nonce ricevuto ma senza campo 'nonce' — vedi console.");
        return;
      }
      pagaConNonce(dettaglio.nonce);
    }
    // Controllo di origin aggiunto il 02/09/2026, dopo aver confermato che
    // Nexi consegna davvero l'esito via window.postMessage (non tramite il
    // CustomEvent XPay_Nonce documentato — vedi commento sopra). Senza
    // questo controllo qualsiasi frame/script sulla pagina potrebbe mandare
    // un postMessage con la stessa forma e far scattare pagaConNonce.
    // L'origin atteso si ricava da dati.scriptSrc (stesso dominio da cui
    // carichiamo lo script XPay Build) invece di essere hardcodato, così
    // regge sia INTEG (int-ecommerce.nexi.it) sia un futuro dominio PROD
    // senza bisogno di toccare questo file.
    function onMessage(e: MessageEvent) {
      const datiCorrenti = datiRef.current;
      const originAtteso = datiCorrenti ? new URL(datiCorrenti.scriptSrc).origin : null;
      if (!originAtteso || e.origin !== originAtteso) {
        return;
      }
      try {
        const data = typeof e.data === "string" ? JSON.parse(e.data) : e.data;
        console.log("POSTMESSAGE:", data);
        const nonce = data?.message?.payload?.xpayNonce || data?.message?.payload?.nonce;
        if (nonce) {
          console.log("NONCE RICEVUTO (postMessage):", nonce);
          pagaConNonce(nonce);
        }
      } catch (err) {
        console.error("Errore parsing postMessage", err);
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
  }, []);

  // Carica lo script SDK e configura XPay non appena abbiamo i dati da
  // /prepara. Guardia anti-doppio-caricamento: in sviluppo React 18 Strict
  // Mode esegue ogni effetto due volte di seguito — stesso problema già
  // visto nella versione precedente di questa pagina con hfsdk.js.
  useEffect(() => {
    if (stato !== "preparato" || !dati) return;
    let annullato = false;

    function configuraXPay() {
      if (annullato || !dati) return;
      XPay!.init();
      XPay!.setConfig({
        baseConfig: {
          apiKey: dati.alias,
          environment: XPay!.Environments.INTEG,
        },
        paymentParams: {
          amount: dati.amount,
          transactionId: dati.transactionId,
          currency: dati.currency,
          timeStamp: dati.timeStamp,
          mac: dati.mac,
          // Obbligatori per XPay.setConfig ma ignorati per le carte (solo
          // per i metodi di pagamento alternativi, che qui non usiamo) —
          // valorizzati comunque per non far fallire una validazione di
          // formato: devono iniziare con http:// o https://.
          url: "https://localhost:3000/it/xpay-test",
          url_back: "https://localhost:3000/it/xpay-test",
          urlPost: "https://localhost:3000/it/xpay-test",
        },
        customParams: {},
        language: XPay!.LANGUAGE.ITA,
      });
      const card = XPay!.create(XPay!.OPERATION_TYPES.CARD, {
        common: { fontSize: "16px" },
      });
      cardRef.current = card;
      card.mount("xpay-card");
    }

    const scriptEsistente = document.querySelector<HTMLScriptElement>(`script[src="${dati.scriptSrc}"]`);
    if (typeof XPay !== "undefined") {
      configuraXPay();
    } else if (scriptEsistente) {
      scriptEsistente.addEventListener("load", configuraXPay, { once: true });
    } else {
      const script = document.createElement("script");
      script.src = dati.scriptSrc;
      script.async = true;
      script.onload = configuraXPay;
      script.onerror = () => {
        if (annullato) return;
        setStato("errore");
        setMessaggio(`Impossibile caricare lo script XPay da ${dati.scriptSrc}.`);
      };
      document.body.appendChild(script);
    }

    return () => {
      annullato = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stato, dati]);

  async function creaOrdine() {
    setStato("inattivo");
    setMessaggio(null);
    setDati(null);
    cardRef.current = null;
    try {
      const res = await fetch(`${GESTIONALE_API_URL}/api/xpay-test/prepara`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ importo: Number(importo) }),
      });
      const risposta = await res.json();
      if (!res.ok) {
        setStato("errore");
        setMessaggio(risposta.errore || "Errore nella preparazione dell'ordine.");
        return;
      }
      setDati(risposta);
      setStato("preparato");
    } catch (err) {
      setStato("errore");
      setMessaggio(err instanceof Error ? err.message : "Errore di rete.");
    }
  }

  function avviaPagamento() {
    if (!cardRef.current || typeof XPay === "undefined") {
      setMessaggio("SDK XPay non ancora pronto.");
      return;
    }
    setStato("invio_in_corso");
    setMessaggio("Invio dati carta a Nexi in corso (potrebbe aprirsi un popup 3D Secure)…");
    XPay.createNonce("payment-form", cardRef.current);
  }

  async function pagaConNonce(xpayNonce: string) {
    const dati = datiRef.current;
    if (!dati) return;
    setStato("pagamento_in_corso");
    try {
      const res = await fetch(`${GESTIONALE_API_URL}/api/xpay-test/paga-nonce`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionId: dati.transactionId, xpayNonce }),
      });
      const esito = await res.json();
      if (esito?.esito === "OK") {
        setStato("completato");
        setMessaggio(`Pagamento accettato — idOperazione: ${esito.idOperazione ?? "?"}`);
      } else {
        setStato("fallito");
        setMessaggio(`Pagamento rifiutato: ${JSON.stringify(esito)}`);
      }
    } catch (err) {
      setStato("errore");
      setMessaggio(err instanceof Error ? err.message : "Errore di rete.");
    }
  }

  return (
    <div style={{ maxWidth: 480, margin: "40px auto", padding: 16 }}>
      <h1>Pagina di test XPay Build (non pubblica)</h1>
      <p>
        Percorso isolato per verificare l&apos;integrazione Nexi XPay Build — flusso nonce +
        pagaNonce, terminale XPay Only 00103562.
      </p>

      <label style={{ display: "block", marginTop: 16 }}>
        Importo (EUR)
        <input value={importo} onChange={(e) => setImporto(e.target.value)} disabled={stato !== "inattivo" && stato !== "errore"} />
      </label>

      <button onClick={creaOrdine} style={{ marginTop: 16 }} disabled={stato === "invio_in_corso" || stato === "pagamento_in_corso"}>
        Crea ordine di test
      </button>

      {(stato === "preparato" || stato === "sdk_pronto" || stato === "invio_in_corso") && (
        <form id="payment-form" onSubmit={(e) => e.preventDefault()} style={{ marginTop: 16 }}>
          <div id="xpay-card" style={{ border: "1px solid #ccc", minHeight: 40, padding: 8 }} />
          <button
            type="button"
            onClick={avviaPagamento}
            disabled={stato !== "sdk_pronto"}
            style={{ marginTop: 16 }}
          >
            Paga
          </button>
          {stato === "preparato" && (
            <p style={{ fontSize: 12, color: "#555" }}>Caricamento SDK XPay in corso…</p>
          )}
        </form>
      )}

      {messaggio && <p style={{ marginTop: 16 }}>{messaggio}</p>}
    </div>
  );
}

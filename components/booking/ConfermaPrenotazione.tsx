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

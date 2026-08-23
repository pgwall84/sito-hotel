// Booking Engine Diretto (modulo 19/08/2026) — Payment Element Stripe
// embedded: il numero di carta non tocca mai il nostro server, passa solo
// da Stripe.js (PCI scope minimo). La conferma reale della prenotazione
// avviene lato server via webhook (backend/controllers/stripeWebhookController.js),
// MAI da questo componente — la pagina di ritorno mostra solo lo stato,
// non decide nulla.

"use client";

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

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
function FormPagamento({ importoCaparra, nomeOspite }: { importoCaparra: number; nomeOspite: string }) {
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
    // server (può richiedere qualche secondo) — qui mostriamo solo un
    // messaggio di attesa, mai uno stato "confermata" deciso dal client.
    setCompletato(true);
    setElaborazione(false);
  }

  if (completato) {
    return (
      <p className="mt-6 text-primary">
        Pagamento ricevuto. La conferma definitiva della prenotazione arriverà a breve via email.
      </p>
    );
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
          className="border rounded px-3 py-2"
        />
      </label>
      <PaymentElement />
      {errore && <p className="mt-4 text-red-600">{errore}</p>}
      <button type="submit" disabled={!stripe || elaborazione} className="mt-4 bg-primary text-white rounded px-4 py-2">
        {elaborazione ? "Elaborazione..." : `Paga €${importoCaparra}`}
      </button>
    </form>
  );
}

export default function PaymentStep({
  clientSecret,
  importoCaparra,
  nomeOspite,
}: {
  clientSecret: string;
  importoCaparra: number;
  locale: string;
  nomeOspite: string;
}) {
  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <FormPagamento importoCaparra={importoCaparra} nomeOspite={nomeOspite} />
    </Elements>
  );
}

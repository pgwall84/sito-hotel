// Client minimale per l'API Resend (invio email) — form contatti.
// Stesso pattern già usato in gestionale-hotel/backend/lib/resendClient.js
// (modulo 5.3): nessuna dipendenza nuova, una singola chiamata `fetch`
// nativa verso l'endpoint HTTP di Resend.
//
// Modalità sandbox (dominio non ancora verificato): Resend accetta l'invio
// solo dall'indirizzo onboarding@resend.dev e SOLO verso l'email con cui è
// stato creato l'account Resend — qualunque altro destinatario viene
// rifiutato. Non è un bug di questo client. In questa fase si riusa lo
// stesso account (e la stessa API key) già configurato nel gestionale per
// il modulo 5.3 — da sostituire con l'account aziendale definitivo quando
// disponibile, cambiando solo le variabili d'ambiente qui sotto.

const RESEND_ENDPOINT = "https://api.resend.com/emails";

interface InviaEmailParams {
  destinatario: string;
  oggetto: string;
  html: string;
  replyTo?: string;
}

interface InviaEmailResult {
  ok: boolean;
  errore?: string;
}

// Invia una email tramite Resend. Non lancia mai per un errore HTTP/di
// rete: restituisce sempre { ok, errore? } e lascia decidere al chiamante
// (qui: app/api/contact/route.ts) come comunicarlo all'utente. A differenza
// delle email del gestionale (fire-and-forget, la prenotazione è già
// salvata a prescindere), qui l'email È l'unico effetto della richiesta:
// se l'invio fallisce l'utente deve saperlo, non un fallback silenzioso.
export async function inviaEmail({
  destinatario,
  oggetto,
  html,
  replyTo,
}: InviaEmailParams): Promise<InviaEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const mittente = process.env.RESEND_MITTENTE;

  if (!apiKey || !mittente) {
    return { ok: false, errore: "RESEND_API_KEY o RESEND_MITTENTE non configurati" };
  }

  try {
    const risposta = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: mittente,
        to: [destinatario],
        subject: oggetto,
        html,
        ...(replyTo ? { reply_to: replyTo } : {}),
      }),
    });

    if (!risposta.ok) {
      const corpo = await risposta.text().catch(() => "");
      return { ok: false, errore: `Resend ${risposta.status}: ${corpo}` };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, errore: err instanceof Error ? err.message : String(err) };
  }
}

import { NextRequest, NextResponse } from "next/server";
import { inviaEmail } from "@/lib/resend";

// Richieste dai form pubblici del sito (prenotazione tavolo, convenzione
// aziendale, degustazione pesto). Stesso schema del form contatti
// (app/api/contact/route.ts): validazione lato server, rate limit in memoria,
// invio via Resend. L'email è l'unico effetto della richiesta, quindi un
// fallimento viene comunicato all'utente (502), mai nascosto.

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 ora
const RATE_LIMIT_MAX = 5;
const MAX_FIELD_LENGTH = 1000;

// in-memory, best effort — si azzera ad ogni cold start serverless.
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return "unknown";
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  if (entry.count >= RATE_LIMIT_MAX) return true;
  entry.count += 1;
  return false;
}

function pulisci(value: unknown, max = MAX_FIELD_LENGTH): string {
  return typeof value === "string" ? value.replace(/<[^>]*>/g, "").trim().slice(0, max) : "";
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

type Kind = "testo" | "email" | "telefono" | "numero" | "data" | "ora" | "lungo";
interface Campo {
  chiave: string;
  etichetta: string;
  kind: Kind;
  obbligatorio?: boolean;
  scelte?: Record<string, string>;
}
interface Definizione {
  titolo: string;
  oggetto: (d: Record<string, string>) => string;
  campi: Campo[];
}

const DEFINIZIONI = {
  tavolo: {
    titolo: "Richiesta prenotazione tavolo dal sito",
    oggetto: (d) => `Prenotazione tavolo — ${d.nome}`,
    campi: [
      { chiave: "nome", etichetta: "Nome", kind: "testo", obbligatorio: true },
      { chiave: "data", etichetta: "Data", kind: "data", obbligatorio: true },
      { chiave: "ora", etichetta: "Ora", kind: "ora", obbligatorio: true },
      { chiave: "coperti", etichetta: "Coperti", kind: "numero", obbligatorio: true },
      { chiave: "telefono", etichetta: "Telefono", kind: "telefono", obbligatorio: true },
    ],
  },
  convenzione: {
    titolo: "Richiesta convenzione aziendale dal sito",
    oggetto: (d) => `Richiesta convenzione — ${d.azienda}`,
    campi: [
      { chiave: "azienda", etichetta: "Azienda", kind: "testo", obbligatorio: true },
      { chiave: "referente", etichetta: "Referente", kind: "testo", obbligatorio: true },
      { chiave: "email", etichetta: "Email", kind: "email", obbligatorio: true },
      { chiave: "telefono", etichetta: "Telefono", kind: "telefono" },
      { chiave: "dipendenti", etichetta: "Dipendenti al mese", kind: "numero" },
      {
        chiave: "periodo",
        etichetta: "Periodo",
        kind: "testo",
        scelte: { anno: "Tutto l'anno", stagionale: "Stagionale" },
      },
      { chiave: "note", etichetta: "Note", kind: "lungo" },
    ],
  },
  pesto: {
    titolo: "Richiesta degustazione pesto dal sito",
    oggetto: (d) => `Degustazione pesto — ${d.nome}`,
    campi: [
      { chiave: "nome", etichetta: "Nome", kind: "testo", obbligatorio: true },
      { chiave: "email", etichetta: "Email", kind: "email", obbligatorio: true },
      { chiave: "telefono", etichetta: "Telefono", kind: "telefono" },
      { chiave: "data", etichetta: "Data desiderata", kind: "data" },
      { chiave: "persone", etichetta: "Numero di persone", kind: "numero", obbligatorio: true },
      { chiave: "note", etichetta: "Note", kind: "lungo" },
    ],
  },
} satisfies Record<string, Definizione>;

type Tipo = keyof typeof DEFINIZIONI;

function validaCampo(campo: Campo, valore: string): boolean {
  if (!valore) return !campo.obbligatorio;
  if (campo.scelte) return valore in campo.scelte;
  switch (campo.kind) {
    case "email":
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valore);
    case "numero":
      return /^\d{1,4}$/.test(valore) && Number(valore) >= 1;
    case "data":
      return /^\d{4}-\d{2}-\d{2}$/.test(valore);
    case "ora":
      return /^\d{2}:\d{2}$/.test(valore);
    case "telefono":
      return /^[0-9+()\-\s.]{5,30}$/.test(valore);
    default:
      return true;
  }
}

export async function POST(req: NextRequest) {
  if (isRateLimited(getClientIp(req))) {
    return NextResponse.json({ error: "Troppe richieste. Riprova più tardi." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Richiesta non valida." }, { status: 400 });
  }
  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Richiesta non valida." }, { status: 400 });
  }
  const b = body as Record<string, unknown>;

  const tipo = pulisci(b.tipo, 20);
  if (!(tipo in DEFINIZIONI)) {
    return NextResponse.json({ error: "Richiesta non valida." }, { status: 400 });
  }
  const def: Definizione = DEFINIZIONI[tipo as Tipo];

  const dati: Record<string, string> = {};
  for (const campo of def.campi) {
    const valore = pulisci(b[campo.chiave], campo.kind === "lungo" ? MAX_FIELD_LENGTH : 200);
    if (!validaCampo(campo, valore)) {
      return NextResponse.json({ error: "Dati non validi." }, { status: 400 });
    }
    dati[campo.chiave] = valore;
  }

  const righe = def.campi
    .filter((c) => dati[c.chiave])
    .map((c) => {
      const mostrato = c.scelte ? c.scelte[dati[c.chiave]] : dati[c.chiave];
      return `<p><strong>${escapeHtml(c.etichetta)}:</strong> ${escapeHtml(mostrato).replace(/\n/g, "<br>")}</p>`;
    })
    .join("");

  const esito = await inviaEmail({
    destinatario: process.env.CONTACT_EMAIL_TO || "info@hoteldelgolfo.com",
    oggetto: def.oggetto(dati),
    html: `<h2>${escapeHtml(def.titolo)}</h2>${righe}`,
    replyTo: dati.email || undefined,
  });

  if (!esito.ok) {
    console.error(`[richiesta:${tipo}] invio email fallito:`, esito.errore);
    return NextResponse.json(
      { error: "Richiesta non inviata. Riprova o contattaci direttamente per telefono/email." },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}

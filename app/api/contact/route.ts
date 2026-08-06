import { NextRequest, NextResponse } from "next/server";
import { inviaEmail } from "@/lib/resend";

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 ora
const RATE_LIMIT_MAX = 3;
const MAX_FIELD_LENGTH = 1000;

// in-memory, best effort — si azzera ad ogni cold start serverless,
// non garantito cross-istanza. Sufficiente a scoraggiare abusi banali.
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

function stripHtml(value: string): string {
  return value.replace(/<[^>]*>/g, "").trim();
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

interface ContactPayload {
  nome: string;
  email: string;
  telefono: string;
  messaggio: string;
  arrivo: string;
  partenza: string;
}

function validatePayload(body: unknown): ContactPayload | null {
  if (typeof body !== "object" || body === null) return null;
  const b = body as Record<string, unknown>;

  const nome = typeof b.nome === "string" ? stripHtml(b.nome).slice(0, MAX_FIELD_LENGTH) : "";
  const email = typeof b.email === "string" ? stripHtml(b.email).slice(0, MAX_FIELD_LENGTH) : "";
  const telefono = typeof b.telefono === "string" ? stripHtml(b.telefono).slice(0, MAX_FIELD_LENGTH) : "";
  const messaggio = typeof b.messaggio === "string" ? stripHtml(b.messaggio).slice(0, MAX_FIELD_LENGTH) : "";
  const arrivo = typeof b.arrivo === "string" ? stripHtml(b.arrivo).slice(0, 20) : "";
  const partenza = typeof b.partenza === "string" ? stripHtml(b.partenza).slice(0, 20) : "";

  if (!nome) return null;
  if (!email || !isValidEmail(email)) return null;
  if (!messaggio) return null;

  return { nome, email, telefono, messaggio, arrivo, partenza };
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);

  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Troppe richieste. Riprova più tardi." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Richiesta non valida." }, { status: 400 });
  }

  const payload = validatePayload(body);
  if (!payload) {
    return NextResponse.json({ error: "Dati non validi." }, { status: 400 });
  }

  const destinatario = process.env.CONTACT_EMAIL_TO || "info@hoteldelgolfo.com";
  const rigaSoggiorno =
    payload.arrivo || payload.partenza
      ? `<p><strong>Soggiorno:</strong> ${payload.arrivo || "?"} → ${payload.partenza || "?"}</p>`
      : "";
  const html = `
    <h2>Nuova richiesta dal form contatti del sito</h2>
    <p><strong>Nome:</strong> ${payload.nome}</p>
    <p><strong>Email:</strong> ${payload.email}</p>
    ${payload.telefono ? `<p><strong>Telefono:</strong> ${payload.telefono}</p>` : ""}
    ${rigaSoggiorno}
    <p><strong>Messaggio:</strong></p>
    <p>${payload.messaggio.replace(/\n/g, "<br>")}</p>
  `;

  const esito = await inviaEmail({
    destinatario,
    oggetto: `Richiesta contatto sito — ${payload.nome}`,
    html,
    replyTo: payload.email,
  });

  if (!esito.ok) {
    // Non un fallback silenzioso: qui l'email è l'unico effetto della
    // richiesta, l'utente deve sapere che non è arrivata (es. account
    // Resend ancora in sandbox, dominio non verificato — vedi lib/resend.ts).
    console.error("[contact] invio email fallito:", esito.errore);
    return NextResponse.json(
      { error: "Messaggio non inviato. Riprova o contattaci direttamente per telefono/email." },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}

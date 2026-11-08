// Client dei form pubblici → POST /api/richiesta (app/api/richiesta/route.ts).
export type EsitoRichiesta = "ok" | "rate-limited" | "error";

export async function inviaRichiesta(
  tipo: "tavolo" | "convenzione" | "pesto",
  dati: Record<string, string>
): Promise<EsitoRichiesta> {
  try {
    const res = await fetch("/api/richiesta", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tipo, ...dati }),
    });
    if (res.status === 429) return "rate-limited";
    return res.ok ? "ok" : "error";
  } catch {
    return "error";
  }
}

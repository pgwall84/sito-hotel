"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";

const API_BASE = process.env.NEXT_PUBLIC_GESTIONALE_API_URL;

type DisponibilitaMese = Record<string, boolean>; // "YYYY-MM-DD" -> disponibile
type CampoAttivo = "arrivo" | "partenza" | null;

export type DateRangePickerProps = {
  dataArrivo: string; // "" se non scelta, altrimenti "YYYY-MM-DD"
  dataPartenza: string;
  onChange: (dataArrivo: string, dataPartenza: string) => void;
  adulti: number;
  bambiniEta: number[];
  labelArrivo: string;
  labelPartenza: string;
};

function isoData(d: Date): string {
  const anno = d.getFullYear();
  const mese = String(d.getMonth() + 1).padStart(2, "0");
  const giorno = String(d.getDate()).padStart(2, "0");
  return `${anno}-${mese}-${giorno}`;
}

function dataDaIso(iso: string): Date {
  return new Date(`${iso}T00:00:00`);
}

function chiaveMese(anno: number, mese1indicizzato: number): string {
  return `${anno}-${mese1indicizzato}`;
}

// DateRangePicker (Piano 2, date-range picker, 24/08/2026 — rifatto lo
// stesso giorno dopo il primo controllo visivo del titolare: "più click
// per capire come rimodificare data inizio e data fine, calendario che
// rimane aperto se non clicchi su un giorno"). Due campi distinti
// Check-in/Check-out (stile Airbnb, scelto esplicitamente dal titolare tra
// due opzioni proposte) invece di un singolo bottone: il campo attivo
// determina quale estremo del range viene impostato dal prossimo click sul
// calendario, con evidenza visiva di quale sia. `mode="single"` sul
// DayPicker sottostante — la logica di range NON è quella integrata della
// libreria (troppo poco controllabile su "quale estremo sto modificando"),
// il range è disegnato a mano con `modifiers` mentre la selezione resta un
// singolo giorno alla volta, gestito da `gestisciClick` sotto. Chiamata al
// nuovo endpoint gestionale GET /api/booking-pubblico/disponibilita-mese
// (Piano 1) invariata rispetto alla prima versione — vedi
// docs/superpowers/specs/2026-08-24-date-range-picker-design.md per il
// design di base. Aggregato su tutte le tipologie camera, NON tiene conto
// delle restrizioni planning-tariffe (decisione approvata dal titolare).
export default function DateRangePicker({
  dataArrivo,
  dataPartenza,
  onChange,
  adulti,
  bambiniEta,
  labelArrivo,
  labelPartenza,
}: DateRangePickerProps) {
  const [aperto, setAperto] = useState(false);
  const [campoAttivo, setCampoAttivo] = useState<CampoAttivo>(null);
  const [meseVisibile, setMeseVisibile] = useState<Date>(new Date());
  const [disponibilitaCache, setDisponibilitaCache] = useState<Record<string, DisponibilitaMese>>({});
  const [caricamento, setCaricamento] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cacheRef = useRef<Record<string, DisponibilitaMese>>({});
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    cacheRef.current = disponibilitaCache;
  }, [disponibilitaCache]);

  // Chiusura su click fuori dal componente o tasto Escape (gap segnalato
  // dal titolare al primo controllo visivo: prima si chiudeva SOLO
  // selezionando un range completo). `pointerdown` invece di `click` per
  // coprire anche il touch, un solo listener condiviso per entrambi i casi.
  useEffect(() => {
    if (!aperto) return;
    function chiudiSeFuori(e: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setAperto(false);
        setCampoAttivo(null);
      }
    }
    function chiudiSuEscape(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setAperto(false);
        setCampoAttivo(null);
      }
    }
    document.addEventListener("pointerdown", chiudiSeFuori);
    document.addEventListener("keydown", chiudiSuEscape);
    return () => {
      document.removeEventListener("pointerdown", chiudiSeFuori);
      document.removeEventListener("keydown", chiudiSuEscape);
    };
  }, [aperto]);

  const caricaMese = useCallback(
    async (data: Date, cache: Record<string, DisponibilitaMese>) => {
      const anno = data.getFullYear();
      const mese = data.getMonth() + 1;
      const chiave = chiaveMese(anno, mese);
      if (cache[chiave] || !API_BASE) return null;

      const url = new URL(`${API_BASE}/api/booking-pubblico/disponibilita-mese`);
      url.searchParams.set("anno", String(anno));
      url.searchParams.set("mese", String(mese));
      url.searchParams.set("adulti", String(adulti));
      if (bambiniEta.length > 0) url.searchParams.set("bambini_eta", bambiniEta.join(","));

      const res = await fetch(url.toString());
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Errore nel controllo disponibilità");
      return { chiave, disponibilita: body.disponibilita as DisponibilitaMese };
    },
    [adulti, bambiniEta]
  );

  const caricaMesiVisibili = useCallback(
    async (data: Date) => {
      setCaricamento(true);
      try {
        const meseSuccessivo = new Date(data.getFullYear(), data.getMonth() + 1, 1);
        const risultati = await Promise.all([
          caricaMese(data, cacheRef.current),
          caricaMese(meseSuccessivo, cacheRef.current),
        ]);
        const aggiornamenti = risultati.filter(
          (r): r is { chiave: string; disponibilita: DisponibilitaMese } => r !== null
        );
        if (aggiornamenti.length > 0) {
          setDisponibilitaCache((prev) => {
            const nuova = { ...prev };
            aggiornamenti.forEach(({ chiave, disponibilita }) => {
              nuova[chiave] = disponibilita;
            });
            return nuova;
          });
        }
      } catch {
        // Degrado grazioso (design doc 24/08/2026): nessuna indicazione
        // invece di bloccare il calendario — un guasto di questo servizio
        // non deve mai impedire una prenotazione.
      } finally {
        setCaricamento(false);
      }
    },
    [caricaMese]
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDisponibilitaCache({});
      if (aperto) caricaMesiVisibili(meseVisibile);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adulti, bambiniEta.join(",")]);

  useEffect(() => {
    if (aperto) caricaMesiVisibili(meseVisibile);
  }, [aperto, meseVisibile, caricaMesiVisibili]);

  function isGiornoNonDisponibile(giorno: Date): boolean {
    const chiave = chiaveMese(giorno.getFullYear(), giorno.getMonth() + 1);
    const mappa = disponibilitaCache[chiave];
    if (!mappa) return false; // nessun dato ancora caricato = non blocca (degrado grazioso)
    return mappa[isoData(giorno)] === false;
  }

  function apriCampo(campo: "arrivo" | "partenza") {
    // Non ha senso impostare la partenza prima dell'arrivo — se l'arrivo
    // non è ancora scelto, il click su "Check-out" attiva comunque il
    // campo arrivo, invece di lasciare che si crei una partenza orfana.
    setCampoAttivo(campo === "partenza" && !dataArrivo ? "arrivo" : campo);
    setAperto(true);
  }

  // Un solo giorno alla volta (mode="single" sul DayPicker sotto): quale
  // estremo del range imposta dipende da campoAttivo, non da un contatore
  // di click come nella modalità range integrata della libreria — questo è
  // il fix del problema segnalato ("più click per capire come rimodificare
  // data inizio e data fine").
  function gestisciClick(giorno: Date) {
    const iso = isoData(giorno);
    if (campoAttivo !== "partenza") {
      // Imposta l'arrivo. Se la partenza già scelta non è più successiva
      // al nuovo arrivo, si scarta (range invertito, va rifatta) — e si
      // passa subito al campo partenza: il prossimo click naturale è
      // quello, il calendario resta aperto.
      const partenzaValida = dataPartenza && iso < dataPartenza ? dataPartenza : "";
      onChange(iso, partenzaValida);
      setCampoAttivo("partenza");
      return;
    }
    // campoAttivo === "partenza"
    if (dataArrivo && iso <= dataArrivo) {
      // Click su un giorno non successivo all'arrivo attuale: reinterpretato
      // come un nuovo arrivo (stesso comportamento familiare di Airbnb),
      // non come un errore silenzioso o un range invertito accettato.
      onChange(iso, "");
      setCampoAttivo("partenza");
      return;
    }
    onChange(dataArrivo, iso);
    setCampoAttivo(null);
    setAperto(false); // range completo: selezione conclusa, si chiude da sola
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => apriCampo("arrivo")}
          className={`flex flex-1 flex-col gap-1 rounded-md border px-3 py-2 text-left ${
            aperto && campoAttivo === "arrivo" ? "border-primary ring-1 ring-primary" : "border-border"
          }`}
        >
          <span className="text-xs text-textMuted">{labelArrivo}</span>
          <span className="text-sm">{dataArrivo || "—"}</span>
        </button>
        <button
          type="button"
          onClick={() => apriCampo("partenza")}
          className={`flex flex-1 flex-col gap-1 rounded-md border px-3 py-2 text-left ${
            aperto && campoAttivo === "partenza" ? "border-primary ring-1 ring-primary" : "border-border"
          }`}
        >
          <span className="text-xs text-textMuted">{labelPartenza}</span>
          <span className="text-sm">{dataPartenza || "—"}</span>
        </button>
      </div>

      {aperto && (
        <div className="absolute z-10 mt-2 rounded-lg border border-border bg-background p-4 shadow-cardHover">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs text-textMuted">
              {campoAttivo === "partenza" ? labelPartenza : labelArrivo}
            </span>
            <button
              type="button"
              onClick={() => {
                setAperto(false);
                setCampoAttivo(null);
              }}
              aria-label="Chiudi"
              className="text-textMuted hover:text-text px-1"
            >
              ×
            </button>
          </div>
          <DayPicker
            mode="single"
            selected={undefined}
            onDayClick={(giorno) => {
              if (isGiornoNonDisponibile(giorno)) return;
              gestisciClick(giorno);
            }}
            month={meseVisibile}
            onMonthChange={setMeseVisibile}
            disabled={isGiornoNonDisponibile}
            startMonth={new Date()}
            modifiers={{
              rangeInizio: dataArrivo ? [dataDaIso(dataArrivo)] : [],
              rangeFine: dataPartenza ? [dataDaIso(dataPartenza)] : [],
              rangeMezzo:
                dataArrivo && dataPartenza
                  ? { after: dataDaIso(dataArrivo), before: dataDaIso(dataPartenza) }
                  : [],
            }}
            modifiersClassNames={{
              rangeInizio: "!bg-primary !text-white rounded-l-full",
              rangeFine: "!bg-primary !text-white rounded-r-full",
              rangeMezzo: "!bg-primary/20",
            }}
            className="[&_.rdp-day_button:disabled]:opacity-40 [&_.rdp-day_button:disabled]:line-through"
          />
          {caricamento && <p className="mt-2 text-xs text-textMuted">Verifica disponibilità…</p>}
        </div>
      )}
    </div>
  );
}

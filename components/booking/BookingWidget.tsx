// Booking Engine Diretto (modulo 19/08/2026) — flusso client-side: 1) cerca
// disponibilità, 2) seleziona camera, 3) dati ospite minimi, 4) pagamento
// (delegato a PaymentStep, Task 11). Il prezzo mostrato viene SEMPRE dal
// gestionale (GET disponibilita) — non calcolato qui, per restare coerente
// con la regola "il prezzo non è mai deciso dal client".

"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { groq } from "next-sanity";
import { useTranslations } from "next-intl";
import { client, urlFor } from "@/lib/sanity";
import { pickLocale } from "@/lib/sanity-i18n";
import { SERVIZI_ICONS } from "@/lib/servizi";
import DateRangePicker from "@/components/ui/DateRangePicker";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import PaymentStep from "./PaymentStep";

const API_BASE = process.env.NEXT_PUBLIC_GESTIONALE_API_URL;

// Trattamento (Modulo tariffe derivate, 20/08/2026) — disponibilita() ora
// restituisce i 3 prezzi insieme (B&B/mezza pensione/pensione completa) per
// ogni tipo camera, calcolati dal gestionale con adulti+bambini già inclusi:
// nessuna seconda chiamata di rete quando l'utente cambia trattamento. Un
// valore null per un trattamento significa "non ancora configurato per
// queste date" — non esclude la camera, solo quell'opzione.
type Trattamento = "bb" | "mezza_pensione" | "pensione_completa";

type TipoCameraDisponibile = {
  id: number;
  nome: string;
  num_notti: number;
  prezzi: Record<Trattamento, number | null>;
  capienza_max: number | null;
  // Sincronizzazione con planning-tariffe (24/08/2026): quando un
  // trattamento risulta non prenotabile per una restrizione impostata dal
  // titolare (minimo notti, arrivo/partenza chiusi, vendita chiusa) invece
  // che per assenza di prezzo, il gestionale manda anche il motivo — testo
  // pronto in italiano, stesso principio già in uso per gli errori generici
  // di questo widget (body.error mostrato direttamente, non tradotto).
  // Campo opzionale: assente su risposte da versioni precedenti/cache.
  motivi_non_disponibile?: Record<Trattamento, string | null>;
};

// Nota storica (rimossa 19/08/2026): qui c'era un hack che rietichettava
// "Matrimoniale Piccola" come "Camera Singola" quando adulti===1, perché
// all'epoca erano un unico tipo camera con prezzo unico (migration 048).
// Non serve più: con lo shared inventory (migration 050, gestionale) Singola
// e Matrimoniale Piccola sono di nuovo due tipi camera distinti, ognuno con
// il proprio prezzo — disponibilita() li restituisce già come risultati
// separati, quindi la ricerca mostra direttamente il nome vero del tipo.

// Arricchimento Fase B (Booking Engine v2, 19/08/2026) — foto/descrizione/mq/
// servizi presi da Sanity via tipoCameraId, prezzo e disponibilità restano
// SEMPRE dal gestionale. Nessun campo qui è mai usato per calcolare un
// prezzo: solo contenuto descrittivo. Camere senza tipoCameraId collegato
// (script backend/scripts/collegaSanityTipiCamera.js non ancora lanciato o
// nessuna corrispondenza per quel tipo) restano con la card semplice
// nome+prezzo di prima, invariata.
type ArricchimentoCamera = {
  descrizione: string;
  fotoUrl: string | null;
  mq: number | null;
  servizi: string[];
};

const ARRICCHIMENTO_QUERY = groq`
  *[_type == "camera" && tipoCameraId in $ids] {
    tipoCameraId, nome, descrizione, mq, servizi, fotoPrincipale
  }
`;

type ArricchimentoRaw = {
  tipoCameraId: number;
  nome?: Partial<Record<"it" | "en" | "de" | "fr", string>>;
  descrizione?: Partial<Record<"it" | "en" | "de" | "fr", string>>;
  mq?: number;
  servizi?: string[];
  fotoPrincipale?: { asset?: { _ref: string } };
};

type DatiOspite = { nome: string; cognome: string; email: string; telefono: string };

type PrenotazioneCreata = {
  prenotazione_id: number;
  importo_caparra: number;
  client_secret: string;
};

export default function BookingWidget({ locale }: { locale: string }) {
  const t = useTranslations("PrenotaPage");
  const tServizi = useTranslations("Servizi");
  const [dataArrivo, setDataArrivo] = useState("");
  const [dataPartenza, setDataPartenza] = useState("");
  // Composizione ospiti (Fase A Booking Engine v2, 19/08/2026) — adulti +
  // età di ogni bambino, non più un numero unico: serve al gestionale per il
  // calcolo esatto della tassa di soggiorno (esenzione under-12) e in futuro
  // per tariffe differenziate bambini (non ancora attive, oggi tariffa
  // piena per tutti).
  const [adulti, setAdulti] = useState(2);
  const [bambiniEta, setBambiniEta] = useState<number[]>([]);
  // Capienza (Modulo tariffe derivate, 20/08/2026, confermato con il
  // titolare): un bambino 0-2 anni non richiede una camera più grande
  // (dorme in culla, sempre gratis) — solo adulti + bambini di 3+ anni
  // contano ai fini della capienza_max, stesso criterio del gestionale
  // (bookingPubblicoController.normalizzaComposizioneOspiti).
  const ospitiChePesanoSuCapienza = adulti + bambiniEta.filter((eta) => eta >= 3).length;
  const [risultati, setRisultati] = useState<TipoCameraDisponibile[] | null>(null);
  const [arricchimenti, setArricchimenti] = useState<Record<number, ArricchimentoCamera>>({});
  const [tipoSelezionato, setTipoSelezionato] = useState<TipoCameraDisponibile | null>(null);
  // Trattamento (nuovo 20/08/2026) — scelto DOPO la camera, come da flusso
  // confermato con il titolare: data+persone → camera adeguata → trattamento.
  const [trattamento, setTrattamento] = useState<Trattamento>("bb");
  const [datiOspite, setDatiOspite] = useState<DatiOspite>({ nome: "", cognome: "", email: "", telefono: "" });
  const [prenotazioneCreata, setPrenotazioneCreata] = useState<PrenotazioneCreata | null>(null);
  const [errore, setErrore] = useState<string | null>(null);
  const [caricamento, setCaricamento] = useState(false);
  // Termini di cancellazione (Fase C, 19/08/2026) — testo dal gestionale
  // (Impostazioni ▸ Testi email, stessa fonte della mail di conferma),
  // mostrato prima del pagamento della caparra. Caricato una sola volta
  // all'apertura del widget, indipendente dalla ricerca disponibilità.
  const [terminiCancellazione, setTerminiCancellazione] = useState<string | null>(null);
  // Percentuale di caparra (fix 23/08/2026, code review 22/08/2026, Tier 2):
  // prima era un letterale 0.3 duplicato a mano qui, disallineabile in
  // silenzio dalla PERCENTUALE_CAPARRA reale del gestionale
  // (backend/controllers/bookingPubblicoController.js). Ora letta a runtime
  // da GET /api/booking-pubblico/configurazione, stesso pattern già in uso
  // per terminiCancellazione qui sopra. 0.3 resta come fallback locale SOLO
  // se la chiamata fallisce — mai bloccare la stima mostrata all'utente per
  // un problema di rete: l'importo autorevole, comunque, è sempre e solo
  // quello restituito da POST /prenota, mai questo valore lato client.
  const [percentualeCaparra, setPercentualeCaparra] = useState(0.3);

  useEffect(() => {
    fetch(`${API_BASE}/api/booking-pubblico/termini-cancellazione`)
      .then((res) => res.json())
      .then((body) => setTerminiCancellazione(body.termini_cancellazione ?? null))
      .catch(() => setTerminiCancellazione(null));

    fetch(`${API_BASE}/api/booking-pubblico/configurazione`)
      .then((res) => res.json())
      .then((body) => {
        if (typeof body.percentuale_caparra === "number") setPercentualeCaparra(body.percentuale_caparra);
      })
      .catch(() => {
        // Mantiene il fallback 0.3 già impostato nello stato iniziale.
      });
  }, []);

  async function cercaDisponibilita(e: React.FormEvent) {
    e.preventDefault();
    setErrore(null);
    setCaricamento(true);
    try {
      const url = new URL(`${API_BASE}/api/booking-pubblico/disponibilita`);
      url.searchParams.set("data_arrivo", dataArrivo);
      url.searchParams.set("data_partenza", dataPartenza);
      url.searchParams.set("adulti", String(adulti));
      if (bambiniEta.length > 0) url.searchParams.set("bambini_eta", bambiniEta.join(","));
      const res = await fetch(url.toString());
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Errore nella ricerca disponibilità");
      setRisultati(body);
    } catch (err) {
      setErrore(err instanceof Error ? err.message : "Errore imprevisto");
    } finally {
      setCaricamento(false);
    }
  }

  // Fase B — dopo ogni ricerca disponibilità, arricchisce i risultati con
  // foto/descrizione/mq/servizi da Sanity (client pubblico, sola lettura,
  // sicuro da chiamare da un componente client). Fallimenti qui non devono
  // mai bloccare la prenotazione — il prezzo è già arrivato dal gestionale,
  // questo è solo contenuto descrittivo aggiuntivo.
  useEffect(() => {
    if (!risultati || risultati.length === 0) {
      setArricchimenti({});
      return;
    }
    const ids = risultati.map((r) => r.id);
    let annullato = false;
    client
      .fetch<ArricchimentoRaw[]>(ARRICCHIMENTO_QUERY, { ids })
      .then((righe) => {
        if (annullato) return;
        const mappa: Record<number, ArricchimentoCamera> = {};
        for (const riga of righe) {
          if (riga.tipoCameraId == null) continue;
          mappa[riga.tipoCameraId] = {
            descrizione: pickLocale(riga.descrizione, locale) ?? "",
            fotoUrl: riga.fotoPrincipale ? urlFor(riga.fotoPrincipale).width(600).height(450).fit("crop").url() : null,
            mq: riga.mq ?? null,
            servizi: riga.servizi ?? [],
          };
        }
        setArricchimenti(mappa);
      })
      .catch(() => {
        // Nessuna UI di errore: senza arricchimento resta la card semplice.
        if (!annullato) setArricchimenti({});
      });
    return () => {
      annullato = true;
    };
  }, [risultati, locale]);

  async function confermaDatiOspite(e: React.FormEvent) {
    e.preventDefault();
    if (!tipoSelezionato) return;
    setErrore(null);
    setCaricamento(true);
    try {
      const res = await fetch(`${API_BASE}/api/booking-pubblico/prenota`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo_camera_id: tipoSelezionato.id,
          data_arrivo: dataArrivo,
          data_partenza: dataPartenza,
          adulti,
          bambini_eta: bambiniEta,
          trattamento,
          ...datiOspite,
        }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Errore nella creazione della prenotazione");
      setPrenotazioneCreata(body);
    } catch (err) {
      setErrore(err instanceof Error ? err.message : "Errore imprevisto");
    } finally {
      setCaricamento(false);
    }
  }

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

  return (
    <div>
      <form onSubmit={cercaDisponibilita} className="grid gap-4 md:grid-cols-3 items-end">
        <DateRangePicker
          dataArrivo={dataArrivo}
          dataPartenza={dataPartenza}
          onChange={(nuovoArrivo, nuovaPartenza) => {
            setDataArrivo(nuovoArrivo);
            setDataPartenza(nuovaPartenza);
          }}
          adulti={adulti}
          bambiniEta={bambiniEta}
          labelArrivo={t("dataArrivo")}
          labelPartenza={t("dataPartenza")}
        />
        {/* Uniformato al look del DateRangePicker (25/08/2026, feedback del
            titolare: "campo enorme con bordo piu scuro del data picker") —
            stessa struttura label-sopra/valore-sotto, stesso bordo
            border-border/rounded-md, stesso anello di fuoco border-primary
            usato dai due campi Check-in/Check-out. focus-within invece di
            :focus sul wrapper perché l'elemento che riceve il focus reale è
            l'<input> interno, non il <label>. */}
        <label className="flex flex-1 flex-col gap-1 rounded-md border border-border px-3 py-2 text-left focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
          <span className="text-xs text-textMuted">{t("adulti")}</span>
          <input
            type="number"
            min={1}
            max={10}
            value={adulti}
            onChange={(e) => setAdulti(Math.max(1, Number(e.target.value)))}
            className="w-full border-0 p-0 text-sm focus:outline-none focus:ring-0"
          />
        </label>
        <Button type="submit" variant="primary" size="compatta" disabled={caricamento || !dataArrivo || !dataPartenza}>
          {t("cerca")}
        </Button>
      </form>

      {/* Bambini con età (Fase A, 19/08/2026) — un selettore età per ogni
          bambino aggiunto, obbligatorio: serve al calcolo esatto della tassa
          di soggiorno lato gestionale. */}
      <div className="mt-4">
        <span className="text-sm text-textMuted">{t("bambini")}</span>
        <div className="mt-2 flex flex-wrap gap-2">
          {bambiniEta.map((eta, indice) => (
            <div key={indice} className="flex items-center gap-1 rounded-md border border-border px-2 py-1">
              <select
                value={eta}
                onChange={(e) => {
                  const nuove = [...bambiniEta];
                  nuove[indice] = Number(e.target.value);
                  setBambiniEta(nuove);
                }}
                className="text-sm"
              >
                {Array.from({ length: 18 }, (_, i) => i).map((anni) => (
                  <option key={anni} value={anni}>
                    {anni} {t("anni")}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setBambiniEta(bambiniEta.filter((_, i) => i !== indice))}
                aria-label={t("rimuoviBambino")}
                className="text-textMuted hover:text-error px-1"
              >
                ×
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setBambiniEta([...bambiniEta, 0])}
            className="text-sm rounded-md border border-dashed border-border px-3 py-1 text-textMuted hover:text-primary hover:border-primary"
          >
            + {t("aggiungiBambino")}
          </button>
        </div>
      </div>

      {errore && <p className="mt-4 text-error">{errore}</p>}

      {risultati && risultati.length === 0 && <p className="mt-6 text-textMuted">{t("nessunaDisponibilita")}</p>}

      {risultati && risultati.length > 0 && !tipoSelezionato && (
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {risultati.map((tipo) => {
            // Guardia difensiva lato client: disponibilita() filtra già
            // server-side per capienza, questo copre solo il caso limite in
            // cui i dati mostrati non fossero più aggiornati.
            const capienzaSuperata = tipo.capienza_max != null && ospitiChePesanoSuCapienza > tipo.capienza_max;
            const arricchimento = arricchimenti[tipo.id];
            return (
              <Card key={tipo.id} conFoto hover>
                {arricchimento?.fotoUrl && (
                  <div className="relative aspect-[4/3]">
                    <Image src={arricchimento.fotoUrl} alt={tipo.nome} fill className="object-cover" />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-heading text-xl text-primary">{tipo.nome}</h3>
                  {tipo.capienza_max != null && (
                    <p className="mt-1 text-xs text-textLight">Fino a {tipo.capienza_max} ospiti</p>
                  )}
                  {arricchimento?.mq != null && (
                    <p className="mt-1 text-xs text-textLight">{arricchimento.mq} m²</p>
                  )}
                  {arricchimento?.descrizione && (
                    <p className="mt-2 text-sm text-textMuted">{arricchimento.descrizione}</p>
                  )}
                  {arricchimento?.servizi && arricchimento.servizi.length > 0 && (
                    <p className="mt-2 text-xs text-textMuted">
                      {arricchimento.servizi
                        .map((s) => (tServizi.has(s) ? `${SERVIZI_ICONS[s] ?? ""} ${tServizi(s)}` : s))
                        .join(" · ")}
                    </p>
                  )}
                  {/* Prezzo "a partire da" B&B — il totale reale dipende dal
                      trattamento, scelto nello step successivo. */}
                  <p className="mt-2 text-textMuted">
                    {t("daPrezzo")} €{tipo.prezzi.bb}
                  </p>
                  <Button
                    variant="primary"
                    size="compatta"
                    className="mt-3"
                    onClick={() => {
                      setTrattamento("bb");
                      setTipoSelezionato(tipo);
                    }}
                    disabled={capienzaSuperata}
                  >
                    {t("selezionaCamera")}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Selettore trattamento (Modulo tariffe derivate, 20/08/2026) — dopo
          la camera, prima dei dati ospite, come da flusso confermato con il
          titolare. I 3 prezzi arrivano già calcolati da disponibilita() (con
          adulti+bambini inclusi), nessuna nuova chiamata di rete al cambio
          scelta. Un'opzione con prezzo null non è ancora configurata dal
          gestionale per queste date — disabilitata, non nascosta: l'ospite
          vede che esiste ma non è ancora prenotabile online. */}
      {tipoSelezionato && (
        <div className="mt-6 max-w-lg">
          <span className="text-sm text-textMuted">{t("trattamento")}</span>
          <div className="mt-2 grid gap-2">
            {(["bb", "mezza_pensione", "pensione_completa"] as Trattamento[]).map((opzione) => {
              const prezzo = tipoSelezionato.prezzi[opzione];
              const etichetta = opzione === "bb" ? t("bb") : opzione === "mezza_pensione" ? t("mezzaPensione") : t("pensioneCompleta");
              return (
                <label
                  key={opzione}
                  className={`flex items-center justify-between gap-3 rounded-md border px-3 py-2 ${prezzo === null ? "opacity-50 cursor-not-allowed" : "cursor-pointer"} ${trattamento === opzione ? "border-primary" : "border-border"}`}
                >
                  <span className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="trattamento"
                      value={opzione}
                      checked={trattamento === opzione}
                      disabled={prezzo === null}
                      onChange={() => setTrattamento(opzione)}
                    />
                    {etichetta}
                  </span>
                  <span className="text-sm text-textMuted">
                    {prezzo === null
                      ? tipoSelezionato.motivi_non_disponibile?.[opzione] || t("trattamentoNonDisponibile")
                      : `€${prezzo}`}
                  </span>
                </label>
              );
            })}
          </div>
          {tipoSelezionato.prezzi[trattamento] !== null && (
            <div className="mt-2">
              <p className="text-textMuted">{t("prezzoTotale")}: €{tipoSelezionato.prezzi[trattamento]}</p>
              <p className="text-sm text-textMuted">
                {t("caparra")}: €{Math.round((tipoSelezionato.prezzi[trattamento] as number) * percentualeCaparra * 100) / 100}
              </p>
            </div>
          )}
        </div>
      )}

      {tipoSelezionato && (
        <form onSubmit={confermaDatiOspite} className="mt-6 grid gap-4 md:grid-cols-2 max-w-lg">
          <label className="flex flex-col gap-1">
            <span className="text-sm text-textMuted">{t("nome")}</span>
            <input required value={datiOspite.nome} onChange={(e) => setDatiOspite({ ...datiOspite, nome: e.target.value })} className="rounded-md border border-border px-3 py-2" />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm text-textMuted">{t("cognome")}</span>
            <input required value={datiOspite.cognome} onChange={(e) => setDatiOspite({ ...datiOspite, cognome: e.target.value })} className="rounded-md border border-border px-3 py-2" />
          </label>
          <label className="flex flex-col gap-1 md:col-span-2">
            <span className="text-sm text-textMuted">{t("email")}</span>
            <input type="email" required value={datiOspite.email} onChange={(e) => setDatiOspite({ ...datiOspite, email: e.target.value })} className="rounded-md border border-border px-3 py-2" />
          </label>
          <label className="flex flex-col gap-1 md:col-span-2">
            <span className="text-sm text-textMuted">{t("telefono")}</span>
            <input value={datiOspite.telefono} onChange={(e) => setDatiOspite({ ...datiOspite, telefono: e.target.value })} className="rounded-md border border-border px-3 py-2" />
          </label>

          {/* Termini di cancellazione (Fase C, 19/08/2026) — mostrati sempre
              prima del pulsante che porta al pagamento della caparra, non
              solo nella mail dopo. Se il testo è ancora il segnaposto
              lasciato dalla migration (nessuna policy reale inserita da
              Impostazioni ▸ Testi email), va comunque mostrato: meglio un
              avviso "da completare" visibile che un silenzio che lascia
              credere che non esista alcuna condizione. */}
          {terminiCancellazione && (
            <div className="md:col-span-2 rounded-md border border-border p-3 bg-surfaceDark/40">
              <h4 className="font-heading text-sm font-semibold text-text">{t("terminiCancellazione")}</h4>
              <p className="mt-1 text-sm text-textMuted whitespace-pre-line">{terminiCancellazione}</p>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="compatta"
            className="md:col-span-2"
            disabled={caricamento || tipoSelezionato.prezzi[trattamento] === null}
          >
            {t("continua")}
          </Button>
        </form>
      )}
    </div>
  );
}

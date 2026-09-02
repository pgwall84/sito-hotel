import { cache } from "react";
import { groq } from "next-sanity";
import { client, urlFor } from "@/lib/sanity";
import { pickLocale } from "@/lib/sanity-i18n";

const REVALIDATE = { next: { revalidate: 60 } } as const;

type Locale = string;
type LocaleString = Partial<Record<"it" | "en" | "de" | "fr", string>>;
type SanityImage = { asset?: { _ref: string } } & Record<string, unknown>;

function imgUrl(source: SanityImage | undefined | null, width: number, height: number) {
  if (!source) return null;
  return urlFor(source).width(width).height(height).fit("crop").url();
}

// per immagini full-bleed (hero): niente crop server-side forzato,
// il ritaglio finale lo fa object-cover lato client
function imgUrlWide(source: SanityImage | undefined | null, width: number) {
  if (!source) return null;
  return urlFor(source).width(width).quality(80).url();
}

// ---------- Info Hotel ----------

const INFO_HOTEL_QUERY = groq`
  *[_type == "infoHotel"][0] {
    nome, claim, descrizione, telefono, telefonoMobile, email,
    indirizzo, citta, cap, provincia, latitudine, longitudine, citr,
    orariReception, logo, logoBianco, immagineHero, linkTripAdvisor
  }
`;

interface InfoHotelRaw {
  nome?: string;
  claim?: LocaleString;
  descrizione?: LocaleString;
  telefono?: string;
  telefonoMobile?: string;
  email?: string;
  indirizzo?: string;
  citta?: string;
  cap?: string;
  provincia?: string;
  latitudine?: number;
  longitudine?: number;
  citr?: string;
  orariReception?: string;
  logo?: SanityImage;
  logoBianco?: SanityImage;
  immagineHero?: SanityImage;
  linkTripAdvisor?: string;
}

export const getInfoHotel = cache(async (locale: Locale) => {
  const h = await client.fetch<InfoHotelRaw | null>(INFO_HOTEL_QUERY, {}, REVALIDATE);
  return {
    nome: h?.nome ?? "Hotel del Golfo",
    claim: pickLocale(h?.claim, locale) ?? "Nel cuore del Golfo dei Poeti",
    descrizione: pickLocale(h?.descrizione, locale) ?? "Hotel familiare a Lerici, 150 metri dal mare.",
    telefono: h?.telefono ?? "+39 0187 967400",
    telefonoMobile: h?.telefonoMobile ?? "+39 335 7579786",
    email: h?.email ?? "info@hoteldelgolfo.com",
    indirizzo: h?.indirizzo ?? "Via Gerini 37",
    citta: h?.citta ?? "Lerici",
    cap: h?.cap ?? "19032",
    provincia: h?.provincia ?? "SP",
    latitudine: h?.latitudine ?? 44.0773612,
    longitudine: h?.longitudine ?? 9.9127261,
    citr: h?.citr ?? "011016-ALB-0027",
    orariReception: h?.orariReception ?? "",
    // Fallback alla scheda TripAdvisor reale trovata via ricerca (06/08/2026) —
    // finché il campo in Sanity (Impostazioni ▸ Info Hotel) resta vuoto.
    // Verificare che sia ancora la pagina corretta prima di fidarsene ciecamente.
    linkTripAdvisor:
      h?.linkTripAdvisor ??
      "https://www.tripadvisor.com/Hotel_Review-g194792-d567523-Reviews-Hotel_Del_Golfo-Lerici_Italian_Riviera_Liguria.html",
    fotoUrl: imgUrl(h?.logo, 1200, 630), // per og:image — crop 1200x630 corretto solo lì
    logoUrl: imgUrlWide(h?.logo, 400), // per Header — nessun crop forzato, mantiene le proporzioni reali
    logoBiancoUrl: imgUrlWide(h?.logoBianco, 400), // per Footer (sfondo navy)
    heroUrl: imgUrlWide(h?.immagineHero, 2400),
  };
});

// ---------- Camere ----------

const CAMERE_LIST_QUERY = groq`
  *[_type == "camera" && disponibile == true] | order(ordine asc) {
    "slug": slug.current,
    nome,
    fotoPrincipale,
    servizi,
    prezzoBase,
    evidenziata
  }
`;

interface CameraListItem {
  slug: string;
  nome: LocaleString;
  fotoPrincipale: SanityImage;
  servizi: string[];
  prezzoBase: number;
  evidenziata?: boolean;
}

export const getCamere = cache(async (locale: Locale) => {
  const raw = await client.fetch<CameraListItem[]>(CAMERE_LIST_QUERY, {}, REVALIDATE);
  return raw.map((c) => ({
    slug: c.slug,
    nome: pickLocale(c.nome, locale) ?? c.slug,
    fotoUrl: imgUrl(c.fotoPrincipale, 600, 450),
    // Crop più alto, solo per la card "grande" del bento camere in home
    // (fino a ~1100px di larghezza reale a schermo) — 600x450 upscalato
    // lì dentro risultava visibilmente sgranato (26/08/2026, segnalato
    // dal titolare dopo il checkpoint del Punto 3a).
    fotoUrlGrande: imgUrl(c.fotoPrincipale, 1200, 900),
    servizi: c.servizi ?? [],
    prezzoBase: c.prezzoBase,
    evidenziata: c.evidenziata ?? false,
  }));
});

const CAMERA_BY_SLUG_QUERY = groq`
  *[_type == "camera" && slug.current == $slug][0] {
    "slug": slug.current,
    nome,
    descrizione,
    capienza,
    mq,
    prezzoBase,
    fotoPrincipale,
    galleria,
    servizi
  }
`;

interface CameraDetailRaw {
  slug: string;
  nome: LocaleString;
  descrizione: LocaleString;
  capienza?: number;
  mq?: number;
  prezzoBase: number;
  fotoPrincipale?: SanityImage;
  galleria?: SanityImage[];
  servizi?: string[];
}

export const getCameraBySlug = cache(async (slug: string, locale: Locale) => {
  const c = await client.fetch<CameraDetailRaw | null>(CAMERA_BY_SLUG_QUERY, { slug }, REVALIDATE);
  if (!c) return null;
  return {
    slug: c.slug,
    nome: pickLocale(c.nome, locale) ?? c.slug,
    descrizione: pickLocale(c.descrizione, locale) ?? "",
    capienza: c.capienza,
    mq: c.mq,
    prezzoBase: c.prezzoBase,
    fotoUrl: imgUrl(c.fotoPrincipale, 1200, 800),
    galleria: (c.galleria ?? []).map((img) => imgUrl(img, 1200, 800)).filter(Boolean) as string[],
    servizi: c.servizi ?? [],
  };
});

// ---------- Sezione Ristorante ----------

const SEZIONE_RISTORANTE_QUERY = groq`
  *[_type == "sezioneRistorante"][0] {
    titolo, descrizione, foto, specialita, orari, linkMenu
  }
`;

interface SezioneRistoranteRaw {
  titolo: LocaleString;
  descrizione: LocaleString;
  foto?: SanityImage[];
  specialita?: LocaleString[];
  orari?: string;
  linkMenu?: string;
}

export const getSezioneRistorante = cache(async (locale: Locale) => {
  const r = await client.fetch<SezioneRistoranteRaw | null>(SEZIONE_RISTORANTE_QUERY, {}, REVALIDATE);
  if (!r) return null;
  return {
    titolo: pickLocale(r.titolo, locale) ?? "",
    descrizione: pickLocale(r.descrizione, locale) ?? "",
    fotoUrl: imgUrl(r.foto?.[0], 1200, 800),
    specialita: (r.specialita ?? []).map((s) => pickLocale(s, locale)).filter(Boolean) as string[],
    orari: r.orari,
    linkMenu: r.linkMenu,
  };
});

// ---------- Esperienza Pesto ----------

const ESPERIENZA_PESTO_QUERY = groq`
  *[_type == "esperienzaPesto"][0] {
    titolo, descrizione, foto, visitatoriStagione, durata, prezzo, comePrenot
  }
`;

interface EsperienzaPestoRaw {
  titolo: LocaleString;
  descrizione: LocaleString;
  foto?: SanityImage[];
  visitatoriStagione?: number;
  durata: LocaleString;
  prezzo?: number;
  comePrenot: LocaleString;
}

export const getEsperienzaPesto = cache(async (locale: Locale) => {
  const e = await client.fetch<EsperienzaPestoRaw | null>(ESPERIENZA_PESTO_QUERY, {}, REVALIDATE);
  if (!e) return null;
  return {
    titolo: pickLocale(e.titolo, locale) ?? "",
    descrizione: pickLocale(e.descrizione, locale) ?? "",
    fotoUrl: imgUrl(e.foto?.[0], 1200, 800),
    visitatoriStagione: e.visitatoriStagione,
    durata: pickLocale(e.durata, locale) ?? "",
    prezzo: e.prezzo,
    comePrenot: pickLocale(e.comePrenot, locale) ?? "",
  };
});

// ---------- Escursioni / dintorni ----------

const ESCURSIONI_LIST_QUERY = groq`
  *[_type == "escursione"] | order(ordine asc) {
    titolo,
    sottotitolo,
    descrizione,
    foto,
    link
  }
`;

interface EscursioneListItem {
  titolo: LocaleString;
  sottotitolo?: LocaleString;
  descrizione?: LocaleString;
  foto?: SanityImage;
  link?: string;
}

export const getEscursioni = cache(async (locale: Locale) => {
  const raw = await client.fetch<EscursioneListItem[]>(ESCURSIONI_LIST_QUERY, {}, REVALIDATE);
  return raw.map((e) => ({
    titolo: pickLocale(e.titolo, locale) ?? "",
    sottotitolo: e.sottotitolo ? pickLocale(e.sottotitolo, locale) : undefined,
    descrizione: e.descrizione ? pickLocale(e.descrizione, locale) : undefined,
    fotoUrl: imgUrl(e.foto, 600, 450),
    link: e.link,
  }));
});

// ---------- Convenzioni Aziendali ----------

const CONVENZIONI_AZIENDALI_QUERY = groq`
  *[_type == "convenzioniAziendali"][0] {
    titolo, sottotitolo, servizi, testoConvenzioni, emailRichieste, mostraFormRichiesta, aziendeLogo
  }
`;

interface ConvenzioniAziendaliRaw {
  titolo: LocaleString;
  sottotitolo: LocaleString;
  servizi?: LocaleString[];
  testoConvenzioni: LocaleString;
  emailRichieste?: string;
  mostraFormRichiesta?: boolean;
}

export const getConvenzioniAziendali = cache(async (locale: Locale) => {
  const c = await client.fetch<ConvenzioniAziendaliRaw | null>(CONVENZIONI_AZIENDALI_QUERY, {}, REVALIDATE);
  if (!c) return null;
  return {
    titolo: pickLocale(c.titolo, locale) ?? "",
    sottotitolo: pickLocale(c.sottotitolo, locale) ?? "",
    servizi: (c.servizi ?? []).map((s) => pickLocale(s, locale)).filter(Boolean) as string[],
    testoConvenzioni: pickLocale(c.testoConvenzioni, locale) ?? "",
    emailRichieste: c.emailRichieste ?? "info@hoteldelgolfo.com",
    mostraFormRichiesta: c.mostraFormRichiesta ?? true,
  };
});

// ---------- Welcome Book (modulo 4.2 — QR in camera) ----------
// Nota: niente REVALIDATE lungo qui non serve — usa lo stesso ISR 60s di
// tutto il resto. Contatti reception e link menu ristorante NON sono in
// questo documento: si leggono da getInfoHotel/getSezioneRistorante nella
// pagina, per non duplicare dati già gestiti altrove in Sanity.

const WELCOME_BOOK_QUERY = groq`
  *[_type == "welcomeBook"][0] {
    titoloBenvenuto, messaggioBenvenuto,
    wifiNome, wifiPassword,
    orariCheckin, orariCheckout, orariColazione,
    regoleCasa,
    numeriUtili,
    posizioneLat, posizioneLon, posizioneTesto,
    trasporti, servizi, attivita, ristorantiEsterni, bar, shopping,
    informazioni, emergenza
  }
`;

interface NumeroUtileRaw {
  etichetta?: LocaleString;
  valore?: string;
}

interface LuogoRaw {
  nome?: LocaleString;
  categoria?: string;
  indirizzo?: string;
  nota?: LocaleString;
  telefono?: string;
  lat?: number;
  lon?: number;
  link?: string;
}

export type Luogo = {
  nome: string;
  categoria?: string;
  indirizzo?: string;
  nota?: string;
  telefono?: string;
  lat?: number;
  lon?: number;
  link?: string;
};

function mapLuogo(raw: LuogoRaw, locale: Locale): Luogo {
  return {
    nome: pickLocale(raw.nome, locale) ?? "",
    categoria: raw.categoria,
    indirizzo: raw.indirizzo,
    nota: pickLocale(raw.nota, locale),
    telefono: raw.telefono,
    lat: raw.lat,
    lon: raw.lon,
    link: raw.link,
  };
}

function mapLuoghi(raw: LuogoRaw[] | undefined, locale: Locale): Luogo[] {
  return (raw ?? []).map((l) => mapLuogo(l, locale)).filter((l) => l.nome);
}

interface WelcomeBookRaw {
  titoloBenvenuto?: LocaleString;
  messaggioBenvenuto?: LocaleString;
  wifiNome?: string;
  wifiPassword?: string;
  orariCheckin?: string;
  orariCheckout?: string;
  orariColazione?: string;
  regoleCasa?: LocaleString[];
  numeriUtili?: NumeroUtileRaw[];
  posizioneLat?: number;
  posizioneLon?: number;
  posizioneTesto?: LocaleString;
  trasporti?: LuogoRaw[];
  servizi?: LuogoRaw[];
  attivita?: LuogoRaw[];
  ristorantiEsterni?: LuogoRaw[];
  bar?: LuogoRaw[];
  shopping?: LuogoRaw[];
  informazioni?: LuogoRaw[];
  emergenza?: LuogoRaw[];
}

export const getWelcomeBook = cache(async (locale: Locale) => {
  const w = await client.fetch<WelcomeBookRaw | null>(WELCOME_BOOK_QUERY, {}, REVALIDATE);
  if (!w) return null;
  return {
    titoloBenvenuto: pickLocale(w.titoloBenvenuto, locale) ?? "",
    messaggioBenvenuto: pickLocale(w.messaggioBenvenuto, locale) ?? "",
    wifiNome: w.wifiNome ?? "",
    wifiPassword: w.wifiPassword ?? "",
    orariCheckin: w.orariCheckin ?? "",
    orariCheckout: w.orariCheckout ?? "",
    orariColazione: w.orariColazione ?? "",
    regoleCasa: (w.regoleCasa ?? []).map((r) => pickLocale(r, locale)).filter(Boolean) as string[],
    numeriUtili: (w.numeriUtili ?? [])
      .map((n) => ({ etichetta: pickLocale(n.etichetta, locale) ?? "", valore: n.valore ?? "" }))
      .filter((n) => n.etichetta && n.valore),
    posizioneLat: w.posizioneLat,
    posizioneLon: w.posizioneLon,
    posizioneTesto: pickLocale(w.posizioneTesto, locale) ?? "",
    trasporti: mapLuoghi(w.trasporti, locale),
    servizi: mapLuoghi(w.servizi, locale),
    attivita: mapLuoghi(w.attivita, locale),
    ristorantiEsterni: mapLuoghi(w.ristorantiEsterni, locale),
    bar: mapLuoghi(w.bar, locale),
    shopping: mapLuoghi(w.shopping, locale),
    informazioni: mapLuoghi(w.informazioni, locale),
    emergenza: mapLuoghi(w.emergenza, locale),
  };
});

// ---------- Offerte ----------

const OFFERTE_QUERY = groq`
  *[_type == "offerta" && attiva == true] | order(evidenziata desc, dataInizio asc) {
    "slug": slug.current,
    titolo,
    descrizione,
    prezzo,
    prezzoBarrato,
    foto,
    dataInizio,
    dataFine,
    evidenziata,
    incluso
  }
`;

interface OffertaRaw {
  slug: string;
  titolo: LocaleString;
  descrizione: LocaleString;
  prezzo?: number;
  prezzoBarrato?: number;
  foto?: SanityImage;
  dataInizio?: string;
  dataFine?: string;
  evidenziata?: boolean;
  incluso?: LocaleString;
}

export const getOfferte = cache(async (locale: Locale) => {
  const raw = await client.fetch<OffertaRaw[]>(OFFERTE_QUERY, {}, REVALIDATE);
  return raw.map((o) => ({
    slug: o.slug,
    titolo: pickLocale(o.titolo, locale) ?? o.slug,
    descrizione: pickLocale(o.descrizione, locale) ?? "",
    prezzo: o.prezzo,
    prezzoBarrato: o.prezzoBarrato,
    fotoUrl: imgUrl(o.foto, 600, 450),
    dataInizio: o.dataInizio,
    dataFine: o.dataFine,
    evidenziata: o.evidenziata ?? false,
    incluso: pickLocale(o.incluso, locale) ?? "",
  }));
});

// ---------- Galleria ----------

const GALLERIA_QUERY = groq`
  *[_type == "fotoGalleria"] | order(ordine asc) {
    foto,
    didascalia,
    categoria
  }
`;

interface FotoGalleriaRaw {
  foto: SanityImage;
  didascalia?: LocaleString;
  categoria: string;
}

export const getGalleria = cache(async (locale: Locale) => {
  const raw = await client.fetch<FotoGalleriaRaw[]>(GALLERIA_QUERY, {}, REVALIDATE);
  return raw
    .map((f) => ({
      fotoUrl: imgUrl(f.foto, 900, 700),
      didascalia: pickLocale(f.didascalia, locale) ?? "",
      categoria: f.categoria,
    }))
    .filter((f) => f.fotoUrl !== null) as { fotoUrl: string; didascalia: string; categoria: string }[];
});

# SPEC — Sito Web Hotel del Golfo Lerici
# Progetto separato dal gestionale — repository: sito-hotel
# Stack: Next.js 15 + TypeScript + Sanity CMS + Vercel

---

## 1. IDENTITÀ PROGETTO

Hotel del Golfo — hotel 3 stelle familiare nel centro di Lerici (SP).
150 metri dal mare, gateway per Cinque Terre e Portovenere.
Elemento distintivo: degustazione pesto artigianale.
Turismo: familiare, culturale, naturalistico.
Clientela: italiani, tedeschi, francesi, inglesi.

Repository separato dal gestionale — NON mescolare i due progetti.
Cartella locale: C:\Users\pgwal\Cloude\sito-hotel

---

## 2. STACK TECNOLOGICO

```
Frontend:  Next.js 15 + TypeScript
           App Router, SSG/ISR per performance SEO
           Tailwind CSS con design tokens personalizzati
           Framer Motion per animazioni discrete
           next-intl per internazionalizzazione (IT/EN/DE/FR)

CMS:       Sanity v3
           Studio in italiano per il titolare
           Nomi campi in italiano, interfaccia semplificata
           Preview live prima della pubblicazione

Deploy:    Vercel (dominio temporaneo, poi hoteldelgolfolerici.com)
           ISR: revalidate 60 secondi sui contenuti Sanity

Immagini:  Sanity CDN con next/image
           WebP/AVIF automatico, lazy loading
           Placeholder blur durante caricamento
```

---

## 3. DESIGN SYSTEM — theme.ts

TUTTO il design passa da questo file. Per cambiare grafica si modifica solo questo.

```typescript
// lib/theme.ts
export const theme = {
  colors: {
    primary: '#1B3A5C',      // blu profondo del golfo
    primaryLight: '#2A5A8C', // blu hover
    accent: '#C4703A',       // terracotta ligure
    accentLight: '#D4875A',  // terracotta hover
    background: '#FFFFFF',   // bianco caldo
    surface: '#F5F0E8',      // sabbia chiara (sezioni alternate)
    surfaceDark: '#EDE8DF',  // sabbia più scura
    text: '#2C2C2C',         // antracite morbido
    textMuted: '#6B6B6B',    // testo secondario
    textLight: '#9A9A9A',    // testo terziario
    border: '#E0D8CE',       // bordi sabbia
    white: '#FFFFFF',
  },
  fonts: {
    heading: 'Playfair Display', // serif elegante per titoli
    body: 'Inter',               // sans-serif pulito per corpo
  },
  fontSizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem',
  },
  spacing: {
    section: '5rem',       // padding verticale sezioni
    sectionMobile: '3rem',
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px',
  },
  shadows: {
    card: '0 2px 12px rgba(27, 58, 92, 0.08)',
    cardHover: '0 8px 24px rgba(27, 58, 92, 0.16)',
  },
  booking: {
    engine: process.env.NEXT_PUBLIC_BOOKING_ENGINE || 'teamsystem',
    // 'teamsystem' → widget iframe TS
    // 'wubook'     → calendario custom con API WuBook
    teamsystemUrl: 'https://digitalbooking.digiside.it/it/Struttura?strutture_id=224',
    wubookApiUrl: process.env.WUBOOK_API_URL || '',
  }
}
```

---

## 4. INTERNAZIONALIZZAZIONE

Lingue: IT (default), EN, DE, FR

```
/          → italiano
/en        → inglese
/de        → tedesco
/fr        → francese
```

Implementazione con next-intl.
File traduzioni in /messages/it.json, en.json, de.json, fr.json.
Sanity: ogni campo testo ha varianti per lingua (internazionalized fields).
Selettore lingua nel header — bandierine + codice lingua.

---

## 5. STRUTTURA PAGINE

### / (Home)
```
1. HERO
   Foto fullscreen del golfo di Lerici
   Overlay scuro gradient dal basso
   Titolo: "Nel cuore del Golfo dei Poeti"
   Sottotitolo: "Hotel familiare a Lerici, 150 metri dal mare"
   CTA primario: "Prenota ora" (blu primario)
   CTA secondario: "Scopri l'hotel" (outline bianco)

2. PUNTI DI FORZA (4 icone)
   150m dal mare | Centro di Lerici | Ristorante di pesce | Familiare

3. CAMERE IN EVIDENZA
   Griglia 3 camere con foto, nome, servizi brevi, prezzo da X€
   CTA: "Vedi tutte le camere"

4. IL RISTORANTE
   Foto + testo descrittivo cucina ligure e di pesce
   CTA: "Scopri il menu"

5. HIGHLIGHT: DEGUSTAZIONE PESTO
   Sezione con sfondo accent (terracotta)
   Foto + storia della degustazione
   "1500 ospiti ogni stagione"
   CTA: "Prenota la degustazione"

6. LERICI E DINTORNI
   3 card: Cinque Terre | Portovenere | Tellaro e borghi
   Link a pagina dedicata

7. GALLERIA PREVIEW
   Griglia masonry 6 foto con link a galleria completa

8. WIDGET TRIPADVISOR
   Recensioni e rating

9. COME ARRIVARE
   Mappa Google Maps embed
   Indirizzo, telefono, email
```

### /camere
```
Lista tutte le camere
Filtro per numero persone (opzionale)
Card: foto principale, nome, icone servizi, prezzo da, CTA "Scopri"
```

### /camere/[slug]
```
Galleria foto (carousel)
Descrizione completa
Lista servizi con icone
Prezzo a partire da
Pulsante "Prenota questa camera" → booking engine
```

### /ristorante
```
Hero foto ristorante
Descrizione cucina ligure e di pesce
Sezione: prodotti tipici usati
Menu stagionale (collegato a /menu-pubblico del gestionale via iframe o link)
Prenotazione tavolo: form email o numero telefono
```

### /esperienze
```
Card 1: Degustazione pesto (elemento distintivo principale)
Card 2+: Escursioni consigliate (Cinque Terre, Portovenere, kayak, trekking)
```

### /lerici
```
Foto del borgo
Cosa vedere: castello, porto, spiagge
Borghi vicini: Tellaro, San Terenzo, Fiascherino
Come arrivare: auto, treno, battello
```

### /offerte
```
Lista offerte/pacchetti stagionali
Card: foto, titolo, descrizione, prezzo, date validità, CTA
Offerta evidenziata: badge "In evidenza"
```

### /galleria
```
Griglia masonry tutte le foto
Categorie: Hotel | Camere | Ristorante | Lerici
Lightbox al click
```

### /contatti
```
Form contatto (nome, email, telefono, messaggio, data arrivo, data partenza)
Mappa embed
Orari reception
Telefono, email, indirizzo
Come arrivare (auto, treno, battello)
```

### /privacy-policy e /cookie-policy
```
Pagine generiche con contenuto rich text da Sanity
```

---

## 6. SCHEMA SANITY

### Tipi di contenuto

#### infoHotel (singleton)
```javascript
{
  nome: string,
  claim: string,              // "Nel cuore del Golfo dei Poeti"
  descrizione: text,
  telefono: string,
  telefonoMobile: string,
  email: string,
  indirizzo: string,
  citta: string,
  cap: string,
  provincia: string,
  latitudine: number,
  longitudine: number,
  citr: string,               // codice struttura turistica
  partitaIva: string,
  linkFacebook: string,
  linkInstagram: string,
  linkTripAdvisor: string,
  logo: image,
  orariReception: string,
}
```

#### camera
```javascript
{
  nome: LocaleString,         // multilingua
  slug: slug,
  descrizione: LocaleText,    // multilingua
  capienza: number,           // numero persone
  piano: number,
  mq: number,
  prezzoBase: number,         // prezzo a partire da
  fotoPrincipale: image,
  galleria: image[],
  servizi: string[],          // ["WiFi", "TV", "Aria condizionata", ...]
  disponibile: boolean,
  ordine: number,
}
```

#### offerta
```javascript
{
  titolo: LocaleString,
  slug: slug,
  descrizione: LocaleText,
  prezzo: number,
  prezzoBarrato: number,      // prezzo originale per mostrare sconto
  foto: image,
  dataInizio: date,
  dataFine: date,
  evidenziata: boolean,
  incluso: LocaleText,        // cosa include l'offerta
  attiva: boolean,
}
```

#### esperienzaPesto (singleton)
```javascript
{
  titolo: LocaleString,
  descrizione: LocaleText,
  foto: image[],
  visitatoriStagione: number, // "1500 ospiti ogni stagione"
  durata: string,
  prezzo: number,
  comePrenot: LocaleText,
}
```

#### paginaGenerica
```javascript
{
  titolo: LocaleString,
  slug: slug,
  contenuto: LocalePortableText,  // rich text multilingua
}
```

#### fotoGalleria
```javascript
{
  foto: image,
  didascalia: LocaleString,
  categoria: 'hotel' | 'camere' | 'ristorante' | 'lerici',
  ordine: number,
}
```

#### sezioneRistorante (singleton)
```javascript
{
  titolo: LocaleString,
  descrizione: LocaleText,
  foto: image[],
  specialita: LocaleString[], // piatti tipici
  orari: string,
  linkMenu: url,              // URL /menu-pubblico del gestionale
}
```

---

## 7. COMPONENTI PRINCIPALI

### Header
```
Logo + nome hotel
Nav: Home | Camere | Ristorante | Esperienze | Lerici | Offerte | Contatti
Selettore lingua (IT | EN | DE | FR)
CTA "Prenota" sempre visibile (sticky)
Mobile: hamburger menu
```

### BookingButton
```typescript
// Componente con dual-mode basato su theme.booking.engine

function BookingButton({ cameraSlug?: string }) {
  if (theme.booking.engine === 'teamsystem') {
    return <a href={theme.booking.teamsystemUrl} target="_blank">
      Prenota ora
    </a>
  }
  // Fase 2: calendario WuBook custom
  return <WubookCalendar cameraSlug={cameraSlug} />
}
```

### Footer
```
Logo + claim
Nav secondaria
Contatti: telefono, email, indirizzo
Social: Facebook, Instagram
CITR, P.IVA
Link: Privacy Policy | Cookie Policy
Copyright
```

### SectionWrapper
```typescript
// Wrapper riutilizzabile per ogni sezione
// bg: 'white' | 'surface' | 'primary' | 'accent'
function SectionWrapper({ children, bg = 'white' }) { ... }
```

---

## 8. SEO + AEO

### Meta tags (ogni pagina)
```
title: dinamico da Sanity + " | Hotel del Golfo Lerici"
description: dinamico da Sanity
og:image: foto principale della pagina
canonical: URL canonico
hreflang: IT/EN/DE/FR per ogni pagina
```

### Schema JSON-LD (homepage)
```json
{
  "@context": "https://schema.org",
  "@type": "Hotel",
  "name": "Hotel del Golfo",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Via Gerini 37",
    "addressLocality": "Lerici",
    "postalCode": "19032",
    "addressCountry": "IT"
  },
  "telephone": "+390187967400",
  "email": "info@hoteldelgolfo.com",
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 44.0773612,
    "longitude": 9.9127261
  },
  "starRating": { "@type": "Rating", "ratingValue": "3" },
  "priceRange": "$$",
  "checkinTime": "14:00",
  "checkoutTime": "11:00",
  "amenityFeature": ["WiFi", "Ristorante", "Parcheggio"],
  "hasMap": "https://maps.google.com/...",
  "image": ["..."],
  "url": "https://www.hoteldelgolfolerici.com"
}
```

### AEO (AI Engine Optimization)
```
HTML semantico: article, section, header, nav, main, footer
FAQ strutturate su ogni pagina con FAQ schema
Breadcrumb schema su pagine interne
Contenuto denso e informativo (no keyword stuffing)
Risposte dirette alle domande frequenti degli ospiti
```

---

## 9. PERFORMANCE

```
Target Core Web Vitals:
  LCP < 2.5s
  CLS < 0.1
  FID < 100ms

Strategie:
  SSG per tutte le pagine statiche
  ISR 60s per contenuti Sanity
  next/image con WebP/AVIF automatico
  Font preload (Playfair Display + Inter da Google Fonts)
  Nessun JavaScript pesante above the fold
  Lazy loading immagini below the fold
```

---

## 10. BOOKING ENGINE — DUAL MODE

```
Variabile d'ambiente: NEXT_PUBLIC_BOOKING_ENGINE

Fase 1 (ora):
  NEXT_PUBLIC_BOOKING_ENGINE=teamsystem
  → pulsante "Prenota" apre URL TeamSystem in nuova tab
  → nessuna integrazione API necessaria

Fase 2 (dopo switch-off TS):
  NEXT_PUBLIC_BOOKING_ENGINE=wubook
  → calendario disponibilità con API WuBook
  → selezione camera, date, ospiti
  → pagamento via WuBook (Nexi + Stripe)
  → webhook al gestionale
  → sviluppare questo componente solo in Fase 2
```

---

## 11. STRUTTURA FILE PROGETTO

```
sito-hotel/
├── app/
│   ├── [locale]/
│   │   ├── page.tsx              → Home
│   │   ├── camere/
│   │   │   ├── page.tsx          → Lista camere
│   │   │   └── [slug]/page.tsx   → Dettaglio camera
│   │   ├── ristorante/page.tsx
│   │   ├── esperienze/page.tsx
│   │   ├── lerici/page.tsx
│   │   ├── offerte/page.tsx
│   │   ├── galleria/page.tsx
│   │   ├── contatti/page.tsx
│   │   └── [slug]/page.tsx       → Pagine generiche
│   └── studio/[[...tool]]/       → Sanity Studio
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── SectionWrapper.tsx
│   ├── home/
│   │   ├── Hero.tsx
│   │   ├── PuntiDiForza.tsx
│   │   ├── CamereInEvidenza.tsx
│   │   ├── RistorantePreview.tsx
│   │   ├── PestoHighlight.tsx
│   │   ├── LericiDintorni.tsx
│   │   └── GalleriaPreview.tsx
│   ├── ui/
│   │   ├── BookingButton.tsx     → dual mode TS/WuBook
│   │   ├── CameraCard.tsx
│   │   ├── OffertaCard.tsx
│   │   ├── LinguaSelector.tsx
│   │   └── ImageGallery.tsx
│   └── sanity/
│       └── PortableText.tsx
├── lib/
│   ├── theme.ts                  → TUTTI i token di design
│   ├── sanity.ts                 → client Sanity
│   └── queries.ts                → GROQ queries
├── messages/
│   ├── it.json
│   ├── en.json
│   ├── de.json
│   └── fr.json
├── sanity/
│   ├── schemaTypes/              → schemi contenuto
│   └── structure.ts              → struttura Studio
├── public/
│   └── fonts/
├── .env.local.example
├── next.config.ts
├── sanity.config.ts
└── tailwind.config.ts
```

---

## 12. SEQUENZA DI SVILUPPO

```
Step 1: Inizializzazione progetto
  npx create-next-app@latest sito-hotel --typescript --tailwind --app
  npm create sanity@latest (aggiungi a progetto esistente)
  Configurare next-intl

Step 2: Design system
  Creare lib/theme.ts con tutti i token
  Configurare Tailwind con i custom colors dal theme
  Installare e configurare font (Playfair Display + Inter)

Step 3: Schema Sanity
  Definire tutti i tipi di contenuto
  Configurare Sanity Studio in italiano
  Popolare con contenuti di test

Step 4: Layout base
  Header con nav multilingua e selettore lingua
  Footer
  SectionWrapper

Step 5: Homepage
  Sviluppare tutte le sezioni nell'ordine
  BookingButton con modalità teamsystem

Step 6: Pagine camere
  Lista + dettaglio con galleria

Step 7: Ristorante + Esperienze + Lerici

Step 8: Offerte + Galleria + Contatti

Step 9: SEO + Schema JSON-LD + AEO

Step 10: Deploy Vercel
  Collegare repo GitHub a Vercel
  Configurare variabili d'ambiente
  Configurare webhook Sanity → Vercel (rebuild su publish)

Step 11: Performance
  Verificare Core Web Vitals
  Ottimizzare immagini
```

---

## 13. VARIABILI D'AMBIENTE

```bash
# .env.local

# Sanity
NEXT_PUBLIC_SANITY_PROJECT_ID=...
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=...

# Booking engine
NEXT_PUBLIC_BOOKING_ENGINE=teamsystem
# Fase 2: wubook
WUBOOK_API_URL=...
WUBOOK_PROVIDER_KEY=...

# Analytics
NEXT_PUBLIC_GA_ID=G-...
```

---

## 14. NOTE IMPORTANTI

- Tutte le modifiche grafiche passano SOLO da lib/theme.ts
- Tutti i testi modificabili dal titolare devono essere in Sanity
- Nomi campi Sanity in italiano, interfaccia Studio semplificata
- BookingButton deve supportare dual mode senza riscrittura
- Font Playfair Display solo per h1, h2, h3 — Inter per tutto il resto
- Immagini sempre via next/image con alt text descrittivi
- Ogni pagina ha meta title e description da Sanity
- CITR hotel: 011016-ALB-0027 (da includere in footer)
- Coordinate GPS hotel: lat 44.0773612, lon 9.9127261
- Telefono: +39 0187 967400 / +39 335 7579786
- Email: info@hoteldelgolfo.com
- Indirizzo: Via Gerini 37, 19032 Lerici (SP)
EOF
echo "Done"
---

## 15. AGGIORNAMENTO — Sezione Soggiorni di Lavoro / Convenzioni Aziendali

### Contesto
L'hotel ha una clientela stabile di lavoratori del Porto di La Spezia e dell'area industriale circostante. Questo segmento è diverso dal turista estivo — soggiorni più lunghi, ricorrenti, con fatturazione aziendale. Vale la pena dargli visibilità dedicata sul sito.

### Aggiunta alla struttura pagine

Aggiungere voce nel menu principale:
```
Home | Camere | Ristorante | Esperienze | Lerici | Soggiorni lavoro | Offerte | Contatti
```

### Nuova pagina /lavoro (o /aziende)

```
Hero: foto reception o camera con sfondo sobrio
Titolo: "Per chi lavora nel Golfo"
Sottotitolo: "Tariffe dedicate per professionisti e aziende
              che operano nel Porto di La Spezia"

Sezione servizi:
  ✓ Tariffe dedicate per soggiorni prolungati (settimanali/mensili)
  ✓ Fatturazione aziendale e convenzioni con ditte
  ✓ Check-in/out flessibile per turni di lavoro
  ✓ Colazione dalle 6:00 per chi inizia presto
  ✓ WiFi ad alta velocità in tutte le camere
  ✓ Parcheggio (convenzione con parcheggio vicino)
  ✓ Ristorante con menu fisso economico per lavoratori
  ✓ Lavanderia su richiesta

Sezione convenzioni:
  Testo: "Collaboriamo con ditte, cooperative e aziende
  del distretto industriale di La Spezia da oltre 30 anni.
  Contattaci per definire una convenzione su misura."

  Form richiesta convenzione:
    Nome azienda (obbligatorio)
    Nome referente (obbligatorio)
    Email aziendale (obbligatorio)
    Telefono
    N° dipendenti stimati al mese
    Periodo (tutto l'anno / stagionale)
    Note
    → Invia richiesta → email a info@hoteldelgolfo.com

Eventuale: loghi aziende già convenzionate (se il titolare vuole mostrarli)
```

### Nuovo tipo Sanity: convenzioniAziendali (singleton)

```javascript
{
  titolo: LocaleString,
  sottotitolo: LocaleText,
  servizi: LocaleString[],    // lista servizi per lavoratori
  testoConvenzioni: LocaleText,
  emailRichieste: string,     // default: info@hoteldelgolfo.com
  mostraFormRichiesta: boolean,
  aziendeLogo: image[],       // opzionale, loghi aziende convenzionate
}
```

### Note per Claude Code

- La pagina /lavoro deve essere sobria e professionale — no elementi decorativi marini
- Tono: diretto e pratico (non turistico)
- Multilingua: IT e EN sufficienti (DE/FR meno rilevanti per questo segmento)
- Il form di richiesta convenzione invia email via API route Next.js → Brevo/SendGrid
  (da implementare quando sarà configurato il servizio email in Fase 2)
  Per ora: mailto link o form con Formspree come placeholder
- Aggiungere alla homepage una piccola sezione o banner:
  "Soggiorni di lavoro — Convenzioni aziendali per il Porto di La Spezia"
  con link a /lavoro

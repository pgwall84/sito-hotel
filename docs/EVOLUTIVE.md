# Evolutive future — sito web — non sviluppare ora

Backlog di gap noti, contenuti mancanti e miglioramenti rimandati
deliberatamente per `sito-hotel`. Creato il 06/08/2026, recuperando il
contenuto che prima viveva nelle Sezioni 16 e 17 di `SPEC_SITO_HOTEL.md`
(per tenere quel file leggero, stesso principio già applicato nel
gestionale il 26/07/2026) più i gap emersi da un confronto esplicito con
le pagine effettivamente costruite e con le prassi dei siti hotel leader
di settore (05-06/08/2026). Costo di ciascuna voce verificato il
06/08/2026 (pricing pubblico dei provider, non un preventivo — verificare
comunque prima di sottoscrivere). Nulla qui è urgente — si consulta quando
si torna a lavorare sul sito, non da lavorare proattivamente.

```
PRIORITÀ ALTA (blocca la qualità percepita o fa perdere contatti diretti):

  - [FATTO 06/08/2026] Invio email reale per /api/contact via Resend
    (lib/resend.ts). Riusa temporaneamente lo stesso account/API key già
    configurato nel gestionale (backend/.env) — sandbox mode: Resend
    consegna solo verso l'indirizzo con cui è stato creato l'account, non
    verso info@hoteldelgolfo.com finché non si verifica un dominio. Da
    sostituire con l'account aziendale definitivo quando disponibile
    (cambiare solo RESEND_API_KEY/RESEND_MITTENTE in .env, nessun codice).
    Variabili da impostare anche su Vercel (produzione), non solo in locale.
  - [FATTO 06/08/2026] Widget TripAdvisor ufficiale in home
    (components/home/TripAdvisorWidget.tsx), sotto la galleria. LocationId
    estratto dall'URL in Sanity (infoHotel.linkTripAdvisor, oggi vuoto —
    usa come fallback la scheda reale trovata via ricerca:
    tripadvisor.com/Hotel_Review-g194792-d567523-...). ATTENZIONE: i
    parametri dello script embed non sono stati generati/verificati dal
    Widget Center ufficiale (nessun accesso browser disponibile in quella
    sessione) — verificare a vista che il riquadro non resti vuoto una
    volta pubblicato; se serve, rigenerare l'embed da
    tripadvisor.com/Widgets e sostituirlo. Il link "leggi le recensioni"
    sotto al widget è invece un link diretto, sempre funzionante.
  - Dominio finale hoteldelgolfolerici.com non ancora collegato a Vercel
    — resta sull'URL provvisorio (https://sito-hotel-five.vercel.app).
    Blocca comunicazione pubblica del sito e penalizza la SEO (canonical/
    hreflang puntano già al dominio finale nel codice, ma il sito reale
    vive altrove).
    COSTO: gratis da collegare — è solo configurazione DNS su un dominio
    già di proprietà dell'hotel (nessun nuovo acquisto). **BLOCCATO
    (06/08/2026): il titolare non può ancora spostare il dominio su un
    altro server** — deciso di aspettare, non riproporlo proattivamente
    finché non lo riporta lui.

PRIORITÀ MEDIA (valore reale; costo quasi sempre nullo o basso, con
un'eccezione reale segnalata sotto):

  - [FATTO 06/08/2026] Messaggio "prenota diretto" sotto ai due CTA di
    prenotazione principali (Hero home + dettaglio camera):
    components/ui/PrenotaDirettoNote.tsx, testo in messages/*.json
    (namespace Booking). Scelta esplicita del titolare: nessuno sconto
    percentuale impegnativo ("non ho ancora deciso quanto scontare") —
    testo generico ("nessuna commissione, il prezzo migliore"). Copy da
    considerare provvisoria: se in futuro il titolare decide una
    percentuale precisa, va aggiornato solo il testo in messages/*.json,
    nessun cambio di codice.
  - Google Analytics 4 mai configurato (NEXT_PUBLIC_GA_ID vuota) — il
    banner cookie GDPR è pronto e gated correttamente, ma gira a vuoto.
    Il componente (components/analytics/GoogleAnalytics.tsx) è già
    scritto e già montato nel layout: non c'è sviluppo da fare, solo
    procurarsi il Measurement ID. COSTO: gratis (GA4 è gratuito a questi
    volumi). BLOCCATO (06/08/2026): titolare senza accesso all'account
    Google in quel momento — riprendere quando disponibile.

    Passaggi per procurarsi il Measurement ID (su analytics.google.com,
    con l'account Google da usare per l'hotel):
      1. Prima volta: "Inizia a misurare" → nome account (es. "Hotel del
         Golfo") → avanti.
      2. Nome proprietà: "Hotel del Golfo Lerici" → fuso orario Italia,
         valuta EUR.
      3. Info attività: categoria Ospitalità/Turismo, dimensione,
         obiettivo (es. "Genera contatti/prenotazioni").
      4. "Configura flusso di dati" → Web.
      5. URL: https://hoteldelgolfolerici.com (va bene anche se il
         dominio non è ancora collegato — è solo un riferimento). Nome
         stream: "Sito Hotel del Golfo".
      6. Lasciare "Misurazione avanzata" attiva (default).
      7. Nella pagina "Dettagli stream web": copiare il Measurement ID
         (formato G-XXXXXXXXXX).
      8. Impostarlo come NEXT_PUBLIC_GA_ID sia in .env.local (locale) sia
         nelle Environment Variables di Vercel (produzione) — nessun
         codice da toccare, si attiva da solo.
  - [FATTO 06/08/2026] Pulsante flottante "scrivici su WhatsApp" (link
    diretto wa.me, nessuna WhatsApp Business API): components/ui/
    WhatsAppButton.tsx, montato in app/[locale]/layout.tsx su tutte le
    pagine, numero da infoHotel.telefonoMobile (Sanity). Stesso pattern del
    competitor locale Hotel Florida. Automazione via WhatsApp Business API
    esplicitamente rimandata dal titolare — valutare separatamente se e
    quando serve (costo provider + nuovo modulo nel gestionale, non nel
    sito). Telegram richiesto insieme a WhatsApp ma non ancora fatto:
    manca un handle/account Telegram reale dell'hotel — verificare con il
    titolare se esiste prima di costruire un bottone che punta a niente.
  - Instagram feed e Facebook Pixel previsti in spec (Sezione 1.11 di
    CLAUDE.md gestionale), mai implementati: stesso pattern del
    TripAdvisor, solo un link statico in footer, nessun embed reale.
    COSTO: Facebook Pixel gratis (solo un account Meta Business). Feed
    Instagram gratis con limiti su provider come Elfsight/Common Ninja/
    EmbedSocial (di solito numero di post o branding limitati sul piano
    free) — verificare il piano specifico scelto prima di promettere
    "gratis" senza condizioni.
  - Privacy policy e cookie policy: testo placeholder, mai passato da un
    legale o da Iubenda (segnalato già in Sezione 17 di SPEC_SITO_HOTEL.md
    dalla sessione 15/07/2026, mai risolto).
    COSTO: **non gratis nella sostanza, unica eccezione reale di questa
    lista.** Il piano Free di Iubenda copre solo siti sotto 1.000
    pageview/mese e mostra il branding Iubenda — per una revisione seria,
    sufficiente a coprire un hotel con traffico reale, serve il piano
    Essentials (~5€/mese fatturato annuale) o una revisione diretta da un
    legale/DPO (costo variabile, probabilmente più alto). Non rimandarla
    aspettando che diventi gratis: non lo sarà.
  - Sezione "colazione" in homepage (foto, prodotti tipici liguri, orario
    servizio) — annotata come evolutiva già dalla spec originale, mai
    scritta.
    COSTO: gratis — solo sviluppo + contenuti già disponibili.
  - /lerici — sezione itinerari dettagliati con mappa e durate escursioni,
    mai aggiunta.
    COSTO: gratis — solo sviluppo + contenuti dal titolare.
  - Aggiornare distanze/tempi reali per i borghi vicini (Cinque Terre,
    Portovenere, Tellaro, La Spezia) nel JSON-LD e nei testi — oggi
    probabilmente segnaposto.
    COSTO: gratis.

PRIORITÀ BASSA / FUTURA (alto valore ma dipende da altro lavoro non ancora
fatto, o alta complessità — qui il costo varia molto per voce):

  - Nessun assistente/chat in tempo reale sul sito: l'incertezza è la
    prima causa di abbandono verso le OTA, i siti con chat/AI assistant
    mostrano un incremento relativo di conversione diretta ~35% secondo
    i benchmark di settore 2026. Da valutare un provider dopo che ci sarà
    davvero qualcosa da "vendere" in chat (vedi punto sotto).
    COSTO: dipende da cosa si vuole davvero. Chat dal vivo semplice (senza
    AI) gratis — Crisp "Free Forever" copre 2 operatori e conversazioni
    illimitate, chatbot solo a regole predefinite. Un vero assistente AI
    invece costa: Tidio ha un piano free (50 conversazioni/mese) ma l'add-
    on AI (Lyro) parte da circa 32-39$/mese a parte. Se l'obiettivo è
    l'incremento di conversione del 35% citato sopra, è l'AI che serve —
    quindi questa voce non è gratis come le altre, va scelta consapevoli
    del costo ricorrente.
  - Disponibilità/prezzo mostrati direttamente in pagina: oggi "Prenota"
    è solo un redirect esterno al widget TeamSystem (BookingButton in
    modalità 'teamsystem'), zero calendario o prezzo visibile senza
    uscire dal sito. Risolto strutturalmente solo in Fase 2 col
    calendario custom su API WuBook (già previsto in
    SPEC_SITO_HOTEL.md Sezione 10) — non anticipabile prima.
    COSTO: non gratis, ma già noto e già in roadmap — WuBook channel
    manager (~21€/mese) + booking engine (~27€/mese), vedi
    `docs/EVOLUTIVE.md` del gestionale, sezione decisioni strategiche
    Fase 2. Nessun costo aggiuntivo oltre a quello già previsto.
  - Remarketing verso ospiti passati integrato nel sito (voucher/sconto
    per chi riprenota diretto): oggi "Offerte" vive solo lato gestionale
    via email (modulo 5.3), il sito non ha una landing dedicata da
    collegare a quelle campagne.
    COSTO: gratis — si appoggia a Resend, già in uso lato gestionale.
  - Audit formale Core Web Vitals (Lighthouse/PageSpeed): è lo Step 11
    della sequenza di sviluppo in SPEC_SITO_HOTEL.md Sezione 12, ma non
    risulta mai eseguito concretamente — non ha comunque senso misurarlo
    seriamente finché il sito ha contenuti/foto segnaposto e non il
    dominio finale.
    COSTO: gratis — Lighthouse e PageSpeed Insights sono strumenti
    gratuiti di Google.

CONTENUTI DA AGGIORNARE IN SANITY (titolare, non sviluppo — recuperato da
SPEC_SITO_HOTEL.md Sezione 16, nessun costo, solo tempo del titolare):
  - Descrizioni camere complete e accattivanti
  - Foto ristorante aggiuntive
  - Descrizione degustazione pesto approfondita
  - Testi pagina soggiorni lavoro /lavoro
  - Foto ingresso hotel: ancora in public/temp-old-photos/, in attesa di
    valutazione (l'originale non convince al titolare)
```

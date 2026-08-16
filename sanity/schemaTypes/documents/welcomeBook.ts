import { defineField, defineType } from "sanity";

// Welcome Book digitale (modulo 4.2) — pagina raggiungibile solo da QR in
// camera o link diretto, MAI dal menu pubblico del sito (contiene la
// password WiFi, non deve comparire in navigazione né essere indicizzata —
// vedi app/[locale]/(benvenuto)/benvenuto/page.tsx, robots noindex e
// assente da sitemap.ts). Contatti reception e link al menu ristorante sono
// già in infoHotel/sezioneRistorante — non duplicati qui.
//
// Redesign 16/08/2026: da 6 a 15 sezioni. Le 8 sezioni a elenco di luoghi
// (Trasporti, Servizi, Attività, Ristoranti esterni, Bar, Shopping,
// Informazioni, Emergenza) usano il tipo riusabile "luogo" (vedi
// objects/luogo.ts). "consigliLerici"/"consigliLericiTitolo" sono stati
// rimossi (contenuto vuoto/bozza, confermato dal titolare) — sostituiti da
// "posizioneTesto".
export const welcomeBook = defineType({
  name: "welcomeBook",
  title: "Welcome Book (QR camere)",
  type: "document",
  fields: [
    defineField({ name: "titoloBenvenuto", title: "Titolo di benvenuto", type: "localeString" }),
    defineField({ name: "messaggioBenvenuto", title: "Messaggio di benvenuto", type: "localeText" }),

    defineField({ name: "wifiNome", title: "Nome rete WiFi (SSID)", type: "string" }),
    defineField({ name: "wifiPassword", title: "Password WiFi", type: "string" }),

    defineField({ name: "orariCheckin", title: "Orario check-in", type: "string" }),
    defineField({ name: "orariCheckout", title: "Orario check-out", type: "string" }),
    defineField({
      name: "orariColazione",
      title: "Orario colazione",
      description: "Mostrato nella pagina Servizi del Welcome Book.",
      type: "string",
    }),

    defineField({
      name: "regoleCasa",
      title: "Regole della casa",
      type: "array",
      of: [{ type: "localeString" }],
    }),

    defineField({
      name: "numeriUtili",
      title: "Numeri utili",
      description: "Es. Farmacia, Guardia medica, Taxi — reception e telefono hotel sono già in Info Hotel, non ripeterli qui.",
      type: "array",
      of: [
        {
          type: "object",
          name: "numeroUtile",
          fields: [
            defineField({ name: "etichetta", title: "Etichetta", type: "localeString" }),
            defineField({ name: "valore", title: "Numero / valore", type: "string" }),
          ],
          preview: {
            select: { title: "etichetta.it", subtitle: "valore" },
          },
        },
      ],
    }),

    defineField({ name: "posizioneLat", title: "Posizione — Latitudine hotel", type: "number" }),
    defineField({ name: "posizioneLon", title: "Posizione — Longitudine hotel", type: "number" }),
    defineField({
      name: "posizioneTesto",
      title: "Posizione — presentazione breve del borgo",
      type: "localeText",
    }),

    defineField({ name: "trasporti", title: "Trasporti", type: "array", of: [{ type: "luogo" }] }),
    defineField({ name: "servizi", title: "Servizi", type: "array", of: [{ type: "luogo" }] }),
    defineField({ name: "attivita", title: "Attività", type: "array", of: [{ type: "luogo" }] }),
    defineField({
      name: "ristorantiEsterni",
      title: "Ristoranti — altri consigli",
      description: "Consigli esterni oltre al ristorante dell'hotel (letto da Sezione Ristorante).",
      type: "array",
      of: [{ type: "luogo" }],
    }),
    defineField({ name: "bar", title: "Bar", type: "array", of: [{ type: "luogo" }] }),
    defineField({ name: "shopping", title: "Shopping", type: "array", of: [{ type: "luogo" }] }),
    defineField({
      name: "informazioni",
      title: "Informazioni",
      description: "Banca/bancomat, supermercati, chiese, benzinai, raccolta rifiuti, ecc.",
      type: "array",
      of: [{ type: "luogo" }],
    }),
    defineField({
      name: "emergenza",
      title: "Emergenza",
      description: "112, pronto soccorso, farmacie (elenco fisso, non calcolato), forze dell'ordine, guardia costiera.",
      type: "array",
      of: [{ type: "luogo" }],
    }),
  ],
  preview: {
    prepare: () => ({ title: "Welcome Book" }),
  },
});

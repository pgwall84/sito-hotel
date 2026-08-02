import { defineField, defineType } from "sanity";

// Welcome Book digitale (modulo 4.2) — pagina raggiungibile solo da QR in
// camera o link diretto, MAI dal menu pubblico del sito (contiene la
// password WiFi, non deve comparire in navigazione né essere indicizzata —
// vedi app/[locale]/benvenuto/page.tsx, robots noindex e assente da
// sitemap.ts). Contatti reception e link al menu ristorante sono già in
// infoHotel/sezioneRistorante — non duplicati qui, letti a parte dalla pagina.
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
    defineField({ name: "orariColazione", title: "Orario colazione", type: "string" }),

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

    defineField({
      name: "consigliLericiTitolo",
      title: "Titolo sezione consigli Lerici",
      type: "localeString",
    }),
    defineField({
      name: "consigliLerici",
      title: "Consigli brevi su Lerici",
      description: "3-4 spunti brevi — per l'approfondimento la pagina rimanda a /lerici, non serve ripetere i contenuti di quella pagina.",
      type: "array",
      of: [{ type: "localeString" }],
    }),
  ],
  preview: {
    prepare: () => ({ title: "Welcome Book" }),
  },
});

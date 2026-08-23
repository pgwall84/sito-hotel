import { defineField, defineType } from "sanity";

const SERVIZI = [
  { title: "WiFi", value: "wifi" },
  { title: "TV", value: "tv" },
  { title: "Aria condizionata", value: "aria-condizionata" },
  { title: "Vista mare", value: "vista-mare" },
  { title: "Balcone", value: "balcone" },
  { title: "Minibar", value: "minibar" },
  { title: "Cassaforte", value: "cassaforte" },
  { title: "Bagno privato", value: "bagno-privato" },
  // Aggiunti 19/08/2026 (Booking Engine v2, contenuti camere) — servizi
  // trasversali confermati dal titolare per le camere dell'hotel.
  { title: "Colazione inclusa", value: "colazione-inclusa" },
  { title: "Parcheggio", value: "parcheggio" },
  { title: "Sky", value: "sky" },
];

export const camera = defineType({
  name: "camera",
  title: "Camera",
  type: "document",
  fields: [
    defineField({ name: "nome", title: "Nome", type: "localeString", validation: (Rule) => Rule.required() }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "nome.it" },
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: "descrizione", title: "Descrizione", type: "localeText" }),
    defineField({ name: "capienza", title: "Capienza (persone)", type: "number" }),
    defineField({ name: "piano", title: "Piano", type: "number" }),
    defineField({ name: "mq", title: "Metri quadri", type: "number" }),
    defineField({ name: "prezzoBase", title: "Prezzo a partire da (€)", type: "number" }),
    defineField({ name: "fotoPrincipale", title: "Foto principale", type: "image" }),
    defineField({ name: "galleria", title: "Galleria foto", type: "array", of: [{ type: "image" }] }),
    defineField({
      name: "servizi",
      title: "Servizi",
      type: "array",
      of: [{ type: "string" }],
      options: { list: SERVIZI, layout: "grid" },
    }),
    defineField({ name: "disponibile", title: "Disponibile", type: "boolean", initialValue: true }),
    defineField({ name: "ordine", title: "Ordine", type: "number" }),
    defineField({
      name: "tipoCameraId",
      title: "ID tipo camera (gestionale)",
      type: "number",
      description:
        "Collega questa camera al tipo camera corrispondente nel gestionale (tabella tipi_camera). " +
        "Necessario perché il Booking Engine Diretto (/prenota sul sito) possa mostrare foto/descrizione/servizi " +
        "presi da qui accanto a prezzo e disponibilità, che restano sempre calcolati dal gestionale. " +
        "Compilato con lo script backend/scripts/collegaSanityTipiCamera.js (gestionale-hotel) — " +
        "modulo Booking Engine v2, Fase B, 19/08/2026.",
    }),
  ],
  orderings: [
    { title: "Ordine", name: "ordineAsc", by: [{ field: "ordine", direction: "asc" }] },
  ],
  preview: {
    select: { title: "nome.it", subtitle: "prezzoBase", media: "fotoPrincipale" },
    prepare: ({ title, subtitle, media }) => ({
      title,
      subtitle: subtitle ? `da €${subtitle}` : undefined,
      media,
    }),
  },
});

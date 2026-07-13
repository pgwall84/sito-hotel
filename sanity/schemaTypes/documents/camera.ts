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

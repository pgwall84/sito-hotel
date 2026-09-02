import { defineField, defineType } from "sanity";

export const escursione = defineType({
  name: "escursione",
  title: "Escursione / dintorno",
  type: "document",
  fields: [
    defineField({ name: "titolo", title: "Titolo", type: "localeString", validation: (Rule) => Rule.required() }),
    defineField({ name: "sottotitolo", title: "Sottotitolo (es. distanza o tipo)", type: "localeString" }),
    defineField({ name: "descrizione", title: "Descrizione breve", type: "localeText" }),
    defineField({ name: "foto", title: "Foto", type: "image" }),
    defineField({ name: "link", title: "Link (opzionale)", type: "url" }),
    defineField({ name: "ordine", title: "Ordine", type: "number" }),
  ],
  preview: {
    select: { title: "titolo.it", media: "foto" },
  },
});

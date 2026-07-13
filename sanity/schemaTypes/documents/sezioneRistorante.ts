import { defineField, defineType } from "sanity";

export const sezioneRistorante = defineType({
  name: "sezioneRistorante",
  title: "Sezione Ristorante",
  type: "document",
  fields: [
    defineField({ name: "titolo", title: "Titolo", type: "localeString" }),
    defineField({ name: "descrizione", title: "Descrizione", type: "localeText" }),
    defineField({ name: "foto", title: "Foto", type: "array", of: [{ type: "image" }] }),
    defineField({ name: "specialita", title: "Specialità", type: "array", of: [{ type: "localeString" }] }),
    defineField({ name: "orari", title: "Orari", type: "string" }),
    defineField({ name: "linkMenu", title: "Link menu (gestionale)", type: "url" }),
  ],
  preview: {
    select: { title: "titolo.it" },
  },
});

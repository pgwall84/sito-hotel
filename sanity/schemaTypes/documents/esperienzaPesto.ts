import { defineField, defineType } from "sanity";

export const esperienzaPesto = defineType({
  name: "esperienzaPesto",
  title: "Esperienza Pesto",
  type: "document",
  fields: [
    defineField({ name: "titolo", title: "Titolo", type: "localeString" }),
    defineField({ name: "descrizione", title: "Descrizione", type: "localeText" }),
    defineField({ name: "foto", title: "Foto", type: "array", of: [{ type: "image" }] }),
    defineField({ name: "visitatoriStagione", title: "Ospiti a stagione", type: "number" }),
    defineField({ name: "durata", title: "Durata", type: "localeString" }),
    defineField({ name: "prezzo", title: "Prezzo (€)", type: "number" }),
    defineField({ name: "comePrenot", title: "Come prenotare", type: "localeText" }),
  ],
  preview: {
    select: { title: "titolo.it" },
  },
});

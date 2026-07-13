import { defineField, defineType } from "sanity";

export const offerta = defineType({
  name: "offerta",
  title: "Offerta",
  type: "document",
  fields: [
    defineField({ name: "titolo", title: "Titolo", type: "localeString", validation: (Rule) => Rule.required() }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "titolo.it" },
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: "descrizione", title: "Descrizione", type: "localeText" }),
    defineField({ name: "prezzo", title: "Prezzo (€)", type: "number" }),
    defineField({ name: "prezzoBarrato", title: "Prezzo barrato (€)", type: "number" }),
    defineField({ name: "foto", title: "Foto", type: "image" }),
    defineField({ name: "dataInizio", title: "Data inizio validità", type: "date" }),
    defineField({ name: "dataFine", title: "Data fine validità", type: "date" }),
    defineField({ name: "evidenziata", title: "In evidenza", type: "boolean", initialValue: false }),
    defineField({ name: "incluso", title: "Cosa include", type: "localeText" }),
    defineField({ name: "attiva", title: "Attiva", type: "boolean", initialValue: true }),
  ],
  preview: {
    select: { title: "titolo.it", subtitle: "prezzo", media: "foto" },
    prepare: ({ title, subtitle, media }) => ({
      title,
      subtitle: subtitle ? `€${subtitle}` : undefined,
      media,
    }),
  },
});

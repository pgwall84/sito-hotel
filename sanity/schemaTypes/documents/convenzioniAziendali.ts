import { defineField, defineType } from "sanity";

export const convenzioniAziendali = defineType({
  name: "convenzioniAziendali",
  title: "Convenzioni Aziendali",
  type: "document",
  fields: [
    defineField({ name: "titolo", title: "Titolo", type: "localeString" }),
    defineField({ name: "sottotitolo", title: "Sottotitolo", type: "localeText" }),
    defineField({
      name: "servizi",
      title: "Servizi per lavoratori",
      type: "array",
      of: [{ type: "localeString" }],
    }),
    defineField({ name: "testoConvenzioni", title: "Testo convenzioni", type: "localeText" }),
    defineField({
      name: "emailRichieste",
      title: "Email richieste",
      type: "string",
      initialValue: "info@hoteldelgolfo.com",
    }),
    defineField({
      name: "mostraFormRichiesta",
      title: "Mostra form richiesta",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "aziendeLogo",
      title: "Loghi aziende convenzionate",
      type: "array",
      of: [{ type: "image" }],
    }),
  ],
  preview: {
    select: { title: "titolo.it" },
  },
});

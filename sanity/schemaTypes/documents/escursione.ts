import { defineField, defineType } from "sanity";

export const escursione = defineType({
  name: "escursione",
  title: "Escursione / dintorno",
  type: "document",
  fields: [
    defineField({ name: "titolo", title: "Titolo", type: "localeString", validation: (Rule) => Rule.required() }),
    defineField({ name: "sottotitolo", title: "Sottotitolo (es. distanza o tipo)", type: "localeString" }),
    defineField({
      name: "slug",
      title: "Indirizzo della pagina (slug)",
      description: "Genera la pagina /esperienze/<slug>. Se vuoto, la scheda usa il campo Link (se presente) o resta non cliccabile.",
      type: "slug",
      options: { source: "titolo.it", maxLength: 60 },
    }),
    defineField({ name: "descrizione", title: "Descrizione breve (scheda)", type: "localeText" }),
    defineField({
      name: "descrizioneEstesa",
      title: "Descrizione estesa (pagina dedicata)",
      description: "Testo mostrato nella pagina dell'esperienza. Separa i paragrafi con una riga vuota.",
      type: "localeText",
    }),
    defineField({ name: "foto", title: "Foto (una o più)", type: "array", of: [{ type: "image" }] }),
    defineField({ name: "link", title: "Link esterno (opzionale, usato solo se manca lo slug)", type: "url" }),
    defineField({ name: "ordine", title: "Ordine", type: "number" }),
  ],
  preview: {
    select: { title: "titolo.it", media: "foto.0" },
  },
});

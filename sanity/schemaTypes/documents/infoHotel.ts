import { defineField, defineType } from "sanity";

export const infoHotel = defineType({
  name: "infoHotel",
  title: "Info Hotel",
  type: "document",
  fields: [
    defineField({ name: "nome", title: "Nome", type: "string", validation: (Rule) => Rule.required() }),
    defineField({ name: "claim", title: "Claim", type: "localeString" }),
    defineField({ name: "descrizione", title: "Descrizione", type: "localeText" }),
    defineField({ name: "telefono", title: "Telefono", type: "string" }),
    defineField({ name: "telefonoMobile", title: "Telefono cellulare", type: "string" }),
    defineField({ name: "email", title: "Email", type: "string" }),
    defineField({ name: "indirizzo", title: "Indirizzo", type: "string" }),
    defineField({ name: "citta", title: "Città", type: "string" }),
    defineField({ name: "cap", title: "CAP", type: "string" }),
    defineField({ name: "provincia", title: "Provincia", type: "string" }),
    defineField({ name: "latitudine", title: "Latitudine", type: "number" }),
    defineField({ name: "longitudine", title: "Longitudine", type: "number" }),
    defineField({ name: "citr", title: "CITR", type: "string" }),
    defineField({ name: "partitaIva", title: "Partita IVA", type: "string" }),
    defineField({ name: "linkFacebook", title: "Link Facebook", type: "url" }),
    defineField({ name: "linkInstagram", title: "Link Instagram", type: "url" }),
    defineField({ name: "linkTripAdvisor", title: "Link TripAdvisor", type: "url" }),
    defineField({ name: "logo", title: "Logo", type: "image" }),
    defineField({
      name: "immagineHero",
      title: "Immagine Hero (homepage)",
      description: "Foto a piena larghezza usata come sfondo dell'hero in home. Orientamento orizzontale, alta risoluzione.",
      type: "image",
    }),
    defineField({ name: "orariReception", title: "Orari reception", type: "string" }),
  ],
  preview: {
    select: { title: "nome" },
  },
});

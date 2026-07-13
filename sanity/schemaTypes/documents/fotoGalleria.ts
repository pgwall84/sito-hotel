import { defineField, defineType } from "sanity";

const CATEGORIE = [
  { title: "Hotel", value: "hotel" },
  { title: "Camere", value: "camere" },
  { title: "Ristorante", value: "ristorante" },
  { title: "Lerici", value: "lerici" },
];

export const fotoGalleria = defineType({
  name: "fotoGalleria",
  title: "Foto galleria",
  type: "document",
  fields: [
    defineField({ name: "foto", title: "Foto", type: "image", validation: (Rule) => Rule.required() }),
    defineField({ name: "didascalia", title: "Didascalia", type: "localeString" }),
    defineField({
      name: "categoria",
      title: "Categoria",
      type: "string",
      options: { list: CATEGORIE },
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: "ordine", title: "Ordine", type: "number" }),
  ],
  orderings: [
    { title: "Ordine", name: "ordineAsc", by: [{ field: "ordine", direction: "asc" }] },
  ],
  preview: {
    select: { title: "didascalia.it", subtitle: "categoria", media: "foto" },
  },
});

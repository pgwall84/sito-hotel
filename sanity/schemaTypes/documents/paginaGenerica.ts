import { defineField, defineType } from "sanity";

export const paginaGenerica = defineType({
  name: "paginaGenerica",
  title: "Pagina generica",
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
    defineField({ name: "contenuto", title: "Contenuto", type: "localePortableText" }),
  ],
  preview: {
    select: { title: "titolo.it" },
  },
});

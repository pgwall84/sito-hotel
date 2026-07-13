import { defineField, defineType } from "sanity";

export const localeText = defineType({
  name: "localeText",
  title: "Testo lungo multilingua",
  type: "object",
  fields: [
    defineField({ name: "it", title: "Italiano", type: "text", rows: 4, validation: (Rule) => Rule.required() }),
    defineField({ name: "en", title: "Inglese", type: "text", rows: 4 }),
    defineField({ name: "de", title: "Tedesco", type: "text", rows: 4 }),
    defineField({ name: "fr", title: "Francese", type: "text", rows: 4 }),
  ],
});

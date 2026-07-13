import { defineField, defineType } from "sanity";

export const localeString = defineType({
  name: "localeString",
  title: "Testo multilingua",
  type: "object",
  fields: [
    defineField({ name: "it", title: "Italiano", type: "string", validation: (Rule) => Rule.required() }),
    defineField({ name: "en", title: "Inglese", type: "string" }),
    defineField({ name: "de", title: "Tedesco", type: "string" }),
    defineField({ name: "fr", title: "Francese", type: "string" }),
  ],
});

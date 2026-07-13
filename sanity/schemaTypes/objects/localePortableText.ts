import { defineField, defineType } from "sanity";

const block = { type: "block" as const };

export const localePortableText = defineType({
  name: "localePortableText",
  title: "Testo ricco multilingua",
  type: "object",
  fields: [
    defineField({ name: "it", title: "Italiano", type: "array", of: [block], validation: (Rule) => Rule.required() }),
    defineField({ name: "en", title: "Inglese", type: "array", of: [block] }),
    defineField({ name: "de", title: "Tedesco", type: "array", of: [block] }),
    defineField({ name: "fr", title: "Francese", type: "array", of: [block] }),
  ],
});

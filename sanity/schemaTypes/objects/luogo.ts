import { defineField, defineType } from "sanity";

// Oggetto riusabile per ogni "luogo/consiglio" del Welcome Book digitale
// (Trasporti, Servizi, Attività, Ristoranti esterni, Bar, Shopping,
// Informazioni, Emergenza — vedi docs/superpowers/specs/2026-08-16-
// welcome-book-design.md). Tutti i campi opzionali tranne "nome".
// "categoria" pilota l'icona mostrata da LuogoCard (components/ui/
// LuogoCard.tsx) — se si aggiunge un valore qui, aggiungere anche la riga
// corrispondente nella mappa icone di quel componente.
export const luogo = defineType({
  name: "luogo",
  title: "Luogo / consiglio",
  type: "object",
  fields: [
    defineField({
      name: "nome",
      title: "Nome",
      type: "localeString",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "categoria",
      title: "Categoria (icona)",
      type: "string",
      options: {
        list: [
          { title: "Farmacia", value: "farmacia" },
          { title: "Banca / Bancomat", value: "banca-bancomat" },
          { title: "Supermercato", value: "supermercato" },
          { title: "Chiesa", value: "chiesa" },
          { title: "Stazione di servizio", value: "benzina" },
          { title: "Taxi", value: "taxi" },
          { title: "Bus", value: "bus" },
          { title: "Traghetto", value: "traghetto" },
          { title: "Navetta", value: "navetta" },
          { title: "Ascensore pubblico", value: "ascensore" },
          { title: "Ristorante", value: "ristorante" },
          { title: "Bar", value: "bar" },
          { title: "Negozio", value: "negozio" },
          { title: "Spiaggia", value: "spiaggia" },
          { title: "Attività / Noleggio", value: "noleggio-attivita" },
          { title: "Soccorso / Emergenza", value: "soccorso" },
          { title: "Forze dell'ordine", value: "forze-ordine" },
          { title: "Guardia costiera", value: "guardia-costiera" },
          { title: "Comune / Turismo", value: "comune-turismo" },
          { title: "Altro", value: "altro" },
        ],
      },
    }),
    defineField({ name: "indirizzo", title: "Indirizzo", type: "string" }),
    defineField({ name: "nota", title: "Nota breve", type: "localeText" }),
    defineField({ name: "telefono", title: "Telefono", type: "string" }),
    defineField({
      name: "lat",
      title: "Latitudine",
      type: "number",
      validation: (Rule) =>
        Rule.custom((lat, ctx) => {
          const lon = (ctx.parent as { lon?: number })?.lon;
          if ((lat != null) !== (lon != null)) return "Lat e lon vanno inserite insieme";
          return true;
        }),
    }),
    defineField({
      name: "lon",
      title: "Longitudine",
      type: "number",
      validation: (Rule) =>
        Rule.custom((lon, ctx) => {
          const lat = (ctx.parent as { lat?: number })?.lat;
          if ((lon != null) !== (lat != null)) return "Lat e lon vanno inserite insieme";
          return true;
        }),
    }),
    defineField({ name: "link", title: "Link (sito o Google Maps)", type: "url" }),
  ],
  preview: {
    select: { title: "nome.it", subtitle: "indirizzo" },
  },
});

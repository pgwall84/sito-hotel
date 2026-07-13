import type { StructureResolver } from "sanity/structure";

const SINGLETONS = [
  "infoHotel",
  "esperienzaPesto",
  "sezioneRistorante",
  "convenzioniAziendali",
] as const;

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) =>
  S.list()
    .title("Contenuti")
    .items([
      S.listItem()
        .title("Info Hotel")
        .child(S.document().schemaType("infoHotel").documentId("infoHotel")),
      S.listItem()
        .title("Esperienza Pesto")
        .child(S.document().schemaType("esperienzaPesto").documentId("esperienzaPesto")),
      S.listItem()
        .title("Sezione Ristorante")
        .child(S.document().schemaType("sezioneRistorante").documentId("sezioneRistorante")),
      S.listItem()
        .title("Convenzioni Aziendali")
        .child(S.document().schemaType("convenzioniAziendali").documentId("convenzioniAziendali")),
      S.divider(),
      ...S.documentTypeListItems().filter(
        (item) => !SINGLETONS.includes(item.getId() as (typeof SINGLETONS)[number])
      ),
    ]);

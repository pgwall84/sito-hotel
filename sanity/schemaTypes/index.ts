import { type SchemaTypeDefinition } from "sanity";

import { localeString } from "./objects/localeString";
import { localeText } from "./objects/localeText";
import { localePortableText } from "./objects/localePortableText";

import { infoHotel } from "./documents/infoHotel";
import { camera } from "./documents/camera";
import { offerta } from "./documents/offerta";
import { esperienzaPesto } from "./documents/esperienzaPesto";
import { paginaGenerica } from "./documents/paginaGenerica";
import { fotoGalleria } from "./documents/fotoGalleria";
import { sezioneRistorante } from "./documents/sezioneRistorante";
import { convenzioniAziendali } from "./documents/convenzioniAziendali";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    // oggetti multilingua riutilizzabili
    localeString,
    localeText,
    localePortableText,
    // documenti
    infoHotel,
    camera,
    offerta,
    esperienzaPesto,
    paginaGenerica,
    fotoGalleria,
    sezioneRistorante,
    convenzioniAziendali,
  ],
};

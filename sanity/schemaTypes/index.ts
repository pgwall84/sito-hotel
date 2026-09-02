import { type SchemaTypeDefinition } from "sanity";

import { localeString } from "./objects/localeString";
import { localeText } from "./objects/localeText";
import { localePortableText } from "./objects/localePortableText";
import { luogo } from "./objects/luogo";

import { infoHotel } from "./documents/infoHotel";
import { camera } from "./documents/camera";
import { offerta } from "./documents/offerta";
import { esperienzaPesto } from "./documents/esperienzaPesto";
import { escursione } from "./documents/escursione";
import { paginaGenerica } from "./documents/paginaGenerica";
import { fotoGalleria } from "./documents/fotoGalleria";
import { sezioneRistorante } from "./documents/sezioneRistorante";
import { convenzioniAziendali } from "./documents/convenzioniAziendali";
import { welcomeBook } from "./documents/welcomeBook";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    // oggetti multilingua riutilizzabili
    localeString,
    localeText,
    localePortableText,
    luogo,
    // documenti
    infoHotel,
    camera,
    offerta,
    esperienzaPesto,
    escursione,
    paginaGenerica,
    fotoGalleria,
    sezioneRistorante,
    convenzioniAziendali,
    welcomeBook,
  ],
};

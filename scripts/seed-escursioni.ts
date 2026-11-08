// Aggiorna le esperienze GIÀ presenti su Sanity ("Cinque Terre" e "Portovenere")
// con i testi (scheda + pagina dedicata) e lo slug della pagina /esperienze/<slug>.
//
// NON crea documenti nuovi. NON tocca titolo, sottotitolo, ordine e foto.
// Imposta: slug, descrizione, descrizioneEstesa; rimuove il vecchio link (che
// puntava a /lerici). Elimina inoltre i due documenti duplicati creati per errore
// dalla prima versione di questo script (escursione-cinque-terre,
// escursione-portovenere), ma solo se non hanno foto.
//
// Prima prova a vuoto (non scrive nulla, mostra cosa farebbe):
//   npx sanity exec scripts/seed-escursioni.ts --with-user-token
// Poi applica davvero:
//   APPLY=1 npx sanity exec scripts/seed-escursioni.ts --with-user-token
import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2024-01-01" });

const ESPERIENZE = [
  {
    _id: "escursione-cinque-terre",
    ordine: 1,
    slug: "cinque-terre",
    titolo: { it: "Cinque Terre", en: "Cinque Terre", de: "Cinque Terre", fr: "Cinque Terre" },
    sottotitolo: {
      it: "Cinque borghi sul mare · Patrimonio UNESCO",
      en: "Five seaside villages · UNESCO World Heritage",
      de: "Fünf Dörfer am Meer · UNESCO-Welterbe",
      fr: "Cinq villages en bord de mer · Patrimoine mondial de l'UNESCO",
    },
    descrizione: {
      it: `Cinque borghi a picco sul mare tra vigneti terrazzati e sentieri panoramici: Monterosso, Vernazza, Corniglia, Manarola e Riomaggiore.`,
      en: `Five villages clinging to the sea cliffs, between terraced vineyards and scenic trails: Monterosso, Vernazza, Corniglia, Manarola and Riomaggiore.`,
      de: `Fünf Dörfer direkt über dem Meer, zwischen Weinterrassen und Panoramawegen: Monterosso, Vernazza, Corniglia, Manarola und Riomaggiore.`,
      fr: `Cinq villages perchés au-dessus de la mer, entre vignes en terrasses et sentiers panoramiques : Monterosso, Vernazza, Corniglia, Manarola et Riomaggiore.`,
    },
    descrizioneEstesa: {
      it: `Le Cinque Terre sono cinque piccoli borghi aggrappati alla costa ligure — Monterosso, Vernazza, Corniglia, Manarola e Riomaggiore — circondati da vigneti terrazzati che scendono fino al mare. Insieme a Portovenere e alle sue isole sono Patrimonio Mondiale UNESCO.

Si visitano in treno, in battello o a piedi lungo i sentieri panoramici, alcuni facili, altri più impegnativi. Ogni borgo ha il suo carattere: la spiaggia e il pesce fresco a Monterosso, i vicoli e il porticciolo di Vernazza, il belvedere di Corniglia, il tramonto a Manarola.

Da Lerici è una gita comoda in giornata. Ti consigliamo di partire presto, di portare scarpe comode e di evitare le ore centrali nei mesi estivi. In reception ti aiutiamo con orari e collegamenti.`,
      en: `The Cinque Terre are five small villages clinging to the Ligurian coast — Monterosso, Vernazza, Corniglia, Manarola and Riomaggiore — surrounded by terraced vineyards that run down to the sea. Together with Portovenere and its islands they are a UNESCO World Heritage Site.

You can visit them by train, by boat or on foot along scenic trails, some easy, some more demanding. Each village has its own character: the beach and fresh fish in Monterosso, the alleys and little harbour of Vernazza, the viewpoint of Corniglia, the sunset in Manarola.

From Lerici it makes a comfortable day trip. We suggest starting early, wearing comfortable shoes and avoiding the middle of the day in summer. Our reception team is happy to help with timetables and connections.`,
      de: `Die Cinque Terre sind fünf kleine Dörfer an der ligurischen Küste — Monterosso, Vernazza, Corniglia, Manarola und Riomaggiore —, umgeben von Weinterrassen, die bis ans Meer reichen. Zusammen mit Portovenere und seinen Inseln gehören sie zum UNESCO-Welterbe.

Man besucht sie mit dem Zug, per Boot oder zu Fuß auf Panoramawegen, teils einfach, teils anspruchsvoller. Jedes Dorf hat seinen eigenen Charakter: Strand und frischer Fisch in Monterosso, Gassen und kleiner Hafen in Vernazza, der Aussichtspunkt von Corniglia, der Sonnenuntergang in Manarola.

Von Lerici aus ist es ein bequemer Tagesausflug. Wir empfehlen, früh zu starten, bequeme Schuhe zu tragen und im Sommer die Mittagshitze zu meiden. An der Rezeption helfen wir gern mit Fahrplänen und Verbindungen.`,
      fr: `Les Cinque Terre sont cinq petits villages accrochés à la côte ligure — Monterosso, Vernazza, Corniglia, Manarola et Riomaggiore — entourés de vignes en terrasses qui descendent jusqu'à la mer. Avec Portovenere et ses îles, ils sont inscrits au patrimoine mondial de l'UNESCO.

On les visite en train, en bateau ou à pied par des sentiers panoramiques, certains faciles, d'autres plus exigeants. Chaque village a son caractère : la plage et le poisson frais à Monterosso, les ruelles et le petit port de Vernazza, le belvédère de Corniglia, le coucher de soleil à Manarola.

Depuis Lerici, c'est une excursion confortable à la journée. Nous conseillons de partir tôt, de porter de bonnes chaussures et d'éviter le milieu de la journée en été. À la réception, nous vous aidons avec les horaires et les liaisons.`,
    },
  },
  {
    _id: "escursione-portovenere",
    ordine: 2,
    slug: "portovenere",
    titolo: { it: "Portovenere", en: "Portovenere", de: "Portovenere", fr: "Portovenere" },
    sottotitolo: {
      it: "Il borgo sul mare dei poeti · Patrimonio UNESCO",
      en: "The seaside village of the poets · UNESCO World Heritage",
      de: "Das Dorf der Dichter am Meer · UNESCO-Welterbe",
      fr: "Le village des poètes au bord de la mer · Patrimoine mondial de l'UNESCO",
    },
    descrizione: {
      it: `Case colorate sul porticciolo, la chiesa di San Pietro a picco sul mare e, di fronte, le isole Palmaria, Tino e Tinetto.`,
      en: `Colourful houses along the little harbour, the church of San Pietro on the sea cliff and, opposite, the islands of Palmaria, Tino and Tinetto.`,
      de: `Bunte Häuser am kleinen Hafen, die Kirche San Pietro direkt am Felsen und gegenüber die Inseln Palmaria, Tino und Tinetto.`,
      fr: `Maisons colorées autour du petit port, l'église San Pietro au-dessus de la mer et, en face, les îles Palmaria, Tino et Tinetto.`,
    },
    descrizioneEstesa: {
      it: `Portovenere è uno dei borghi più belli del Golfo dei Poeti: una fila di case colorate sul porticciolo, dominata dal castello Doria e dalla chiesa di San Pietro, costruita sulla roccia a picco sul mare. Con le isole Palmaria, Tino e Tinetto è Patrimonio Mondiale UNESCO.

Si passeggia lungo la via principale fino alla chiesa, si scende alla Grotta Byron e, nella bella stagione, si raggiunge in barca l'isola Palmaria per un bagno o un pranzo vista mare.

È il dirimpettaio di Lerici, dall'altra parte del golfo: si può raggiungere in battello nella stagione estiva o in auto. In reception ti diamo orari, consigli e qualche trucco per evitare la folla.`,
      en: `Portovenere is one of the most beautiful villages of the Gulf of Poets: a row of colourful houses on the little harbour, dominated by the Doria castle and the church of San Pietro, built on the rock above the sea. With the islands of Palmaria, Tino and Tinetto it is a UNESCO World Heritage Site.

You can stroll along the main street to the church, go down to Byron's Grotto and, in the warm season, take a boat to Palmaria island for a swim or a lunch with a sea view.

It sits just across the gulf from Lerici: you can get there by boat in summer or by car. Our reception team will give you timetables, tips and a few tricks to avoid the crowds.`,
      de: `Portovenere ist eines der schönsten Dörfer im Golf der Dichter: eine Reihe bunter Häuser am kleinen Hafen, überragt vom Doria-Kastell und der Kirche San Pietro, die auf dem Felsen direkt über dem Meer steht. Mit den Inseln Palmaria, Tino und Tinetto gehört es zum UNESCO-Welterbe.

Man spaziert die Hauptgasse hinauf zur Kirche, steigt zur Byron-Grotte hinab und fährt in der warmen Jahreszeit mit dem Boot zur Insel Palmaria, um zu baden oder mit Meerblick zu Mittag zu essen.

Es liegt direkt gegenüber von Lerici auf der anderen Seite des Golfs: Im Sommer erreicht man es mit dem Boot, sonst mit dem Auto. An der Rezeption erhalten Sie Fahrpläne, Tipps und ein paar Tricks, um den Menschenmassen auszuweichen.`,
      fr: `Portovenere est l'un des plus beaux villages du golfe des Poètes : une rangée de maisons colorées autour du petit port, dominée par le château Doria et l'église San Pietro, bâtie sur le rocher au-dessus de la mer. Avec les îles Palmaria, Tino et Tinetto, il est inscrit au patrimoine mondial de l'UNESCO.

On flâne dans la rue principale jusqu'à l'église, on descend à la grotte de Byron et, à la belle saison, on rejoint en bateau l'île Palmaria pour une baignade ou un déjeuner face à la mer.

Il se trouve juste en face de Lerici, de l'autre côté du golfe : on y accède en bateau en été ou en voiture. À la réception, nous vous donnons horaires, conseils et quelques astuces pour éviter la foule.`,
    },
  },
];

const APPLY = process.env.APPLY === "1";
const ID_DUPLICATI = ["escursione-cinque-terre", "escursione-portovenere"];

interface Doc {
  _id: string;
  titolo?: { it?: string };
  foto?: unknown[];
}

const norm = (v?: string) => (v ?? "").toLowerCase().replace(/\s+/g, "");

async function main() {
  console.log(APPLY ? "== APPLICO LE MODIFICHE ==" : "== PROVA A VUOTO (nessuna scrittura) ==");
  const tutti = await client.fetch<Doc[]>(`*[_type == "escursione"]{_id, titolo, foto}`);
  const baseId = (id: string) => id.replace(/^drafts\./, "");

  for (const e of ESPERIENZE) {
    const chiave = norm(e.titolo.it);
    // Documenti dell'utente: titolo che corrisponde, esclusi i duplicati creati dallo script.
    const candidati = tutti.filter(
      (d) => norm(d.titolo?.it).includes(chiave) && !ID_DUPLICATI.includes(baseId(d._id))
    );
    const ids = [...new Set(candidati.map((d) => baseId(d._id)))];
    if (ids.length !== 1) {
      console.log(`!! "${e.titolo.it}": trovati ${ids.length} documenti (${ids.join(", ") || "nessuno"}). Salto: sistema a mano.`);
      continue;
    }
    // Se esistono sia la versione pubblicata sia la bozza, aggiorna entrambe.
    for (const d of candidati) {
      console.log(`${APPLY ? "AGGIORNO" : "aggiornerei"} ${d._id} ("${d.titolo?.it}", ${d.foto?.length ?? 0} foto) → /esperienze/${e.slug}`);
      if (!APPLY) continue;
      await client
        .patch(d._id)
        .set({
          slug: { _type: "slug", current: e.slug },
          descrizione: e.descrizione,
          descrizioneEstesa: e.descrizioneEstesa,
        })
        .unset(["link"])
        .commit();
    }
  }

  for (const id of ID_DUPLICATI) {
    for (const d of tutti.filter((x) => baseId(x._id) === id)) {
      if ((d.foto?.length ?? 0) > 0) {
        console.log(`!! ${d._id} ha foto: NON lo elimino.`);
        continue;
      }
      console.log(`${APPLY ? "ELIMINO" : "eliminerei"} doppione ${d._id}`);
      if (APPLY) await client.delete(d._id);
    }
  }
  if (!APPLY) console.log("\nSe tutto torna, rilancia con APPLY=1 davanti al comando.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

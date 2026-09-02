import Image from "next/image";
import { getTranslations } from "next-intl/server";
import Button from "@/components/ui/Button";
import SectionWrapper from "@/components/layout/SectionWrapper";
import EscursioneCard from "@/components/ui/EscursioneCard";
import { getEsperienzaPesto, getEscursioni } from "@/lib/queries";

// fallback solo se non c'è ancora nessuna escursione pubblicata su Sanity
// (27/08/2026, Punto 3b) — 2 voci finte senza foto, così il bento resta
// "1 grande + 2 piccole" anche a Sanity vuoto, mai un solo riquadro.
const ESCURSIONI_PLACEHOLDER = [
  { titolo: "Cinque Terre", sottotitolo: "20 min in treno", descrizione: undefined, fotoUrl: null, link: "/lerici" },
  { titolo: "Portovenere", sottotitolo: "10 min in battello", descrizione: undefined, fotoUrl: null, link: "/lerici" },
];

export default async function EsperienzeInEvidenza({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "Home.esperienze" });
  const tPesto = await getTranslations({ locale, namespace: "Home.pesto" });
  const pesto = await getEsperienzaPesto(locale);
  const escursioniReali = await getEscursioni(locale);
  const escursioni = escursioniReali.length > 0 ? escursioniReali.slice(0, 2) : ESCURSIONI_PLACEHOLDER;

  const numero = pesto?.visitatoriStagione ? `${pesto.visitatoriStagione}+` : tPesto("number");
  const titoloPesto = pesto?.titolo || tPesto("title");
  const descrizionePesto = pesto?.descrizione || tPesto("description");

  return (
    <SectionWrapper bg="white">
      <h2 className="font-heading text-3xl text-primary">{t("title")}</h2>
      <p className="mt-2 text-textMuted">{t("subtitle")}</p>

      <div className="mt-10 flex flex-col gap-6">
        <div className="grid items-center gap-10 overflow-hidden rounded-lg bg-accentDeep p-8 md:grid-cols-2 md:p-10">
          <div>
            <p className="font-heading text-6xl text-white">{numero}</p>
            <p className="mt-1 text-white/85">{tPesto("numberLabel")}</p>
            <h3 className="mt-6 font-heading text-2xl text-white">{titoloPesto}</h3>
            <p className="mt-4 text-white/90">{descrizionePesto}</p>
            <Button href="/esperienze" variant="solid-white-accent" className="mt-6 inline-block">
              {tPesto("cta")}
            </Button>
          </div>
          {pesto?.fotoUrl ? (
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
              <Image src={pesto.fotoUrl} alt={titoloPesto} fill className="object-cover" />
            </div>
          ) : (
            <div className="aspect-[4/3] rounded-lg bg-white/10" />
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {escursioni.map((e, i) => (
            <EscursioneCard
              key={`${e.titolo}-${i}`}
              titolo={e.titolo}
              sottotitolo={e.sottotitolo}
              descrizione={e.descrizione}
              fotoUrl={e.fotoUrl}
              link={e.link}
            />
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}

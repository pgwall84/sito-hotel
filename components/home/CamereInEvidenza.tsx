import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";
import SectionWrapper from "@/components/layout/SectionWrapper";
import CameraCard from "@/components/ui/CameraCard";
import { getCamere } from "@/lib/queries";

// fallback solo se non c'è ancora nessuna camera pubblicata su Sanity —
// "Camera Vista Mare" marcata evidenziata per mantenere un bento corretto
// anche a Sanity vuoto (26/08/2026, Punto 3a coerenza visiva).
const CAMERE_PLACEHOLDER = [
  { slug: "standard", nome: "Camera Standard", servizi: ["wifi", "tv", "aria-condizionata"], prezzoBase: 85, fotoUrl: null, fotoUrlGrande: null, evidenziata: false },
  { slug: "vista-mare", nome: "Camera Vista Mare", servizi: ["wifi", "balcone", "vista-mare"], prezzoBase: 110, fotoUrl: null, fotoUrlGrande: null, evidenziata: true },
  { slug: "family", nome: "Camera Family", servizi: ["wifi", "tv", "bagno-privato"], prezzoBase: 140, fotoUrl: null, fotoUrlGrande: null, evidenziata: false },
];

export default async function CamereInEvidenza({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "Home.camere" });
  const camereReali = await getCamere(locale);
  const camere = camereReali.length > 0 ? camereReali.slice(0, 3) : CAMERE_PLACEHOLDER;

  // Riquadro grande: la prima camera con evidenziata === true (nell'ordine
  // già restituito dalla query, per `ordine asc`); se nessuna è flaggata,
  // la prima in ordine — mai un layout "tutto piccolo". Se più di una è
  // flaggata per errore, vince la prima incontrata (findIndex si ferma
  // alla prima corrispondenza).
  const indiceGrande = Math.max(
    camere.findIndex((c) => c.evidenziata),
    0
  );
  const grandeCamera = camere[indiceGrande];
  const piccole = camere.filter((_, i) => i !== indiceGrande);

  return (
    <SectionWrapper bg="white">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h2 className="font-heading text-3xl text-primary">{t("title")}</h2>
          <p className="mt-2 text-textMuted">{t("subtitle")}</p>
        </div>
        <Link href="/camere" className="text-sm font-semibold text-primary hover:text-accent">
          {t("ctaAll")} →
        </Link>
      </div>

      <div className="mt-10 flex flex-col gap-6">
        <CameraCard
          key={grandeCamera.slug}
          grande
          evidenziata
          badgeLabel={t("badgeEvidenziata")}
          nome={grandeCamera.nome}
          servizi={grandeCamera.servizi}
          prezzoBase={grandeCamera.prezzoBase}
          slug={grandeCamera.slug}
          fotoUrl={grandeCamera.fotoUrlGrande}
          priceFromLabel={t("priceFrom")}
          ctaLabel={t("cta")}
        />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {piccole.map((camera) => (
            <CameraCard
              key={camera.slug}
              nome={camera.nome}
              servizi={camera.servizi}
              prezzoBase={camera.prezzoBase}
              slug={camera.slug}
              fotoUrl={camera.fotoUrl}
              priceFromLabel={t("priceFrom")}
              ctaLabel={t("cta")}
            />
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}

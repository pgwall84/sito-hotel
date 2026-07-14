import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";
import SectionWrapper from "@/components/layout/SectionWrapper";
import CameraCard from "@/components/ui/CameraCard";
import { getCamere } from "@/lib/queries";

// fallback solo se non c'è ancora nessuna camera pubblicata su Sanity
const CAMERE_PLACEHOLDER = [
  { slug: "standard", nome: "Camera Standard", servizi: ["wifi", "tv", "aria-condizionata"], prezzoBase: 85, fotoUrl: null },
  { slug: "vista-mare", nome: "Camera Vista Mare", servizi: ["wifi", "balcone", "vista-mare"], prezzoBase: 110, fotoUrl: null },
  { slug: "family", nome: "Camera Family", servizi: ["wifi", "tv", "bagno-privato"], prezzoBase: 140, fotoUrl: null },
];

export default async function CamereInEvidenza({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "Home.camere" });
  const camereReali = await getCamere(locale);
  const camere = camereReali.length > 0 ? camereReali.slice(0, 3) : CAMERE_PLACEHOLDER;

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

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {camere.map((camera) => (
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
    </SectionWrapper>
  );
}

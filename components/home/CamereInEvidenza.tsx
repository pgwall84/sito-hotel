import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import SectionWrapper from "@/components/layout/SectionWrapper";
import CameraCard from "@/components/ui/CameraCard";

// dati placeholder — sostituiti dalle camere reali di Sanity allo Step 6
const CAMERE_PLACEHOLDER = [
  { slug: "standard", nome: "Camera Standard", servizi: ["wifi", "tv", "aria-condizionata"], prezzoBase: 85 },
  { slug: "vista-mare", nome: "Camera Vista Mare", servizi: ["wifi", "balcone", "vista-mare"], prezzoBase: 110 },
  { slug: "family", nome: "Camera Family", servizi: ["wifi", "tv", "bagno-privato"], prezzoBase: 140 },
];

export default function CamereInEvidenza() {
  const t = useTranslations("Home.camere");

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
        {CAMERE_PLACEHOLDER.map((camera) => (
          <CameraCard
            key={camera.slug}
            nome={camera.nome}
            servizi={camera.servizi}
            prezzoBase={camera.prezzoBase}
            slug={camera.slug}
            priceFromLabel={t("priceFrom")}
            ctaLabel={t("cta")}
          />
        ))}
      </div>
    </SectionWrapper>
  );
}

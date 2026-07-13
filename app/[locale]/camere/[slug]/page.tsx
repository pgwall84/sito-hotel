import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";
import SectionWrapper from "@/components/layout/SectionWrapper";
import ImageGallery from "@/components/ui/ImageGallery";
import BookingButton from "@/components/ui/BookingButton";
import JsonLd from "@/components/seo/JsonLd";
import { SERVIZI_ICONS } from "@/lib/servizi";
import { getCameraBySlug } from "@/lib/queries";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const camera = await getCameraBySlug(slug, locale);
  if (!camera) {
    const t = await getTranslations({ locale, namespace: "CameraDetailPage" });
    return pageMetadata({ title: t("notFoundTitle"), description: t("notFoundBody"), path: `/camere/${slug}`, locale });
  }
  return pageMetadata({
    title: camera.nome,
    description: camera.descrizione || camera.nome,
    path: `/camere/${slug}`,
    locale,
    image: camera.fotoUrl,
  });
}

export default async function CameraDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "CameraDetailPage" });
  const tServizi = await getTranslations({ locale, namespace: "Servizi" });
  const camera = await getCameraBySlug(slug, locale);

  if (!camera) {
    return (
      <SectionWrapper bg="white">
        <h1 className="font-heading text-3xl text-primary">{t("notFoundTitle")}</h1>
        <p className="mt-2 text-textMuted">{t("notFoundBody")}</p>
        <Link href="/camere" className="mt-6 inline-block text-sm font-semibold text-primary hover:text-accent">
          ← {t("backToList")}
        </Link>
      </SectionWrapper>
    );
  }

  const galleria = camera.fotoUrl ? [camera.fotoUrl, ...camera.galleria] : camera.galleria;

  const roomSchema = {
    "@context": "https://schema.org",
    "@type": "HotelRoom",
    name: camera.nome,
    description: camera.descrizione || undefined,
    image: camera.fotoUrl || undefined,
    occupancy: camera.capienza ? { "@type": "QuantitativeValue", maxValue: camera.capienza } : undefined,
    floorSize: camera.mq ? { "@type": "QuantitativeValue", value: camera.mq, unitCode: "MTK" } : undefined,
    amenityFeature: camera.servizi.map((s) => ({
      "@type": "LocationFeatureSpecification",
      name: tServizi.has(s) ? tServizi(s) : s,
    })),
    offers: {
      "@type": "Offer",
      price: camera.prezzoBase,
      priceCurrency: "EUR",
    },
  };

  return (
    <SectionWrapper bg="white">
      <JsonLd data={roomSchema} />

      <Link href="/camere" className="text-sm font-semibold text-primary hover:text-accent">
        ← {t("backToList")}
      </Link>

      <div className="mt-6 grid gap-10 md:grid-cols-2">
        <ImageGallery images={galleria} alt={camera.nome} />

        <div>
          <h1 className="font-heading text-3xl text-primary">{camera.nome}</h1>
          {(camera.capienza || camera.mq) && (
            <p className="mt-2 text-sm text-textMuted">
              {camera.capienza ? `${camera.capienza} ${t("capienza")}` : ""}
              {camera.capienza && camera.mq ? " · " : ""}
              {camera.mq ? `${camera.mq} ${t("mq")}` : ""}
            </p>
          )}
          <p className="mt-4 text-textMuted">{camera.descrizione}</p>

          {camera.servizi.length > 0 && (
            <div className="mt-6">
              <h2 className="font-heading text-lg text-primary">{t("serviziTitle")}</h2>
              <ul className="mt-3 grid grid-cols-2 gap-2 text-sm text-text">
                {camera.servizi.map((s) => (
                  <li key={s}>
                    {SERVIZI_ICONS[s] ?? ""} {tServizi.has(s) ? tServizi(s) : s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className="mt-6 text-sm text-text">
            {t("prezzoFrom")} <strong className="text-2xl text-accent">€{camera.prezzoBase}</strong>{" "}
            {t("prezzoNotte")}
          </p>

          <BookingButton
            cameraSlug={camera.slug}
            className="mt-6 inline-block rounded-full bg-accent px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-accentLight"
          >
            {t("bookingCta")}
          </BookingButton>
        </div>
      </div>
    </SectionWrapper>
  );
}

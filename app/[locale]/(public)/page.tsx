import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import JsonLd from "@/components/seo/JsonLd";
import Hero from "@/components/home/Hero";
import CamereInEvidenza from "@/components/home/CamereInEvidenza";
import RistorantePreview from "@/components/home/RistorantePreview";
import EsperienzeInEvidenza from "@/components/home/EsperienzeInEvidenza";
import LavoroBanner from "@/components/home/LavoroBanner";
import GalleriaPreview from "@/components/home/GalleriaPreview";
import TripAdvisorWidget from "@/components/home/TripAdvisorWidget";
import FAQ from "@/components/home/FAQ";
import SectionWrapper from "@/components/layout/SectionWrapper";
import { getInfoHotel } from "@/lib/queries";
import { pageMetadata, SITE_URL, SITE_NAME } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const info = await getInfoHotel(locale);
  const meta = pageMetadata({
    title: info.claim,
    description: info.descrizione,
    path: "",
    locale,
    image: info.fotoUrl,
  });
  // homepage e layout condividono lo stesso segmento di route: title.template
  // del layout non si applica qui (per design di Next.js), va composto a mano
  return { ...meta, title: `${info.claim} | ${SITE_NAME}` };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const info = await getInfoHotel(locale);
  const tRecensioni = await getTranslations({ locale, namespace: "Home.recensioni" });

  const hotelSchema = {
    "@context": "https://schema.org",
    "@type": "Hotel",
    name: info.nome,
    address: {
      "@type": "PostalAddress",
      streetAddress: info.indirizzo,
      addressLocality: info.citta,
      postalCode: info.cap,
      addressCountry: "IT",
    },
    telephone: info.telefono,
    email: info.email,
    geo: {
      "@type": "GeoCoordinates",
      latitude: info.latitudine,
      longitude: info.longitudine,
    },
    starRating: { "@type": "Rating", ratingValue: "3" },
    priceRange: "$$",
    checkinTime: "14:00",
    checkoutTime: "11:00",
    amenityFeature: ["WiFi", "Ristorante", "Parcheggio"],
    additionalProperty: {
      "@type": "PropertyValue",
      name: "CITR",
      value: info.citr,
    },
    url: `${SITE_URL}/${locale}`,
  };

  return (
    <>
      <JsonLd data={hotelSchema} />
      <Hero fotoUrl={info.heroUrl} />
      <CamereInEvidenza locale={locale} />
      <RistorantePreview locale={locale} />
      <EsperienzeInEvidenza locale={locale} />
      <LavoroBanner />
      <GalleriaPreview locale={locale} />
      <SectionWrapper bg="surface">
        <h2 className="text-center font-heading text-3xl text-primary">{tRecensioni("title")}</h2>
        <div className="mt-8">
          <TripAdvisorWidget url={info.linkTripAdvisor} locale={locale} />
        </div>
      </SectionWrapper>
      <FAQ />
    </>
  );
}

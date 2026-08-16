import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import SectionWrapper from "@/components/layout/SectionWrapper";
import PrenotazioneTavoloForm from "@/components/forms/PrenotazioneTavoloForm";
import JsonLd from "@/components/seo/JsonLd";
import { getSezioneRistorante, getInfoHotel } from "@/lib/queries";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "RistorantePage" });
  const ristorante = await getSezioneRistorante(locale);
  return pageMetadata({
    title: ristorante?.titolo || t("title"),
    description: ristorante?.descrizione || t("fallbackDescription"),
    path: "/ristorante",
    locale,
    image: ristorante?.fotoUrl,
  });
}

export default async function RistorantePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "RistorantePage" });
  const ristorante = await getSezioneRistorante(locale);
  const info = await getInfoHotel(locale);

  const titolo = ristorante?.titolo || t("title");
  const descrizione = ristorante?.descrizione || t("fallbackDescription");

  const restaurantSchema = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: titolo,
    description: descrizione,
    servesCuisine: ["Italian", "Ligurian"],
    address: {
      "@type": "PostalAddress",
      streetAddress: info.indirizzo,
      addressLocality: info.citta,
      postalCode: info.cap,
      addressCountry: "IT",
    },
    telephone: info.telefono,
    image: ristorante?.fotoUrl || undefined,
    menu: ristorante?.linkMenu || undefined,
  };

  return (
    <>
      <JsonLd data={restaurantSchema} />

      <SectionWrapper bg="surface">
        <div className="grid items-center gap-10 md:grid-cols-2">
          {ristorante?.fotoUrl ? (
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
              <Image src={ristorante.fotoUrl} alt={titolo} fill className="object-cover" />
            </div>
          ) : (
            <div className="aspect-[4/3] rounded-lg bg-gradient-to-br from-primary/15 to-surfaceDark" />
          )}
          <div>
            <span className="inline-block rounded-full bg-primary px-4 py-1 text-xs font-semibold uppercase tracking-wide text-white">
              {t("tag")}
            </span>
            <h1 className="mt-4 font-heading text-4xl text-primary">{titolo}</h1>
            <p className="mt-4 text-textMuted">{descrizione}</p>

            {ristorante?.linkMenu && (
              <a
                href={ristorante.linkMenu}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-block rounded-full bg-accent px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-accentLight"
              >
                {t("menuCta")}
              </a>
            )}
          </div>
        </div>

        {ristorante && ristorante.specialita.length > 0 && (
          <div className="mt-12">
            <h2 className="font-heading text-2xl text-primary">{t("specialitaTitle")}</h2>
            <ul className="mt-4 flex flex-wrap gap-3">
              {ristorante.specialita.map((s) => (
                <li key={s} className="rounded-full bg-background px-4 py-2 text-sm text-text shadow-card">
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}
      </SectionWrapper>

      <SectionWrapper bg="white">
        <h2 className="font-heading text-2xl text-primary">{t("formTitle")}</h2>
        <div className="mt-6 max-w-2xl">
          <PrenotazioneTavoloForm />
        </div>
      </SectionWrapper>
    </>
  );
}

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import SectionWrapper from "@/components/layout/SectionWrapper";
import CameraCard from "@/components/ui/CameraCard";
import { getCamere } from "@/lib/queries";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "CamerePage" });
  return pageMetadata({
    title: t("title"),
    description: t("subtitle"),
    path: "/camere",
    locale,
  });
}

export default async function CamerePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "CamerePage" });
  const camere = await getCamere(locale);

  return (
    <SectionWrapper bg="white">
      <h1 className="font-heading text-4xl text-primary">{t("title")}</h1>
      <p className="mt-2 text-textMuted">{t("subtitle")}</p>

      {camere.length === 0 ? (
        <p className="mt-10 text-textMuted">{t("empty")}</p>
      ) : (
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
      )}
    </SectionWrapper>
  );
}

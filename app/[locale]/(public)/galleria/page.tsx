import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import SectionWrapper from "@/components/layout/SectionWrapper";
import GalleriaGrid from "@/components/ui/GalleriaGrid";
import { getGalleria } from "@/lib/queries";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "GalleriaPage" });
  return pageMetadata({ title: t("title"), description: t("subtitle"), path: "/galleria", locale });
}

export default async function GalleriaPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "GalleriaPage" });
  const foto = await getGalleria(locale);

  return (
    <SectionWrapper bg="white">
      <h1 className="font-heading text-4xl text-primary">{t("title")}</h1>
      <p className="mt-2 text-textMuted">{t("subtitle")}</p>

      {foto.length === 0 ? (
        <p className="mt-10 text-textMuted">{t("empty")}</p>
      ) : (
        <div className="mt-8">
          <GalleriaGrid foto={foto} />
        </div>
      )}
    </SectionWrapper>
  );
}

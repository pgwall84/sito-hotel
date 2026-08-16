import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import SectionWrapper from "@/components/layout/SectionWrapper";
import { getWelcomeBook } from "@/lib/queries";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "BenvenutoPage" });
  const meta = pageMetadata({ title: t("checkoutTitle"), description: t("subtitle"), path: "/benvenuto/checkout", locale });
  return { ...meta, robots: { index: false, follow: false } };
}

export default async function BenvenutoCheckoutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "BenvenutoPage" });
  const wb = await getWelcomeBook(locale);

  return (
    <SectionWrapper bg="white">
      {wb?.orariCheckout ? (
        <p className="text-lg font-semibold text-text">{wb.orariCheckout}</p>
      ) : (
        <p className="text-sm text-textMuted">{t("infoNonDisponibile")}</p>
      )}
    </SectionWrapper>
  );
}

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import SectionWrapper from "@/components/layout/SectionWrapper";
import LuogoGrid from "@/components/ui/LuogoGrid";
import { getWelcomeBook } from "@/lib/queries";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "BenvenutoPage" });
  const meta = pageMetadata({ title: t("shoppingTitle"), description: t("subtitle"), path: "/benvenuto/shopping", locale });
  return { ...meta, robots: { index: false, follow: false } };
}

export default async function BenvenutoShoppingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "BenvenutoPage" });
  const wb = await getWelcomeBook(locale);

  return (
    <SectionWrapper bg="white">
      <LuogoGrid luoghi={wb?.shopping ?? []} infoNonDisponibile={t("infoNonDisponibile")} />
    </SectionWrapper>
  );
}

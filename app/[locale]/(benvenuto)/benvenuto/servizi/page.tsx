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
  const meta = pageMetadata({ title: t("serviziTitle"), description: t("subtitle"), path: "/benvenuto/servizi", locale });
  return { ...meta, robots: { index: false, follow: false } };
}

export default async function BenvenutoServiziPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "BenvenutoPage" });
  const wb = await getWelcomeBook(locale);

  return (
    <SectionWrapper bg="white">
      {wb?.orariColazione && (
        <div className="mb-6">
          <p className="text-xs uppercase tracking-wide text-textMuted">{t("colazioneLabel")}</p>
          <p className="mt-1 text-lg font-semibold text-text">{wb.orariColazione}</p>
        </div>
      )}
      <LuogoGrid luoghi={wb?.servizi ?? []} infoNonDisponibile={t("infoNonDisponibile")} />
    </SectionWrapper>
  );
}

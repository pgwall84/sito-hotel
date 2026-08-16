import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import SectionWrapper from "@/components/layout/SectionWrapper";
import LuogoGrid from "@/components/ui/LuogoGrid";
import { getSezioneRistorante, getWelcomeBook } from "@/lib/queries";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "BenvenutoPage" });
  const meta = pageMetadata({ title: t("ristorantiTitle"), description: t("subtitle"), path: "/benvenuto/ristoranti", locale });
  return { ...meta, robots: { index: false, follow: false } };
}

export default async function BenvenutoRistorantiPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "BenvenutoPage" });
  const ristorante = await getSezioneRistorante(locale);
  const wb = await getWelcomeBook(locale);

  return (
    <SectionWrapper bg="white">
      <p className="max-w-2xl text-textMuted">{t("ristorantiText")}</p>

      {ristorante?.linkMenu ? (
        <a
          href={ristorante.linkMenu}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-block rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primaryLight"
        >
          {t("menuCta")} →
        </a>
      ) : (
        <p className="mt-4 text-sm text-textMuted">{t("infoNonDisponibile")}</p>
      )}

      <h2 className="mt-10 font-heading text-xl text-primary">{t("ristorantiEsterniTitle")}</h2>
      <LuogoGrid luoghi={wb?.ristorantiEsterni ?? []} infoNonDisponibile={t("infoNonDisponibile")} />
    </SectionWrapper>
  );
}

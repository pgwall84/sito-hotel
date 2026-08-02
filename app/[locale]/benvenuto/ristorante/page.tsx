import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";
import { ArrowLeft } from "lucide-react";
import SectionWrapper from "@/components/layout/SectionWrapper";
import { getSezioneRistorante } from "@/lib/queries";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "BenvenutoPage" });
  const meta = pageMetadata({ title: t("ristoranteTitle"), description: t("subtitle"), path: "/benvenuto/ristorante", locale });
  return { ...meta, robots: { index: false, follow: false } };
}

export default async function BenvenutoRistorantePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "BenvenutoPage" });
  const ristorante = await getSezioneRistorante(locale);

  return (
    <SectionWrapper bg="white">
      <Link href="/benvenuto" className="inline-flex items-center gap-1 text-sm font-medium text-textMuted hover:text-primary">
        <ArrowLeft size={16} /> {t("backCta")}
      </Link>
      <h1 className="mt-4 font-heading text-2xl text-primary">{t("ristoranteTitle")}</h1>
      <p className="mt-3 max-w-2xl text-textMuted">{t("ristoranteText")}</p>

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
    </SectionWrapper>
  );
}

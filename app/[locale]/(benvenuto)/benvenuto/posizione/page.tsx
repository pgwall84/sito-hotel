import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";
import SectionWrapper from "@/components/layout/SectionWrapper";
import MapEmbed from "@/components/ui/MapEmbed";
import { getWelcomeBook, getInfoHotel } from "@/lib/queries";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "BenvenutoPage" });
  const meta = pageMetadata({ title: t("posizioneTitle"), description: t("subtitle"), path: "/benvenuto/posizione", locale });
  return { ...meta, robots: { index: false, follow: false } };
}

export default async function BenvenutoPosizionePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "BenvenutoPage" });
  const tContatti = await getTranslations({ locale, namespace: "ContattiPage" });
  const wb = await getWelcomeBook(locale);
  const info = await getInfoHotel(locale);

  const lat = wb?.posizioneLat ?? info.latitudine;
  const lon = wb?.posizioneLon ?? info.longitudine;

  return (
    <SectionWrapper bg="white">
      <p className="text-sm text-textMuted">
        {info.indirizzo}, {info.cap} {info.citta} ({info.provincia})
      </p>

      {wb?.posizioneTesto && <p className="mt-4 max-w-2xl text-text">{wb.posizioneTesto}</p>}

      <div className="mt-6 aspect-[4/3] overflow-hidden rounded-lg border border-border">
        <MapEmbed lat={lat} lon={lon} />
      </div>

      <div className="mt-6">
        <p className="font-heading text-lg text-primary">{tContatti("comeArrivareTitle")}</p>
        <ul className="mt-2 space-y-1 text-sm text-textMuted">
          <li>{tContatti("auto")}</li>
          <li>{tContatti("treno")}</li>
          <li>{tContatti("battello")}</li>
        </ul>
      </div>

      <Link href="/lerici" className="mt-6 inline-block text-sm font-semibold text-primary hover:text-accent">
        {t("posizioneTitle")} →
      </Link>
    </SectionWrapper>
  );
}

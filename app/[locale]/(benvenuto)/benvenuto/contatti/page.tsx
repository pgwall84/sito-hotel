import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import SectionWrapper from "@/components/layout/SectionWrapper";
import { getWelcomeBook, getInfoHotel } from "@/lib/queries";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "BenvenutoPage" });
  const meta = pageMetadata({ title: t("contattiTitle"), description: t("subtitle"), path: "/benvenuto/contatti", locale });
  return { ...meta, robots: { index: false, follow: false } };
}

export default async function BenvenutoContattiPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "BenvenutoPage" });
  const wb = await getWelcomeBook(locale);
  const info = await getInfoHotel(locale);

  return (
    <SectionWrapper bg="white">
      <div className="grid gap-10 sm:grid-cols-2">
        <div className="text-sm text-textMuted">
          <p className="text-lg font-semibold text-text">{info.telefono}</p>
          {info.telefonoMobile && <p className="mt-1">{info.telefonoMobile}</p>}
          {info.orariReception && <p className="mt-2">{info.orariReception}</p>}
        </div>

        {wb && wb.numeriUtili.length > 0 && (
          <div>
            <h2 className="font-heading text-lg text-primary">{t("numeriUtiliTitle")}</h2>
            <ul className="mt-3 space-y-1.5">
              {wb.numeriUtili.map((n) => (
                <li key={n.etichetta} className="flex justify-between gap-4 text-sm text-textMuted">
                  <span>{n.etichetta}</span>
                  <span className="font-semibold text-text">{n.valore}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </SectionWrapper>
  );
}

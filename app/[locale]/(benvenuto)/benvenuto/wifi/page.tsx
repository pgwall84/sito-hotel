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
  const meta = pageMetadata({ title: t("wifiTitle"), description: t("subtitle"), path: "/benvenuto/wifi", locale });
  return { ...meta, robots: { index: false, follow: false } };
}

export default async function BenvenutoWifiPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "BenvenutoPage" });
  const wb = await getWelcomeBook(locale);

  return (
    <SectionWrapper bg="white">
      {wb?.wifiNome ? (
        <div className="inline-flex flex-col gap-2 rounded-lg border border-border bg-surface px-6 py-5 text-sm">
          <p>
            <span className="text-textMuted">{t("wifiNomeLabel")}: </span>
            <span className="text-lg font-semibold text-text">{wb.wifiNome}</span>
          </p>
          {wb.wifiPassword && (
            <p>
              <span className="text-textMuted">{t("wifiPasswordLabel")}: </span>
              <span className="text-lg font-semibold text-text">{wb.wifiPassword}</span>
            </p>
          )}
        </div>
      ) : (
        <p className="text-sm text-textMuted">{t("infoNonDisponibile")}</p>
      )}
    </SectionWrapper>
  );
}

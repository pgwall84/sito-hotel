import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";
import { ArrowLeft } from "lucide-react";
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
  const meta = pageMetadata({ title: t("orariTitle"), description: t("subtitle"), path: "/benvenuto/orari", locale });
  return { ...meta, robots: { index: false, follow: false } };
}

export default async function BenvenutoOrariPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "BenvenutoPage" });
  const wb = await getWelcomeBook(locale);
  const haOrari = wb?.orariCheckin || wb?.orariCheckout || wb?.orariColazione;

  return (
    <SectionWrapper bg="white">
      <Link href="/benvenuto" className="inline-flex items-center gap-1 text-sm font-medium text-textMuted hover:text-primary">
        <ArrowLeft size={16} /> {t("backCta")}
      </Link>
      <h1 className="mt-4 font-heading text-2xl text-primary">{t("orariTitle")}</h1>

      {haOrari ? (
        <div className="mt-6 grid gap-6 sm:grid-cols-3">
          {wb?.orariCheckin && (
            <div>
              <p className="text-xs uppercase tracking-wide text-textMuted">{t("checkinLabel")}</p>
              <p className="mt-1 text-lg font-semibold text-text">{wb.orariCheckin}</p>
            </div>
          )}
          {wb?.orariCheckout && (
            <div>
              <p className="text-xs uppercase tracking-wide text-textMuted">{t("checkoutLabel")}</p>
              <p className="mt-1 text-lg font-semibold text-text">{wb.orariCheckout}</p>
            </div>
          )}
          {wb?.orariColazione && (
            <div>
              <p className="text-xs uppercase tracking-wide text-textMuted">{t("colazioneLabel")}</p>
              <p className="mt-1 text-lg font-semibold text-text">{wb.orariColazione}</p>
            </div>
          )}
        </div>
      ) : (
        <p className="mt-4 text-sm text-textMuted">{t("infoNonDisponibile")}</p>
      )}
    </SectionWrapper>
  );
}

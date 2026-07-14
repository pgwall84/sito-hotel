import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import SectionWrapper from "@/components/layout/SectionWrapper";
import { Link } from "@/lib/i18n/navigation";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "PrivacyPolicyPage" });
  return pageMetadata({ title: t("title"), description: t("titolareText"), path: "/privacy-policy", locale });
}

export default async function PrivacyPolicyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "PrivacyPolicyPage" });

  return (
    <SectionWrapper bg="white">
      <h1 className="font-heading text-4xl text-primary">{t("title")}</h1>
      <p className="mt-3 max-w-2xl rounded-md bg-surface p-4 text-sm text-textMuted">{t("notice")}</p>

      <div className="mt-8 max-w-2xl space-y-8 text-textMuted">
        <div>
          <h2 className="font-heading text-xl text-primary">{t("titolareTitle")}</h2>
          <p className="mt-2">{t("titolareText")}</p>
        </div>
        <div>
          <h2 className="font-heading text-xl text-primary">{t("datiTitle")}</h2>
          <p className="mt-2">{t("datiText")}</p>
        </div>
        <div>
          <h2 className="font-heading text-xl text-primary">{t("finalitaTitle")}</h2>
          <p className="mt-2">{t("finalitaText")}</p>
        </div>
        <div>
          <h2 className="font-heading text-xl text-primary">{t("cookieTitle")}</h2>
          <p className="mt-2">
            {t("cookieText")}{" "}
            <Link href="/cookie-policy" className="font-semibold text-primary hover:text-accent">
              {t("cookieLinkText")}
            </Link>
            .
          </p>
        </div>
        <div>
          <h2 className="font-heading text-xl text-primary">{t("dirittiTitle")}</h2>
          <p className="mt-2">{t("dirittiText")}</p>
        </div>
        <div>
          <h2 className="font-heading text-xl text-primary">{t("contattiTitle")}</h2>
          <p className="mt-2">{t("contattiText")}</p>
        </div>
      </div>
    </SectionWrapper>
  );
}

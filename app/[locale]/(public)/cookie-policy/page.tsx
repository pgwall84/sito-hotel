import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import SectionWrapper from "@/components/layout/SectionWrapper";
import ManagePreferencesButton from "@/components/cookie/ManagePreferencesButton";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "CookiePolicyPage" });
  return pageMetadata({ title: t("title"), description: t("introText"), path: "/cookie-policy", locale });
}

const ROWS = ["Session", "Consent", "Ga", "Maps"] as const;

export default async function CookiePolicyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "CookiePolicyPage" });

  return (
    <SectionWrapper bg="white">
      <h1 className="font-heading text-4xl text-primary">{t("title")}</h1>
      <p className="mt-3 max-w-2xl rounded-md bg-surface p-4 text-sm text-textMuted">{t("notice")}</p>
      <p className="mt-6 max-w-2xl text-textMuted">{t("introText")}</p>

      <ManagePreferencesButton className="mt-6 inline-block rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primaryLight">
        {t("manageButton")}
      </ManagePreferencesButton>

      <h2 className="mt-10 font-heading text-2xl text-primary">{t("tableTitle")}</h2>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-border text-text">
              <th className="py-2 pr-4 font-semibold">{t("colName")}</th>
              <th className="py-2 pr-4 font-semibold">{t("colType")}</th>
              <th className="py-2 pr-4 font-semibold">{t("colPurpose")}</th>
              <th className="py-2 font-semibold">{t("colDuration")}</th>
            </tr>
          </thead>
          <tbody className="text-textMuted">
            {ROWS.map((row) => (
              <tr key={row} className="border-b border-border/60">
                <td className="py-2 pr-4">{t(`row${row}Name` as "rowSessionName")}</td>
                <td className="py-2 pr-4">{t(`row${row}Type` as "rowSessionType")}</td>
                <td className="py-2 pr-4">{t(`row${row}Purpose` as "rowSessionPurpose")}</td>
                <td className="py-2">{t(`row${row}Duration` as "rowSessionDuration")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionWrapper>
  );
}

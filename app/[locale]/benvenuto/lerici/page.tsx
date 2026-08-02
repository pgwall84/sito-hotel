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
  const meta = pageMetadata({ title: t("lericiTitle"), description: t("subtitle"), path: "/benvenuto/lerici", locale });
  return { ...meta, robots: { index: false, follow: false } };
}

export default async function BenvenutoLericiPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "BenvenutoPage" });
  const wb = await getWelcomeBook(locale);
  const consigliLerici = wb && wb.consigliLerici.length > 0 ? wb.consigliLerici : (t.raw("lericiDefault") as string[]);
  const titolo = wb?.consigliLericiTitolo || t("lericiTitle");

  return (
    <SectionWrapper bg="white">
      <Link href="/benvenuto" className="inline-flex items-center gap-1 text-sm font-medium text-textMuted hover:text-primary">
        <ArrowLeft size={16} /> {t("backCta")}
      </Link>
      <h1 className="mt-4 font-heading text-2xl text-primary">{titolo}</h1>

      <ul className="mt-6 space-y-3">
        {consigliLerici.map((c) => (
          <li key={c} className="flex gap-2 text-sm text-text">
            <span className="text-accent">•</span>
            {c}
          </li>
        ))}
      </ul>

      <Link href="/lerici" className="mt-6 inline-block text-sm font-semibold text-primary hover:text-accent">
        {t("lericiCta")} →
      </Link>
    </SectionWrapper>
  );
}

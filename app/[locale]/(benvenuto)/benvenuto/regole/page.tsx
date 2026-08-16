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
  const meta = pageMetadata({ title: t("regoleTitle"), description: t("subtitle"), path: "/benvenuto/regole", locale });
  return { ...meta, robots: { index: false, follow: false } };
}

export default async function BenvenutoRegolePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "BenvenutoPage" });
  const wb = await getWelcomeBook(locale);
  const regoleCasa = wb && wb.regoleCasa.length > 0 ? wb.regoleCasa : (t.raw("regoleDefault") as string[]);

  return (
    <SectionWrapper bg="white">
      <ul className="space-y-3">
        {regoleCasa.map((r) => (
          <li key={r} className="flex gap-2 text-sm text-text">
            <span className="text-accent">•</span>
            {r}
          </li>
        ))}
      </ul>
    </SectionWrapper>
  );
}

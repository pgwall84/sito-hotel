import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import SectionWrapper from "@/components/layout/SectionWrapper";

const BORGHI = ["cinqueTerre", "portovenere", "tellaro"] as const;

export default function LericiDintorni() {
  const t = useTranslations("Home.dintorni");

  return (
    <SectionWrapper bg="white">
      <h2 className="font-heading text-3xl text-primary">{t("title")}</h2>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {BORGHI.map((key) => (
          <Link
            key={key}
            href="/lerici"
            className="rounded-lg border border-border p-6 shadow-card transition-shadow hover:shadow-cardHover"
          >
            <h3 className="font-heading text-xl text-primary">{t(`${key}.name`)}</h3>
            <p className="mt-2 text-sm text-textMuted">{t(`${key}.distanza`)}</p>
          </Link>
        ))}
      </div>

      <Link href="/lerici" className="mt-8 inline-block text-sm font-semibold text-primary hover:text-accent">
        {t("cta")} →
      </Link>
    </SectionWrapper>
  );
}

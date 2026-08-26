import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import SectionWrapper from "@/components/layout/SectionWrapper";
import Card from "@/components/ui/Card";

const BORGHI = ["cinqueTerre", "portovenere", "tellaro"] as const;

export default function LericiDintorni() {
  const t = useTranslations("Home.dintorni");

  return (
    <SectionWrapper bg="white">
      <h2 className="font-heading text-3xl text-primary">{t("title")}</h2>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {BORGHI.map((key) => (
          <Card key={key} conFoto={false} hover href="/lerici" className="p-6">
            <h3 className="font-heading text-xl text-primary">{t(`${key}.name`)}</h3>
            <p className="mt-2 text-sm text-textMuted">{t(`${key}.distanza`)}</p>
          </Card>
        ))}
      </div>

      <Link href="/lerici" className="mt-8 inline-block text-sm font-semibold text-primary hover:text-accent">
        {t("cta")} →
      </Link>
    </SectionWrapper>
  );
}

import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import SectionWrapper from "@/components/layout/SectionWrapper";

export default function LavoroBanner() {
  const t = useTranslations("Home.lavoro");

  return (
    <SectionWrapper bg="surface" className="text-center">
      <h2 className="font-heading text-2xl text-primary">{t("title")}</h2>
      <p className="mt-2 text-textMuted">{t("subtitle")}</p>
      <Link
        href="/lavoro"
        className="mt-6 inline-block rounded-full border border-primary px-7 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-white"
      >
        {t("cta")}
      </Link>
    </SectionWrapper>
  );
}

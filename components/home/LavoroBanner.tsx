import { useTranslations } from "next-intl";
import Button from "@/components/ui/Button";
import SectionWrapper from "@/components/layout/SectionWrapper";

export default function LavoroBanner() {
  const t = useTranslations("Home.lavoro");

  return (
    <SectionWrapper bg="surface" className="text-center">
      <h2 className="font-heading text-3xl text-primary">{t("title")}</h2>
      <p className="mt-2 text-textMuted">{t("subtitle")}</p>
      <Button href="/lavoro" variant="outline-primary" className="mt-6 inline-block">
        {t("cta")}
      </Button>
    </SectionWrapper>
  );
}

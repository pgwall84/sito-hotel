import { useTranslations } from "next-intl";
import Button from "@/components/ui/Button";
import SectionWrapper from "@/components/layout/SectionWrapper";

export default function PestoHighlight() {
  const t = useTranslations("Home.pesto");

  return (
    <SectionWrapper bg="accent">
      <div className="grid items-center gap-10 md:grid-cols-2">
        <div>
          <p className="font-heading text-6xl">{t("number")}</p>
          <p className="mt-1 text-white/85">{t("numberLabel")}</p>
          <h2 className="mt-6 font-heading text-3xl">{t("title")}</h2>
          <p className="mt-4 text-white/90">{t("description")}</p>
          <Button href="/esperienze" variant="solid-white-accent" className="mt-6 inline-block">
            {t("cta")}
          </Button>
        </div>
        <div className="aspect-[4/3] rounded-lg bg-white/10" />
      </div>
    </SectionWrapper>
  );
}

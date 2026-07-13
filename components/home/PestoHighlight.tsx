import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
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
          <Link
            href="/esperienze"
            className="mt-6 inline-block rounded-full bg-white px-7 py-3 text-sm font-semibold text-accent transition-colors hover:bg-surface"
          >
            {t("cta")}
          </Link>
        </div>
        <div className="aspect-[4/3] rounded-lg bg-white/10" />
      </div>
    </SectionWrapper>
  );
}

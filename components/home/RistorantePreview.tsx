import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import SectionWrapper from "@/components/layout/SectionWrapper";

export default function RistorantePreview() {
  const t = useTranslations("Home.ristorante");

  return (
    <SectionWrapper bg="surface">
      <div className="grid items-center gap-10 md:grid-cols-2">
        <div className="aspect-[4/3] rounded-lg bg-gradient-to-br from-primary/15 to-surfaceDark" />
        <div>
          <span className="inline-block rounded-full bg-primary px-4 py-1 text-xs font-semibold uppercase tracking-wide text-white">
            {t("tag")}
          </span>
          <h2 className="mt-4 font-heading text-3xl text-primary">{t("title")}</h2>
          <p className="mt-4 text-textMuted">{t("description")}</p>
          <Link href="/ristorante" className="mt-6 inline-block text-sm font-semibold text-primary hover:text-accent">
            {t("cta")} →
          </Link>
        </div>
      </div>
    </SectionWrapper>
  );
}

import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import SectionWrapper from "@/components/layout/SectionWrapper";

export default function GalleriaPreview() {
  const t = useTranslations("Home.galleria");

  return (
    <SectionWrapper bg="white">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-3xl text-primary">{t("title")}</h2>
        <Link href="/galleria" className="text-sm font-semibold text-primary hover:text-accent">
          {t("cta")} →
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-3 gap-3 md:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="aspect-square rounded-md bg-gradient-to-br from-primary/10 to-surfaceDark" />
        ))}
      </div>
    </SectionWrapper>
  );
}

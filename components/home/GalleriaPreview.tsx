import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";
import SectionWrapper from "@/components/layout/SectionWrapper";
import { getGalleria } from "@/lib/queries";

export default async function GalleriaPreview({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "Home.galleria" });
  const foto = (await getGalleria(locale)).slice(0, 6);

  return (
    <SectionWrapper bg="white">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-3xl text-primary">{t("title")}</h2>
        <Link href="/galleria" className="text-sm font-semibold text-primary hover:text-accent">
          {t("cta")} →
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-3 gap-3 md:grid-cols-6">
        {foto.length > 0
          ? foto.map((f, i) => (
              <div key={i} className="relative aspect-square overflow-hidden rounded-md">
                <Image src={f.fotoUrl} alt={f.didascalia || t("title")} fill className="object-cover" />
              </div>
            ))
          : Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-md bg-gradient-to-br from-primary/10 to-surfaceDark" />
            ))}
      </div>
    </SectionWrapper>
  );
}

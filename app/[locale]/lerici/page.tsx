import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";
import SectionWrapper from "@/components/layout/SectionWrapper";
import { getGalleria } from "@/lib/queries";
import { pageMetadata } from "@/lib/seo";

const COSA_VEDERE = ["castello", "porto", "spiagge"] as const;
const BORGHI = ["tellaro", "sanTerenzo", "fiascherino"] as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "LericiPage" });
  return pageMetadata({ title: t("title"), description: t("subtitle"), path: "/lerici", locale });
}

export default async function LericiPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "LericiPage" });
  const tContatti = await getTranslations({ locale, namespace: "ContattiPage" });
  const foto = (await getGalleria(locale)).filter((f) => f.categoria === "lerici");

  return (
    <>
      <SectionWrapper bg="white">
        <h1 className="font-heading text-4xl text-primary">{t("title")}</h1>
        <p className="mt-2 max-w-2xl text-textMuted">{t("subtitle")}</p>

        {foto.length > 0 && (
          <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
            {foto.map((f, i) => (
              <div key={i} className="relative aspect-square overflow-hidden rounded-md">
                <Image src={f.fotoUrl} alt={f.didascalia || t("title")} fill className="object-cover" />
              </div>
            ))}
          </div>
        )}
        <Link href="/galleria" className="mt-4 inline-block text-sm font-semibold text-primary hover:text-accent">
          {t("galleriaCta")} →
        </Link>
      </SectionWrapper>

      <SectionWrapper bg="surface">
        <h2 className="font-heading text-2xl text-primary">{t("cosaVedereTitle")}</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {COSA_VEDERE.map((key) => (
            <div key={key}>
              <h3 className="font-heading text-lg text-primary">
                {t(`${key}Titolo` as "castelloTitolo" | "portoTitolo" | "spiaggeTitolo")}
              </h3>
              <p className="mt-2 text-sm text-textMuted">
                {t(`${key}Descrizione` as "castelloDescrizione" | "portoDescrizione" | "spiaggeDescrizione")}
              </p>
            </div>
          ))}
        </div>
      </SectionWrapper>

      <SectionWrapper bg="white">
        <h2 className="font-heading text-2xl text-primary">{t("borghiTitle")}</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {BORGHI.map((key) => (
            <div key={key} className="rounded-lg border border-border p-6 shadow-card">
              <h3 className="font-heading text-lg text-primary">
                {t(`${key}Titolo` as "tellaroTitolo" | "sanTerenzoTitolo" | "fiascherinoTitolo")}
              </h3>
              <p className="mt-2 text-sm text-textMuted">
                {t(`${key}Descrizione` as "tellaroDescrizione" | "sanTerenzoDescrizione" | "fiascherinoDescrizione")}
              </p>
            </div>
          ))}
        </div>
      </SectionWrapper>

      <SectionWrapper bg="surface">
        <h2 className="font-heading text-2xl text-primary">{t("comeArrivareTitle")}</h2>
        <ul className="mt-4 space-y-1 text-textMuted">
          <li>{tContatti("auto")}</li>
          <li>{tContatti("treno")}</li>
          <li>{tContatti("battello")}</li>
        </ul>
      </SectionWrapper>
    </>
  );
}

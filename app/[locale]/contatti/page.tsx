import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import SectionWrapper from "@/components/layout/SectionWrapper";
import ContattoForm from "@/components/forms/ContattoForm";
import { pageMetadata } from "@/lib/seo";

const LAT = 44.0773612;
const LON = 9.9127261;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "ContattiPage" });
  return pageMetadata({
    title: t("title"),
    description: "Via Gerini 37, 19032 Lerici (SP) — +39 0187 967400 — info@hoteldelgolfo.com",
    path: "/contatti",
    locale,
  });
}

export default async function ContattiPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "ContattiPage" });

  return (
    <>
      <SectionWrapper bg="white">
        <h1 className="font-heading text-4xl text-primary">{t("title")}</h1>

        <div className="mt-10 grid gap-10 md:grid-cols-2">
          <div>
            <h2 className="font-heading text-xl text-primary">{t("formTitle")}</h2>
            <div className="mt-4">
              <ContattoForm />
            </div>
          </div>

          <div className="text-sm text-text">
            <p className="font-heading text-xl text-primary">{t("orariTitle")}</p>
            <p className="mt-2 text-textMuted">+39 0187 967400 · +39 335 7579786</p>
            <p className="text-textMuted">info@hoteldelgolfo.com</p>
            <p className="mt-2 text-textMuted">Via Gerini 37, 19032 Lerici (SP)</p>

            <p className="mt-6 font-heading text-xl text-primary">{t("comeArrivareTitle")}</p>
            <ul className="mt-2 space-y-1 text-textMuted">
              <li>{t("auto")}</li>
              <li>{t("treno")}</li>
              <li>{t("battello")}</li>
            </ul>

            <div className="mt-6 aspect-[4/3] overflow-hidden rounded-lg border border-border">
              <iframe
                title="Hotel del Golfo — mappa"
                src={`https://www.google.com/maps?q=${LAT},${LON}&z=15&output=embed`}
                className="h-full w-full border-0"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </SectionWrapper>
    </>
  );
}

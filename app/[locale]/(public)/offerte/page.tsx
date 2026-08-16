import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import SectionWrapper from "@/components/layout/SectionWrapper";
import OffertaCard from "@/components/ui/OffertaCard";
import { getOfferte } from "@/lib/queries";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "OffertePage" });
  return pageMetadata({ title: t("title"), description: t("subtitle"), path: "/offerte", locale });
}

function formatDate(date: string | undefined, locale: string) {
  if (!date) return null;
  return new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" }).format(
    new Date(date)
  );
}

export default async function OffertePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "OffertePage" });
  const offerte = await getOfferte(locale);

  return (
    <SectionWrapper bg="white">
      <h1 className="font-heading text-4xl text-primary">{t("title")}</h1>
      <p className="mt-2 text-textMuted">{t("subtitle")}</p>

      {offerte.length === 0 ? (
        <p className="mt-10 text-textMuted">{t("empty")}</p>
      ) : (
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {offerte.map((offerta) => {
            const inizio = formatDate(offerta.dataInizio, locale);
            const fine = formatDate(offerta.dataFine, locale);
            const validita = inizio && fine ? `${t("validoDal")} ${inizio} ${t("al")} ${fine}` : undefined;

            return (
              <OffertaCard
                key={offerta.slug}
                titolo={offerta.titolo}
                descrizione={offerta.descrizione}
                prezzo={offerta.prezzo}
                prezzoBarrato={offerta.prezzoBarrato}
                fotoUrl={offerta.fotoUrl}
                validita={validita}
                evidenziata={offerta.evidenziata}
                badgeLabel={t("badgeEvidenziata")}
                ctaLabel={t("cta")}
              />
            );
          })}
        </div>
      )}
    </SectionWrapper>
  );
}

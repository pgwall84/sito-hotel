// Booking Engine Diretto (modulo 19/08/2026) — pagina pubblica di
// prenotazione diretta. Server component solo per metadata/i18n, tutta
// l'interattività (date, disponibilità, pagamento) è nel client component
// BookingWidget, stesso pattern di separazione già usato altrove nel repo
// per le pagine che hanno bisogno di stato client (vedi consenso cookie).

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import SectionWrapper from "@/components/layout/SectionWrapper";
import { pageMetadata } from "@/lib/seo";
import BookingWidget from "@/components/booking/BookingWidget";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "PrenotaPage" });
  return pageMetadata({ title: t("title"), description: t("subtitle"), path: "/prenota", locale });
}

export default async function PrenotaPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "PrenotaPage" });

  return (
    <SectionWrapper bg="white">
      <h1 className="font-heading text-4xl text-primary">{t("title")}</h1>
      <p className="mt-2 text-textMuted">{t("subtitle")}</p>
      <div className="mt-10">
        <BookingWidget locale={locale} />
      </div>
    </SectionWrapper>
  );
}

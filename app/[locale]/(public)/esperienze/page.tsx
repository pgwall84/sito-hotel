import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";
import SectionWrapper from "@/components/layout/SectionWrapper";
import { getEsperienzaPesto } from "@/lib/queries";
import { pageMetadata } from "@/lib/seo";

const ESCURSIONI = ["cinqueTerre", "portovenere", "kayak", "trekking"] as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "EsperienzePage" });
  const tHome = await getTranslations({ locale, namespace: "Home.pesto" });
  const pesto = await getEsperienzaPesto(locale);
  return pageMetadata({
    title: t("title"),
    description: pesto?.descrizione || tHome("description"),
    path: "/esperienze",
    locale,
    image: pesto?.fotoUrl,
  });
}

export default async function EsperienzePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "EsperienzePage" });
  const tHome = await getTranslations({ locale, namespace: "Home.pesto" });
  const pesto = await getEsperienzaPesto(locale);

  const titolo = pesto?.titolo || tHome("title");
  const descrizione = pesto?.descrizione || tHome("description");
  const numero = pesto?.visitatoriStagione ? `${pesto.visitatoriStagione}+` : tHome("number");

  return (
    <>
      <SectionWrapper bg="accent">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <p className="font-heading text-6xl text-white">{numero}</p>
            <p className="mt-1 text-white/85">{tHome("numberLabel")}</p>
            <h1 className="mt-6 font-heading text-3xl text-white">{titolo}</h1>
            <p className="mt-4 text-white/90">{descrizione}</p>
            {pesto?.prezzo && (
              <p className="mt-4 text-white/90">
                {pesto.durata} · €{pesto.prezzo}
              </p>
            )}
            <a
              href="mailto:info@hoteldelgolfo.com?subject=Prenotazione degustazione pesto"
              className="mt-6 inline-block rounded-full bg-white px-7 py-3 text-sm font-semibold text-accent transition-colors hover:bg-surface"
            >
              {t("pestoCta")}
            </a>
          </div>
          {pesto?.fotoUrl ? (
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
              <Image src={pesto.fotoUrl} alt={titolo} fill className="object-cover" />
            </div>
          ) : (
            <div className="aspect-[4/3] rounded-lg bg-white/10" />
          )}
        </div>
      </SectionWrapper>

      <SectionWrapper bg="white">
        <h2 className="font-heading text-3xl text-primary">{t("escursioniTitle")}</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {ESCURSIONI.map((key) => (
            <Link
              key={key}
              href="/lerici"
              className="rounded-lg border border-border p-6 shadow-card transition-shadow hover:shadow-cardHover"
            >
              <h3 className="font-heading text-xl text-primary">{t(`escursioni.${key}.titolo`)}</h3>
              <p className="mt-2 text-sm text-textMuted">{t(`escursioni.${key}.descrizione`)}</p>
            </Link>
          ))}
        </div>
      </SectionWrapper>
    </>
  );
}

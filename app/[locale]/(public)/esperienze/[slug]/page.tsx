import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";
import SectionWrapper from "@/components/layout/SectionWrapper";
import Button from "@/components/ui/Button";
import ImageCarousel from "@/components/ui/ImageCarousel";
import { getEscursioneBySlug } from "@/lib/queries";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const esperienza = await getEscursioneBySlug(slug, locale);
  if (!esperienza) return {};
  return pageMetadata({
    title: esperienza.titolo,
    description: esperienza.descrizione || esperienza.descrizioneEstesa?.slice(0, 160) || esperienza.titolo,
    path: `/esperienze/${slug}`,
    locale,
    image: esperienza.fotoUrls[0],
  });
}

export default async function EsperienzaDettaglioPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "EsperienzaDettaglioPage" });
  const esperienza = await getEscursioneBySlug(slug, locale);

  if (!esperienza) notFound();

  // Paragrafi separati da una riga vuota nel campo "Descrizione estesa" di Sanity.
  const paragrafi = (esperienza.descrizioneEstesa ?? esperienza.descrizione ?? "")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <SectionWrapper bg="white">
      <Link href="/esperienze" className="text-sm font-semibold text-primary hover:text-accent">
        ← {t("backToList")}
      </Link>

      <div className="mt-6 grid items-start gap-10 md:grid-cols-2">
        <ImageCarousel foto={esperienza.fotoUrls} alt={esperienza.titolo} />

        <div>
          <h1 className="font-heading text-3xl text-primary">{esperienza.titolo}</h1>
          {esperienza.sottotitolo && <p className="mt-2 text-sm text-accentDeep">{esperienza.sottotitolo}</p>}
          <div className="mt-6 space-y-4 text-textMuted">
            {paragrafi.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          <Button href="/prenota" variant="primary" size="grande" className="mt-8 inline-block">
            {t("bookCta")}
          </Button>
        </div>
      </div>
    </SectionWrapper>
  );
}

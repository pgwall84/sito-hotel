import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";
import SectionWrapper from "@/components/layout/SectionWrapper";
import { getSezioneRistorante } from "@/lib/queries";

export default async function RistorantePreview({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "Home.ristorante" });
  const ristorante = await getSezioneRistorante(locale);

  const titolo = ristorante?.titolo || t("title");
  const descrizione = ristorante?.descrizione || t("description");

  return (
    <SectionWrapper bg="surface">
      <div className="grid items-center gap-10 md:grid-cols-2">
        {ristorante?.fotoUrl ? (
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
            <Image src={ristorante.fotoUrl} alt={titolo} fill className="object-cover" />
          </div>
        ) : (
          <div className="aspect-[4/3] rounded-lg bg-gradient-to-br from-primary/15 to-surfaceDark" />
        )}
        <div>
          <span className="inline-block rounded-full bg-primary px-4 py-1 text-xs font-semibold uppercase tracking-wide text-white">
            {t("tag")}
          </span>
          <h2 className="mt-4 font-heading text-3xl text-primary">{titolo}</h2>
          <p className="mt-4 text-textMuted">{descrizione}</p>
          <Link href="/ristorante" className="mt-6 inline-block text-sm font-semibold text-primary hover:text-accent">
            {t("cta")} →
          </Link>
        </div>
      </div>
    </SectionWrapper>
  );
}

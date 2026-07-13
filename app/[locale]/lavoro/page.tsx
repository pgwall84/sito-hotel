import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import SectionWrapper from "@/components/layout/SectionWrapper";
import ConvenzioneForm from "@/components/forms/ConvenzioneForm";
import { getConvenzioniAziendali } from "@/lib/queries";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "LavoroPage" });
  const convenzioni = await getConvenzioniAziendali(locale);
  return pageMetadata({
    title: convenzioni?.titolo || t("title"),
    description: convenzioni?.sottotitolo || t("subtitle"),
    path: "/lavoro",
    locale,
  });
}

export default async function LavoroPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "LavoroPage" });
  const convenzioni = await getConvenzioniAziendali(locale);

  const titolo = convenzioni?.titolo || t("title");
  const sottotitolo = convenzioni?.sottotitolo || t("subtitle");
  const servizi = convenzioni && convenzioni.servizi.length > 0 ? convenzioni.servizi : t.raw("serviziDefault");
  const testoConvenzioni = convenzioni?.testoConvenzioni || t("convenzioniFallback");
  const emailTo = convenzioni?.emailRichieste ?? "info@hoteldelgolfo.com";
  const mostraForm = convenzioni?.mostraFormRichiesta ?? true;

  return (
    <>
      {/* tono sobrio e professionale — niente elementi decorativi marini */}
      <SectionWrapper bg="surface">
        <h1 className="font-heading text-3xl text-primary">{titolo}</h1>
        <p className="mt-3 max-w-2xl text-textMuted">{sottotitolo}</p>
      </SectionWrapper>

      <SectionWrapper bg="white">
        <h2 className="font-heading text-2xl text-primary">{t("serviziTitle")}</h2>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {(servizi as string[]).map((s) => (
            <li key={s} className="flex gap-2 text-sm text-text">
              <span className="text-primary">✓</span>
              {s}
            </li>
          ))}
        </ul>
      </SectionWrapper>

      <SectionWrapper bg="surface">
        <h2 className="font-heading text-2xl text-primary">{t("convenzioniTitle")}</h2>
        <p className="mt-3 max-w-2xl text-textMuted">{testoConvenzioni}</p>

        {mostraForm && (
          <div className="mt-8 max-w-2xl">
            <h3 className="font-heading text-lg text-primary">{t("formTitle")}</h3>
            <div className="mt-4">
              <ConvenzioneForm emailTo={emailTo} />
            </div>
          </div>
        )}
      </SectionWrapper>
    </>
  );
}

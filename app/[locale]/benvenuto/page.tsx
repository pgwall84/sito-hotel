import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";
import SectionWrapper from "@/components/layout/SectionWrapper";
import { getWelcomeBook, getInfoHotel, getSezioneRistorante } from "@/lib/queries";
import { pageMetadata } from "@/lib/seo";

// Welcome Book digitale (modulo 4.2) — pagina raggiungibile SOLO da QR in
// camera o link diretto, mai dal menu pubblico (vedi NAV_ITEMS di
// Header/Footer, invariati) e mai dalla sitemap (app/sitemap.ts, invariato).
// Contiene la password WiFi: robots noindex/nofollow qui sotto, non è un
// dettaglio opzionale.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "BenvenutoPage" });
  const wb = await getWelcomeBook(locale);
  const meta = pageMetadata({
    title: wb?.titoloBenvenuto || t("title"),
    description: wb?.messaggioBenvenuto || t("subtitle"),
    path: "/benvenuto",
    locale,
  });
  return { ...meta, robots: { index: false, follow: false } };
}

export default async function BenvenutoPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "BenvenutoPage" });
  const wb = await getWelcomeBook(locale);
  const info = await getInfoHotel(locale);
  const ristorante = await getSezioneRistorante(locale);

  const titolo = wb?.titoloBenvenuto || t("title");
  const messaggio = wb?.messaggioBenvenuto || t("subtitle");
  const regoleCasa = wb && wb.regoleCasa.length > 0 ? wb.regoleCasa : t.raw("regoleDefault");
  const consigliLerici = wb && wb.consigliLerici.length > 0 ? wb.consigliLerici : t.raw("lericiDefault");
  const consigliLericiTitolo = wb?.consigliLericiTitolo || t("lericiTitle");

  return (
    <>
      <SectionWrapper bg="primary">
        <h1 className="font-heading text-3xl text-white">{titolo}</h1>
        <p className="mt-3 max-w-2xl text-white/85">{messaggio}</p>
      </SectionWrapper>

      {wb?.wifiNome && (
        <SectionWrapper bg="surface">
          <h2 className="font-heading text-xl text-primary">{t("wifiTitle")}</h2>
          <div className="mt-4 inline-flex flex-col gap-1 rounded-lg border border-border bg-background px-5 py-4 text-sm">
            <p>
              <span className="text-textMuted">{t("wifiNomeLabel")}: </span>
              <span className="font-semibold text-text">{wb.wifiNome}</span>
            </p>
            {wb.wifiPassword && (
              <p>
                <span className="text-textMuted">{t("wifiPasswordLabel")}: </span>
                <span className="font-semibold text-text">{wb.wifiPassword}</span>
              </p>
            )}
          </div>
        </SectionWrapper>
      )}

      {(wb?.orariCheckin || wb?.orariCheckout || wb?.orariColazione) && (
        <SectionWrapper bg="white">
          <h2 className="font-heading text-xl text-primary">{t("orariTitle")}</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {wb.orariCheckin && (
              <div>
                <p className="text-xs uppercase tracking-wide text-textMuted">{t("checkinLabel")}</p>
                <p className="mt-1 text-lg font-semibold text-text">{wb.orariCheckin}</p>
              </div>
            )}
            {wb.orariCheckout && (
              <div>
                <p className="text-xs uppercase tracking-wide text-textMuted">{t("checkoutLabel")}</p>
                <p className="mt-1 text-lg font-semibold text-text">{wb.orariCheckout}</p>
              </div>
            )}
            {wb.orariColazione && (
              <div>
                <p className="text-xs uppercase tracking-wide text-textMuted">{t("colazioneLabel")}</p>
                <p className="mt-1 text-lg font-semibold text-text">{wb.orariColazione}</p>
              </div>
            )}
          </div>
        </SectionWrapper>
      )}

      <SectionWrapper bg="surface">
        <h2 className="font-heading text-xl text-primary">{t("regoleTitle")}</h2>
        <ul className="mt-4 space-y-2">
          {(regoleCasa as string[]).map((r) => (
            <li key={r} className="flex gap-2 text-sm text-text">
              <span className="text-accent">•</span>
              {r}
            </li>
          ))}
        </ul>
      </SectionWrapper>

      <SectionWrapper bg="white">
        <h2 className="font-heading text-xl text-primary">{t("ristoranteTitle")}</h2>
        <p className="mt-3 max-w-2xl text-textMuted">{t("ristoranteText")}</p>
        {ristorante?.linkMenu && (
          <a
            href={ristorante.linkMenu}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block text-sm font-semibold text-primary hover:text-accent"
          >
            {t("menuCta")} →
          </a>
        )}
      </SectionWrapper>

      <SectionWrapper bg="surface">
        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <h2 className="font-heading text-xl text-primary">{t("contattiTitle")}</h2>
            <p className="mt-3 text-sm text-textMuted">{info.telefono}</p>
            {info.telefonoMobile && <p className="text-sm text-textMuted">{info.telefonoMobile}</p>}
            {info.orariReception && <p className="mt-2 text-sm text-textMuted">{info.orariReception}</p>}
          </div>

          {wb && wb.numeriUtili.length > 0 && (
            <div>
              <h2 className="font-heading text-xl text-primary">{t("numeriUtiliTitle")}</h2>
              <ul className="mt-3 space-y-1.5">
                {wb.numeriUtili.map((n) => (
                  <li key={n.etichetta} className="flex justify-between gap-4 text-sm text-textMuted">
                    <span>{n.etichetta}</span>
                    <span className="font-semibold text-text">{n.valore}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </SectionWrapper>

      <SectionWrapper bg="white">
        <h2 className="font-heading text-xl text-primary">{consigliLericiTitolo}</h2>
        <ul className="mt-4 space-y-2">
          {(consigliLerici as string[]).map((c) => (
            <li key={c} className="flex gap-2 text-sm text-text">
              <span className="text-accent">•</span>
              {c}
            </li>
          ))}
        </ul>
        <Link href="/lerici" className="mt-4 inline-block text-sm font-semibold text-primary hover:text-accent">
          {t("lericiCta")} →
        </Link>
      </SectionWrapper>
    </>
  );
}

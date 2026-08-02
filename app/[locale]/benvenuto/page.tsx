import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Clock, Wifi, ScrollText, UtensilsCrossed, Phone, MapPin } from "lucide-react";
import SectionWrapper from "@/components/layout/SectionWrapper";
import BenvenutoTile from "@/components/ui/BenvenutoTile";
import { getWelcomeBook } from "@/lib/queries";
import { pageMetadata } from "@/lib/seo";

// Welcome Book digitale (modulo 4.2) — hub raggiungibile SOLO da QR in
// camera o link diretto, mai dal menu pubblico (vedi NAV_ITEMS di
// Header/Footer, invariati) e mai dalla sitemap (app/sitemap.ts, invariato).
// Contiene la password WiFi (nella sottopagina /benvenuto/wifi): robots
// noindex/nofollow qui e su ogni sottopagina, non è un dettaglio opzionale.
//
// Struttura a griglia di pulsanti (ristrutturata dal titolare da una singola
// pagina a scorrimento — vedi docs/DIARIO_SESSIONI.md, modulo 4.2): ogni
// pulsante rimanda alla propria sottopagina sotto /benvenuto/[sezione].
// Il modello dati (getWelcomeBook, Sanity) non è cambiato, solo la
// presentazione — vedi lib/queries.ts.
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

  const titolo = wb?.titoloBenvenuto || t("title");
  const messaggio = wb?.messaggioBenvenuto || t("subtitle");

  // Elenco fisso per ora (6 sezioni concordate) — "poi aggiungiamo altre
  // info pulsanti" (nota del titolare): aggiungere qui una nuova voce +
  // la sottopagina corrispondente sotto /benvenuto/, stesso pattern.
  const TILES = [
    { href: "/benvenuto/orari", icon: Clock, label: t("orariTitle") },
    { href: "/benvenuto/wifi", icon: Wifi, label: t("wifiTitle") },
    { href: "/benvenuto/regole", icon: ScrollText, label: t("regoleTitle") },
    { href: "/benvenuto/ristorante", icon: UtensilsCrossed, label: t("ristoranteTitle") },
    { href: "/benvenuto/contatti", icon: Phone, label: t("contattiTitle") },
    { href: "/benvenuto/lerici", icon: MapPin, label: t("lericiTitle") },
  ] as const;

  return (
    <>
      <SectionWrapper bg="primary">
        <h1 className="font-heading text-3xl text-white">{titolo}</h1>
        <p className="mt-3 max-w-2xl text-white/85">{messaggio}</p>
      </SectionWrapper>

      <SectionWrapper bg="white">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {TILES.map((tile) => (
            <BenvenutoTile key={tile.href} href={tile.href} icon={tile.icon} label={tile.label} />
          ))}
        </div>
      </SectionWrapper>
    </>
  );
}

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import {
  LogIn, LogOut, Wifi, ScrollText, MapPin, Bus, ConciergeBell, Compass,
  UtensilsCrossed, Coffee, ShoppingBag, Info, Siren, Phone,
} from "lucide-react";
import SectionWrapper from "@/components/layout/SectionWrapper";
import BenvenutoTile from "@/components/ui/BenvenutoTile";
import LinguaSelector from "@/components/ui/LinguaSelector";
import { getWelcomeBook } from "@/lib/queries";
import { pageMetadata } from "@/lib/seo";

// Welcome Book digitale (modulo 4.2) — hub raggiungibile SOLO da QR in
// camera o link diretto, mai dal menu pubblico né dalla sitemap. Contiene
// la password WiFi (sottopagina /benvenuto/wifi): robots noindex/nofollow
// qui e su ogni sottopagina, non è un dettaglio opzionale.
//
// Redesign 16/08/2026: da 6 a 15 sezioni, griglia fissa 3 colonne anche su
// mobile (vedi components/ui/BenvenutoTile.tsx). Per aggiungere una nuova
// sezione: aggiungere qui una voce a TILES + la sottopagina corrispondente
// sotto (benvenuto)/benvenuto/[sezione]/page.tsx, stesso pattern.
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

  const TILES = [
    { href: "/benvenuto/checkin", icon: LogIn, label: t("checkinTitle") },
    { href: "/benvenuto/wifi", icon: Wifi, label: t("wifiTitle") },
    { href: "/benvenuto/regole", icon: ScrollText, label: t("regoleTitle") },
    { href: "/benvenuto/posizione", icon: MapPin, label: t("posizioneTitle") },
    { href: "/benvenuto/trasporti", icon: Bus, label: t("trasportiTitle") },
    { href: "/benvenuto/servizi", icon: ConciergeBell, label: t("serviziTitle") },
    { href: "/benvenuto/attivita", icon: Compass, label: t("attivitaTitle") },
    { href: "/benvenuto/ristoranti", icon: UtensilsCrossed, label: t("ristorantiTitle") },
    { href: "/benvenuto/bar", icon: Coffee, label: t("barTitle") },
    { href: "/benvenuto/shopping", icon: ShoppingBag, label: t("shoppingTitle") },
    { href: "/benvenuto/informazioni", icon: Info, label: t("informazioniTitle") },
    { href: "/benvenuto/emergenza", icon: Siren, label: t("emergenzaTitle") },
    { href: "/benvenuto/checkout", icon: LogOut, label: t("checkoutTitle") },
    { href: "/benvenuto/contatti", icon: Phone, label: t("contattiTitle") },
  ] as const;

  return (
    <>
      <SectionWrapper bg="primary">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-heading text-3xl text-white">{titolo}</h1>
            <p className="mt-3 max-w-2xl text-white/85">{messaggio}</p>
          </div>
          <LinguaSelector />
        </div>
      </SectionWrapper>

      <SectionWrapper bg="white">
        <div className="grid grid-cols-3 gap-3">
          {TILES.map((tile) => (
            <BenvenutoTile key={tile.href} href={tile.href} icon={tile.icon} label={tile.label} />
          ))}
        </div>
      </SectionWrapper>
    </>
  );
}

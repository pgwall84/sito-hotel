"use client";

import { usePathname } from "@/lib/i18n/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { ArrowLeft } from "lucide-react";
import LinguaSelector from "@/components/ui/LinguaSelector";

const SEGMENT_TITLE_KEYS: Record<string, string> = {
  checkin: "checkinTitle",
  checkout: "checkoutTitle",
  wifi: "wifiTitle",
  regole: "regoleTitle",
  posizione: "posizioneTitle",
  trasporti: "trasportiTitle",
  servizi: "serviziTitle",
  attivita: "attivitaTitle",
  ristoranti: "ristorantiTitle",
  bar: "barTitle",
  shopping: "shoppingTitle",
  informazioni: "informazioniTitle",
  emergenza: "emergenzaTitle",
  contatti: "contattiTitle",
};

export default function BenvenutoTopBar() {
  const pathname = usePathname();
  const t = useTranslations("BenvenutoPage");

  // Sull'hub (/benvenuto) niente topbar: la riga superiore lì è il banner
  // di benvenuto + LinguaSelector, non questa barra (vedi hub page.tsx).
  if (pathname === "/benvenuto") return null;

  const segment = pathname.split("/").pop() ?? "";
  const titleKey = SEGMENT_TITLE_KEYS[segment];
  const titolo = titleKey ? t(titleKey as Parameters<typeof t>[0]) : "";

  return (
    <div className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link
          href="/benvenuto"
          className="flex items-center gap-1 text-sm font-semibold text-primary hover:text-accent"
        >
          <ArrowLeft size={16} /> {t("menuBackCta")}
        </Link>
        <h1 className="font-heading text-base text-text">{titolo}</h1>
        <LinguaSelector />
      </div>
    </div>
  );
}

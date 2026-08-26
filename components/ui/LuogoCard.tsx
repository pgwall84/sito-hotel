"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Pill, Landmark, ShoppingCart, Church, Fuel, Car, Bus, Ship,
  ArrowUpDown, UtensilsCrossed, Coffee, ShoppingBag, Umbrella, Compass,
  Siren, Shield, Anchor, Info, MapPin, Phone, type LucideIcon,
} from "lucide-react";
import type { Luogo } from "@/lib/queries";
import Card from "@/components/ui/Card";

// Card per un singolo "luogo" (Trasporti, Servizi, Attività, Ristoranti
// esterni, Bar, Shopping, Informazioni, Emergenza — vedi docs/superpowers/
// specs/2026-08-16-welcome-book-design.md §3.2). Niente MapEmbed incorporato
// qui di proposito: dietro consenso cookie funzionale, attrito nel momento
// sbagliato per un ospite che cerca indicazioni — solo link esterno a
// Google Maps, che apre navigazione vera. MapEmbed resta in uso nella sola
// pagina Posizione (mappa unica, non in un elenco di card).
const CATEGORIA_ICONS: Record<string, LucideIcon> = {
  farmacia: Pill,
  "banca-bancomat": Landmark,
  supermercato: ShoppingCart,
  chiesa: Church,
  benzina: Fuel,
  taxi: Car,
  bus: Bus,
  traghetto: Ship,
  navetta: Bus,
  ascensore: ArrowUpDown,
  ristorante: UtensilsCrossed,
  bar: Coffee,
  negozio: ShoppingBag,
  spiaggia: Umbrella,
  "noleggio-attivita": Compass,
  soccorso: Siren,
  "forze-ordine": Shield,
  "guardia-costiera": Anchor,
  "comune-turismo": Info,
  altro: MapPin,
};

export default function LuogoCard({ luogo }: { luogo: Luogo }) {
  const t = useTranslations("LuogoCard");
  const [confermaChiamata, setConfermaChiamata] = useState(false);
  const Icon = CATEGORIA_ICONS[luogo.categoria ?? "altro"] ?? MapPin;

  const mapsHref =
    luogo.lat != null && luogo.lon != null
      ? `https://www.google.com/maps/search/?api=1&query=${luogo.lat},${luogo.lon}`
      : luogo.indirizzo
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(luogo.indirizzo)}`
        : null;

  return (
    <Card conFoto={false} className="flex flex-col gap-2 p-5">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface text-primary">
          <Icon size={20} />
        </span>
        <h3 className="font-heading text-lg text-primary">{luogo.nome}</h3>
      </div>

      {luogo.indirizzo && <p className="text-sm text-textMuted">{luogo.indirizzo}</p>}
      {luogo.nota && <p className="text-sm text-text">{luogo.nota}</p>}

      {(luogo.telefono || mapsHref) && (
        <div className="mt-2 flex items-center gap-3">
          {luogo.telefono && (
            <button
              type="button"
              aria-label={t("chiamaConferma")}
              onClick={() => setConfermaChiamata(true)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-surface text-primary hover:bg-surfaceDark"
            >
              <Phone size={16} />
            </button>
          )}
          {mapsHref && (
            <a
              href={mapsHref}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto text-sm font-semibold text-primary hover:text-accent"
            >
              {t("apriMappa")} →
            </a>
          )}
        </div>
      )}

      {confermaChiamata && luogo.telefono && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setConfermaChiamata(false)}
        >
          <div
            className="w-full max-w-xs rounded-xl bg-background p-6 text-center shadow-cardHover"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="font-heading text-lg text-primary">
              {t("chiamaConfirmTitle", { nome: luogo.nome })}
            </p>
            <p className="mt-1 text-sm text-textMuted">
              {t("chiamaConfirmNumero", { telefono: luogo.telefono })}
            </p>
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setConfermaChiamata(false)}
                className="flex-1 rounded-full border border-border py-2 text-sm font-semibold text-text"
              >
                {t("chiamaAnnulla")}
              </button>
              <a
                href={`tel:${luogo.telefono}`}
                className="flex-1 rounded-full bg-primary py-2 text-center text-sm font-semibold text-white"
              >
                {t("chiamaConferma")}
              </a>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

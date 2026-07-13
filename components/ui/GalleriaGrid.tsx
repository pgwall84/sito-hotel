"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";

type Foto = { fotoUrl: string; didascalia: string; categoria: string };

const CATEGORIE = ["all", "hotel", "camere", "ristorante", "lerici"] as const;

export default function GalleriaGrid({ foto }: { foto: Foto[] }) {
  const t = useTranslations("GalleriaPage");
  const [categoria, setCategoria] = useState<(typeof CATEGORIE)[number]>("all");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const filtrate = categoria === "all" ? foto : foto.filter((f) => f.categoria === categoria);

  const close = () => setLightboxIndex(null);
  const prev = () => setLightboxIndex((i) => (i === null ? null : (i - 1 + filtrate.length) % filtrate.length));
  const next = () => setLightboxIndex((i) => (i === null ? null : (i + 1) % filtrate.length));

  const filterLabel: Record<(typeof CATEGORIE)[number], string> = {
    all: t("filterAll"),
    hotel: t("filterHotel"),
    camere: t("filterCamere"),
    ristorante: t("filterRistorante"),
    lerici: t("filterLerici"),
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {CATEGORIE.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategoria(c)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              categoria === c ? "bg-primary text-white" : "bg-surface text-text hover:bg-surfaceDark"
            }`}
          >
            {filterLabel[c]}
          </button>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {filtrate.map((f, i) => (
          <button
            key={`${f.fotoUrl}-${i}`}
            type="button"
            onClick={() => setLightboxIndex(i)}
            className="relative aspect-square overflow-hidden rounded-md"
          >
            <Image src={f.fotoUrl} alt={f.didascalia} fill className="object-cover transition-transform hover:scale-105" />
          </button>
        ))}
      </div>

      {lightboxIndex !== null && filtrate[lightboxIndex] && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={close}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
        >
          <button
            type="button"
            aria-label={t("closeLightbox")}
            onClick={close}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-2xl text-white hover:bg-white/20"
          >
            ×
          </button>

          <button
            type="button"
            aria-label="Precedente"
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-2xl text-white hover:bg-white/20"
          >
            ‹
          </button>

          <div className="relative h-[80vh] w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <Image
              src={filtrate[lightboxIndex].fotoUrl}
              alt={filtrate[lightboxIndex].didascalia}
              fill
              className="object-contain"
            />
          </div>

          <button
            type="button"
            aria-label="Successiva"
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-2xl text-white hover:bg-white/20"
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}

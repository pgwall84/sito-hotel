import Image from "next/image";
import BookingButton from "@/components/ui/BookingButton";

export default function OffertaCard({
  titolo,
  descrizione,
  prezzo,
  prezzoBarrato,
  fotoUrl,
  validita,
  evidenziata,
  badgeLabel,
  ctaLabel,
}: {
  titolo: string;
  descrizione: string;
  prezzo?: number;
  prezzoBarrato?: number;
  fotoUrl?: string | null;
  validita?: string;
  evidenziata: boolean;
  badgeLabel: string;
  ctaLabel: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-lg bg-background shadow-card transition-shadow hover:shadow-cardHover">
      {evidenziata && (
        <span className="absolute left-3 top-3 z-10 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-white">
          {badgeLabel}
        </span>
      )}
      {fotoUrl ? (
        <div className="relative aspect-[4/3]">
          <Image src={fotoUrl} alt={titolo} fill className="object-cover" />
        </div>
      ) : (
        <div className="aspect-[4/3] bg-gradient-to-br from-primary/10 to-surfaceDark" />
      )}
      <div className="p-5">
        <h3 className="font-heading text-xl text-primary">{titolo}</h3>
        <p className="mt-2 text-sm text-textMuted">{descrizione}</p>
        {validita && <p className="mt-2 text-xs text-textLight">{validita}</p>}

        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm text-text">
            {prezzoBarrato && (
              <span className="mr-2 text-textLight line-through">€{prezzoBarrato}</span>
            )}
            {prezzo && <strong className="text-lg text-accent">€{prezzo}</strong>}
          </span>
        </div>

        <BookingButton className="mt-4 inline-block w-full rounded-full bg-primary px-5 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-primaryLight">
          {ctaLabel}
        </BookingButton>
      </div>
    </div>
  );
}

"use client";

import { theme } from "@/lib/theme";
import { Link } from "@/lib/i18n/navigation";

export default function BookingButton({
  cameraSlug,
  className,
  children,
}: {
  cameraSlug?: string;
  className?: string;
  children: React.ReactNode;
}) {
  if (theme.booking.engine === "teamsystem") {
    return (
      <a
        href={theme.booking.teamsystemUrl}
        target="_blank"
        rel="noopener noreferrer"
        data-camera-slug={cameraSlug}
        className={className}
      >
        {children}
      </a>
    );
  }

  // Default dal 19/08/2026 (theme.booking.engine === 'diretto'): Booking
  // Engine Diretto interno, /prenota — nessuna dipendenza esterna, il
  // <Link> di next-intl gestisce già il prefisso locale (it/en/de/fr).
  // cameraSlug passato come query string per un'eventuale preselezione
  // futura della camera in BookingWidget — non ancora letta lì (Task 10
  // del piano booking engine diretto copriva solo la ricerca generica per
  // date/ospiti), quindi oggi è un parametro innocuo, non una funzionalità
  // già attiva.
  return (
    <Link
      href={cameraSlug ? `/prenota?camera=${encodeURIComponent(cameraSlug)}` : "/prenota"}
      data-camera-slug={cameraSlug}
      className={className}
    >
      {children}
    </Link>
  );
}

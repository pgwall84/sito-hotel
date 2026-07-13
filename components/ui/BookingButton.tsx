"use client";

import { theme } from "@/lib/theme";

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

  // Fase 2: calendario WuBook custom — da implementare quando TS viene dismesso
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

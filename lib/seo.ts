import type { Metadata } from "next";
import { routing } from "@/lib/i18n/routing";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://hoteldelgolfolerici.com";
export const SITE_NAME = "Hotel del Golfo Lerici";

// path: es. "", "/camere", "/camere/standard" (nessuno slash finale)
export function pageMetadata({
  title,
  description,
  path,
  locale,
  image,
}: {
  title?: string;
  description: string;
  path: string;
  locale: string;
  image?: string | null;
}): Metadata {
  const languages: Record<string, string> = { "x-default": `/${routing.defaultLocale}${path}` };
  for (const l of routing.locales) languages[l] = `/${l}${path}`;

  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}${path}`,
      languages,
    },
    openGraph: {
      title,
      description,
      url: `/${locale}${path}`,
      siteName: SITE_NAME,
      images: image ? [image] : undefined,
      locale,
    },
  };
}

import type { MetadataRoute } from "next";
import { routing } from "@/lib/i18n/routing";
import { getCamere } from "@/lib/queries";
import { SITE_URL } from "@/lib/seo";

const STATIC_PATHS = ["", "/camere", "/ristorante", "/esperienze", "/lavoro", "/contatti", "/offerte", "/galleria"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const camere = await getCamere(routing.defaultLocale);
  const paths = [...STATIC_PATHS, ...camere.map((c) => `/camere/${c.slug}`)];

  const entries: MetadataRoute.Sitemap = [];
  for (const path of paths) {
    const languages = Object.fromEntries(routing.locales.map((l) => [l, `${SITE_URL}/${l}${path}`]));
    for (const locale of routing.locales) {
      entries.push({
        url: `${SITE_URL}/${locale}${path}`,
        lastModified: new Date(),
        alternates: { languages },
      });
    }
  }
  return entries;
}

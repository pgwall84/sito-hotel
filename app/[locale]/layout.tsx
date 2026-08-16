import type { Metadata } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";
import { Playfair_Display, Inter } from "next/font/google";
import { routing } from "@/lib/i18n/routing";
import { SITE_URL, SITE_NAME } from "@/lib/seo";
import CookieConsentInit from "@/components/cookie/CookieConsentInit";
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";
import "../globals.css";

const playfairDisplay = Playfair_Display({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Hotel familiare a Lerici, 150 metri dal mare — gateway per Cinque Terre e Portovenere.",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

// Ridotto 16/08/2026 (redesign Welcome Book): Header/Footer/WhatsAppButton
// spostati in (public)/layout.tsx — questo layout radice è condiviso da
// TUTTO il sito, incluso (benvenuto), che non deve ereditare la chrome
// pubblica. CookieConsentInit resta qui: MapEmbed (usato anche nel Welcome
// Book, pagina Posizione) dipende dal consenso cookie funzionale, deve
// restare disponibile ovunque.
export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return (
    <html
      lang={locale}
      className={`${playfairDisplay.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <NextIntlClientProvider>
          {children}
          <CookieConsentInit />
          <GoogleAnalytics />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

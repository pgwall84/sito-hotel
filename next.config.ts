import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./lib/i18n/request.ts");

// applicati a tutte le route, inclusa /studio — non hanno impatto sul suo funzionamento
const BASE_SECURITY_HEADERS = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

// in dev, webpack esegue i moduli con eval() (devtool eval-source-map):
// serve 'unsafe-eval' solo qui, mai in produzione dove non è necessario
const SCRIPT_SRC_EVAL = process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : "";

// CSP applicata solo al sito pubblico: lo Studio Sanity richiede una policy
// molto più permissiva per i propri bundle/worker interni
const PUBLIC_SITE_CSP = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${SCRIPT_SRC_EVAL} https://www.googletagmanager.com https://www.google-analytics.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https://cdn.sanity.io https://www.google-analytics.com https://www.googletagmanager.com",
  "font-src 'self' data:",
  "connect-src 'self' https://*.sanity.io https://www.google-analytics.com https://www.googletagmanager.com",
  "frame-src https://www.google.com",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: BASE_SECURITY_HEADERS,
      },
      {
        // esclude /studio: policy propria, molto più permissiva, non gestita qui
        source: "/((?!studio).*)",
        headers: [{ key: "Content-Security-Policy", value: PUBLIC_SITE_CSP }],
      },
    ];
  },
};

export default withNextIntl(nextConfig);

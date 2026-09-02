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

// in dev il Booking Engine Diretto chiama il gestionale in LAN su localhost:7001
// (vedi NEXT_PUBLIC_GESTIONALE_API_URL) — in produzione punta invece al dominio
// pubblico del gestionale, già coperto da HTTPS/CSP suo (vedi gestionale-hotel/CLAUDE.md)
const CONNECT_SRC_GESTIONALE =
  process.env.NODE_ENV === "development" ? " http://localhost:7001" : " https://hdgolfo-gestionale.com";

// CSP applicata solo al sito pubblico: lo Studio Sanity richiede una policy
// molto più permissiva per i propri bundle/worker interni
const PUBLIC_SITE_CSP = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${SCRIPT_SRC_EVAL} https://www.googletagmanager.com https://www.google-analytics.com https://js.stripe.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https://cdn.sanity.io https://www.google-analytics.com https://www.googletagmanager.com",
  "font-src 'self' data:",
  `connect-src 'self' https://*.sanity.io https://www.google-analytics.com https://www.googletagmanager.com https://api.stripe.com${CONNECT_SRC_GESTIONALE}`,
  "frame-src https://www.google.com https://js.stripe.com",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

// CSP dedicata alla pagina di test isolata dell'integrazione Nexi XPay
// (29/08/2026, vedi app/[locale]/xpay-test/page.tsx e Task 6 del piano) —
// NON applicata al resto del sito pubblico, solo a questo percorso non
// linkato. XPay Build v3 carica uno script SDK (hfsdk.js) e incorpora
// iframe di pagamento da un dominio Nexi il cui sottodominio esatto non è
// documentato in modo esplicito (il pattern osservato in sandbox è
// ngwecomm-dev.nexi.it, ma non è confermato al 100% finché non lo vediamo
// nella risposta reale di POST /orders/build) — per questo qui si usa un
// wildcard *.nexi.it/*.nexigroup.com invece del singolo host, solo su
// questa route isolata. Da restringere al dominio esatto una volta
// confermato durante il primo test reale (Task 6).
const XPAY_TEST_CSP = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${SCRIPT_SRC_EVAL} https://*.nexi.it https://*.nexigroup.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https://*.nexi.it https://*.nexigroup.com",
  "font-src 'self' data:",
  `connect-src 'self' https://*.nexi.it https://*.nexigroup.com${CONNECT_SRC_GESTIONALE}`,
  "frame-src https://*.nexi.it https://*.nexigroup.com",
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
        // esclude /studio (policy propria) e /xpay-test di ogni locale
        // (policy dedicata sotto, deve poter parlare con i domini Nexi)
        source: "/((?!studio|it/xpay-test|en/xpay-test|de/xpay-test|fr/xpay-test).*)",
        headers: [{ key: "Content-Security-Policy", value: PUBLIC_SITE_CSP }],
      },
      {
        source: "/:locale(it|en|de|fr)/xpay-test",
        headers: [{ key: "Content-Security-Policy", value: XPAY_TEST_CSP }],
      },
    ];
  },
};

export default withNextIntl(nextConfig);

// lib/theme.ts
export const theme = {
  colors: {
    primary: '#1B3A5C',      // blu profondo del golfo
    primaryLight: '#2A5A8C', // blu hover
    accent: '#C4703A',       // terracotta ligure
    accentLight: '#D4875A',  // terracotta hover
    accentDeep: '#A65F31',   // terracotta scurita per testo/sfondo a contrasto AA (27/08/2026, audit accessibilità: 4.88:1)
    background: '#FFFFFF',   // bianco caldo
    surface: '#F5F0E8',      // sabbia chiara (sezioni alternate)
    surfaceDark: '#EDE8DF',  // sabbia più scura
    text: '#2C2C2C',         // antracite morbido
    textMuted: '#6B6B6B',    // testo secondario
    textLight: '#767676',    // testo terziario (scurito 27/08/2026, audit accessibilità: 2.81:1 -> 4.54:1 su bianco)
    border: '#E0D8CE',       // bordi sabbia
    error: '#B23B2E',        // rosso mattone smorzato — sostituisce text-red-600 (stonato con la palette calda)
    white: '#FFFFFF',
    gold: '#C4A882',         // oro antico — eyebrow/testo secondario su navy
  },
  fonts: {
    heading: 'Playfair Display', // serif elegante per titoli
    body: 'Inter',               // sans-serif pulito per corpo
  },
  fontSizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem',
  },
  spacing: {
    section: '5rem',       // padding verticale sezioni
    sectionMobile: '3rem',
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px',
  },
  shadows: {
    card: '0 2px 12px rgba(27, 58, 92, 0.08)',
    cardHover: '0 8px 24px rgba(27, 58, 92, 0.16)',
  },
  booking: {
    // 'diretto'    → Booking Engine Diretto interno (/prenota, caparra Stripe) — DEFAULT dal 19/08/2026,
    //                widget TeamSystem fuori servizio. Vedi CLAUDE.md e
    //                docs/superpowers/specs/2026-08-19-booking-engine-diretto-design.md (repo gestionale-hotel).
    // 'teamsystem' → widget iframe TS — tenuto solo come fallback manuale, non più il default
    // 'wubook'     → non più previsto: la sincronizzazione OTA userà Beds24 (spec separata),
    //                il booking engine diretto sostituisce il calendario custom WuBook di questa entry
    engine: process.env.NEXT_PUBLIC_BOOKING_ENGINE || 'diretto',
    teamsystemUrl: 'https://digitalbooking.digiside.it/it/Struttura?strutture_id=224',
    wubookApiUrl: process.env.WUBOOK_API_URL || '',
  }
}

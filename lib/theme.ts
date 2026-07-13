// lib/theme.ts
export const theme = {
  colors: {
    primary: '#1B3A5C',      // blu profondo del golfo
    primaryLight: '#2A5A8C', // blu hover
    accent: '#C4703A',       // terracotta ligure
    accentLight: '#D4875A',  // terracotta hover
    background: '#FFFFFF',   // bianco caldo
    surface: '#F5F0E8',      // sabbia chiara (sezioni alternate)
    surfaceDark: '#EDE8DF',  // sabbia più scura
    text: '#2C2C2C',         // antracite morbido
    textMuted: '#6B6B6B',    // testo secondario
    textLight: '#9A9A9A',    // testo terziario
    border: '#E0D8CE',       // bordi sabbia
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
    engine: process.env.NEXT_PUBLIC_BOOKING_ENGINE || 'teamsystem',
    // 'teamsystem' → widget iframe TS
    // 'wubook'     → calendario custom con API WuBook
    teamsystemUrl: 'https://digitalbooking.digiside.it/it/Struttura?strutture_id=224',
    wubookApiUrl: process.env.WUBOOK_API_URL || '',
  }
}

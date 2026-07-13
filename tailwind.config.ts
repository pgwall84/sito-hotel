import type { Config } from "tailwindcss";
import { theme } from "./lib/theme";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: theme.colors,
      fontFamily: {
        heading: ["var(--font-heading)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      fontSize: theme.fontSizes,
      spacing: {
        section: theme.spacing.section,
        "section-mobile": theme.spacing.sectionMobile,
      },
      borderRadius: theme.borderRadius,
      boxShadow: theme.shadows,
    },
  },
} satisfies Config;

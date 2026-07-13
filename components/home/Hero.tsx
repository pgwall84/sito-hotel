import { useTranslations } from "next-intl";
import BookingButton from "@/components/ui/BookingButton";

const BADGE_KEYS = ["mare", "borgo", "ristorante", "famiglia"] as const;

export default function Hero() {
  const t = useTranslations("Home.hero");

  return (
    // sfondo navy placeholder — foto reale del golfo arriverà da Sanity (infoHotel/hero)
    <section className="relative overflow-hidden bg-primary text-white">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
      <div className="relative mx-auto flex max-w-6xl flex-col items-start px-4 py-24 md:py-32">
        <p className="text-[11px] uppercase tracking-[3px] text-gold">{t("eyebrow")}</p>

        <h1 className="mt-4 font-heading text-4xl leading-tight md:text-5xl">
          {t("titlePre")}
          <span className="italic text-gold">{t("titleHighlight")}</span>
        </h1>

        <p className="mt-4 max-w-xl text-lg text-white/85">{t("subtitle")}</p>

        <div className="mt-8 flex flex-wrap gap-4">
          <BookingButton className="rounded-full bg-accent px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-accentLight">
            {t("ctaPrimary")}
          </BookingButton>
          <a
            href="#punti-di-forza"
            className="rounded-full border border-white px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-primary"
          >
            {t("ctaSecondary")}
          </a>
        </div>

        <div
          id="punti-di-forza"
          className="mt-16 grid w-full grid-cols-2 gap-6 border-t border-white/15 pt-8 md:grid-cols-4"
        >
          {BADGE_KEYS.map((key) => (
            <p key={key} className="text-sm font-medium text-white/90">
              {t(`badges.${key}`)}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}

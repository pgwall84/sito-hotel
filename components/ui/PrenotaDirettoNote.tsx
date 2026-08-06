import { useTranslations } from "next-intl";

// Messaggio "prenota diretto" — nessuno sconto numerico impegnativo
// (decisione esplicita del titolare, 06/08/2026: prima serve una vera
// decisione commerciale su quanto scontare rispetto alle OTA, non ancora
// presa). Testo in messages/*.json, namespace "Booking" — riusato ovunque
// compare un BookingButton "primario" (Hero, dettaglio camera).
export default function PrenotaDirettoNote({ variant = "default" }: { variant?: "default" | "light" }) {
  const t = useTranslations("Booking");
  const colorClass = variant === "light" ? "text-white/75" : "text-textMuted";

  return <p className={`mt-3 text-xs ${colorClass}`}>{t("prenotaDirettoNote")}</p>;
}

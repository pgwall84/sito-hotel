import type { LucideIcon } from "lucide-react";
import { Link } from "@/lib/i18n/navigation";

// Pulsante a icona della griglia hub del Welcome Book digitale (modulo 4.2).
// Restyle 16/08/2026: da 6 a 15 tile, sempre 3 colonne anche su mobile
// (vedi app/[locale]/(benvenuto)/benvenuto/page.tsx) — icona/testo più
// compatti per stare leggibili in uno spazio più piccolo.
export default function BenvenutoTile({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-1.5 rounded-xl border border-border bg-background p-3 text-center shadow-card transition-shadow hover:shadow-cardHover"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-surface text-primary">
        <Icon size={20} />
      </span>
      <span className="text-xs font-semibold leading-tight text-text">{label}</span>
    </Link>
  );
}

import type { LucideIcon } from "lucide-react";
import { Link } from "@/lib/i18n/navigation";

// Pulsante a icona della griglia hub del Welcome Book digitale (modulo 4.2).
// Un tile = una sezione (WiFi, Orari, Regole...), con la propria sottopagina
// sotto /benvenuto/[sezione] — vedi app/[locale]/benvenuto/page.tsx.
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
      className="flex flex-col items-center gap-2 rounded-xl border border-border bg-background p-5 text-center shadow-card transition-shadow hover:shadow-cardHover"
    >
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-surface text-primary">
        <Icon size={26} />
      </span>
      <span className="text-sm font-semibold text-text">{label}</span>
    </Link>
  );
}

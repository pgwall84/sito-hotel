import type { LucideIcon } from "lucide-react";
import Card from "@/components/ui/Card";

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
    <Card
      conFoto={false}
      hover
      href={href}
      className="flex flex-col items-center gap-1.5 p-3 text-center"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-surface text-primary">
        <Icon size={20} />
      </span>
      <span className="text-xs font-semibold leading-tight text-text">{label}</span>
    </Card>
  );
}

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { SERVIZI_ICONS } from "@/lib/servizi";
import Card from "@/components/ui/Card";

export default function CameraCard({
  nome,
  servizi,
  prezzoBase,
  slug,
  fotoUrl,
  priceFromLabel,
  ctaLabel,
  grande = false,
  evidenziata = false,
  badgeLabel,
}: {
  nome: string;
  servizi: string[];
  prezzoBase: number;
  slug: string;
  fotoUrl?: string | null;
  priceFromLabel: string;
  ctaLabel: string;
  grande?: boolean;
  evidenziata?: boolean;
  badgeLabel?: string;
}) {
  const t = useTranslations("Servizi");

  return (
    <Card conFoto hover className="relative">
      {evidenziata && badgeLabel && (
        <span className="absolute left-3 top-3 z-10 rounded-full bg-accentDeep px-3 py-1 text-xs font-semibold text-white">
          {badgeLabel}
        </span>
      )}
      {fotoUrl ? (
        <div className="relative aspect-[4/3]">
          <Image src={fotoUrl} alt={nome} fill className="object-cover" />
        </div>
      ) : (
        <div className="aspect-[4/3] bg-gradient-to-br from-primary/10 to-surfaceDark" />
      )}
      <div className="p-5">
        <h3 className={`font-heading text-primary ${grande ? "text-2xl" : "text-xl"}`}>{nome}</h3>
        <p className="mt-2 text-sm text-textMuted">
          {servizi.map((s) => (t.has(s) ? `${SERVIZI_ICONS[s] ?? ""} ${t(s)}` : s)).join(" · ")}
        </p>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm text-text">
            {priceFromLabel} <strong className="text-lg text-accent">€{prezzoBase}</strong>
          </span>
          <Link href={`/camere/${slug}`} className="text-sm font-semibold text-primary hover:text-accent">
            {ctaLabel} →
          </Link>
        </div>
      </div>
    </Card>
  );
}

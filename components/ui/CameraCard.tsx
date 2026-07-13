import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { SERVIZI_ICONS } from "@/lib/servizi";

export default function CameraCard({
  nome,
  servizi,
  prezzoBase,
  slug,
  fotoUrl,
  priceFromLabel,
  ctaLabel,
}: {
  nome: string;
  servizi: string[];
  prezzoBase: number;
  slug: string;
  fotoUrl?: string | null;
  priceFromLabel: string;
  ctaLabel: string;
}) {
  const t = useTranslations("Servizi");

  return (
    <div className="overflow-hidden rounded-lg bg-background shadow-card transition-shadow hover:shadow-cardHover">
      {fotoUrl ? (
        <div className="relative aspect-[4/3]">
          <Image src={fotoUrl} alt={nome} fill className="object-cover" />
        </div>
      ) : (
        <div className="aspect-[4/3] bg-gradient-to-br from-primary/10 to-surfaceDark" />
      )}
      <div className="p-5">
        <h3 className="font-heading text-xl text-primary">{nome}</h3>
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
    </div>
  );
}

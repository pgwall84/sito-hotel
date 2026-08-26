import type { ComponentPropsWithoutRef } from "react";
import { Link } from "@/lib/i18n/navigation";

// Guscio fisico condiviso per tutte le "card" del sito (foto + testo, o
// icona + testo) — vedi docs/superpowers/specs/2026-08-26-coerenza-visiva-design.md,
// §"Componente Card". Nessuna direttiva "use client": Card non usa hook né
// API client-only, quindi resta importabile/renderizzabile sia da Server
// che da Client Component senza il rischio incontrato con buttonClasses
// (vedi components/ui/buttonClasses.ts) — qui non esiste comunque una
// funzione "classi pure" invocata fuori da JSX, quindi il problema non si
// pone.
//
// `conFoto` è OBBLIGATORIA (nessun default): ogni call site deve dichiarare
// esplicitamente se questa istanza è una card con foto (o fallback a
// gradiente, stessa area "foto in testa") in testa — niente bordo, la
// foto/il fallback definisce già il bordo visivo, overflow-hidden per
// ritagliare l'immagine dentro gli angoli arrotondati — oppure senza foto
// (bordo border-border, niente overflow-hidden).
//
// `hover` è opzionale (default false): true SOLO se la card, o il suo
// contenuto principale, è cliccabile/link (regola della spec).

type CardBaseProps = {
  conFoto: boolean;
  hover?: boolean;
  className?: string;
  children: React.ReactNode;
};

type CardAsLink = CardBaseProps & {
  href: string;
} & Omit<ComponentPropsWithoutRef<typeof Link>, "href" | "className" | "children">;

type CardAsDiv = CardBaseProps & {
  href?: undefined;
} & Omit<ComponentPropsWithoutRef<"div">, "className" | "children">;

export type CardProps = CardAsLink | CardAsDiv;

export default function Card(props: CardProps) {
  const { conFoto, hover = false, className = "", children } = props;
  const classi = [
    "rounded-lg",
    "bg-background",
    "shadow-card",
    conFoto ? "overflow-hidden" : "border border-border",
    hover ? "transition-shadow hover:shadow-cardHover" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (props.href !== undefined) {
    const { href, conFoto: _cf, hover: _h, className: _c, children: _ch, ...rest } = props;
    return (
      <Link href={href} {...rest} className={classi}>
        {children}
      </Link>
    );
  }

  const { conFoto: _cf2, hover: _h2, className: _c2, children: _ch2, href: _hh, ...rest } = props;
  return (
    <div {...rest} className={classi}>
      {children}
    </div>
  );
}

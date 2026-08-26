"use client";

import { Link } from "@/lib/i18n/navigation";
import { buttonClasses, type ButtonVariant, type ButtonSize } from "@/components/ui/buttonClasses";

// buttonClasses vive in components/ui/buttonClasses.ts, un modulo senza
// "use client" (fix 26/08/2026 — vedi commento lì per il motivo esatto).
// NON va ri-esportata (come valore) da qui: questo file ha "use client",
// e l'intero modulo — inclusi i re-export di valori — resta un confine
// client per il bundler RSC, quindi un Server Component che chiamasse
// buttonClasses passando da QUESTO file andrebbe comunque in errore. Ogni
// call site deve importare buttonClasses direttamente da
// "@/components/ui/buttonClasses", mai da "@/components/ui/Button". I
// tipi invece sono compile-time-only (spariscono prima del bundling), il
// re-export qui sotto è innocuo e comodo per chi importa già da qui il
// componente <Button>.
export type { ButtonVariant, ButtonSize };

type ButtonBaseProps = {
  variant: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: React.ReactNode;
};

type ButtonAsLink = ButtonBaseProps & {
  href: string;
} & Omit<React.ComponentPropsWithoutRef<"a">, "className" | "children" | "href">;

type ButtonAsButton = ButtonBaseProps & {
  href?: undefined;
} & Omit<React.ComponentPropsWithoutRef<"button">, "className" | "children">;

export type ButtonProps = ButtonAsLink | ButtonAsButton;

// Componente polimorfo: con `href` che inizia per "/" è un link di
// navigazione interna (next-intl Link, gestisce già il prefisso locale);
// con `href` che inizia per "#"/"mailto:"/altro è un <a> semplice (ancora
// in pagina, mailto, esterno); senza `href` è un <button> (per i form).
// Per i call site che passano già da BookingButton (Header, Hero
// primaria, OffertaCard — che hanno una propria logica di routing/
// fallback TeamSystem) si usa `buttonClasses` da solo, non questo
// componente, per non innestare due wrapper di routing diversi.
export default function Button(props: ButtonProps) {
  const { variant, size = "grande", className = "", children } = props;
  const classi = `${buttonClasses(variant, size)} ${className}`.trim();

  if (props.href !== undefined) {
    const { href, variant: _v, size: _s, className: _c, children: _ch, ...rest } = props;
    if (href.startsWith("/")) {
      return (
        <Link href={href} {...rest} className={classi}>
          {children}
        </Link>
      );
    }
    return (
      <a href={href} {...rest} className={classi}>
        {children}
      </a>
    );
  }

  const { variant: _v2, size: _s2, className: _c2, children: _ch2, href: _h, ...rest } = props;
  return (
    <button type="button" {...rest} className={classi}>
      {children}
    </button>
  );
}

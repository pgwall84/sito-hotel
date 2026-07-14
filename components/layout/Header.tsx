"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/lib/i18n/navigation";
import LinguaSelector from "@/components/ui/LinguaSelector";
import BookingButton from "@/components/ui/BookingButton";

const NAV_ITEMS = [
  { href: "/", key: "home" },
  { href: "/camere", key: "camere" },
  { href: "/ristorante", key: "ristorante" },
  { href: "/esperienze", key: "esperienze" },
  { href: "/lerici", key: "lerici" },
  { href: "/lavoro", key: "lavoro" },
  { href: "/offerte", key: "offerte" },
  { href: "/contatti", key: "contatti" },
] as const;

export default function Header({
  logoUrl,
  nome,
}: {
  logoUrl?: string | null;
  nome: string;
}) {
  const t = useTranslations("Nav");
  const tHeader = useTranslations("Header");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center">
          {logoUrl ? (
            <span className="relative block h-10 w-36">
              <Image src={logoUrl} alt={nome} fill className="object-contain object-left" priority />
            </span>
          ) : (
            <span className="font-heading text-xl font-semibold text-primary">{nome}</span>
          )}
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm font-medium transition-colors hover:text-accent ${
                pathname === item.href ? "text-accent" : "text-text"
              }`}
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 lg:flex">
          <LinguaSelector />
          <BookingButton className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-primaryLight">
            {tHeader("cta")}
          </BookingButton>
        </div>

        <button
          type="button"
          aria-label={tHeader("menuAria")}
          aria-expanded={open}
          className="flex h-10 w-10 items-center justify-center lg:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">{tHeader("menuAria")}</span>
          <div className="flex flex-col gap-1.5">
            <span className={`h-0.5 w-6 bg-text transition-transform ${open ? "translate-y-2 rotate-45" : ""}`} />
            <span className={`h-0.5 w-6 bg-text transition-opacity ${open ? "opacity-0" : ""}`} />
            <span className={`h-0.5 w-6 bg-text transition-transform ${open ? "-translate-y-2 -rotate-45" : ""}`} />
          </div>
        </button>
      </div>

      {open && (
        <nav className="flex flex-col gap-1 border-t border-border bg-background px-4 py-4 lg:hidden">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`rounded-md px-3 py-2 text-sm font-medium hover:bg-surface ${
                pathname === item.href ? "text-accent" : "text-text"
              }`}
            >
              {t(item.key)}
            </Link>
          ))}
          <div className="mt-2 px-3">
            <LinguaSelector />
          </div>
          <BookingButton className="mt-2 rounded-full bg-primary px-5 py-2.5 text-center text-sm font-semibold text-white">
            {tHeader("cta")}
          </BookingButton>
        </nav>
      )}
    </header>
  );
}

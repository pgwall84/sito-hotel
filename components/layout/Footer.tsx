import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import LinguaSelector from "@/components/ui/LinguaSelector";

const NAV_ITEMS = [
  { href: "/camere", key: "camere" },
  { href: "/ristorante", key: "ristorante" },
  { href: "/esperienze", key: "esperienze" },
  { href: "/lerici", key: "lerici" },
  { href: "/lavoro", key: "lavoro" },
  { href: "/offerte", key: "offerte" },
  { href: "/contatti", key: "contatti" },
] as const;

export default function Footer() {
  const t = useTranslations("Nav");
  const tFooter = useTranslations("Footer");
  const year = new Date().getFullYear();

  return (
    <footer className="bg-primary text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-4">
        <div>
          <span className="font-heading text-lg font-semibold">Hotel del Golfo</span>
          <p className="mt-2 text-sm text-white/70">Nel cuore del Golfo dei Poeti</p>
          <div className="mt-4">
            <LinguaSelector />
          </div>
        </div>

        <nav className="flex flex-col gap-2 text-sm">
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href} className="text-white/80 hover:text-white">
              {t(item.key)}
            </Link>
          ))}
        </nav>

        <div className="text-sm text-white/80">
          <p className="font-semibold text-white">{tFooter("contattiTitle")}</p>
          <p className="mt-2">+39 0187 967400</p>
          <p>+39 335 7579786</p>
          <p>info@hoteldelgolfo.com</p>
          <p className="mt-2">Via Gerini 37, 19032 Lerici (SP)</p>
          <p className="mt-2">{tFooter("orari")}</p>
        </div>

        <div className="text-sm text-white/80">
          <p className="font-semibold text-white">Social</p>
          <div className="mt-2 flex gap-3">
            <a href="#" aria-label="Facebook" className="hover:text-white">Facebook</a>
            <a href="#" aria-label="Instagram" className="hover:text-white">Instagram</a>
          </div>
          <div className="mt-4 flex flex-col gap-1">
            <Link href="/privacy-policy" className="hover:text-white">{tFooter("privacy")}</Link>
            <Link href="/cookie-policy" className="hover:text-white">{tFooter("cookie")}</Link>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 px-4 py-4 text-center text-xs text-white/60">
        <p>CITR 011016-ALB-0027</p>
        <p className="mt-1">© {year} Hotel del Golfo — {tFooter("rights")}</p>
      </div>
    </footer>
  );
}

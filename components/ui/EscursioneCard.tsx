import Image from "next/image";
import { Link } from "@/lib/i18n/navigation";
import { focusRingClasses } from "@/lib/a11y";

// Guscio proprio, non components/ui/Card.tsx: Card instrada sempre il suo
// href tramite il Link interno di next-intl (pensato per rotte del sito).
// Il campo `link` di `escursione` è testo libero da Sanity e può essere un
// URL esterno — stesso pattern già usato da components/ui/Button.tsx
// (interno via Link se inizia per "/", altrimenti <a> semplice), replicato
// qui invece di allargare il contratto di Card per un solo chiamante con
// questo bisogno specifico (27/08/2026, Punto 3b).
const CLASSI_CARD =
  `block overflow-hidden rounded-lg bg-background shadow-card transition-shadow hover:shadow-cardHover ${focusRingClasses}`;
const CLASSI_CARD_STATICA = "overflow-hidden rounded-lg bg-background shadow-card";

export default function EscursioneCard({
  titolo,
  sottotitolo,
  descrizione,
  fotoUrl,
  link,
}: {
  titolo: string;
  sottotitolo?: string;
  descrizione?: string;
  fotoUrl?: string | null;
  link?: string;
}) {
  const contenuto = (
    <>
      {fotoUrl ? (
        <div className="relative aspect-[4/3]">
          <Image src={fotoUrl} alt={titolo} fill className="object-cover" />
        </div>
      ) : (
        <div className="aspect-[4/3] bg-gradient-to-br from-primary/10 to-surfaceDark" />
      )}
      <div className="p-5">
        <h3 className="font-heading text-xl text-primary">{titolo}</h3>
        {sottotitolo && <p className="mt-1 text-sm text-accentDeep">{sottotitolo}</p>}
        {descrizione && <p className="mt-2 text-sm text-textMuted">{descrizione}</p>}
      </div>
    </>
  );

  if (link && link.startsWith("/")) {
    return (
      <Link href={link} className={CLASSI_CARD}>
        {contenuto}
      </Link>
    );
  }

  if (link) {
    return (
      <a href={link} target="_blank" rel="noopener noreferrer" className={CLASSI_CARD}>
        {contenuto}
      </a>
    );
  }

  return <div className={CLASSI_CARD_STATICA}>{contenuto}</div>;
}

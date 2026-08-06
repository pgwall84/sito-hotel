import { useTranslations } from "next-intl";

// Pulsante flottante "scrivici su WhatsApp" — link diretto wa.me, nessun
// backend/provider (06/08/2026, decisione esplicita del titolare: prima il
// link gratuito, un'eventuale WhatsApp Business API automatizzata si valuta
// più avanti separatamente). Stesso pattern già usato dal competitor locale
// Hotel Florida (hotelflorida.it, bottone verde in basso a destra).
// Verde brand WhatsApp (#25D366) invece della palette del sito: è il colore
// che i visitatori riconoscono a colpo d'occhio come "chat", non un elemento
// di marchio dell'hotel — stessa logica per cui nessun sito usa il proprio
// blu per l'icona WhatsApp.
export default function WhatsAppButton({ telefono }: { telefono?: string }) {
  const t = useTranslations("Chat");
  if (!telefono) return null;

  // wa.me vuole solo cifre (con prefisso internazionale, senza + o spazi)
  const numero = telefono.replace(/[^0-9]/g, "");
  const testo = encodeURIComponent(t("whatsappGreeting"));
  const href = `https://wa.me/${numero}?text=${testo}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t("whatsappLabel")}
      className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105"
      style={{ backgroundColor: "#25D366" }}
    >
      <svg viewBox="0 0 32 32" width="30" height="30" fill="white" aria-hidden="true">
        <path d="M16.004 3C9.377 3 4 8.373 4 15c0 2.34.671 4.523 1.834 6.375L4 29l7.828-1.79A11.94 11.94 0 0 0 16.004 27C22.63 27 28 21.627 28 15S22.63 3 16.004 3Zm0 21.75a9.7 9.7 0 0 1-4.945-1.354l-.354-.21-4.646 1.062 1.088-4.518-.232-.365A9.66 9.66 0 0 1 5.25 15c0-5.938 4.816-10.75 10.754-10.75S26.75 9.062 26.75 15 21.94 24.75 16.004 24.75Zm5.55-7.77c-.304-.152-1.797-.887-2.076-.988-.279-.101-.482-.152-.685.152-.203.304-.786.988-.964 1.19-.177.203-.355.228-.658.076-.304-.152-1.284-.473-2.446-1.51-.904-.806-1.514-1.802-1.692-2.106-.177-.304-.019-.469.133-.62.137-.136.304-.355.456-.532.152-.177.203-.304.304-.507.101-.203.05-.38-.025-.532-.076-.152-.685-1.65-.938-2.26-.247-.594-.498-.514-.685-.523l-.583-.01c-.203 0-.532.076-.811.38-.279.304-1.064 1.04-1.064 2.537s1.089 2.943 1.24 3.146c.152.203 2.144 3.273 5.194 4.59.726.313 1.292.5 1.734.64.729.232 1.392.199 1.917.121.585-.087 1.797-.735 2.05-1.445.253-.71.253-1.318.177-1.445-.076-.127-.279-.203-.583-.355Z" />
      </svg>
    </a>
  );
}

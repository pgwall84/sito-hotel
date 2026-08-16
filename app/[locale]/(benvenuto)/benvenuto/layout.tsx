import BenvenutoTopBar from "@/components/layout/BenvenutoTopBar";

// Chrome dedicata al Welcome Book digitale — NIENTE Header/Footer/
// WhatsAppButton pubblici (vedi (public)/layout.tsx, isolato da questo
// tramite route group). BenvenutoTopBar decide da sé se mostrarsi (si
// nasconde sull'hub, vedi components/layout/BenvenutoTopBar.tsx).
export default function BenvenutoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <BenvenutoTopBar />
      <main className="flex-1">{children}</main>
    </>
  );
}

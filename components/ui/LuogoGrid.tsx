import LuogoCard from "@/components/ui/LuogoCard";
import type { Luogo } from "@/lib/queries";

// Wrapper DRY per ogni pagina sezione che mostra un elenco di luoghi —
// stesso pattern "infoNonDisponibile" già in uso altrove nel Welcome Book:
// mai una sezione vuota senza spiegazione.
export default function LuogoGrid({
  luoghi,
  infoNonDisponibile,
}: {
  luoghi: Luogo[];
  infoNonDisponibile: string;
}) {
  if (luoghi.length === 0) {
    return <p className="mt-4 text-sm text-textMuted">{infoNonDisponibile}</p>;
  }

  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2">
      {luoghi.map((l, i) => (
        <LuogoCard key={`${l.nome}-${i}`} luogo={l} />
      ))}
    </div>
  );
}

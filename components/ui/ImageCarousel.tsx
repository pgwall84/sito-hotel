"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

const INTERVALLO_AUTOPLAY_MS = 5000;
const DURATA_TRANSIZIONE_MS = 700;

// Carosello con avanzamento automatico ogni pochi secondi. Il cambio foto è
// una dissolvenza incrociata con sfocatura (la vecchia foto sfuma sfocandosi,
// la nuova entra a fuoco) invece di un taglio netto. I valori di blur sono
// arbitrari (blur-[..px]) e non le utility standard (blur-md, ecc.): "blur-0"
// non esiste in Tailwind e non annullava lo sfocamento in modo esplicito.
// `controls=false` nasconde frecce e pallini (card piccole dove il carosello
// deve solo variare le foto da solo, es. dentro un <Link> — frecce/pallini
// dentro un link cliccabile sarebbero elementi interattivi annidati).
export default function ImageCarousel({
  foto,
  alt,
  controls = true,
}: {
  foto: string[];
  alt: string;
  controls?: boolean;
}) {
  const [corrente, setCorrente] = useState(0);
  const [precedente, setPrecedente] = useState<number | null>(null);
  const [aFuoco, setAFuoco] = useState(true);
  const timerAutoplay = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerTransizione = useRef<ReturnType<typeof setTimeout> | null>(null);

  const riavviaAutoplay = () => {
    if (timerAutoplay.current) clearInterval(timerAutoplay.current);
    if (foto.length > 1) {
      timerAutoplay.current = setInterval(() => {
        vaia((i) => (i + 1) % foto.length);
      }, INTERVALLO_AUTOPLAY_MS);
    }
  };

  useEffect(() => {
    riavviaAutoplay();
    return () => {
      if (timerAutoplay.current) clearInterval(timerAutoplay.current);
      if (timerTransizione.current) clearTimeout(timerTransizione.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [foto.length]);

  if (foto.length === 0) {
    return <div className="aspect-[4/3] rounded-lg bg-white/10" />;
  }

  function vaia(calcolaNuovoIndice: (i: number) => number) {
    setCorrente((attuale) => {
      const nuovoIndice = calcolaNuovoIndice(attuale);
      if (nuovoIndice === attuale) return attuale;
      setPrecedente(attuale);
      setAFuoco(false);
      if (timerTransizione.current) clearTimeout(timerTransizione.current);
      requestAnimationFrame(() => requestAnimationFrame(() => setAFuoco(true)));
      timerTransizione.current = setTimeout(() => setPrecedente(null), DURATA_TRANSIZIONE_MS + 50);
      return nuovoIndice;
    });
    riavviaAutoplay();
  }

  const prev = () => vaia((i) => (i - 1 + foto.length) % foto.length);
  const next = () => vaia((i) => (i + 1) % foto.length);
  const vaiA = (i: number) => vaia(() => i);

  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
      {precedente !== null && (
        <Image
          src={foto[precedente]}
          alt={alt}
          fill
          className={`absolute inset-0 object-cover transition-[opacity,filter] duration-[700ms] ease-in-out ${
            aFuoco ? "opacity-0 blur-[14px]" : "opacity-100 blur-[0px]"
          }`}
        />
      )}
      <Image
        src={foto[corrente]}
        alt={alt}
        fill
        className={`absolute inset-0 object-cover transition-[opacity,filter] duration-[700ms] ease-in-out ${
          aFuoco ? "opacity-100 blur-[0px]" : "opacity-0 blur-[14px]"
        }`}
      />

      {controls && foto.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Foto precedente"
            onClick={prev}
            className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-xl text-white hover:bg-black/60"
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="Foto successiva"
            onClick={next}
            className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-xl text-white hover:bg-black/60"
          >
            ›
          </button>
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {foto.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Vai alla foto ${i + 1}`}
                onClick={() => vaiA(i)}
                className={`h-2 w-2 rounded-full transition-colors ${
                  i === corrente ? "bg-white" : "bg-white/40"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

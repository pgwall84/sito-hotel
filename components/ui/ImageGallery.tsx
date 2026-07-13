"use client";

import { useState } from "react";
import Image from "next/image";

export default function ImageGallery({ images, alt }: { images: string[]; alt: string }) {
  const [index, setIndex] = useState(0);

  if (images.length === 0) {
    return <div className="aspect-[16/10] rounded-lg bg-gradient-to-br from-primary/10 to-surfaceDark" />;
  }

  const prev = () => setIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  const next = () => setIndex((i) => (i === images.length - 1 ? 0 : i + 1));

  return (
    <div>
      <div className="relative aspect-[16/10] overflow-hidden rounded-lg bg-surfaceDark">
        <Image src={images[index]} alt={`${alt} — ${index + 1}/${images.length}`} fill className="object-cover" />
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Precedente"
              className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-primary shadow-card hover:bg-white"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Successiva"
              className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-primary shadow-card hover:bg-white"
            >
              ›
            </button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-3 flex justify-center gap-2">
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Foto ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-2 w-2 rounded-full transition-colors ${i === index ? "bg-primary" : "bg-border"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

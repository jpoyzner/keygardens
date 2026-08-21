"use client";

import { useState } from "react";
import Image from "next/image";
import type { ComingSoonSlide } from "@/lib/coming-soon";

export function ComingSoonSlideshow({ slides }: { slides: ComingSoonSlide[] }) {
  const [index, setIndex] = useState(0);

  if (slides.length === 0) {
    return <p className="text-zinc-600">More products are on the way — check back soon!</p>;
  }

  const slide = slides[index];
  const goTo = (next: number) => setIndex((next + slides.length) % slides.length);

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-video overflow-hidden rounded border border-zinc-200 bg-zinc-50">
        <Image
          src={slide.url}
          alt={slide.caption ?? "Coming soon"}
          fill
          sizes="(min-width: 768px) 700px, 100vw"
          className="object-contain"
          priority
        />
      </div>

      {slide.caption && <p className="text-center text-zinc-700">{slide.caption}</p>}

      {slides.length > 1 && (
        <div className="flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => goTo(index - 1)}
            className="rounded border border-zinc-300 px-3 py-1 text-sm"
            aria-label="Previous slide"
          >
            ‹ Prev
          </button>
          <div className="flex gap-1.5">
            {slides.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-2 w-2 rounded-full ${i === index ? "bg-zinc-900" : "bg-zinc-300"}`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => goTo(index + 1)}
            className="rounded border border-zinc-300 px-3 py-1 text-sm"
            aria-label="Next slide"
          >
            Next ›
          </button>
        </div>
      )}
    </div>
  );
}

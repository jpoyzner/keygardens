"use client";

import { useRef, useState } from "react";
import Image from "next/image";

export function ProductGallery({
  images,
  productName,
}: {
  images: { url: string; alt: string | null }[];
  productName: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomOrigin, setZoomOrigin] = useState({ x: 50, y: 50 });
  const [zoomed, setZoomed] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const active = images[activeIndex];

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setZoomOrigin({ x, y });
  }

  if (!active) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded bg-zinc-100 text-sm text-zinc-400">
        No image
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-3">
      <div
        ref={containerRef}
        className="relative aspect-square w-full cursor-zoom-in overflow-hidden rounded bg-zinc-100"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setZoomed(true)}
        onMouseLeave={() => setZoomed(false)}
        onClick={() => setLightboxOpen(true)}
      >
        <Image
          src={active.url}
          alt={active.alt ?? productName}
          fill
          sizes="(min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-150 ease-out"
          style={
            zoomed
              ? { transform: "scale(2)", transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%` }
              : undefined
          }
          priority
        />
      </div>

      {images.length > 1 && (
        <div className="flex gap-2">
          {images.map((image, index) => (
            <button
              key={image.url}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Show image ${index + 1}`}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded border ${
                index === activeIndex ? "border-zinc-900" : "border-zinc-200"
              }`}
            >
              <Image src={image.url} alt={image.alt ?? productName} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}

      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            type="button"
            aria-label="Close"
            className="absolute top-4 right-4 text-2xl text-white"
            onClick={() => setLightboxOpen(false)}
          >
            &times;
          </button>
          <div className="relative h-full max-h-[80vh] w-full max-w-3xl">
            <Image
              src={active.url}
              alt={active.alt ?? productName}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}

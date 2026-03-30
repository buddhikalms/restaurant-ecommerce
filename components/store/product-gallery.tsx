"use client";

import { useMemo, useState } from "react";

import { RemoteImage } from "@/components/ui/remote-image";
import { cn } from "@/lib/utils";

export function ProductGallery({
  productName,
  images,
}: {
  productName: string;
  images: string[];
}) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const activeImage = useMemo(() => {
    if (!images.length) {
      return null;
    }

    if (selectedImage && images.includes(selectedImage)) {
      return selectedImage;
    }

    return images[0];
  }, [images, selectedImage]);

  if (!activeImage) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-[2.5rem] border border-white/70 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
        <RemoteImage
          src={activeImage}
          alt={productName}
          width={1600}
          height={1200}
          priority
          className="aspect-[4/3] h-full w-full object-cover"
        />
      </div>

      {images.length > 1 ? (
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
          {images.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setSelectedImage(image)}
              className={cn(
                "group overflow-hidden rounded-[1.3rem] border bg-white shadow-sm transition",
                image === activeImage
                  ? "border-[var(--brand)] ring-2 ring-[var(--brand)]/20"
                  : "border-slate-200 hover:border-slate-300",
              )}
              aria-label={`Show gallery image ${index + 1}`}
            >
              <RemoteImage
                src={image}
                alt={`${productName} view ${index + 1}`}
                width={320}
                height={320}
                loading="lazy"
                className="aspect-square h-full w-full object-cover transition duration-300 group-hover:scale-105"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

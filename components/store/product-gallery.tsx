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
    <div className="space-y-3">
      <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)]">
        <RemoteImage
          src={activeImage}
          alt={productName}
          width={1200}
          height={900}
          priority
          className="aspect-[4/3] h-full w-full object-cover"
        />
      </div>

      {images.length > 1 ? (
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
          {images.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setSelectedImage(image)}
              className={cn(
                "overflow-hidden rounded-md border bg-[var(--surface)]",
                image === activeImage
                  ? "border-[var(--brand)]"
                  : "border-[var(--border)] hover:border-[var(--border-strong)]",
              )}
              aria-label={`Show gallery image ${index + 1}`}
            >
              <RemoteImage
                src={image}
                alt={`${productName} view ${index + 1}`}
                width={240}
                height={240}
                className="aspect-square h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

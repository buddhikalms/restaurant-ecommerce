import Image from "next/image";

import { cn } from "@/lib/utils";

export function RemoteImage({
  src,
  alt,
  width,
  height,
  className,
  sizes,
  priority,
  loading,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  sizes?: string;
  priority?: boolean;
  loading?: "eager" | "lazy";
}) {
  return (
    <Image
      unoptimized
      src={src}
      alt={alt}
      width={width}
      height={height}
      sizes={sizes}
      priority={priority}
      loading={loading}
      className={cn(className)}
    />
  );
}

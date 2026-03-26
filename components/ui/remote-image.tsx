import Image from "next/image";

import { cn } from "@/lib/utils";

export function RemoteImage({
  src,
  alt,
  width,
  height,
  className,
  sizes
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  sizes?: string;
}) {
  return (
    <Image
      unoptimized
      src={src}
      alt={alt}
      width={width}
      height={height}
      sizes={sizes}
      className={cn(className)}
    />
  );
}
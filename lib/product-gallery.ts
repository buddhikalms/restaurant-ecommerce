export function parseGalleryImageUrlsText(text?: string | null) {
  return Array.from(
    new Set(
      (text ?? "")
        .split(/\r?\n/)
        .map((value) => value.trim())
        .filter(Boolean)
    )
  );
}

function isValidUrl(value: string) {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function sanitizeGalleryImageUrls(values: string[]) {
  return Array.from(
    new Set(
      values
        .map((value) => value.trim())
        .filter(Boolean)
    )
  );
}

export function coerceGalleryImageUrls(value: unknown): string[] {
  if (Array.isArray(value)) {
    return sanitizeGalleryImageUrls(value.filter((item): item is string => typeof item === "string"));
  }

  if (typeof value === "string") {
    const normalized = value.trim();

    if (!normalized) {
      return [];
    }

    try {
      return coerceGalleryImageUrls(JSON.parse(normalized));
    } catch {
      return parseGalleryImageUrlsText(normalized);
    }
  }

  return [];
}

export function getGalleryImageValidationError(text?: string | null) {
  const galleryImageUrls = parseGalleryImageUrlsText(text);

  if (galleryImageUrls.length > 8) {
    return "You can add up to 8 gallery images.";
  }

  if (galleryImageUrls.some((url) => !isValidUrl(url))) {
    return "Each gallery image must be a valid URL on its own line.";
  }

  return null;
}

export function normalizeGalleryImageUrls(primaryImageUrl: string, text?: string | null) {
  const normalizedPrimaryImageUrl = primaryImageUrl.trim();

  return parseGalleryImageUrlsText(text).filter((url) => url !== normalizedPrimaryImageUrl);
}

export function buildProductGalleryImages(primaryImageUrl: string, galleryImageUrls: unknown = []) {
  return Array.from(
    new Set(
      [primaryImageUrl, ...coerceGalleryImageUrls(galleryImageUrls)]
        .map((value) => value.trim())
        .filter(Boolean)
    )
  );
}
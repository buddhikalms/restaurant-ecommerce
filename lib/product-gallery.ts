function parseGalleryImageUrlsText(text?: string | null) {
  return Array.from(
    new Set(
      (text ?? "")
        .split(/\r?\n/)
        .map((value) => value.trim())
        .filter(Boolean),
    ),
  );
}

function normalizeImageReferences(values: string[]) {
  return Array.from(
    new Set(
      values.map((value) => value.trim()).filter(Boolean),
    ),
  );
}

export function isValidImageReference(value: string) {
  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return false;
  }

  if (normalizedValue.startsWith("/")) {
    return true;
  }

  try {
    const url = new URL(normalizedValue);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function coerceGalleryImageUrls(value: unknown): string[] {
  if (Array.isArray(value)) {
    return normalizeImageReferences(
      value.filter((item): item is string => typeof item === "string"),
    ).filter(isValidImageReference);
  }

  if (typeof value === "string") {
    const normalized = value.trim();

    if (!normalized) {
      return [];
    }

    try {
      return coerceGalleryImageUrls(JSON.parse(normalized));
    } catch {
      return parseGalleryImageUrlsText(normalized).filter(isValidImageReference);
    }
  }

  return [];
}

export function getGalleryImageValidationError(values: string[] = []) {
  const galleryImageUrls = normalizeImageReferences(values);

  if (galleryImageUrls.length > 8) {
    return "You can keep up to 8 gallery images.";
  }

  if (galleryImageUrls.some((value) => !isValidImageReference(value))) {
    return "Each gallery image must be a valid uploaded image or URL.";
  }

  return null;
}

export function normalizeGalleryImageUrls(
  primaryImageUrl: string,
  values: string[] = [],
) {
  const normalizedPrimaryImageUrl = primaryImageUrl.trim();

  return normalizeImageReferences(values)
    .filter(isValidImageReference)
    .filter((value) => value !== normalizedPrimaryImageUrl);
}

export function buildProductGalleryImages(
  primaryImageUrl: string,
  galleryImageUrls: unknown = [],
) {
  return Array.from(
    new Set(
      [primaryImageUrl, ...coerceGalleryImageUrls(galleryImageUrls)]
        .map((value) => value.trim())
        .filter(isValidImageReference),
    ),
  );
}

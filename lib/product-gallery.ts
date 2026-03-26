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

export function buildProductGalleryImages(primaryImageUrl: string, galleryImageUrls: string[] = []) {
  return Array.from(
    new Set(
      [primaryImageUrl, ...galleryImageUrls]
        .map((value) => value.trim())
        .filter(Boolean)
    )
  );
}
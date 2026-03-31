import "server-only";

import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const PRODUCT_UPLOAD_DIRECTORY = path.join(
  process.cwd(),
  "public",
  "uploads",
  "products",
);
const MAX_IMAGE_FILE_SIZE = 5 * 1024 * 1024;
const MIME_TYPE_EXTENSION_MAP = new Map<string, string>([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
  ["image/avif", ".avif"],
  ["image/gif", ".gif"],
]);
const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif"]);

function isUploadedFile(value: FormDataEntryValue | null): value is File {
  return value instanceof File && value.size > 0 && value.name.trim().length > 0;
}

function getFileExtension(file: File) {
  const extensionFromMimeType = MIME_TYPE_EXTENSION_MAP.get(file.type);

  if (extensionFromMimeType) {
    return extensionFromMimeType;
  }

  const fileExtension = path.extname(file.name).toLowerCase();

  if (ALLOWED_EXTENSIONS.has(fileExtension)) {
    return fileExtension === ".jpeg" ? ".jpg" : fileExtension;
  }

  throw new Error("Upload images as JPG, PNG, WebP, AVIF, or GIF files.");
}

export function getUploadedFile(value: FormDataEntryValue | null) {
  return isUploadedFile(value) ? value : null;
}

export function getUploadedFiles(values: FormDataEntryValue[]) {
  return values.filter((value): value is File => isUploadedFile(value));
}

export async function saveUploadedProductImage(file: File) {
  if (file.size > MAX_IMAGE_FILE_SIZE) {
    throw new Error("Each uploaded image must be 5MB or smaller.");
  }

  const extension = getFileExtension(file);
  const fileName = `${Date.now()}-${randomUUID()}${extension}`;
  const filePath = path.join(PRODUCT_UPLOAD_DIRECTORY, fileName);
  const buffer = Buffer.from(await file.arrayBuffer());

  await mkdir(PRODUCT_UPLOAD_DIRECTORY, { recursive: true });
  await writeFile(filePath, buffer);

  return `/uploads/products/${fileName}`;
}

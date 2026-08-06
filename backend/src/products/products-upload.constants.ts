import { BadRequestException } from "@nestjs/common";
import { randomUUID } from "crypto";
import { mkdirSync } from "fs";
import path from "path";
import multer from "multer";

const uploadRoot = process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR)
  : path.resolve(process.cwd(), "uploads");

export const PRODUCT_UPLOAD_PATH = path.join(uploadRoot, "products");

export const IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export const PRODUCT_IMAGE_EXTENSIONS: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

export const PRODUCT_ALLOWED_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
]);

export const PRODUCT_IMAGE_MAX_SIZE = 5 * 1024 * 1024;

export function createProductStorage() {
  mkdirSync(PRODUCT_UPLOAD_PATH, { recursive: true });
  return multer.diskStorage({
    destination: (_req, _file, cb) => {
      mkdirSync(PRODUCT_UPLOAD_PATH, { recursive: true });
      cb(null, PRODUCT_UPLOAD_PATH);
    },
    filename: (_req, file, cb) => {
      const ext = PRODUCT_IMAGE_EXTENSIONS[file.mimetype] || "";
      cb(null, `${randomUUID()}${ext}`);
    },
  });
}

export function productImageFilter(
  _req: any,
  file: Express.Multer.File,
  cb: (error: Error | null, acceptFile: boolean) => void,
) {
  if (IMAGE_MIME_TYPES.has(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new BadRequestException(
        `Tipo de arquivo não permitido: ${file.originalname}`,
      ),
      false,
    );
  }
}
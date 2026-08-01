import { BadRequestException } from "@nestjs/common";
import { randomUUID } from "crypto";
import { mkdirSync } from "fs";
import path from "path";
import multer from "multer";

const uploadRoot = process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR)
  : path.resolve(process.cwd(), "uploads");

export const SUPPORT_UPLOAD_PATH = path.join(uploadRoot, "support");

export const IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export const DOCUMENT_MIME_TYPES = new Set([
  "application/pdf",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/csv",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
]);

export const VIDEO_MIME_TYPES = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime",
]);

export const SUPPORT_UPLOAD_LIMITS: Record<
  string,
  { maxSize: number; maxFiles: number }
> = {
  images: { maxSize: 5 * 1024 * 1024, maxFiles: 6 },
  documents: { maxSize: 10 * 1024 * 1024, maxFiles: 3 },
  videos: { maxSize: 20 * 1024 * 1024, maxFiles: 3 },
};

export const FILE_EXTENSIONS: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "application/pdf": ".pdf",
  "text/plain": ".txt",
  "application/msword": ".doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    ".docx",
  "text/csv": ".csv",
  "application/vnd.ms-excel": ".xls",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ".xlsx",
  "video/mp4": ".mp4",
  "video/webm": ".webm",
  "video/quicktime": ".mov",
};

export const ALLOWED_FILE_EXTENSIONS = new Set<string>([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".pdf",
  ".txt",
  ".doc",
  ".docx",
  ".csv",
  ".xls",
  ".xlsx",
  ".mp4",
  ".webm",
  ".mov",
]);

export function createSupportStorage() {
  mkdirSync(SUPPORT_UPLOAD_PATH, { recursive: true });
  return multer.diskStorage({
    destination: (req, file, cb) => {
      mkdirSync(SUPPORT_UPLOAD_PATH, { recursive: true });
      cb(null, SUPPORT_UPLOAD_PATH);
    },
    filename: (req, file, cb) => {
      const ext = FILE_EXTENSIONS[file.mimetype] || "";
      cb(null, `${randomUUID()}${ext}`);
    },
  });
}

export function supportFileFilter(
  req: any,
  file: Express.Multer.File,
  cb: (error: Error | null, acceptFile: boolean) => void,
) {
  const allowed =
    (file.fieldname === "images" && IMAGE_MIME_TYPES.has(file.mimetype)) ||
    (file.fieldname === "documents" &&
      DOCUMENT_MIME_TYPES.has(file.mimetype)) ||
    (file.fieldname === "videos" && VIDEO_MIME_TYPES.has(file.mimetype));

  if (allowed) {
    cb(null, true);
  } else {
    cb(
      new BadRequestException(
        `Tipo de arquivo não permitido no campo "${file.fieldname}": ${file.originalname}`,
      ),
      false,
    );
  }
}

export function sanitizeText(input: string): string {
  return input
    .replace(/<[^>]*>/g, "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function sanitizeFilename(input: string): string {
  const cleaned = path
    .basename(input)
    .replace(/[\u0000-\u001F\u007F<>:"/\\|?*]/g, "")
    .trim();
  return cleaned || "arquivo";
}

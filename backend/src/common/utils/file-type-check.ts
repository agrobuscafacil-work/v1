export interface DetectedFileType {
  mime: string;
  ext: string;
}

const PNG_SIG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const JPEG_SIG = Buffer.from([0xff, 0xd8, 0xff]);
const GIF_SIG = Buffer.from([0x47, 0x49, 0x46, 0x38]);
const PDF_SIG = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2d]);
const ZIP_SIG = Buffer.from([0x50, 0x4b, 0x03, 0x04]);
const OLE2_SIG = Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]);
const EBML_SIG = Buffer.from([0x1a, 0x45, 0xdf, 0xa3]);

const ASCII = "ascii";

function startsWith(buf: Buffer, sig: Buffer, offset = 0): boolean {
  if (buf.length < offset + sig.length) return false;
  for (let i = 0; i < sig.length; i++) {
    if (buf[offset + i] !== sig[i]) return false;
  }
  return true;
}

function findMarker(buf: Buffer, marker: string, maxBytes: number): boolean {
  const search = buf.subarray(0, Math.min(buf.length, maxBytes));
  return search.includes(Buffer.from(marker, ASCII));
}

function isPlainText(buf: Buffer): boolean {
  const sample = buf.subarray(0, Math.min(buf.length, 4096));
  for (const byte of sample) {
    if (byte === 0) return false;
    if (byte < 9 || (byte > 13 && byte < 32)) return false;
  }
  return sample.length > 0;
}

/**
 * Detecta o tipo real de um arquivo pelos primeiros bytes (magic bytes),
 * ignorando o mimetype declarado pelo cliente.
 */
export function detectFileType(buffer: Buffer): DetectedFileType | null {
  if (!buffer || buffer.length === 0) return null;

  if (startsWith(buffer, JPEG_SIG)) {
    return { mime: "image/jpeg", ext: ".jpg" };
  }
  if (startsWith(buffer, PNG_SIG)) {
    return { mime: "image/png", ext: ".png" };
  }
  if (startsWith(buffer, GIF_SIG)) {
    return { mime: "image/gif", ext: ".gif" };
  }
  if (
    startsWith(buffer, Buffer.from("RIFF", ASCII)) &&
    startsWith(buffer, Buffer.from("WEBP", ASCII), 8)
  ) {
    return { mime: "image/webp", ext: ".webp" };
  }
  if (startsWith(buffer, PDF_SIG)) {
    return { mime: "application/pdf", ext: ".pdf" };
  }

  if (startsWith(buffer, ZIP_SIG)) {
    if (findMarker(buffer, "word/document.xml", 512 * 1024)) {
      return { mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", ext: ".docx" };
    }
    if (findMarker(buffer, "xl/workbook.xml", 512 * 1024)) {
      return { mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", ext: ".xlsx" };
    }
    return null;
  }

  if (startsWith(buffer, OLE2_SIG)) {
    if (findMarker(buffer, "Word.Document", 512 * 1024)) {
      return { mime: "application/msword", ext: ".doc" };
    }
    if (findMarker(buffer, "Excel.Sheet", 512 * 1024)) {
      return { mime: "application/vnd.ms-excel", ext: ".xls" };
    }
    return null;
  }

  if (startsWith(buffer, EBML_SIG)) {
    return { mime: "video/webm", ext: ".webm" };
  }

  if (
    buffer.length > 8 &&
    startsWith(buffer, Buffer.from("ftyp", ASCII), 4)
  ) {
    const brand = buffer.subarray(8, 12).toString(ASCII);
    if (/qt/i.test(brand)) {
      return { mime: "video/quicktime", ext: ".mov" };
    }
    return { mime: "video/mp4", ext: ".mp4" };
  }

  if (isPlainText(buffer)) {
    return { mime: "text/plain", ext: ".txt" };
  }

  return null;
}

/** Verifica se o tipo detectado é aceito para o campo de upload esperado. */
export function isAllowedDetectedType(
  detected: DetectedFileType,
  options: { images?: boolean; documents?: boolean; videos?: boolean },
): boolean {
  const imageMimes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
  const documentMimes = new Set([
    "application/pdf",
    "text/plain",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/csv",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ]);
  const videoMimes = new Set(["video/mp4", "video/webm", "video/quicktime"]);

  if (options.images && imageMimes.has(detected.mime)) return true;
  if (options.documents && documentMimes.has(detected.mime)) return true;
  if (options.videos && videoMimes.has(detected.mime)) return true;
  return false;
}
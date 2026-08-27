import { BadRequestException } from '@nestjs/common';
import multer from 'multer';

export const SUPPLIER_IMAGE_MAX_SIZE = 5 * 1024 * 1024;
export const SUPPLIER_IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);

export function createSupplierStorage() {
  return multer.memoryStorage();
}

export function supplierImageFilter(
  _req: any,
  file: Express.Multer.File,
  cb: (error: Error | null, acceptFile: boolean) => void,
) {
  if (['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.mimetype)) {
    cb(null, true);
    return;
  }
  cb(new BadRequestException(`Tipo de arquivo não permitido: ${file.originalname}`), false);
}
import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Storage, StorageOptions } from "@google-cloud/storage";
import { type Response } from "express";
import { existsSync } from "fs";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";

/**
 * FileStorageService grava uploads no Google Cloud Storage quando GCS_BUCKET
 * está definido, ou em disco local (uploads/) caso contrário (dev/servidor
 * simples). Isso permite que a aplicação funcione igualmente nos dois modos.
 *
 * Anexos sensíveis (ex.: suporte) usam GCS_PRIVATE_BUCKET: o arquivo nunca é
 * exposto via URL pública e só é servido pelo backend, com autorização.
 */
@Injectable()
export class FileStorageService {
  private readonly logger = new Logger(FileStorageService.name);

  private readonly useGcs: boolean;
  private readonly client?: Storage;
  private readonly bucket?: string;
  private readonly privateBucket?: string;
  private readonly publicBaseUrl: string;
  private readonly uploadRoot: string;

  constructor(configService: ConfigService) {
    this.uploadRoot = process.env.UPLOAD_DIR
      ? path.resolve(process.env.UPLOAD_DIR)
      : path.resolve(process.cwd(), "uploads");

    const bucket = configService.get<string>("GCS_BUCKET");
    this.useGcs = Boolean(bucket);

    if (this.useGcs) {
      const projectId = configService.get<string>("GCS_PROJECT_ID");
      const keyFilename = existsSync(
        configService.get<string>("GCS_CREDENTIALS_FILE") || "",
      )
        ? configService.get<string>("GCS_CREDENTIALS_FILE")
        : undefined;
      const options: StorageOptions = { projectId };
      if (keyFilename) options.keyFilename = keyFilename;
      this.client = new Storage(options);
      this.bucket = bucket;
      this.privateBucket =
        configService.get<string>("GCS_PRIVATE_BUCKET") || undefined;
      if (this.privateBucket && this.privateBucket === bucket) {
        this.logger.warn(
          "GCS_PRIVATE_BUCKET igual a GCS_BUCKET: o bucket é público, anexos continuarão expostos.",
        );
      }
      this.publicBaseUrl = (
        configService.get<string>("GCS_PUBLIC_BASE_URL") ||
        `https://storage.googleapis.com/${bucket}`
      ).replace(/\/+$/, "");
    } else {
      this.publicBaseUrl = "";
    }
  }

  get isCloud(): boolean {
    return this.useGcs;
  }

  /**
   * Persiste um arquivo. Retorna a URL pública absoluta quando usando GCS,
   * caso contrário retorna null (usa-se o redirect local/api para servir).
   */
  async save(
    folder: string,
    filename: string,
    buffer: Buffer,
    contentType: string,
  ): Promise<string | null> {
    if (this.useGcs) {
      const file = this.client!.bucket(this.bucket!).file(
        `${folder}/${filename}`,
      );
      await file.save(buffer, {
        contentType,
        metadata: { cacheControl: "public, max-age=31536000, immutable" },
      });
      return `${this.publicBaseUrl}/${folder}/${filename}`;
    }

    const dir = path.join(this.uploadRoot, folder);
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, filename), buffer);
    return null;
  }

  /** URL pública absoluta no GCS (apenas quando habilitado). */
  publicUrl(folder: string, filename: string): string {
    return `${this.publicBaseUrl}/${folder}/${filename}`;
  }

  /**
   * Persiste um arquivo sem expor URL pública (anexos sensíveis).
   * Usa GCS_PRIVATE_BUCKET quando configurado; caso contrário grava em disco
   * local (o endpoint do backend é o único acesso).
   */
  async savePrivate(
    folder: string,
    filename: string,
    buffer: Buffer,
    contentType: string,
  ): Promise<null> {
    if (this.useGcs) {
      const target = this.privateBucket ?? this.bucket!;
      if (!this.privateBucket) {
        this.logger.warn(
          `GCS_PRIVATE_BUCKET não configurado: salvando anexos em "${target}" (público). Configure um bucket privado para anexos.`,
        );
      }
      await this.client!
        .bucket(target)
        .file(`${folder}/${filename}`)
        .save(buffer, {
          contentType,
          metadata: { cacheControl: "private, max-age=0, no-store" },
        });
      return null;
    }

    const dir = path.join(this.uploadRoot, folder);
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, filename), buffer);
    return null;
  }

  /** Verifica se um arquivo existe no armazenamento. */
  async exists(folder: string, filename: string): Promise<boolean> {
    if (this.useGcs) {
      const bucketName = this.privateBucket ?? this.bucket!;
      const [status] = await this.client!
        .bucket(bucketName)
        .file(`${folder}/${filename}`)
        .exists();
      return status;
    }
    return existsSync(path.join(this.uploadRoot, folder, filename));
  }

  /**
   * Envia um arquivo anexo para a resposta HTTP (proxy autenticado).
   * Nunca redireciona para GCS: o conteúdo só é acessível com autorização.
   */
  async stream(
    folder: string,
    filename: string,
    res: Response,
    contentType: string,
    downloadName?: string,
  ): Promise<void> {
    const safeMime = /^[a-z0-9+.-]+\/[a-z0-9+.-]+$/i.test(contentType || "")
      ? contentType
      : "application/octet-stream";
    const inline = safeMime.startsWith("image/") || safeMime.startsWith("video/");

    const dispositionValue = `${inline ? "inline" : "attachment"}${
      downloadName ? `; filename="${downloadName.replace(/["\\\r\n]/g, "")}"` : ""
    }`;

    if (this.useGcs) {
      const bucketName = this.privateBucket ?? this.bucket!;
      const bucketFile = this.client!
        .bucket(bucketName)
        .file(`${folder}/${filename}`);

      const [exists] = await bucketFile.exists();
      if (!exists) throw new NotFoundException("Arquivo não encontrado");

      const metadata = await bucketFile.getMetadata();
      const actualContentType = metadata[0].contentType || safeMime;

      res.set({
        "Content-Type": actualContentType,
        "Cache-Control": "private, max-age=0, no-store",
        "Content-Disposition": dispositionValue,
        "X-Content-Type-Options": "nosniff",
      });

      const readStream = bucketFile.createReadStream();
      await new Promise<void>((resolve) => {
        readStream.on("error", () => {
          if (!res.headersSent) {
            res.status(404).json({
              message: "Arquivo não encontrado",
              statusCode: 404,
            });
          }
          resolve();
        });
        readStream.pipe(res);
        res.on("finish", resolve);
        res.on("close", () => {
          readStream.destroy();
          resolve();
        });
      });
      return;
    }

    const filePath = path.join(this.uploadRoot, folder, filename);
    if (!existsSync(filePath)) {
      throw new NotFoundException("Arquivo não encontrado");
    }
    res.set({
      "Content-Type": safeMime,
      "Cache-Control": "private, max-age=0, no-store",
      "Content-Disposition": dispositionValue,
      "X-Content-Type-Options": "nosniff",
    });
    res.sendFile(filePath);
  }

  async delete(folder: string, filename: string): Promise<void> {
    try {
      if (this.useGcs) {
        await this.client!
          .bucket(this.bucket!)
          .file(`${folder}/${filename}`)
          .delete();
      } else {
        await unlink(path.join(this.uploadRoot, folder, filename));
      }
    } catch (error) {
      this.logger.warn(
        `Falha ao remover ${folder}/${filename}: ${(error as Error).message}`,
      );
    }
  }
}